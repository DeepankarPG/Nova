# PayGlocal UI — expansion backlog

Prioritized gap list versus large systems (e.g. Razorpay Blade). Use this for roadmap planning; implementation order should follow **foundations → high-traffic primitives → patterns**.

**Legend:** `[x]` shipped in repo at time of writing · `[ ]` not yet a first-class `@payglocal/ui` export or doc recipe.

## Foundations & tokens

| Item | Status | Notes |
|------|--------|--------|
| Semantic color tokens | [x] | `payglocal-theme.css` + chart / sidebar / header |
| Motion duration & easing | [x] | `--motion-duration-*`, `--motion-ease-*`, Tailwind `duration-pg-*`, `ease-pg-*` |
| Typography docs | [x] | `/docs/foundations/typography` |
| Spacing scale docs | [x] | `/docs/foundations/spacing` + `LayoutSpacing` on Box/Stack/Inline |
| Elevation / shadow ladder | [ ] | Optional CSS vars + doc table |
| Breakpoint reference | [ ] | Doc aligned to dashboard layouts |
| Opacity / z-index tokens | [ ] | Optional |
| Shared `tokens.css` only (no app-specific CSS) | [x] | `payglocal-theme.css` |

## Layout primitives

| Item | Status | Notes |
|------|--------|--------|
| Box | [x] | Padding props |
| Stack | [x] | Vertical flex + gap |
| Inline | [x] | Horizontal flex + gap |
| Responsive styled props (Blade-style objects) | [ ] | Future; high type complexity |
| Grid / Split / Center | [ ] | Optional |

## Components (common gaps)

| Item | Status | Notes |
|------|--------|--------|
| Accordion | [ ] | Radix Collapsible composition |
| Alert | [ ] | Status + description + actions |
| Badge (generic) | [ ] | Beyond `StatusBadge` |
| Breadcrumb | [ ] | |
| Button | [x] | + motion tokens |
| Card | [x] | |
| Checkbox | [ ] | Radix |
| Collapsible | [ ] | |
| Combobox / Command | [ ] | |
| Data table | [x] | |
| Date picker | [x] | |
| Dialog | [x] | |
| Drawer / Sheet | [ ] | |
| Dropdown menu | [x] | |
| Empty state | [x] | |
| File upload | [ ] | |
| Input / Textarea / Label | [x] | |
| Input group | [x] | |
| Link / Text link | [ ] | |
| Icon button | [ ] | |
| List / List item | [ ] | |
| Modal variants (fullscreen) | [ ] | |
| Pagination | [ ] | |
| Popover | [x] | |
| Progress | [ ] | |
| Radio group | [ ] | |
| Scroll area | [x] | |
| Select | [x] | |
| Separator | [x] | |
| Skeleton | [x] | Expand variants |
| Slider | [ ] | |
| Spinner | [ ] | |
| Switch | [ ] | |
| Table (low-level) | [ ] | vs composed `DataTable` |
| Tabs | [x] | |
| Toast | [x] | Sonner |
| Tooltip | [x] | |
| Time picker | [ ] | |
| Carousel | [ ] | |
| Tour / spotlight | [ ] | Lower priority |

## Fintech / domain

| Item | Status | Notes |
|------|--------|--------|
| Currency amount input | [x] | |
| Amount display (read-only) | [ ] | Formatted money cell |
| Filter chips / quick filters | [ ] | |

## Charting

| Item | Status | Notes |
|------|--------|--------|
| Chart composition (Recharts) | [x] | `ChartContainer`, tooltips |
| Dashboard chart templates | [x] | `chart-templates.tsx` |

## Patterns & recipes (docs or light components)

| Item | Status | Notes |
|------|--------|--------|
| List view shell | [ ] | |
| Detail view shell | [ ] | |
| Settings layout | [ ] | |
| Confirmation flow | [ ] | |
| Creation / empty → form | [ ] | |
| Simple dashboard recipe | [ ] | Compose templates + layout primitives |
| Simple form recipe | [ ] | Field + actions |

## Docs / DX

| Item | Status | Notes |
|------|--------|--------|
| CSS parity product ↔ ui-docs | [x] | `payglocal-theme.css`, `CSS_PARITY.md` |
| Preview chrome (minimal / dashboard / card) | [x] | Per-component toggle |
| Playground + generated code | [x] | Button, Input, Data table |
| Props table / Storybook | [ ] | Future |
| StackBlitz embed | [ ] | Non-goal for v1 |
