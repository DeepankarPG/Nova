export type TocItem = { id: string; label: string };

export const STATIC_DOCS_TOC: Record<string, TocItem[]> = {
  "/docs": [
    { id: "overview", label: "Overview" },
    { id: "philosophy", label: "Philosophy" },
    { id: "open-code", label: "Open code" },
    { id: "stack", label: "Stack" },
    { id: "license", label: "License" },
  ],
  "/docs/guidelines": [
    { id: "tokens", label: "Design tokens" },
    { id: "tailwind", label: "Tailwind v4" },
    { id: "composition", label: "Composition" },
    { id: "accessibility", label: "Accessibility" },
    { id: "dark-mode", label: "Dark mode" },
  ],
  "/docs/installation": [
    { id: "quick", label: "One-command install" },
    { id: "next", label: "Next.js" },
    { id: "tailwind", label: "Tailwind v4" },
    { id: "tokens", label: "Design tokens" },
    { id: "monorepo", label: "Monorepo / workspace" },
  ],
  "/docs/theming": [
    { id: "variables", label: "CSS variables" },
    { id: "mapping", label: "Mapping to Tailwind" },
    { id: "dark", label: "Dark theme" },
  ],
  "/docs/components": [
    { id: "catalog", label: "All components" },
    { id: "roadmap", label: "Roadmap" },
  ],
  "/docs/foundations": [
    { id: "overview", label: "Overview" },
  ],
  "/docs/foundations/motion": [
    { id: "duration", label: "Duration tokens" },
    { id: "easing", label: "Easing tokens" },
    { id: "reduced-motion", label: "Reduced motion" },
    { id: "example", label: "Example" },
  ],
  "/docs/foundations/typography": [
    { id: "scale", label: "Scale" },
    { id: "patterns", label: "Patterns" },
  ],
  "/docs/foundations/spacing": [
    { id: "layout-spacing", label: "Layout spacing" },
    { id: "consistency", label: "Consistency" },
  ],
  "/docs/patterns": [
    { id: "overview", label: "Overview" },
  ],
  "/docs/patterns/dashboard-shell": [
    { id: "structure", label: "Structure" },
    { id: "tokens", label: "Tokens" },
    { id: "docs-preview", label: "Docs previews" },
  ],
  "/docs/patterns/forms": [
    { id: "example", label: "Example" },
    { id: "related", label: "Related" },
  ],
};
