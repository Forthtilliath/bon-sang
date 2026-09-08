/** Sections de navigation principale. `key` = clé dans le namespace i18n `Nav`. */
export const NAV_ITEMS = [
  { href: "/comprendre", key: "understand" },
  { href: "/qui-ca-aide", key: "whoItHelps" },
  { href: "/eligibilite", key: "eligibility" },
  { href: "/collectes", key: "collections" },
  { href: "/mon-suivi", key: "tracker" },
  { href: "/a-propos", key: "about" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
