/**
 * Atlas — PayGlocal UI docs branding and external links.
 *
 * Env (set on Vercel for the Atlas project):
 * - NEXT_PUBLIC_ATLAS_SITE_URL — canonical URL for OG + sitemap (production domain).
 * - NEXT_PUBLIC_ATLAS_GITHUB_URL — header GitHub link.
 * - NEXT_PUBLIC_MAIN_APP_URL — “Back to app” target.
 */

export const ATLAS_NAME = "Atlas";
export const ATLAS_SUBTITLE = "PayGlocal UI";

export function getAtlasGitHubUrl(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_ATLAS_GITHUB_URL) {
    return process.env.NEXT_PUBLIC_ATLAS_GITHUB_URL;
  }
  return "";
}

/** Main PayGlocal app URL — when set, “Back to app” links here (standalone Atlas deploy). */
export function getMainAppUrl(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_MAIN_APP_URL) {
    return process.env.NEXT_PUBLIC_MAIN_APP_URL.replace(/\/$/, "");
  }
  return "";
}
