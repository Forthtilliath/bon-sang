import type { ComponentProps } from "react";

/** Goutte de sang, motif récurrent du thème (logo, puces, décors). Décorative. */
export function Drop({ filled = true, ...props }: ComponentProps<"svg"> & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M12 2.5s7.25 7.9 7.25 12.9a7.25 7.25 0 0 1-14.5 0C4.75 10.4 12 2.5 12 2.5Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
