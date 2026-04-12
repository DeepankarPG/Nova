/**
 * PayGlocal UI — component inventory.
 * Status: available = token, @payglocal/ui primitive, or documented product pattern. backlog = not scheduled (see roadmap note on /design/components).
 */

export type InventoryStatus = "available" | "backlog";

export type InventoryItem = {
  id: string;
  name: string;
  description: string;
  status: InventoryStatus;
  importPath?: string;
  designHref?: string;
  hint?: string;
};

export type InventoryCategory = {
  id: string;
  title: string;
  description: string;
  items: InventoryItem[];
};

export const INVENTORY_CATEGORIES: InventoryCategory[] = [
  {
    id: "foundations",
    title: "Foundations",
    description: "Design tokens and global primitives the whole product inherits.",
    items: [
      {
        id: "f-colors",
        name: "Color tokens",
        description: "Semantic palette, light/dark, primary and surfaces in CSS variables.",
        status: "available",
        designHref: "/design/foundations",
        hint: "app/globals.css :root / .dark",
      },
      {
        id: "f-type",
        name: "Typography scale",
        description: "Geist Sans/Mono, heading and body rhythm via Tailwind.",
        status: "available",
        designHref: "/design/foundations",
      },
      {
        id: "f-space",
        name: "Spacing scale",
        description: "Tailwind spacing utilities as the canonical rhythm (padding, gap, space-y).",
        status: "available",
        designHref: "/design/foundations",
        hint: "Prefer token-backed surfaces; use spacing steps 1–12 (e.g. gap-3, p-4)",
      },
      {
        id: "f-radius",
        name: "Border radius",
        description: "rounded-* utilities aligned with cards and controls.",
        status: "available",
        designHref: "/design/foundations",
      },
      {
        id: "f-elevation",
        name: "Elevation / shadows",
        description: "Surfaces use border + shadow-sm (or shadow-lg for overlays); no separate shadow token scale yet.",
        status: "available",
        designHref: "/design/foundations",
        hint: "Cards: border border-border shadow-sm; modals: shadow-2xl",
      },
      {
        id: "f-icons",
        name: "Icon library",
        description: "Lucide icons across dashboard and settings.",
        status: "available",
        hint: "lucide-react",
      },
      {
        id: "f-motion",
        name: "Motion tokens",
        description: "Centralized duration/easing tokens for Framer and CSS transitions.",
        status: "backlog",
        hint: "Today: framer-motion defaults + ad hoc transition-* on primitives",
      },
      {
        id: "f-chart-tokens",
        name: "Chart color tokens",
        description: "--chart-1 … --chart-5 for Recharts series.",
        status: "available",
        designHref: "/design/foundations",
        hint: "Pair with /design/chart",
      },
    ],
  },
  {
    id: "core",
    title: "Core components",
    description: "Basic interactive building blocks.",
    items: [
      {
        id: "c-button",
        name: "Button",
        description: "Variants, sizes, loading, icons.",
        status: "available",
        importPath: "@/components/ui/button",
        designHref: "/design/button",
      },
      {
        id: "c-input",
        name: "Input",
        description: "Single-line text, file type, aria-invalid and disabled states.",
        status: "available",
        importPath: "@/components/ui/input",
        designHref: "/design/input",
      },
      {
        id: "c-textarea",
        name: "Textarea",
        description: "Multi-line text with consistent focus ring.",
        status: "available",
        importPath: "@/components/ui/textarea",
        designHref: "/design/input",
      },
      {
        id: "c-select",
        name: "Select / dropdown",
        description: "Radix Select with portal content and keyboard support.",
        status: "available",
        importPath: "@/components/ui/select",
        designHref: "/design/overlays",
      },
      {
        id: "c-checkbox",
        name: "Checkbox",
        description: "Binary choice with accessible label.",
        status: "backlog",
        hint: "Add @radix-ui/react-checkbox primitive when needed",
      },
      {
        id: "c-radio",
        name: "Radio group",
        description: "Single choice from a set.",
        status: "backlog",
      },
      {
        id: "c-switch",
        name: "Toggle / switch",
        description: "On/off control for settings.",
        status: "backlog",
      },
      {
        id: "c-label",
        name: "Label",
        description: "Radix Label primitive; pairs with FieldLabel in forms.",
        status: "available",
        importPath: "@/components/ui/label",
        designHref: "/design/input",
      },
      {
        id: "c-field",
        name: "Field primitives",
        description: "Field, FieldGroup, FieldLabel, FieldDescription, FieldError, FieldSet, FieldSeparator.",
        status: "available",
        importPath: "@/components/ui/field",
        designHref: "/design/input",
      },
      {
        id: "c-input-group",
        name: "Input group",
        description: "Addons, icons, and inline actions wrapping Input or Textarea.",
        status: "available",
        importPath: "@/components/ui/input-group",
        designHref: "/design/input",
      },
      {
        id: "c-link",
        name: "Link",
        description: "Next.js Link + token colors for inline navigation.",
        status: "available",
        hint: "next/link",
      },
      {
        id: "c-avatar",
        name: "Avatar",
        description: "User or entity image with fallback (Radix Avatar).",
        status: "available",
        importPath: "@/components/ui/avatar",
        designHref: "/design/overlays",
      },
      {
        id: "c-badge",
        name: "Status badge",
        description: "Workflow states for payments and disputes.",
        status: "available",
        importPath: "@/components/ui/status-badge",
        designHref: "/design/status-badge",
        hint: "Not a generic Badge; extend later",
      },
      {
        id: "c-chip",
        name: "Chip / tag",
        description: "Removable or static compact tags.",
        status: "backlog",
      },
    ],
  },
  {
    id: "layout",
    title: "Layout & structure",
    description: "Page composition, shells, and spatial patterns.",
    items: [
      {
        id: "l-card",
        name: "Card",
        description: "Contained surface with header, content, footer; shadcn-aligned Card primitives.",
        status: "available",
        importPath: "@/components/ui/card",
        designHref: "/design/card",
        hint: "packages/payglocal-ui/src/card.tsx",
      },
      {
        id: "l-divider",
        name: "Separator",
        description: "Horizontal or vertical divider; used inside FieldSeparator.",
        status: "available",
        importPath: "@/components/ui/separator",
        designHref: "/design/input",
        hint: "@radix-ui/react-separator",
      },
      {
        id: "l-stack",
        name: "Stack / cluster",
        description: "Vertical and horizontal spacing primitives as Tailwind patterns.",
        status: "backlog",
        hint: "Document as layout recipes in Foundations",
      },
      {
        id: "l-grid",
        name: "Grid",
        description: "Responsive grid for dashboards and settings columns.",
        status: "available",
        hint: "Tailwind grid in product",
      },
      {
        id: "l-container",
        name: "Container",
        description: "Max-width page gutters for marketing or wide layouts.",
        status: "backlog",
      },
      {
        id: "l-sidebar",
        name: "Sidebar layout",
        description: "Dashboard shell with merchant selector and nav.",
        status: "available",
        hint: "components/layout/Sidebar.tsx",
      },
      {
        id: "l-split",
        name: "Split pane",
        description: "Resizable two-column layouts.",
        status: "backlog",
      },
      {
        id: "l-drawer",
        name: "Drawer / panel",
        description: "Slide-over for filters or secondary tasks.",
        status: "backlog",
        hint: "Consider Sheet pattern (Radix Dialog variant)",
      },
      {
        id: "l-page-header",
        name: "Page header",
        description: "Title, subtitle, and toolbar actions for list pages.",
        status: "available",
        importPath: "@/components/ui/page-header",
        designHref: "/design/page-header",
      },
    ],
  },
  {
    id: "feedback",
    title: "Feedback & status",
    description: "How the UI communicates progress, emptiness, and alerts.",
    items: [
      {
        id: "fb-toast",
        name: "Toast / snackbar",
        description: "Transient confirmations via Sonner; themed Toaster in @payglocal/ui.",
        status: "available",
        importPath: "@/components/ui/sonner",
        designHref: "/design/overlays",
        hint: "Use toast() from the same module; mount <Toaster /> once near root",
      },
      {
        id: "fb-alert",
        name: "Alert / inline message",
        description: "Contextual warning, info, or error blocks.",
        status: "backlog",
      },
      {
        id: "fb-banner",
        name: "Banner",
        description: "Dismissible promos and system messages.",
        status: "available",
        hint: "components/echo/EchoLaunchBanner.tsx and similar callout patterns",
      },
      {
        id: "fb-skeleton",
        name: "Skeleton loader",
        description: "Shimmer placeholders for tables, charts, and stats.",
        status: "available",
        importPath: "@/components/ui/skeleton",
        designHref: "/design/skeleton",
      },
      {
        id: "fb-spinner",
        name: "Spinner",
        description: "Inline loading indicator beyond button state.",
        status: "backlog",
      },
      {
        id: "fb-progress",
        name: "Progress bar",
        description: "Determinate upload or step progress.",
        status: "backlog",
      },
      {
        id: "fb-empty",
        name: "Empty state",
        description: "Centered empty views with optional action.",
        status: "available",
        importPath: "@/components/ui/empty-state",
        designHref: "/design/empty-state",
      },
      {
        id: "fb-error",
        name: "Error state",
        description: "Failed load boundary with retry.",
        status: "backlog",
      },
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    description: "Moving between sections and deep content.",
    items: [
      {
        id: "n-header",
        name: "App header",
        description: "Top bar with theme toggle and merchant context.",
        status: "available",
        hint: "components/layout/Header.tsx",
      },
      {
        id: "n-sidebar-nav",
        name: "Sidebar navigation",
        description: "Primary route list with active states.",
        status: "available",
        hint: "components/layout/Sidebar.tsx",
      },
      {
        id: "n-tabs",
        name: "Tabs",
        description: "Section switching without route change (Radix Tabs).",
        status: "available",
        importPath: "@/components/ui/tabs",
        designHref: "/design/overlays",
      },
      {
        id: "n-pagination",
        name: "Pagination",
        description: "Page controls for long tables.",
        status: "available",
        importPath: "@/components/ui/data-table",
        designHref: "/design/data-table",
        hint: "Built into DataTable footer",
      },
      {
        id: "n-breadcrumb",
        name: "Breadcrumbs",
        description: "Hierarchy trail for nested IA.",
        status: "backlog",
      },
      {
        id: "n-command",
        name: "Command menu",
        description: "Keyboard-driven palette for power users.",
        status: "backlog",
      },
      {
        id: "n-stepper",
        name: "Step indicator",
        description: "Multi-step flows and onboarding.",
        status: "backlog",
      },
    ],
  },
  {
    id: "overlays",
    title: "Overlays & modals",
    description: "Layers above the page for focus and extra context.",
    items: [
      {
        id: "o-dialog",
        name: "Modal / dialog",
        description: "Radix dialog with portal styling.",
        status: "available",
        importPath: "@/components/ui/dialog",
        designHref: "/design/dialog",
      },
      {
        id: "o-tooltip",
        name: "Tooltip",
        description: "Hover/focus hints on dense UIs.",
        status: "available",
        importPath: "@/components/ui/tooltip",
        designHref: "/design/overlays",
        hint: "Wrap app region with TooltipProvider where needed",
      },
      {
        id: "o-popover",
        name: "Popover",
        description: "Anchored floating panels.",
        status: "available",
        importPath: "@/components/ui/popover",
        designHref: "/design/overlays",
      },
      {
        id: "o-context",
        name: "Context menu",
        description: "Right-click or long-press actions.",
        status: "backlog",
      },
      {
        id: "o-sheet",
        name: "Sheet / bottom sheet",
        description: "Mobile-friendly slide-up panels.",
        status: "backlog",
      },
      {
        id: "o-lightbox",
        name: "Lightbox",
        description: "Full-screen media preview.",
        status: "backlog",
      },
    ],
  },
  {
    id: "data",
    title: "Data display",
    description: "Tables, charts, and dense information.",
    items: [
      {
        id: "d-table",
        name: "Data table",
        description: "Column-driven table with pagination and empty state.",
        status: "available",
        importPath: "@/components/ui/data-table",
        designHref: "/design/data-table",
      },
      {
        id: "d-table-primitive",
        name: "Table (primitive)",
        description: "Unstyled or lightly styled HTML table shell.",
        status: "backlog",
        hint: "Optional shadcn Table",
      },
      {
        id: "d-accordion",
        name: "Accordion",
        description: "Expandable sections for FAQs and settings.",
        status: "backlog",
      },
      {
        id: "d-chart-layer",
        name: "Chart layer",
        description: "ChartContainer, tooltips, and legend for Recharts.",
        status: "available",
        importPath: "@/components/ui/chart",
        designHref: "/design/chart",
      },
      {
        id: "d-bar",
        name: "Bar chart",
        description: "Category comparisons in dashboard widgets.",
        status: "available",
        hint: "components/charts/BarChartCard.tsx",
      },
      {
        id: "d-line",
        name: "Line chart",
        description: "Time series trends for volume and rates.",
        status: "available",
        hint: "components/charts/LineChartCard.tsx",
      },
      {
        id: "d-pie",
        name: "Pie / donut chart",
        description: "Part-to-whole breakdowns.",
        status: "backlog",
        hint: "Recharts Pie + ChartContainer",
      },
      {
        id: "d-stat",
        name: "Stat card",
        description: "KPI tiles with delta and spark context.",
        status: "available",
        hint: "components/dashboard/TodaysAnalyticsSection.tsx",
      },
      {
        id: "d-heatmap",
        name: "Heat map",
        description: "Geographic or matrix intensity views.",
        status: "backlog",
      },
      {
        id: "d-datagrid",
        name: "Data grid",
        description: "Sortable, filterable dense grid beyond simple tables.",
        status: "backlog",
      },
      {
        id: "d-timeline",
        name: "Timeline",
        description: "Activity and audit streams.",
        status: "backlog",
      },
      {
        id: "d-map",
        name: "Map / geo insight",
        description: "Country or region visualization.",
        status: "available",
        hint: "components/dashboard/CountryInsightsMap.tsx",
      },
    ],
  },
  {
    id: "forms",
    title: "Forms & inputs",
    description: "Complex data entry and filters.",
    items: [
      {
        id: "g-form",
        name: "Form layout",
        description: "Field grouping, validation messaging, submit patterns.",
        status: "available",
        hint: "Field primitives + settings under app/(dashboard)/settings/**",
      },
      {
        id: "g-date",
        name: "Date picker",
        description: "Single-date calendar popover.",
        status: "available",
        importPath: "@/components/ui/date-picker",
        designHref: "/design/date-picker",
      },
      {
        id: "g-currency",
        name: "Currency amount input",
        description: "Amount with currency selector for payment flows.",
        status: "available",
        importPath: "@/components/ui/currency-amount-input",
        designHref: "/design/currency-amount-input",
      },
      {
        id: "g-file",
        name: "File upload",
        description: "Drag-drop and progress for documents.",
        status: "backlog",
      },
      {
        id: "g-search",
        name: "Search with filters",
        description: "Query plus chip or dropdown filters.",
        status: "available",
        hint: "Transactions, invoice-management, client-management list filters",
      },
      {
        id: "g-combobox",
        name: "Combobox",
        description: "Searchable select for long lists.",
        status: "backlog",
      },
      {
        id: "g-phone",
        name: "Phone input",
        description: "International format and validation.",
        status: "backlog",
      },
      {
        id: "g-otp",
        name: "OTP input",
        description: "One-time code entry for security flows.",
        status: "backlog",
      },
      {
        id: "g-slider",
        name: "Range slider",
        description: "Numeric range selection.",
        status: "backlog",
      },
    ],
  },
  {
    id: "utilities",
    title: "Utilities & patterns",
    description: "Cross-cutting product behaviors and composite cards.",
    items: [
      {
        id: "u-theme",
        name: "Theme switcher",
        description: "Light/dark via next-themes on design and dashboard.",
        status: "available",
        hint: "DesignDocsTopBar; dashboard header",
      },
      {
        id: "u-copy",
        name: "Copy to clipboard",
        description: "API keys, IDs, and share links.",
        status: "backlog",
      },
      {
        id: "u-scroll",
        name: "Scroll area",
        description: "Custom scrollbars in tight layouts.",
        status: "available",
        importPath: "@/components/ui/scroll-area",
        designHref: "/design/overlays",
      },
      {
        id: "u-dropdown",
        name: "Dropdown menu",
        description: "Actions menu in headers and rows.",
        status: "available",
        importPath: "@/components/ui/dropdown-menu",
        designHref: "/design/overlays",
      },
      {
        id: "u-widget",
        name: "Dashboard widget shell",
        description: "Configurable grid tiles and picker.",
        status: "available",
        hint: "components/dashboard/configurable/DashboardWidgetRenderer.tsx, WidgetLibraryModal.tsx",
      },
      {
        id: "u-merchant",
        name: "Merchant selector",
        description: "Context switch for multi-merchant users.",
        status: "available",
        hint: "components/layout/MerchantSelector.tsx",
      },
      {
        id: "u-insight",
        name: "Insight / highlight card",
        description: "Narrative callouts tied to metrics.",
        status: "backlog",
      },
      {
        id: "u-offline",
        name: "Offline state",
        description: "Connectivity loss messaging.",
        status: "backlog",
      },
      {
        id: "u-tour",
        name: "Onboarding tour",
        description: "Coach marks for first-time flows.",
        status: "backlog",
      },
    ],
  },
];

export function getInventoryStats(categories: InventoryCategory[]) {
  let total = 0;
  let available = 0;
  let backlog = 0;
  for (const c of categories) {
    for (const item of c.items) {
      total++;
      if (item.status === "available") available++;
      else backlog++;
    }
  }
  return {
    total,
    categories: categories.length,
    available,
    backlog,
  };
}

/** Flat list for search / future API (optional). */
export function flattenInventory(categories: InventoryCategory[]): InventoryItem[] {
  return categories.flatMap((c) => c.items.map((i) => i));
}
