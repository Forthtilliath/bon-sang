"use client";

import { useCallback, useMemo } from "react";

import { usePersistentState } from "@/hooks/use-persistent-state";
import { parseIsoDate } from "@/lib/dates";
import { randomId } from "@/lib/uuid";

import { earnedBadges } from "./badges";
import { nextEligibleDate } from "./eligibility-date";
import { EMPTY_TRACKER, TRACKER_STORAGE_KEY, type Donation, type Profile } from "./types";
import { parseTrackerState } from "./validate";

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
        donations: [...prev.donations, { ...donation, id: randomId() }],
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

  const updateDonation = useCallback(
    (id: string, patch: Partial<Omit<Donation, "id">>) => {
      setValue((prev) => ({
        ...prev,
        donations: prev.donations.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      }));
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
      const parsed = parseTrackerState(raw);
      if (!parsed) return false;
      setValue(parsed);
      return true;
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
    updateDonation,
    setProfile,
    clearReminder,
    importState,
    reset: clear,
  };
}
