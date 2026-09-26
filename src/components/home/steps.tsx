import { useTranslations } from "next-intl";

import { Container } from "@/components/ui/container";
import { Wave } from "@/components/ui/wave";
import { cn } from "@/lib/cn";

const STEPS = ["s1", "s2", "s3", "s4"] as const;
// Le jour du don est l'étape mise en avant (nœud plein, rouge).
const HIGHLIGHT = "s3";

/**
 * « Comment ça se passe » : les étapes sont reliées par une tubulure en
 * pointillés, horizontale sur grand écran, verticale sur mobile.
 */
export function Steps() {
  const t = useTranslations("HomePage.how");

  return (
    <section className="text-fg">
      <Wave className="text-surface -mb-px" />
      <div className="bg-surface">
        <Container className="py-14 sm:py-16">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h2>
          <div className="relative mt-10">
            <span
              aria-hidden="true"
              className="border-primary absolute top-0 bottom-10 left-[26px] border-l-4 border-dotted lg:hidden"
            />
            <span
              aria-hidden="true"
              className="border-primary absolute top-[26px] right-[calc(25%-18px)] left-0 hidden border-t-4 border-dotted lg:block"
            />
            <ol className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
              {STEPS.map((step, index) => (
                <li key={step} className="relative flex gap-5 lg:flex-col">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "border-ink font-display shadow-sticker-sm relative flex size-14 shrink-0 items-center justify-center rounded-full border-2 text-2xl font-semibold",
                      step === HIGHLIGHT ? "bg-primary text-primary-fg" : "bg-bg",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="pt-3 lg:pt-0">{t(step)}</span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </div>
      <Wave flip className="text-surface -mt-px" />
    </section>
  );
}
