import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen, userEvent } from "@/test/render";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => "/",
}));

import { SiteHeader } from "./site-header";

beforeEach(() => {
  window.localStorage.clear();
});

describe("<SiteHeader> — menu mobile", () => {
  it("ouvre le menu et déplace le focus sur le premier lien", async () => {
    const user = userEvent.setup();
    renderWithIntl(<SiteHeader />);

    const toggle = screen.getByRole("button", { name: "Ouvrir le menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);

    expect(screen.getByRole("button", { name: "Fermer le menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    const links = screen.getAllByRole("link", { name: "Comprendre" });
    expect(links[links.length - 1]).toHaveFocus();
  });

  it("ferme le menu sur Escape et rend le focus au bouton", async () => {
    const user = userEvent.setup();
    renderWithIntl(<SiteHeader />);

    const toggle = screen.getByRole("button", { name: "Ouvrir le menu" });
    await user.click(toggle);
    await user.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: "Ouvrir le menu" })).toHaveFocus();
  });

  it("ferme le menu au clic en dehors", async () => {
    const user = userEvent.setup();
    renderWithIntl(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
    await user.click(screen.getAllByRole("link", { name: /Bon/ })[0]);

    expect(screen.getByRole("button", { name: "Ouvrir le menu" })).toBeInTheDocument();
  });
});
