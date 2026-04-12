import { NextResponse } from "next/server";
import { devGetAiContext, devPatchAiContext } from "@/lib/ai-storefront/dev-store";
import { forwardUpstream, isUpstreamConfigured } from "@/lib/ai-storefront/upstream";
import type { AiGuardrails } from "@/lib/ai-storefront/types";

export async function GET(request: Request) {
  if (isUpstreamConfigured()) {
    try {
      const res = await forwardUpstream(request, "/ai-context");
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
      });
    } catch {
      return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
    }
  }
  return NextResponse.json(devGetAiContext());
}

export async function PATCH(request: Request) {
  if (isUpstreamConfigured()) {
    try {
      const body = await request.text();
      const res = await forwardUpstream(request, "/ai-context", { method: "PATCH", body });
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
      });
    } catch {
      return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
    }
  }
  try {
    const patch = (await request.json()) as Partial<AiGuardrails>;
    return NextResponse.json(devPatchAiContext(patch));
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
