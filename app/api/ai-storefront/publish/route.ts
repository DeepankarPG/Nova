import { NextResponse } from "next/server";
import { devPublish } from "@/lib/ai-storefront/dev-store";
import { forwardUpstream, isUpstreamConfigured } from "@/lib/ai-storefront/upstream";

export async function POST(request: Request) {
  if (isUpstreamConfigured()) {
    try {
      const body = await request.text();
      const res = await forwardUpstream(request, "/publish", { method: "POST", body });
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
      });
    } catch {
      return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
    }
  }
  const { publishedAt, estimatedPropagationSeconds } = devPublish();
  return NextResponse.json({
    publishedAt,
    estimatedPropagationSeconds,
    message: "Storefront changes are propagating to AI tools.",
  });
}
