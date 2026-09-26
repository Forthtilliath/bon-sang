"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { downloadTextFile } from "@/lib/download";

import { Section, type TrackerApi } from "./tracker-ui";
import { MAX_IMPORT_BYTES } from "./validate";

export function DataControls({ tracker }: { tracker: TrackerApi }) {
  const t = useTranslations("Tracker");
  const [error, setError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    downloadTextFile(
      "bon-sang-suivi.json",
      JSON.stringify(tracker.state, null, 2),
      "application/json",
    );
  };

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    const ok = file.size <= MAX_IMPORT_BYTES && tracker.importState(await file.text());
    setError(!ok);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Section title={t("data.title")}>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={exportJson}
          className={buttonClasses({ variant: "outline", size: "sm" })}
        >
          {t("data.export")}
        </button>
        <label className={cn(buttonClasses({ variant: "outline", size: "sm" }), "cursor-pointer")}>
          {t("data.import")}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={(e) => importJson(e.target.files?.[0])}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t("data.resetConfirm"))) tracker.reset();
          }}
          className={buttonClasses({ variant: "ghost", size: "sm" })}
        >
          {t("data.reset")}
        </button>
      </div>
      {error ? <p className="text-primary text-sm">{t("data.importError")}</p> : null}
    </Section>
  );
}
