"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

type Updater<T> = T | ((previous: T) => T);

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * État persistant dans `localStorage`, sûr en SSR et synchronisé entre onglets.
 *
 * - `initialValue` **doit être stable** (constante de module), pas un littéral inline.
 * - `hydrated` passe à `true` une fois la valeur du navigateur lue ; utile pour éviter
 *   un flash de la valeur par défaut.
 */
export function usePersistentState<T>(key: string, initialValue: T) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );

  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const value = useMemo<T>(() => {
    if (raw == null) return initialValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  }, [raw, initialValue]);

  const setValue = useCallback(
    (updater: Updater<T>) => {
      try {
        const current = readRaw(key);
        const previous = current == null ? initialValue : (JSON.parse(current) as T);
        const next = typeof updater === "function" ? (updater as (p: T) => T)(previous) : updater;
        window.localStorage.setItem(key, JSON.stringify(next));
        // `storage` ne se déclenche pas dans l'onglet émetteur : on le simule.
        window.dispatchEvent(new StorageEvent("storage", { key }));
      } catch {
        // localStorage indisponible (mode privé, quota) : on ignore silencieusement.
      }
    },
    [key, initialValue],
  );

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      window.dispatchEvent(new StorageEvent("storage", { key }));
    } catch {
      // idem
    }
  }, [key]);

  return { value, setValue, clear, hydrated };
}
