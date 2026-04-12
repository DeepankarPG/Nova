import type {
  AiGuardrails,
  InventoryOverview,
  InventorySource,
  StorefrontOverview,
  StorefrontProduct,
  StorefrontSettings,
} from "@/lib/ai-storefront/types";
import {
  aiStorefrontAiContextSeed,
  aiStorefrontInventorySeed,
  aiStorefrontOverviewSeed,
  aiStorefrontProductsSeed,
  aiStorefrontSettingsSeed,
} from "@/lib/mock-data/ai-storefront";

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

type DevState = {
  overview: StorefrontOverview;
  settings: StorefrontSettings;
  products: StorefrontProduct[];
  inventory: InventoryOverview;
  aiContext: AiGuardrails;
};

let state: DevState | null = null;

function ensureState(): DevState {
  if (!state) {
    state = {
      overview: clone(aiStorefrontOverviewSeed),
      settings: clone(aiStorefrontSettingsSeed),
      products: clone(aiStorefrontProductsSeed),
      inventory: clone(aiStorefrontInventorySeed),
      aiContext: clone(aiStorefrontAiContextSeed),
    };
  }
  return state;
}

function recomputeOverview(s: DevState): void {
  s.overview.productCount = s.products.length;
  s.overview.setupComplete = s.settings.setupComplete;
  const steps = s.settings.setupStepsCompleted;
  s.overview.setupProgressPercent = Math.min(100, Math.round((steps / 5) * 100));
}

export function devGetOverview(): StorefrontOverview {
  const s = ensureState();
  recomputeOverview(s);
  return clone(s.overview);
}

export function devGetSettings(): StorefrontSettings {
  return clone(ensureState().settings);
}

export function devPatchSettings(patch: Partial<StorefrontSettings>): StorefrontSettings {
  const s = ensureState();
  s.settings = { ...s.settings, ...patch };
  recomputeOverview(s);
  return clone(s.settings);
}

export function devListProducts(): StorefrontProduct[] {
  return clone(ensureState().products);
}

export function devCreateProduct(
  input: Omit<StorefrontProduct, "id" | "updatedAt">
): StorefrontProduct {
  const s = ensureState();
  const id = `asp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const row: StorefrontProduct = {
    ...input,
    id,
    updatedAt: new Date().toISOString(),
  };
  s.products.push(row);
  recomputeOverview(s);
  return clone(row);
}

export function devUpdateProduct(
  id: string,
  patch: Partial<Omit<StorefrontProduct, "id">>
): StorefrontProduct | null {
  const s = ensureState();
  const i = s.products.findIndex((p) => p.id === id);
  if (i === -1) return null;
  s.products[i] = {
    ...s.products[i]!,
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  recomputeOverview(s);
  return clone(s.products[i]!);
}

export function devDeleteProduct(id: string): boolean {
  const s = ensureState();
  const len = s.products.length;
  s.products = s.products.filter((p) => p.id !== id);
  recomputeOverview(s);
  return s.products.length < len;
}

export function devGetInventory(): InventoryOverview {
  return clone(ensureState().inventory);
}

export function devSyncSource(sourceId: string): InventorySource | null {
  const s = ensureState();
  const src = s.inventory.sources.find((x) => x.id === sourceId);
  if (!src) return null;
  src.status = "syncing";
  const now = new Date().toISOString();
  src.lastSyncAt = now;
  s.overview.catalogueSyncedAt = now;
  src.status = "connected";
  src.detail = "Last sync completed successfully.";
  return clone(src);
}

export function devGetAiContext(): AiGuardrails {
  return clone(ensureState().aiContext);
}

export function devPatchAiContext(patch: Partial<AiGuardrails>): AiGuardrails {
  const s = ensureState();
  if (patch.allowedTopics) s.aiContext.allowedTopics = patch.allowedTopics;
  if (patch.forbiddenTopics) s.aiContext.forbiddenTopics = patch.forbiddenTopics;
  if (patch.mustNotQuotePriceWithoutTool !== undefined) {
    s.aiContext.mustNotQuotePriceWithoutTool = patch.mustNotQuotePriceWithoutTool;
  }
  if (patch.mustNotPromiseDeliveryDates !== undefined) {
    s.aiContext.mustNotPromiseDeliveryDates = patch.mustNotPromiseDeliveryDates;
  }
  if (patch.mustNotConfirmAvailabilityWithoutTool !== undefined) {
    s.aiContext.mustNotConfirmAvailabilityWithoutTool = patch.mustNotConfirmAvailabilityWithoutTool;
  }
  return clone(s.aiContext);
}

export function devPublish(): { publishedAt: string; estimatedPropagationSeconds: number } {
  const s = ensureState();
  const publishedAt = new Date().toISOString();
  s.overview.lastPublishedAt = publishedAt;
  s.overview.lifecycleStatus = "live";
  s.settings.setupComplete = true;
  s.settings.setupStepsCompleted = 5;
  recomputeOverview(s);
  return {
    publishedAt,
    estimatedPropagationSeconds: s.overview.estimatedPropagationSeconds,
  };
}

export function devTouchMcpCheck(): void {
  const s = ensureState();
  s.overview.mcp.lastCheckedAt = new Date().toISOString();
}
