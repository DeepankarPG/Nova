import { NextResponse } from "next/server";
import { devGetInventory, devSyncSource } from "@/lib/ai-storefront/dev-store";
import { forwardUpstream, isUpstreamConfigured } from "@/lib/ai-storefront/upstream";

export async function GET(request: Request) {
  if (isUpstreamConfigured()) {
    try {
      const res = await forwardUpstream(request, "/inventory");
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
      });
    } catch {
      return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
    }
  }
  return NextResponse.json(devGetInventory());
}

export async function POST(request: Request) {
  if (isUpstreamConfigured()) {
    try {
      const body = await request.text();
      const res = await forwardUpstream(request, "/inventory", { method: "POST", body });
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
    const json = (await request.json()) as { action?: string; sourceId?: string };
    if (json.action !== "sync" || !json.sourceId) {
      return NextResponse.json({ error: "Expected { action: 'sync', sourceId }" }, { status: 400 });
    }
    const src = devSyncSource(json.sourceId);
    if (!src) return NextResponse.json({ error: "Unknown source" }, { status: 404 });
    return NextResponse.json({ source: src });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
