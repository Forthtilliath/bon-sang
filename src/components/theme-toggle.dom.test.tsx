import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { renderWithIntl, screen, userEvent } from "@/test/render";

import { ThemeToggle } from "./theme-toggle";

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

describe("<ThemeToggle>", () => {
  it("part de « système » et fait défiler clair → sombre → système", async () => {
    const user = userEvent.setup();
    renderWithIntl(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Thème : Système" });
    expect(document.documentElement.dataset.theme).toBeUndefined();

    await user.click(button);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("theme")).toBe("light");
    expect(screen.getByRole("button", { name: "Thème : Clair" })).toBeInTheDocument();

    await user.click(button);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("theme")).toBe("dark");

    await user.click(button);
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(window.localStorage.getItem("theme")).toBeNull();
    expect(screen.getByRole("button", { name: "Thème : Système" })).toBeInTheDocument();
  });

  it("lit le choix déjà enregistré", () => {
    window.localStorage.setItem("theme", "dark");
    renderWithIntl(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Thème : Sombre" })).toBeInTheDocument();
  });
});
