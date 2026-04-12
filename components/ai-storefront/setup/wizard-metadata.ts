import type { TonePreset } from "@/lib/ai-storefront/types";

export const SETUP_STEP_COUNT = 5 as const;

export type SetupStepMeta = {
  n: number;
  title: string;
  short: string;
  blurb: string;
};

export const SETUP_STEPS: SetupStepMeta[] = [
  {
    n: 1,
    title: "Brand & welcome",
    short: "Brand",
    blurb: "First impression in AI chats — we’ve started from your PayGlocal business profile.",
  },
  {
    n: 2,
    title: "Catalogue",
    short: "Catalogue",
    blurb: "Products and copy that assistants can quote — aligned with what you already sell.",
  },
  {
    n: 3,
    title: "Inventory",
    short: "Stock",
    blurb: "How availability is checked so you never oversell in conversational checkout.",
  },
  {
    n: 4,
    title: "AI guardrails",
    short: "Safety",
    blurb: "Non‑negotiables for your brand — recommended defaults from risk & compliance.",
  },
  {
    n: 5,
    title: "Review & publish",
    short: "Publish",
    blurb: "One last look before your storefront is discoverable by AI shopping tools.",
  },
];

export const TONE_OPTIONS: {
  id: TonePreset;
  title: string;
  tagline: string;
  detail: string;
}[] = [
  {
    id: "professional",
    title: "Professional",
    tagline: "Polished & precise",
    detail:
      "Structured sentences, minimal slang. Best for B2B, finance-adjacent, or premium positioning.",
  },
  {
    id: "friendly",
    title: "Friendly",
    tagline: "Warm & approachable",
    detail:
      "Conversational and human. Great for D2C, lifestyle, and repeat shoppers who expect a human tone.",
  },
  {
    id: "concise",
    title: "Concise",
    tagline: "Short & scannable",
    detail:
      "Gets to the point fast in small chat bubbles. Ideal for high-volume SKUs or quick reorder flows.",
  },
];

export function tonePresetLabel(id: TonePreset): string {
  return TONE_OPTIONS.find((t) => t.id === id)?.title ?? id;
}
