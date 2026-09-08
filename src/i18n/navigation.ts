import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

// Wrappers de `next/navigation` conscients de la locale.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
