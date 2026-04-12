import type { DashboardSpec } from "./genUITypes";

/** Short labels for horizontal chip row (2–3 per reply). */
const BY_SPEC_ID: Record<string, [string, string, string]> = {
  "dom-intl-split-6m": [
    "Fastest corridor?",
    "Domestic by mode",
    "Success vs last Q",
  ],
  "success-rate-3m": [
    "Top failure driver?",
    "By payment method",
    "MoM recovery",
  ],
  "decline-reasons-q": [
    "Trending decline?",
    "Vs benchmark",
    "By network",
  ],
  "settlement-cycle": [
    "Slowest corridor?",
    "Stuck in review",
    "T+0 vs T+2 mix",
  ],
  "country-revenue": [
    "Highest growth?",
    "Concentration risk",
    "US vs EU",
  ],
  "upi-card-90d": [
    "UPI weekly shift",
    "High-ticket split",
    "Refunds by mode",
  ],
  "chargeback-q": [
    "CB by method",
    "Riskiest MIDs",
    "Dispute win rate",
  ],
  "hourly-heatmap": [
    "Maintenance window?",
    "Weekend vs weekday",
    "Failures by hour",
  ],
};

const FALLBACK: [string, string, string] = [
  "What changed most?",
  "Biggest risk?",
  "Next actions?",
];

export function getFollowUpsForSpec(spec: DashboardSpec): string[] {
  const row = BY_SPEC_ID[spec.id];
  return row ? [...row] : [...FALLBACK];
}
