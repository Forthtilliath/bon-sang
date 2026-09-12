import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import "@testing-library/jest-dom/vitest";

// jsdom n'implémente pas ces API de layout.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

afterEach(() => {
  cleanup();
  try {
    window.localStorage.clear();
  } catch {
    // localStorage indisponible : rien à nettoyer.
  }
});
