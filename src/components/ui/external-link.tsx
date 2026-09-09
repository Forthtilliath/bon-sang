import type { ComponentProps } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

export function ExternalLink({ className, children, ...props }: ComponentProps<"a">) {
  const t = useTranslations("Common");

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn("text-primary font-medium underline-offset-2 hover:underline", className)}
      {...props}
    >
      {children}
      <span className="sr-only"> ({t("newWindow")})</span>
    </a>
  );
}
