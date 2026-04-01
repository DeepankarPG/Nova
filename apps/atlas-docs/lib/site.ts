/**
 * Canonical public URL for Atlas (production custom domain or Vercel preview).
 * Set NEXT_PUBLIC_ATLAS_SITE_URL in production for stable OG URLs and sitemap.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_ATLAS_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) {
    return explicit.startsWith("http") ? explicit : `https://${explicit}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3001";
}

export function getMetadataBase(): URL {
  return new URL(`${getSiteUrl()}/`);
}
