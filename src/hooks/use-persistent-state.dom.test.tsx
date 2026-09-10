import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { act, renderHook } from "@/test/render";

import { usePersistentState } from "./use-persistent-state";

const KEY = "test:key";
type State = { n: number };
const INIT: State = { n: 0 };

describe("usePersistentState", () => {
  it("rend la valeur initiale quand rien n'est stocké, puis hydrate", () => {
    const { result } = renderHook(() => usePersistentState(KEY, INIT));
    expect(result.current.value).toEqual(INIT);
    expect(result.current.hydrated).toBe(true);
  });

  it("lit la valeur déjà présente dans localStorage", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ n: 7 }));
    const { result } = renderHook(() => usePersistentState(KEY, INIT));
    expect(result.current.value).toEqual({ n: 7 });
  });

  it("retombe sur la valeur initiale si le JSON stocké est corrompu", () => {
    window.localStorage.setItem(KEY, "{ pas du json");
    const { result } = renderHook(() => usePersistentState(KEY, INIT));
    expect(result.current.value).toEqual(INIT);
  });

  it("persiste une valeur et un updater basé sur l'état précédent", () => {
    const { result } = renderHook(() => usePersistentState(KEY, INIT));

    act(() => result.current.setValue({ n: 1 }));
    expect(JSON.parse(window.localStorage.getItem(KEY)!)).toEqual({ n: 1 });
    expect(result.current.value).toEqual({ n: 1 });

    act(() => result.current.setValue((prev) => ({ n: prev.n + 4 })));
    expect(result.current.value).toEqual({ n: 5 });
  });

  it("se synchronise sur un StorageEvent émis par un autre onglet", () => {
    const { result } = renderHook(() => usePersistentState(KEY, INIT));
    act(() => {
      window.localStorage.setItem(KEY, JSON.stringify({ n: 99 }));
      window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    });
    expect(result.current.value).toEqual({ n: 99 });
  });

  it("propage un changement entre deux instances du même clé", () => {
    const { result } = renderHook(() => ({
      a: usePersistentState(KEY, INIT),
      b: usePersistentState(KEY, INIT),
    }));
    act(() => result.current.a.setValue({ n: 42 }));
    expect(result.current.b.value).toEqual({ n: 42 });
  });

  it("vide la clé et revient à la valeur initiale", () => {
    const { result } = renderHook(() => usePersistentState(KEY, INIT));
    act(() => result.current.setValue({ n: 3 }));
    act(() => result.current.clear());
    expect(window.localStorage.getItem(KEY)).toBeNull();
    expect(result.current.value).toEqual(INIT);
  });

  it("avale silencieusement un localStorage qui jette (quota plein, mode privé)", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    const { result } = renderHook(() => usePersistentState(KEY, INIT));
    expect(() => act(() => result.current.setValue({ n: 5 }))).not.toThrow();
    expect(result.current.value).toEqual(INIT);
    spy.mockRestore();
  });

  it("rend côté serveur sans toucher au navigateur (valeur initiale, non hydraté)", () => {
    function Probe() {
      const { value, hydrated } = usePersistentState(KEY, INIT);
      return <output>{`${hydrated ? "client" : "serveur"}:${value.n}`}</output>;
    }
    window.localStorage.setItem(KEY, JSON.stringify({ n: 123 }));
    const html = renderToString(<Probe />);
    expect(html).toContain("serveur:0");
  });
});
