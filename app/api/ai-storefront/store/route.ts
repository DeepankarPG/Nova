import { NextResponse } from "next/server";
import { devGetSettings, devPatchSettings } from "@/lib/ai-storefront/dev-store";
import type { StorefrontSettings } from "@/lib/ai-storefront/types";
import { forwardUpstream, isUpstreamConfigured } from "@/lib/ai-storefront/upstream";

export async function GET(request: Request) {
  if (isUpstreamConfigured()) {
    try {
      const res = await forwardUpstream(request, "/store");
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
      });
    } catch {
      return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
    }
  }
  return NextResponse.json(devGetSettings());
}

export async function PATCH(request: Request) {
  if (isUpstreamConfigured()) {
    try {
      const body = await request.text();
      const res = await forwardUpstream(request, "/store", { method: "PATCH", body });
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
    const patch = (await request.json()) as Record<string, unknown>;
    const allowed: Partial<StorefrontSettings> = {};
    if (typeof patch.brandName === "string") allowed.brandName = patch.brandName;
    if (typeof patch.welcomeMessage === "string") allowed.welcomeMessage = patch.welcomeMessage;
    if (
      patch.tonePreset === "professional" ||
      patch.tonePreset === "friendly" ||
      patch.tonePreset === "concise"
    ) {
      allowed.tonePreset = patch.tonePreset;
    }
    if (typeof patch.setupComplete === "boolean") allowed.setupComplete = patch.setupComplete;
    if (typeof patch.setupStepsCompleted === "number") {
      allowed.setupStepsCompleted = Math.min(5, Math.max(0, Math.floor(patch.setupStepsCompleted)));
    }
    return NextResponse.json(devPatchSettings(allowed));
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
