/** Statuses for each agent step shown during GenUI generation. */
export type AgentStepStatus = "pending" | "active" | "done" | "error";

export type AgentStep = {
  id: string;
  label: string;
  detail?: string;
  status: AgentStepStatus;
};

/** A single KPI metric card (numeric value + trend). */
export type GenUIMetricCard = {
  type: "metric";
  id: string;
  title: string;
  value: string;
  subValue?: string;
  change?: number;
  changeLabel?: string;
  /** Optional sparkline series (values only). */
  sparkline?: number[];
};

/** A time-series line or area chart card. */
export type GenUILineCard = {
  type: "line";
  id: string;
  title: string;
  subtitle?: string;
  dataKey: string;
  compareKey?: string;
  compareLabel?: string;
  data: Record<string, string | number>[];
  xKey: string;
  yLabel?: string;
  colorVar?: string;
};

/** A grouped/stacked bar chart card. */
export type GenUIBarCard = {
  type: "bar";
  id: string;
  title: string;
  subtitle?: string;
  bars: { dataKey: string; label: string; colorVar?: string }[];
  data: Record<string, string | number>[];
  xKey: string;
  stacked?: boolean;
};

/** A donut/pie chart card with a legend. */
export type GenUIDonutCard = {
  type: "donut";
  id: string;
  title: string;
  subtitle?: string;
  segments: { key: string; label: string; value: number; colorVar?: string }[];
  centerLabel?: string;
};

/** A simple data table card. */
export type GenUITableCard = {
  type: "table";
  id: string;
  title: string;
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, string | number>[];
};

/** A horizontal split-bar card (e.g. domestic vs international). */
export type GenUISplitCard = {
  type: "split";
  id: string;
  title: string;
  segments: { label: string; value: number; colorVar?: string }[];
  total?: string;
};

export type GenUICard =
  | GenUIMetricCard
  | GenUILineCard
  | GenUIBarCard
  | GenUIDonutCard
  | GenUITableCard
  | GenUISplitCard;

/** Top-level spec for a GenUI dashboard rendered by Echo. */
export type DashboardSpec = {
  id: string;
  title: string;
  summary: string;
  cards: GenUICard[];
};
