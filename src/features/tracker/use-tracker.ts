"use client";

import { useCallback, useMemo } from "react";

import { usePersistentState } from "@/hooks/use-persistent-state";
import { parseIsoDate } from "@/lib/dates";

import { earnedBadges } from "./badges";
import { nextEligibleDate } from "./eligibility-date";
import {
  EMPTY_TRACKER,
  TRACKER_STORAGE_KEY,
  type Donation,
  type Profile,
  type TrackerState,
} from "./types";

function isTrackerState(value: unknown): value is TrackerState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.donations) && typeof v.profile === "object" && v.profile !== null;
}

export function useTracker() {
  const {
    value: state,
    setValue,
    clear,
    hydrated,
  } = usePersistentState(TRACKER_STORAGE_KEY, EMPTY_TRACKER);

  const donations = useMemo(
    () =>
      [...state.donations].sort(
        (a, b) => (parseIsoDate(b.date)?.getTime() ?? 0) - (parseIsoDate(a.date)?.getTime() ?? 0),
      ),
    [state.donations],
  );

  const nextEligible = useMemo(() => nextEligibleDate(state), [state]);
  const badges = useMemo(() => earnedBadges(state), [state]);

  const addDonation = useCallback(
    (donation: Omit<Donation, "id">) => {
      setValue((prev) => ({
        ...prev,
        donations: [...prev.donations, { ...donation, id: crypto.randomUUID() }],
      }));
    },
    [setValue],
  );

  const removeDonation = useCallback(
    (id: string) => {
      setValue((prev) => ({ ...prev, donations: prev.donations.filter((d) => d.id !== id) }));
    },
    [setValue],
  );

  const setProfile = useCallback(
    (profile: Partial<Profile>) => {
      setValue((prev) => ({ ...prev, profile: { ...prev.profile, ...profile } }));
    },
    [setValue],
  );

  const clearReminder = useCallback(() => {
    setValue((prev) => ({ ...prev, reminder: null }));
  }, [setValue]);

  const importState = useCallback(
    (raw: string): boolean => {
      try {
        const parsed = JSON.parse(raw);
        if (!isTrackerState(parsed)) return false;
        setValue({ ...EMPTY_TRACKER, ...parsed });
        return true;
      } catch {
        return false;
      }
    },
    [setValue],
  );

  return {
    state,
    hydrated,
    donations,
    nextEligible,
    badges,
    addDonation,
    removeDonation,
    setProfile,
    clearReminder,
    importState,
    reset: clear,
  };
}
