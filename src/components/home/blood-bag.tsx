// Illustration décorative du hero : une poche de sang « étiquetée », dont le
// liquide ondule doucement (animation coupée si `prefers-reduced-motion`).
// Textes de l'étiquette = marque et faux code, jamais traduits : constantes hors
// JSX (cf. `i18next/no-literal-string`).
const LABEL_BRAND = "BON SANG";
const LABEL_CODE = "N° 0001 · 450 ML";

// Code-barres : largeurs (unités SVG) alternées trait / espace, converties une
// fois pour toutes en traits positionnés.
const BARCODE = [3, 2, 1, 2, 4, 1, 2, 3, 1, 1, 3, 2, 2, 1, 4, 2, 1, 3, 2, 1, 1, 2, 3, 1];
const BAR_SCALE = 1.8;
const BARS = BARCODE.map((width, index) => ({
  x: 78 + BARCODE.slice(0, index).reduce((sum, w) => sum + w, 0) * BAR_SCALE,
  width: width * BAR_SCALE,
})).filter((_, index) => index % 2 === 0);

const BAG_PATH =
  "M44 58c0-14 11-24 25-24h102c14 0 25 10 25 24v214c0 22-18 40-40 40H84c-22 0-40-18-40-40Z";

export function BloodBag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 340" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <clipPath id="bag-clip">
          <path d={BAG_PATH} />
        </clipPath>
      </defs>

      {/* Tubulure : trait encre, sang à l'intérieur. */}
      <path
        d="M120 34V20c0-12 10-16 22-14s30 10 44 4 20-2 26 6"
        className="stroke-ink"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M120 34V20c0-12 10-16 22-14s30 10 44 4 20-2 26 6"
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Ombre décalée « sticker » de la poche. */}
      <path d={BAG_PATH} transform="translate(8 8)" className="fill-ink" />
      <path d={BAG_PATH} className="fill-bg" />

      {/* Liquide : vague plus large que la poche, qui oscille latéralement. */}
      <g clipPath="url(#bag-clip)">
        <g className="animate-slosh">
          <path
            d="M10 128q15-12 30 0t30 0 30 0 30 0 30 0 30 0 30 0 30 0v220H10Z"
            className="fill-primary"
          />
        </g>
        <path
          d="M62 70v200"
          className="stroke-bg"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>

      <path d={BAG_PATH} fill="none" className="stroke-ink" strokeWidth="4" />

      {/* Graduations. */}
      {[110, 150, 190, 230, 270].map((y) => (
        <path
          key={y}
          d={`M184 ${y}h12`}
          className="stroke-ink"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}

      {/* Étiquette plasma, légèrement de travers. */}
      <g transform="rotate(-5 120 206)">
        <rect
          x="66"
          y="160"
          width="108"
          height="92"
          rx="10"
          className="fill-accent stroke-ink"
          strokeWidth="3"
        />
        <text x="78" y="182" className="fill-accent-fg font-mono" fontSize="11" letterSpacing="1.5">
          {LABEL_BRAND}
        </text>
        {BARS.map((bar) => (
          <rect
            key={bar.x}
            x={bar.x}
            y="192"
            width={bar.width}
            height="30"
            className="fill-accent-fg"
          />
        ))}
        <text x="78" y="240" className="fill-accent-fg font-mono" fontSize="8" letterSpacing="0.5">
          {LABEL_CODE}
        </text>
      </g>
    </svg>
  );
}
