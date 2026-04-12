import type {
  AiGuardrails,
  InventoryOverview,
  PreviewScript,
  PublishResult,
  StorefrontOverview,
  StorefrontProduct,
  StorefrontSettings,
} from "@/lib/ai-storefront/types";
import type { PreviewScenario } from "@/lib/ai-storefront/types";

const JSON_HEADERS = { "content-type": "application/json" };

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return JSON.parse(text) as T;
}

export async function fetchAiStorefrontOverview(): Promise<StorefrontOverview> {
  const res = await fetch("/api/ai-storefront/overview", { cache: "no-store" });
  return parseJson<StorefrontOverview>(res);
}

export async function fetchAiStorefrontSettings(): Promise<StorefrontSettings> {
  const res = await fetch("/api/ai-storefront/store", { cache: "no-store" });
  return parseJson<StorefrontSettings>(res);
}

export async function patchAiStorefrontSettings(
  patch: Partial<StorefrontSettings>
): Promise<StorefrontSettings> {
  const res = await fetch("/api/ai-storefront/store", {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(patch),
  });
  return parseJson<StorefrontSettings>(res);
}

export async function fetchAiStorefrontProducts(): Promise<StorefrontProduct[]> {
  const res = await fetch("/api/ai-storefront/products", { cache: "no-store" });
  const data = await parseJson<{ products: StorefrontProduct[] }>(res);
  return data.products;
}

export async function createAiStorefrontProduct(
  body: Omit<StorefrontProduct, "id" | "updatedAt">
): Promise<StorefrontProduct> {
  const res = await fetch("/api/ai-storefront/products", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  return parseJson<StorefrontProduct>(res);
}

export async function patchAiStorefrontProduct(
  id: string,
  patch: Partial<Omit<StorefrontProduct, "id">>
): Promise<StorefrontProduct> {
  const res = await fetch(`/api/ai-storefront/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(patch),
  });
  return parseJson<StorefrontProduct>(res);
}

export async function deleteAiStorefrontProduct(id: string): Promise<void> {
  const res = await fetch(`/api/ai-storefront/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await parseJson<{ ok: boolean }>(res);
}

export async function fetchAiStorefrontInventory(): Promise<InventoryOverview> {
  const res = await fetch("/api/ai-storefront/inventory", { cache: "no-store" });
  return parseJson<InventoryOverview>(res);
}

export async function syncAiStorefrontInventorySource(sourceId: string): Promise<void> {
  const res = await fetch("/api/ai-storefront/inventory", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ action: "sync", sourceId }),
  });
  await parseJson<{ source: unknown }>(res);
}

export async function fetchAiStorefrontAiContext(): Promise<AiGuardrails> {
  const res = await fetch("/api/ai-storefront/ai-context", { cache: "no-store" });
  return parseJson<AiGuardrails>(res);
}

export async function patchAiStorefrontAiContext(
  patch: Partial<AiGuardrails>
): Promise<AiGuardrails> {
  const res = await fetch("/api/ai-storefront/ai-context", {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(patch),
  });
  return parseJson<AiGuardrails>(res);
}

export async function fetchAiStorefrontPreview(
  scenario: PreviewScenario = "default"
): Promise<PreviewScript> {
  const q = scenario === "default" ? "" : `?scenario=${encodeURIComponent(scenario)}`;
  const res = await fetch(`/api/ai-storefront/preview${q}`, { cache: "no-store" });
  return parseJson<PreviewScript>(res);
}

export async function publishAiStorefront(): Promise<PublishResult> {
  const res = await fetch("/api/ai-storefront/publish", { method: "POST" });
  return parseJson<PublishResult>(res);
}
