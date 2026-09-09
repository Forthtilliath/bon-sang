export const DONATION_TYPES = ["blood", "plasma", "platelets"] as const;
export type DonationType = (typeof DONATION_TYPES)[number];

export const SEXES = ["unspecified", "female", "male"] as const;
export type Sex = (typeof SEXES)[number];

export const BLOOD_GROUPS = ["unknown", "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export type Donation = {
  id: string;
  /** Date ISO `YYYY-MM-DD`. */
  date: string;
  type: DonationType;
  place?: string;
};

export type Profile = {
  sex: Sex;
  bloodGroup: BloodGroup;
};

/** Rappel « à nouveau éligible le… » posé depuis le quiz. */
export type Reminder = {
  /** Date ISO `YYYY-MM-DD`. */
  date: string;
  note?: string;
};

export type TrackerState = {
  profile: Profile;
  donations: Donation[];
  reminder: Reminder | null;
};

export const EMPTY_TRACKER: TrackerState = {
  profile: { sex: "unspecified", bloodGroup: "unknown" },
  donations: [],
  reminder: null,
};

export const TRACKER_STORAGE_KEY = "bon-sang:tracker";
