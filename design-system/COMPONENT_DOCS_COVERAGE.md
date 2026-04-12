# PayGlocal UI — package vs UI docs coverage

This file tracks **`@payglocal/ui` exports**, what **`apps/payglocal-ui-docs`** documents under `/docs/components/[slug]`, and **gaps** (not in package vs missing doc vs missing preview variants).

## Summary

| Area | In `@payglocal/ui` | Doc page | Preview variants |
|------|-------------------|----------|------------------|
| Utilities (`cn`) | Yes | No (by design) | N/A |
| Layout (`Box`, `Stack`, `Inline`) | Yes | `layout-primitives` | Nested Stack gaps, multiple `Inline` rows |
| `Button` | Yes | `button` | `ButtonPlayground` |
| `Card` (+ `CardAction`, sizes) | Yes | `card` | `CardPlayground` |
| `Input`, `Textarea`, `Label` | Yes | `input` | `InputPlayground` (states, types, Textarea block) |
| `Field` * | Yes | `field` | `FieldPlayground` |
| `InputGroup` * | Yes | `input-group` | `InputGroupPlayground` |
| `Select` * | Yes | `select` | `SelectPlayground` |
| `DropdownMenu` * | Yes | `dropdown-menu` | `DropdownMenuPlayground` |
| `Dialog` * | Yes | `dialog` | Modal demo |
| `Popover` (+ anchor) | Yes | `popover` | Side buttons + content |
| `Tooltip` | Yes | `tooltip` | Four sides |
| `Tabs` | Yes | `tabs` | Disabled trigger |
| `ScrollArea`, `ScrollBar` | Yes | `scroll-area` | `ScrollAreaPlayground` |
| `Separator` | Yes | `separator` | Horizontal + vertical |
| `Avatar` | Yes | `avatar` | Three sizes + fallback |
| `DataTable` | Yes | `data-table` | `DataTablePlayground` |
| `StatusBadge` | Yes | `status-badge` | `StatusBadgePlayground` + export `STATUS_BADGE_KEYS` |
| `PageHeader` | Yes | `page-header` | With actions + title-only |
| `EmptyState` | Yes | `empty-state` | Action + custom icon / no description |
| `Skeleton` * | Yes | `skeleton` | `SkeletonPlayground` |
| `Chart` * | Yes | `chart` | `ChartPlayground` |
| `Chart` templates | Yes | `chart-templates` | Large demo |
| `CurrencyAmountInput` | Yes | `currency-amount-input` | Toggle disabled |
| `DatePicker` | Yes | `date-picker` | Default + `min` |
| `Calendar`, `CalendarDayButton` | Yes | `calendar` | `CalendarPlayground` |
| `Toaster` / `toast` | Yes | `sonner` | Success + error |

\* Radix subcomponents exist on the export; previews exercise the common ones.

## Not in `@payglocal/ui` (app-level or future)

These may exist in the product (`components/`) but are **not** design-system primitives today:

- Checkbox, Radio group, Switch (use native + `Label` or add Radix later)
- `Alert` / inline `Callout` banner
- `Breadcrumb`
- `Command` / combobox
- `Sheet` / drawer
- `Slider`
- `Toggle` / `ToggleGroup`
- `Accordion`
- `NavigationMenu`
- `ContextMenu`
- `Progress`
- `AspectRatio`
- `Collapsible`
- `HoverCard`
- `Menubar`

When a primitive is added under `packages/payglocal-ui`, register it in `apps/payglocal-ui-docs/lib/component-registry.ts` and add a `ComponentPreview` case or playground.

## Maintenance

When you add a new export from `packages/payglocal-ui/src/index.ts`:

1. Add a `ComponentDocPage` entry in `component-registry.ts` (unless it is purely internal).
2. Add a `case` in `ComponentPreview.tsx` or a `*Playground.tsx` import.
3. If the preview shell should stretch, add the slug to `lib/preview-layout.ts`.
