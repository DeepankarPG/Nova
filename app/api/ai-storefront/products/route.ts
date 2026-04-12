import { NextResponse } from "next/server";
import { devCreateProduct, devListProducts } from "@/lib/ai-storefront/dev-store";
import { forwardUpstream, isUpstreamConfigured } from "@/lib/ai-storefront/upstream";
import type { StorefrontProduct } from "@/lib/ai-storefront/types";

export async function GET(request: Request) {
  if (isUpstreamConfigured()) {
    try {
      const res = await forwardUpstream(request, "/products");
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
      });
    } catch {
      return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
    }
  }
  return NextResponse.json({ products: devListProducts() });
}

export async function POST(request: Request) {
  if (isUpstreamConfigured()) {
    try {
      const body = await request.text();
      const res = await forwardUpstream(request, "/products", { method: "POST", body });
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
    const body = (await request.json()) as Partial<StorefrontProduct>;
    if (!body.sku || !body.name || typeof body.priceInPaise !== "number") {
      return NextResponse.json(
        { error: "sku, name, and priceInPaise are required" },
        { status: 400 }
      );
    }
    const row = devCreateProduct({
      sku: String(body.sku),
      name: String(body.name),
      description: typeof body.description === "string" ? body.description : "",
      priceInPaise: body.priceInPaise,
      currency: typeof body.currency === "string" ? body.currency : "INR",
      imageUrl: body.imageUrl ?? null,
      inventoryLabel: typeof body.inventoryLabel === "string" ? body.inventoryLabel : "—",
    });
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
