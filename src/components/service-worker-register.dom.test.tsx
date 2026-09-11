import { afterEach, describe, expect, it, vi } from "vitest";

import { render } from "@/test/render";

import { ServiceWorkerRegister } from "./service-worker-register";

const ORIGINAL_ENV = process.env.NODE_ENV;

afterEach(() => {
  vi.stubEnv("NODE_ENV", ORIGINAL_ENV ?? "test");
  vi.unstubAllGlobals();
});

describe("<ServiceWorkerRegister>", () => {
  it("enregistre le service worker en production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const register = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, serviceWorker: { register } });

    render(<ServiceWorkerRegister />);

    expect(register).toHaveBeenCalledWith("/sw.js");
  });

  it("ne fait rien en dehors de la production", () => {
    vi.stubEnv("NODE_ENV", "test");
    const register = vi.fn();
    vi.stubGlobal("navigator", { ...navigator, serviceWorker: { register } });

    render(<ServiceWorkerRegister />);

    expect(register).not.toHaveBeenCalled();
  });
});
