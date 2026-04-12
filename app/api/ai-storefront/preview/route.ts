import { NextResponse } from "next/server";
import {
  aiStorefrontPreviewCatalogueDownSeed,
  aiStorefrontPreviewDefaultSeed,
  aiStorefrontProductsSeed,
} from "@/lib/mock-data/ai-storefront";
import { devListProducts } from "@/lib/ai-storefront/dev-store";
import { mapStorefrontProductsToPreviewJourney } from "@/lib/ai-storefront/map-storefront-to-preview-products";
import { forwardUpstream, isUpstreamConfigured } from "@/lib/ai-storefront/upstream";
import type { PreviewScenario, PreviewScript } from "@/lib/ai-storefront/types";

function devDefaultPreviewScript(): PreviewScript {
  const script = structuredClone(aiStorefrontPreviewDefaultSeed) as PreviewScript;
  const live = devListProducts();
  const source = live.length > 0 ? live : aiStorefrontProductsSeed;
  if (script.journey) {
    script.journey = {
      ...script.journey,
      products: mapStorefrontProductsToPreviewJourney(source),
    };
  }
  return script;
}

export async function GET(request: Request) {
  if (isUpstreamConfigured()) {
    try {
      const u = new URL(request.url);
      const qs = u.search;
      const res = await forwardUpstream(request, `/preview${qs}`);
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
      });
    } catch {
      return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
    }
  }
  const u = new URL(request.url);
  const scenario = (u.searchParams.get("scenario") ?? "default") as PreviewScenario;
  const script =
    scenario === "catalogue_unavailable"
      ? aiStorefrontPreviewCatalogueDownSeed
      : devDefaultPreviewScript();
  return NextResponse.json(script);
}
