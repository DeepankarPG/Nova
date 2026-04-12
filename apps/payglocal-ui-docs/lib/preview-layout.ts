/** Previews that read better top-aligned and full-width inside the canvas */
export const DOCS_PREVIEW_STRETCH_SLUGS = new Set<string>([
  "calendar",
  "data-table",
  "page-header",
  "chart",
  "chart-templates",
]);

export type PreviewLayoutMode = "center" | "stretch";

/** Visual context for the preview canvas — matches how components sit in product vs isolated. */
export type PreviewChrome = "minimal" | "dashboard" | "inset-card";

const CHROME_DEFAULT: PreviewChrome = "dashboard";

/** Optional per-slug default chrome (user can still override in the UI). */
export const DOCS_PREVIEW_CHROME_DEFAULTS: Partial<Record<string, PreviewChrome>> = {
  button: "dashboard",
  input: "dashboard",
  "data-table": "dashboard",
  /** Avoid triple nested “card in card” frames; padding comes from Card + shell */
  card: "minimal",
  calendar: "minimal",
  dialog: "minimal",
};

export function getDocsPreviewConfig(slug: string): { layout: PreviewLayoutMode; chrome: PreviewChrome } {
  return {
    layout: DOCS_PREVIEW_STRETCH_SLUGS.has(slug) ? "stretch" : "center",
    chrome: DOCS_PREVIEW_CHROME_DEFAULTS[slug] ?? CHROME_DEFAULT,
  };
}
