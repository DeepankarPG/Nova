/** Merchant AI Storefront — shapes shared by BFF, seed, and UI. */

export type StorefrontLifecycleStatus = "draft" | "live" | "paused";

export type McpHealthStatus = "healthy" | "degraded" | "unknown";

export type InventorySourceKind = "manual" | "shopify" | "woocommerce" | "csv";

export type InventorySourceStatus = "connected" | "disconnected" | "error" | "syncing";

export type TonePreset = "professional" | "friendly" | "concise";

export type PreviewScenario = "default" | "catalogue_unavailable";

export type PreviewMessageRole = "user" | "assistant" | "system";

export type PreviewBlockType = "text" | "tool_result";

/** Hourly (or bucket) point for assistant / MCP time-series charts. */
export interface StorefrontAnalyticsTimePoint {
  label: string;
  /** Primary series (e.g. this period). */
  current: number;
  /** Comparison series (e.g. previous day). Optional for single-series charts. */
  previous?: number;
}

/** Split of shopper sessions by AI surface (ChatGPT Apps, Claude, etc.). */
export interface StorefrontAssistantChannelRow {
  id: "chatgpt" | "claude" | "other";
  label: string;
  sessions: number;
  /** Share of total sessions, 0–100. */
  pct: number;
}

/** Conversion-style funnel for chat → commerce (seed / BFF driven). */
export interface StorefrontAnalyticsFunnelStage {
  key: string;
  label: string;
  count: number;
}

/**
 * Merchant-facing analytics for AI Storefront overview (optional on upstream).
 * Designed for ChatGPT vs Claude bifurcation, MCP health, and chat→checkout funnel.
 */
export interface StorefrontAnalytics {
  /** e.g. "Last 24 hours vs prior day" */
  rangeLabel: string;
  assistantSessions: {
    total: number;
    /** vs comparison period, e.g. 12.4 */
    deltaPct: number;
    byChannel: StorefrontAssistantChannelRow[];
  };
  /** Shopper prompts / turns in assistant (volume over time). */
  promptVolume: StorefrontAnalyticsTimePoint[];
  mcpUptime: {
    /** Rolling availability % for catalogue/checkout MCP endpoints. */
    pct: number;
    deltaPct: number;
    /** Hourly availability 0–100 for spark-style chart. */
    series: { label: string; pct: number }[];
  };
  toolLatency: {
    p95Ms: number;
    deltaPct: number;
    series: StorefrontAnalyticsTimePoint[];
  };
  funnel: {
    stages: StorefrontAnalyticsFunnelStage[];
    /** Share: last stage / first stage * 100 */
    overallConversionPct: number;
    deltaPct: number;
  };
  /** Rough token proxy for billed MCP / model usage (optional). */
  toolUsage?: {
    inputTokensThousands: number;
    outputTokensThousands: number;
    deltaPct: number;
  };
}

export interface StorefrontOverview {
  lifecycleStatus: StorefrontLifecycleStatus;
  setupComplete: boolean;
  setupProgressPercent: number;
  productCount: number;
  lastPublishedAt: string | null;
  estimatedPropagationSeconds: number;
  mcp: {
    status: McpHealthStatus;
    p95LatencyMs: number | null;
    lastCheckedAt: string;
  };
  catalogueSyncedAt: string | null;
  /** Present when BFF / dev seed exposes assistant analytics. */
  analytics?: StorefrontAnalytics;
}

export interface StorefrontSettings {
  brandName: string;
  welcomeMessage: string;
  tonePreset: TonePreset;
  setupComplete: boolean;
  /** 0–4 wizard steps completed (for hub progress). */
  setupStepsCompleted: number;
}

export interface StorefrontProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  priceInPaise: number;
  currency: string;
  imageUrl: string | null;
  /** Shown in UI; stock enforced at checkout per product policy. */
  inventoryLabel: string;
  updatedAt: string;
}

export interface InventorySource {
  id: string;
  kind: InventorySourceKind;
  label: string;
  status: InventorySourceStatus;
  lastSyncAt: string | null;
  detail: string;
}

export interface InventoryOverview {
  sources: InventorySource[];
  stockCheckedAtCheckoutCopy: string;
}

export interface AiGuardrails {
  allowedTopics: string[];
  forbiddenTopics: string[];
  mustNotQuotePriceWithoutTool: boolean;
  mustNotPromiseDeliveryDates: boolean;
  mustNotConfirmAvailabilityWithoutTool: boolean;
}

export interface PreviewMessage {
  id: string;
  role: PreviewMessageRole;
  content: string;
}

export interface PreviewToolBlock {
  id: string;
  toolName: string;
  title: string;
  body: string;
}

/** Rich product row inside the immersive carousel widget (seed-driven copy). */
export interface PreviewJourneyProduct {
  id: string;
  name: string;
  description: string;
  priceInPaise: number;
  currency: string;
  /** Optional struck-through reference price for “% off” demo. */
  listPriceInPaise?: number;
  ratingLabel?: string;
  /** Short spec lines under title (e.g. playback hours). */
  specLines?: string[];
  /** Public path e.g. `/photo-unsplash.jpg` for carousel image. */
  imageSrc?: string;
}

/** Saved instrument shown as sequential chat rows before payment. */
export interface PreviewJourneyCard {
  id: string;
  brandLabel: string;
  maskedPan: string;
  expiryLabel: string;
}

/**
 * Scripted conversational commerce journey for merchant preview (mobile + desktop).
 * When present, the preview page renders the immersive chat mock instead of plain transcript/tool panels.
 */
export interface PreviewJourney {
  initialUserMessage: string;
  /** Shown in the composer before Send (merchants can edit in the demo). */
  composerPlaceholder?: string;
  /** Short copy when no messages yet. */
  idleHint?: string;
  assistantProductReply: string;
  trustedMerchantBadge: string;
  userContinueMessage: string;
  assistantPayIntro: string;
  paySectionTitle: string;
  successTitleTemplate: string;
  /** Use {{product}} placeholder; filled client-side from selected product name. */
  successBodyTemplate: string;
  products: PreviewJourneyProduct[];
  savedCards: PreviewJourneyCard[];
}

export interface PreviewScript {
  scenario: PreviewScenario;
  disclaimer: string;
  messages: PreviewMessage[];
  toolBlocks: PreviewToolBlock[];
  /** Immersive shopping + PayGlocal checkout demo (default scenario). */
  journey?: PreviewJourney;
}

export interface PublishResult {
  publishedAt: string;
  estimatedPropagationSeconds: number;
  message?: string;
}
