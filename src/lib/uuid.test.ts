import { afterEach, describe, expect, it, vi } from "vitest";

import { randomId } from "./uuid";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("randomId", () => {
  it("utilise crypto.randomUUID quand disponible", () => {
    const spy = vi.fn(() => "11111111-1111-4111-8111-111111111111");
    vi.stubGlobal("crypto", { randomUUID: spy });
    expect(randomId()).toBe("11111111-1111-4111-8111-111111111111");
    expect(spy).toHaveBeenCalled();
  });

  it("se rabat sur getRandomValues en contexte non sécurisé", () => {
    vi.stubGlobal("crypto", {
      getRandomValues: (arr: Uint8Array) => {
        arr.fill(0xab);
        return arr;
      },
    });
    const id = randomId();
    expect(id).toMatch(UUID_RE);
  });

  it("se rabat sur un identifiant unique sans API crypto", () => {
    vi.stubGlobal("crypto", undefined);
    expect(randomId()).not.toEqual(randomId());
  });
});
