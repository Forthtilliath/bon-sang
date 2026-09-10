import { describe, expect, it } from "vitest";

import en from "../../messages/en.json";
import fr from "../../messages/fr.json";

type Tree = { [key: string]: string | Tree };

/** Aplati l'arbre de messages en `chemin.pointé -> valeur`. */
function flatten(tree: Tree, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      out.set(path, value);
    } else {
      for (const [k, v] of flatten(value, path)) out.set(k, v);
    }
  }
  return out;
}

/**
 * Arguments ICU d'une chaîne : l'identifiant qui suit `{` puis `,` ou `}`.
 * Couvre `{count}`, `{name}`, `{days, plural, …}` sans se laisser piéger par
 * le texte des branches (`one {Dans # jour}`).
 */
function placeholders(value: string): string[] {
  return [...value.matchAll(/\{\s*(\w+)\s*[,}]/g)].map((m) => m[1]).sort();
}

const frFlat = flatten(fr as Tree);
const enFlat = flatten(en as Tree);

describe("catalogues de messages i18n", () => {
  it("fr.json et en.json exposent exactement les mêmes clés", () => {
    const missingInEn = [...frFlat.keys()].filter((k) => !enFlat.has(k)).sort();
    const missingInFr = [...enFlat.keys()].filter((k) => !frFlat.has(k)).sort();
    expect({ missingInEn, missingInFr }).toEqual({ missingInEn: [], missingInFr: [] });
  });

  it("aucune valeur vide", () => {
    const empty = [...frFlat, ...enFlat].filter(([, v]) => v.trim() === "").map(([k]) => k);
    expect(empty).toEqual([]);
  });

  it("les placeholders ICU concordent clé à clé", () => {
    const mismatches: string[] = [];
    for (const [key, frValue] of frFlat) {
      const enValue = enFlat.get(key);
      if (enValue === undefined) continue;
      const a = placeholders(frValue);
      const b = placeholders(enValue);
      if (a.join(",") !== b.join(",")) mismatches.push(`${key}: fr[${a}] en[${b}]`);
    }
    expect(mismatches).toEqual([]);
  });
});
