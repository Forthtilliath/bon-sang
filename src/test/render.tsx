import type { ReactElement, ReactNode } from "react";

import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import messages from "../../messages/fr.json";

/** « Maintenant » figé pour des rendus déterministes (formats de date relatifs). */
export const NOW = new Date("2026-09-11T12:00:00Z");

function Providers({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider
      locale="fr"
      timeZone="Europe/Paris"
      now={NOW}
      messages={messages as Record<string, unknown>}
    >
      {children}
    </NextIntlClientProvider>
  );
}

/** `render` de Testing Library, enveloppé dans le provider next-intl (locale `fr`). */
export function renderWithIntl(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: Providers, ...options });
}

export * from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
