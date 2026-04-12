import { NextResponse } from "next/server";
import { devGetOverview, devTouchMcpCheck } from "@/lib/ai-storefront/dev-store";
import { forwardUpstream, isUpstreamConfigured } from "@/lib/ai-storefront/upstream";

export async function GET(request: Request) {
  if (isUpstreamConfigured()) {
    try {
      const res = await forwardUpstream(request, "/overview");
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
      });
    } catch {
      return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
    }
  }
  devTouchMcpCheck();
  return NextResponse.json(devGetOverview());
}
