import type { AgentStep, DashboardSpec } from "./genUITypes";
import { getFollowUpsForSpec } from "./assistantFollowUps";
import { GEN_UI_QUERIES, matchGenUIQuery } from "./genUIQueries";

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export type FullPagePipelineCallbacks = {
  onStepsUpdate: (steps: AgentStep[]) => void;
};

function makeStep(id: string, label: string, detail?: string): AgentStep {
  return { id, label, detail, status: "pending" };
}

/** Resolves agent steps and a DashboardSpec for the given user text. */
export async function runFullPagePipeline(
  userText: string,
  cb: FullPagePipelineCallbacks
): Promise<{
  /** Main answer — streamed token-by-token in the UI. */
  summary: string;
  /** Short line shown after the stream in the follow-up “hug” strip. */
  closingLine: string;
  spec: DashboardSpec | null;
  followUps: string[];
}> {
  const matched = matchGenUIQuery(userText) ?? GEN_UI_QUERIES[0]!;
  const { spec } = matched;

  const STEPS: AgentStep[] = [
    makeStep(
      "intent",
      "Understanding query intent",
      `Parsed: "${userText.slice(0, 80)}${userText.length > 80 ? "…" : ""}"`
    ),
    makeStep(
      "fetch",
      "Fetching transaction data",
      "Querying last 90 days of transactions, settlements and payment method logs"
    ),
    makeStep(
      "compute",
      "Running analytics computations",
      "Aggregating domestic vs international split, success rate trends and payment mix"
    ),
    makeStep(
      "render",
      "Building dashboard layout",
      `Composing ${spec.cards.length} cards — metrics, charts and data tables`
    ),
  ];

  const emit = (updates: Partial<AgentStep>, idx: number) => {
    const next = STEPS.map((s, i) => (i === idx ? { ...s, ...updates } : s));
    STEPS.splice(0, STEPS.length, ...next);
    cb.onStepsUpdate([...STEPS]);
  };

  // Realistic per-step durations (ms): intent parse → data fetch → compute → render
  const STEP_DURATIONS = [700, 2600, 2100, 1400];

  for (let i = 0; i < STEPS.length; i++) {
    emit({ status: "active" }, i);
    await delay(STEP_DURATIONS[i]! + Math.random() * 400);
    emit({ status: "done" }, i);
    await delay(120);
  }

  return {
    summary: spec.summary,
    closingLine:
      "Want to go deeper? Pick a suggestion below or ask your own follow-up.",
    spec,
    followUps: getFollowUpsForSpec(spec),
  };
}
