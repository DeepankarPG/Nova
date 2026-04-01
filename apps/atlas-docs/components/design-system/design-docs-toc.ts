export type TocItem = { id: string; label: string };

/** Right-rail “On this page” — keyed by pathname. */
export const DESIGN_DOCS_TOC: Record<string, TocItem[]> = {
  "/design": [
    { id: "introduction", label: "Introduction" },
    { id: "how-to-use", label: "How to use" },
    { id: "explore", label: "Explore" },
  ],
  "/design/foundations": [
    { id: "semantic-colors", label: "Semantic colors" },
    { id: "typography", label: "Typography" },
    { id: "tailwind-v4", label: "Tailwind v4" },
    { id: "figma", label: "Figma" },
  ],
  "/design/components": [
    { id: "directory", label: "Directory" },
    { id: "inventory", label: "Inventory" },
  ],
  "/design/card": [
    { id: "preview", label: "Preview" },
    { id: "installation", label: "Installation" },
    { id: "usage", label: "Usage" },
    { id: "examples", label: "Examples" },
    { id: "api", label: "API Reference" },
  ],
  "/design/button": [
    { id: "preview", label: "Preview" },
    { id: "import", label: "Import" },
    { id: "usage", label: "Usage" },
    { id: "props", label: "Props" },
  ],
  "/design/input": [
    { id: "installation", label: "Installation" },
    { id: "usage", label: "Usage" },
    { id: "examples", label: "Examples" },
  ],
};
