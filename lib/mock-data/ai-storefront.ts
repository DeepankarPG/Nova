import type {
  AiGuardrails,
  InventoryOverview,
  PreviewScript,
  StorefrontAnalytics,
  StorefrontOverview,
  StorefrontProduct,
  StorefrontSettings,
} from "@/lib/ai-storefront/types";

/** Demo analytics for dev / design review; replace with BFF when wired. */
export const aiStorefrontAnalyticsSeed: StorefrontAnalytics = {
  rangeLabel: "Last 24 hours vs prior day",
  assistantSessions: {
    total: 2847,
    deltaPct: 14.2,
    byChannel: [
      { id: "chatgpt", label: "ChatGPT", sessions: 1822, pct: 64 },
      { id: "claude", label: "Claude", sessions: 891, pct: 31 },
      { id: "other", label: "Other assistants", sessions: 134, pct: 5 },
    ],
  },
  promptVolume: [
    { label: "4a", current: 42, previous: 31 },
    { label: "6a", current: 58, previous: 44 },
    { label: "8a", current: 124, previous: 98 },
    { label: "10a", current: 198, previous: 156 },
    { label: "12p", current: 256, previous: 210 },
    { label: "2p", current: 232, previous: 201 },
    { label: "4p", current: 268, previous: 189 },
    { label: "6p", current: 312, previous: 245 },
    { label: "8p", current: 276, previous: 228 },
    { label: "10p", current: 156, previous: 134 },
    { label: "12a", current: 88, previous: 72 },
    { label: "2a", current: 54, previous: 48 },
  ],
  mcpUptime: {
    pct: 99.94,
    deltaPct: 0.12,
    series: [
      { label: "4a", pct: 100 },
      { label: "6a", pct: 100 },
      { label: "8a", pct: 99.2 },
      { label: "10a", pct: 100 },
      { label: "12p", pct: 100 },
      { label: "2p", pct: 99.8 },
      { label: "4p", pct: 100 },
      { label: "6p", pct: 100 },
      { label: "8p", pct: 100 },
      { label: "10p", pct: 100 },
      { label: "12a", pct: 100 },
      { label: "2a", pct: 100 },
    ],
  },
  toolLatency: {
    p95Ms: 142,
    deltaPct: -8.4,
    series: [
      { label: "4a", current: 128, previous: 156 },
      { label: "6a", current: 118, previous: 148 },
      { label: "8a", current: 165, previous: 172 },
      { label: "10a", current: 152, previous: 160 },
      { label: "12p", current: 138, previous: 155 },
      { label: "2p", current: 142, previous: 150 },
      { label: "4p", current: 155, previous: 168 },
      { label: "6p", current: 148, previous: 162 },
      { label: "8p", current: 134, previous: 158 },
      { label: "10p", current: 122, previous: 140 },
      { label: "12a", current: 110, previous: 132 },
      { label: "2a", current: 105, previous: 128 },
    ],
  },
  funnel: {
    stages: [
      { key: "open", label: "Chat opened your storefront", count: 2847 },
      { key: "browse", label: "Product card or tool result shown", count: 1924 },
      { key: "intent", label: "Add-to-bag / checkout intent", count: 412 },
      { key: "checkout", label: "Reached PayGlocal checkout", count: 186 },
    ],
    overallConversionPct: 6.5,
    deltaPct: 0.7,
  },
  toolUsage: {
    inputTokensThousands: 842,
    outputTokensThousands: 1206,
    deltaPct: 9.1,
  },
};

export const aiStorefrontOverviewSeed: StorefrontOverview = {
  lifecycleStatus: "draft",
  setupComplete: false,
  setupProgressPercent: 35,
  productCount: 10,
  lastPublishedAt: null,
  estimatedPropagationSeconds: 60,
  mcp: {
    status: "healthy",
    p95LatencyMs: 142,
    lastCheckedAt: "2026-04-08T09:15:00.000Z",
  },
  catalogueSyncedAt: "2026-04-08T08:40:00.000Z",
  analytics: aiStorefrontAnalyticsSeed,
};

export const aiStorefrontSettingsSeed: StorefrontSettings = {
  brandName: "Wavefront Audio",
  welcomeMessage:
    "Welcome to Wavefront Audio — wireless earbuds, over-ear headphones, and gaming headsets. Ask what’s in stock or what fits your budget.",
  tonePreset: "friendly",
  setupComplete: false,
  setupStepsCompleted: 1,
};

/** Demo catalogue photos (Unsplash, in /public); reused across rows intentionally. */
const CATALOG_IMG = {
  warm: "/luke-peterson-lUMj2Zv5HUE-unsplash.jpg",
  snack: "/caleb-wright-E8Olk5kVN5c-unsplash.jpg",
  tea: "/filipe-alves-qFJR0wI2ITM-unsplash.jpg",
  gift: "/andres-jasso-6hQB-U2nWG8-unsplash.jpg",
  spread: "/frank-septillion-Qrspubmx6kE-unsplash.jpg",
} as const;

export const aiStorefrontProductsSeed: StorefrontProduct[] = [
  {
    id: "asp_001",
    sku: "AUD-WBL-01",
    name: "WaveBud Lite",
    description: "True wireless · ENC · USB-C charging case.",
    priceInPaise: 129900,
    currency: "INR",
    imageUrl: CATALOG_IMG.warm,
    inventoryLabel: "In stock (synced)",
    updatedAt: "2026-04-07T12:00:00.000Z",
  },
  {
    id: "asp_002",
    sku: "AUD-SNE-02",
    name: "SoundNest Essential",
    description: "Over-ear comfort · fold-flat hinges · 32h battery.",
    priceInPaise: 169900,
    currency: "INR",
    imageUrl: CATALOG_IMG.snack,
    inventoryLabel: "In stock (synced)",
    updatedAt: "2026-04-06T10:30:00.000Z",
  },
  {
    id: "asp_003",
    sku: "AUD-PAI-03",
    name: "Pulse Air In-Ear",
    description: "IPX4 sweat resistance · gesture controls · quick pair.",
    priceInPaise: 149900,
    currency: "INR",
    imageUrl: CATALOG_IMG.tea,
    inventoryLabel: "Low stock",
    updatedAt: "2026-04-05T09:00:00.000Z",
  },
  {
    id: "asp_004",
    sku: "AUD-ZEP-04",
    name: "Zephyr Open Clip",
    description: "Open-ear awareness · secure clip · 24h with case.",
    priceInPaise: 189900,
    currency: "INR",
    imageUrl: CATALOG_IMG.gift,
    inventoryLabel: "In stock (synced)",
    updatedAt: "2026-04-04T16:20:00.000Z",
  },
  {
    id: "asp_005",
    sku: "AUD-PKT-05",
    name: "PocketPods Mini",
    description: "Ultra-compact case · pocketable · Bluetooth 5.3.",
    priceInPaise: 99900,
    currency: "INR",
    imageUrl: CATALOG_IMG.spread,
    inventoryLabel: "In stock (synced)",
    updatedAt: "2026-04-03T11:00:00.000Z",
  },
  {
    id: "asp_006",
    sku: "AUD-ARC-06",
    name: "ArcSport Neckband",
    description: "Magnetic buds · 18h playback · workout secure fit.",
    priceInPaise: 119900,
    currency: "INR",
    imageUrl: CATALOG_IMG.warm,
    inventoryLabel: "In stock (synced)",
    updatedAt: "2026-04-02T08:45:00.000Z",
  },
  {
    id: "asp_007",
    sku: "AUD-ELT-07",
    name: "Elite ANC Pro",
    description: "Hybrid noise cancellation · transparency · travel fold.",
    priceInPaise: 199900,
    currency: "INR",
    imageUrl: CATALOG_IMG.snack,
    inventoryLabel: "Low stock",
    updatedAt: "2026-04-01T14:10:00.000Z",
  },
  {
    id: "asp_008",
    sku: "AUD-CLN-08",
    name: "Clarity USB-C Wired",
    description: "Studio-tuned 40mm drivers · inline mic · braided cable.",
    priceInPaise: 159900,
    currency: "INR",
    imageUrl: CATALOG_IMG.tea,
    inventoryLabel: "In stock (synced)",
    updatedAt: "2026-03-31T09:20:00.000Z",
  },
  {
    id: "asp_009",
    sku: "AUD-DLX-09",
    name: "Delta LX Gaming",
    description: "2.4 GHz dongle · sub-20ms latency · Discord-certified mic.",
    priceInPaise: 179900,
    currency: "INR",
    imageUrl: CATALOG_IMG.gift,
    inventoryLabel: "In stock (synced)",
    updatedAt: "2026-03-30T16:00:00.000Z",
  },
  {
    id: "asp_010",
    sku: "AUD-STR-10",
    name: "StreamMic Duo Kit",
    description: "Headset + detachable boom · dual PC/Mac routing.",
    priceInPaise: 219900,
    currency: "INR",
    imageUrl: CATALOG_IMG.warm,
    inventoryLabel: "Made to order",
    updatedAt: "2026-03-29T10:05:00.000Z",
  },
];

export const aiStorefrontInventorySeed: InventoryOverview = {
  stockCheckedAtCheckoutCopy:
    "Inventory is validated when checkout starts, not when items are added to cart in the assistant. This reduces oversells while keeping browsing fast.",
  sources: [
    {
      id: "inv_manual",
      kind: "manual",
      label: "Manual catalogue",
      status: "connected",
      lastSyncAt: "2026-04-08T08:40:00.000Z",
      detail: "Products edited in PayGlocal are served to AI tools on publish.",
    },
    {
      id: "inv_shopify",
      kind: "shopify",
      label: "Shopify",
      status: "disconnected",
      lastSyncAt: null,
      detail: "Connect your store to sync products and inventory on a schedule.",
    },
    {
      id: "inv_woo",
      kind: "woocommerce",
      label: "WooCommerce",
      status: "disconnected",
      lastSyncAt: null,
      detail: "Connect your WordPress shop for automated catalogue updates.",
    },
    {
      id: "inv_csv",
      kind: "csv",
      label: "CSV import",
      status: "disconnected",
      lastSyncAt: null,
      detail: "Upload a CSV to bulk-create or refresh products.",
    },
  ],
};

export const aiStorefrontAiContextSeed: AiGuardrails = {
  allowedTopics: [
    "Specs and compatibility (Bluetooth, codecs, ports) per SKU",
    "Battery life and charging for each model",
    "Shipping and warranty within India",
  ],
  forbiddenTopics: [
    "Medical or hearing-health claims",
    "Competitor comparisons",
    "Unverified audiophile performance claims",
  ],
  mustNotQuotePriceWithoutTool: true,
  mustNotPromiseDeliveryDates: true,
  mustNotConfirmAvailabilityWithoutTool: true,
};

export const aiStorefrontPreviewDefaultSeed: PreviewScript = {
  scenario: "default",
  disclaimer:
    "Interactive demo only — messages, cards, and checkout are simulated. Real AI assistants and PayGlocal flows may differ.",
  messages: [
    {
      id: "pm_1",
      role: "user",
      content: "Show me wireless earbuds and headphones from your catalogue.",
    },
    {
      id: "pm_2",
      role: "assistant",
      content:
        "Here’s what we list right now — scroll the row to compare, then pick one for PayGlocal checkout.",
    },
  ],
  toolBlocks: [
    {
      id: "tb_1",
      toolName: "browse_products",
      title: "Headphones & earbuds",
      body: "Carousel from your published catalogue (dev preview uses the same product list).",
    },
  ],
  journey: {
    initialUserMessage: "Show me wireless earbuds and headphones from your catalogue.",
    composerPlaceholder: "Ask about products in your storefront…",
    idleHint:
      "Your first message is prefilled below. Edit it if you want, then tap Send — product cards appear after you send.",
    assistantProductReply:
      "Here are the models in your catalogue right now — same list as the dashboard. Select one, then continue to pay with PayGlocal.",
    trustedMerchantBadge: "PayGlocal trusted checkout",
    userContinueMessage: "Continue to pay with PayGlocal",
    assistantPayIntro: "Pay using a saved card on file. Tap a card to confirm — you’ll see a quick PayGlocal secure prompt.",
    paySectionTitle: "Saved cards",
    successTitleTemplate: "Payment successful",
    successBodyTemplate:
      "Your purchase of {{product}} is confirmed. Order updates will be sent by SMS.",
    products: [],
    savedCards: [
      {
        id: "pj_c1",
        brandLabel: "Mastercard Debit",
        maskedPan: "•••• 4492",
        expiryLabel: "Expires 05/29",
      },
      {
        id: "pj_c2",
        brandLabel: "Visa Credit",
        maskedPan: "•••• 8821",
        expiryLabel: "Expires 11/27",
      },
    ],
  },
};

export const aiStorefrontPreviewCatalogueDownSeed: PreviewScript = {
  scenario: "catalogue_unavailable",
  disclaimer:
    "This preview simulates assistant messages and tool results. Actual AI platforms may format responses differently.",
  messages: [
    {
      id: "pm_cd_1",
      role: "user",
      content: "Show me your headphones.",
    },
    {
      id: "pm_cd_2",
      role: "assistant",
      content:
        "I’m having trouble loading the catalogue right now. Please try again in a moment or browse on our website while we fix this.",
    },
  ],
  toolBlocks: [
    {
      id: "tb_cd_1",
      toolName: "browse_products",
      title: "Error",
      body: "CATALOGUE_UNAVAILABLE — retry suggested",
    },
  ],
};
