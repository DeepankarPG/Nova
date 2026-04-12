import { NextResponse } from "next/server";
import { devDeleteProduct, devUpdateProduct } from "@/lib/ai-storefront/dev-store";
import { forwardUpstream, isUpstreamConfigured } from "@/lib/ai-storefront/upstream";
import type { StorefrontProduct } from "@/lib/ai-storefront/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (isUpstreamConfigured()) {
    try {
      const body = await request.text();
      const res = await forwardUpstream(request, `/products/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body,
      });
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
    const patch = (await request.json()) as Partial<Omit<StorefrontProduct, "id">>;
    const updated = devUpdateProduct(id, patch);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (isUpstreamConfigured()) {
    try {
      const res = await forwardUpstream(request, `/products/${encodeURIComponent(id)}`, {
        method: "DELETE",
        body: null,
      });
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
      });
    } catch {
      return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
    }
  }
  const ok = devDeleteProduct(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
