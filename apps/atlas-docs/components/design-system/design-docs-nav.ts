export type DesignDocsNavItem = {
  title: string;
  href: string;
  description?: string;
};

export type DesignDocsNavSection = {
  label: string;
  items: DesignDocsNavItem[];
};

export const DESIGN_DOCS_NAV: DesignDocsNavSection[] = [
  {
    label: "Overview",
    items: [
      { title: "Introduction", href: "/design", description: "Atlas — PayGlocal UI primitives and tokens" },
      { title: "Foundations", href: "/design/foundations", description: "Colors, tokens, and theming" },
      {
        title: "Component inventory",
        href: "/design/components",
        description: "Categories, status, and roadmap",
      },
    ],
  },
  {
    label: "Components",
    items: [
      { title: "Button", href: "/design/button", description: "Actions and forms" },
      { title: "Card", href: "/design/card", description: "Header, content, footer surface" },
      { title: "Input", href: "/design/input", description: "Field, groups, states" },
      { title: "Dialog", href: "/design/dialog", description: "Radix modal shell" },
      {
        title: "Overlays & menus",
        href: "/design/overlays",
        description: "Select, tabs, tooltip, popover, menus, scroll, avatar, toasts",
      },
      { title: "Data table", href: "/design/data-table", description: "Paginated columns" },
      { title: "Status badge", href: "/design/status-badge", description: "Workflow states" },
      { title: "Page header", href: "/design/page-header", description: "Title and actions" },
      { title: "Chart", href: "/design/chart", description: "Recharts + ChartContainer" },
      { title: "Skeleton", href: "/design/skeleton", description: "Shimmer loading" },
      { title: "Empty state", href: "/design/empty-state", description: "No-data panels" },
      { title: "Date picker", href: "/design/date-picker", description: "Single-date calendar" },
      {
        title: "Currency amount",
        href: "/design/currency-amount-input",
        description: "Money + currency",
      },
    ],
  },
];
