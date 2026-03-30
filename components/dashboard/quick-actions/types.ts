export const QUICK_ACTION_IDS = [
  "payment-link",
  "invoice",
  "invite-teammate",
  "fx-calculator",
  "international-accounts",
] as const;

export type QuickActionId = (typeof QUICK_ACTION_IDS)[number];
