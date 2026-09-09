/** Utilitaires de dates, purs et testables. Les entrées ne sont jamais mutées. */

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  // Gère le débordement (31 janv. + 1 mois => 28/29 févr., pas le 3 mars).
  if (d.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    d.setDate(0);
  }
  return d;
}

/** Nombre de jours entiers de `from` à `to` (négatif si `to` est avant). */
export function daysBetween(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86_400_000);
}

/** La date la plus tardive d'une liste, en ignorant les `null`. */
export function latestDate(dates: Array<Date | null>): Date | null {
  return dates.reduce<Date | null>((max, d) => {
    if (!d) return max;
    return !max || d.getTime() > max.getTime() ? d : max;
  }, null);
}

/** Parse une valeur `YYYY-MM-DD` d'un `<input type="date">`. Renvoie `null` si invalide. */
export function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Formate une date en `YYYY-MM-DD` **dans le fuseau local** (jamais UTC : le domaine
 * ne manipule que des dates calendaires).
 */
export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
