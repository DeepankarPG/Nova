import type { PreviewJourneyProduct, StorefrontProduct } from "@/lib/ai-storefront/types";

const SPEC_LINES_ROTATION: [string, string][] = [
  ["32h total playback", "USB-C fast charge"],
  ["Hybrid ANC", "Transparency mode"],
  ["IPX4 rated", "Touch controls"],
  ["Open-ear fit", "Dual-device pairing"],
  ["Ultra-compact case", "Quick pair"],
  ["Magnetic clasp", "Workout secure"],
  ["Low-latency mode", "Detachable mic"],
  ["Studio-tuned drivers", "Braided cable"],
  ["2.4 GHz + BT", "Console-ready"],
  ["Boom mic included", "Mute flip-to-mute"],
];

/**
 * Builds carousel rows for the immersive preview from live catalogue rows (dev BFF).
 * Adds demo list price, rating, and spec lines — not stored on `StorefrontProduct`.
 */
export function mapStorefrontProductsToPreviewJourney(
  products: StorefrontProduct[]
): PreviewJourneyProduct[] {
  return products.map((p, i) => {
    const bump = 1.26 + ((i * 7) % 6) * 0.035;
    const listRaw = Math.round(p.priceInPaise * bump);
    const listPriceInPaise = listRaw > p.priceInPaise ? listRaw : undefined;
    const ratingN = 4.2 + ((i * 3) % 8) * 0.1;
    const ratingLabel = `${ratingN.toFixed(1)} (demo)`;
    const specLines = SPEC_LINES_ROTATION[i % SPEC_LINES_ROTATION.length]!;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      priceInPaise: p.priceInPaise,
      currency: p.currency,
      listPriceInPaise,
      ratingLabel,
      specLines: [...specLines],
      imageSrc: p.imageUrl ?? undefined,
    };
  });
}
