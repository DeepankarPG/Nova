# PayGlocal GCC — design playbook (code ↔ design)

This document is the **single source of truth** for how product UI should look and behave in this repository. On case-insensitive filesystems it may appear as `DESIGN.md` or `design.md` (same file).

---

## Rules for designers, engineers, and AI agents

1. **Default to what already exists.** Reuse **`@payglocal/ui`** primitives, patterns in **`components/`**, and tokens in **`app/globals.css`**. Match spacing, type scale, radii, borders, shadows, and motion to nearby screens.
2. **Do not invent a new visual language** (new palettes, new radii systems, new type scales, new shadow vocabulary, or one-off components) **unless the request explicitly asks for exploration or a redesign.**
3. **Figma is upstream for layout intent; code is upstream for tokens.** If Figma and code disagree on **semantic** colors or radii, align to **code tokens** unless product design signs off on a token change in `globals.css`.
4. **Prefer Atlas for browsing:** `npm run dev:atlas` → [http://localhost:3001/design](http://localhost:3001/design) (foundations, components). Primitives live in **`packages/payglocal-ui/`**; the app re-exports via **`components/ui/*`** (see **`design-system/README.md`**).

When briefing an AI agent, paste: *“Follow `design.md` in the repo root: use existing tokens and `@payglocal/ui` only; no new visual style unless I say so.”*

---

## Design tokens (canonical)

All semantic colors and theme behavior are defined in **`design-system/payglocal-theme.css`** (imported into **`app/globals.css`**) under **`:root`** (light) and **`.dark`** (dark). Tailwind maps them via **`@theme inline`** in that file (e.g. `bg-background`, `text-foreground`, `border-border`).

### Core semantic colors (light reference)

| Role | CSS variable | Light (hex) | Usage |
|------|----------------|------------|--------|
| Canvas | `--background` | `#f6f8fa` | Page background |
| Default text | `--foreground` | `#111827` | Body copy |
| Surfaces | `--card` | `#ffffff` | Cards, panels |
| Dividers | `--border` | `#e5e7eb` | Borders, hairlines |
| Muted fill / secondary | `--muted`, `--muted-foreground` | `#f3f4f6` / `#6b7280` | Subtle backgrounds, secondary text |
| Brand / actions | `--primary` | `#0061e3` | Buttons, links, focus |
| On primary | `--primary-foreground` | `#ffffff` | Text on primary |
| Primary hover | `--primary-hover` | `#0055c8` | Hover states |
| Primary soft fill | `--primary-light` | `#eff4ff` | Highlights, chips |
| Focus ring | `--ring` | `#0061e3` (light) | `focus-visible` |
| Destructive | `--destructive` | `#dc2626` | Errors, dangerous actions |
| Sidebar / chrome | `--sidebar`, `--sidebar-border`, `--sidebar-foreground` | See CSS | Navigation rail |
| Header | `--header`, `--header-border` | See CSS | Top bar |

### PayGlocal dashboard widgets

| Token | Light |
|-------|--------|
| `--pg-blue` | `#1a56db` |
| `--pg-blue-light` | `#ebf3ff` |
| `--pg-navy` | `#1e2a3b` |
| `--pg-border` | `#e5e9f0` |
| `--pg-surface` | `#f7f9fc` |

Charts use **`--chart-1`** … **`--chart-5`** and chart chrome tokens (`--chart-grid`, `--chart-tick`, etc.). **Do not** introduce arbitrary hex colors in new UI when a semantic or chart token fits.

---

## Typography

- **Sans:** **Geist Sans** via `next/font` → CSS variable **`--font-geist-sans`** (`font-sans` in Tailwind).
- **Mono:** **Geist Mono** → **`--font-geist-mono`** (`font-mono`) for code and dense numeric UI.
- **Body:** `antialiased` on **`body`**; default inherits **`text-foreground`**.
- **Tracking:** Page titles often use **`tracking-tight`** (see Atlas foundations). Do **not** default to wide marketing letter-spacing unless matching an existing hero pattern.
- **Readable secondary copy:** `text-sm` / `text-[15px]` with **`text-muted-foreground`** and **`leading-relaxed`** is a documented pattern in Atlas.

---

## Spacing and layout rhythm

- **Dashboard page gutters:** `p-4 md:p-6` on main content (**`app/(dashboard)/layout.tsx`**).
- **Stacks and grids:** Prefer Tailwind scale steps used elsewhere: **`gap-3` / `gap-4`**, **`space-y-4`**, card insets **`p-3`–`p-6`**. Avoid arbitrary `px` spacing unless matching an existing component.
- **Consistency:** Within one screen, pick **one** spacing step for parallel regions (e.g. all section gaps `gap-4`).

---

## Radius

Defined in **`@theme inline`** and **`globals.css`**:

| Token / usage | Value |
|----------------|--------|
| Base `--radius` | `0.375rem` (6px) — inputs, small controls |
| `--radius-xl` | `0.625rem` |
| `--radius-2xl` | `0.875rem` — e.g. dialogs |
| `--radius-3xl` | `1.25rem` |
| `--radius-4xl` | `1.5rem` |

Cards and tables commonly use **`rounded-xl`**. Dialog content uses **`rounded-2xl`**. Stay consistent with sibling surfaces.

---

## Elevation, borders, and shadows

- **Default surfaces:** `bg-card` + **`border border-border`**; cards often add **`shadow-sm`**.
- **Modals / dialogs:** overlay **`bg-black/50 backdrop-blur-[2px]`**; content **`shadow-2xl`**, **`border-border`** (see **`packages/payglocal-ui/src/dialog.tsx`**).
- **Subtle row affordance:** hover shadow is token-adjacent and minimal (e.g. data table row hover uses a light **`shadow-[0_1px_0_rgba(0,0,0,0.04)]`** in light mode only). **Do not** add heavy drop shadows to list rows without a precedent.

---

## Data tables (canonical pattern)

Use **`DataTable`** from **`@payglocal/ui`** (or the app re-export). Conventions:

- **Container:** `bg-card text-card-foreground rounded-xl border border-border overflow-hidden`.
- **Header styles:** `surface` (muted header) vs `minimal`; header type **`text-[11px] font-semibold`** (default density) or **`text-[12px] font-medium text-muted-foreground`** (comfortable).
- **Cell padding:** default **`px-3.5 py-2.5`**; comfortable **`px-5 py-4`**.
- **Rows:** `border-b border-border/60`, hover `bg-muted/40` (light) / `bg-muted/25` (dark).
- **Scrollbars:** thin, 4px, aligned with global scrollbar styling.

New “spreadsheet” or list UIs should **match this table** rather than introducing new header heights or gridline colors.

---

## Status and feedback

- **Status pills:** **`StatusBadge`** in **`@payglocal/ui`** maps business statuses to **fixed** variants (`success`, `info`, `warning`, `danger`, `muted`, …) with **Tailwind hue + opacity + border** patterns tuned for light and dark. **Do not** create ad-hoc badge colors; extend **`status-badge.tsx`** if a status is missing.
- **Toasts:** use the app toaster / Sonner patterns already wired in the shell.
- **Focus:** visible focus uses **`outline: 2px solid var(--ring)`** with **`outline-offset: 2px`** for interactive elements (see **`globals.css`**).

---

## Icons and motion

- **Icons:** **lucide-react** at standard sizes (**`h-4 w-4`**, **`h-5 w-5`**) unless matching an existing component.
- **Motion:** **`page-enter`**, dialog open/close, and a few branded animations are defined in **`globals.css`**. Respect **`prefers-reduced-motion: reduce`**; many animations already gate on this.

---

## Theming

- Light/dark is toggled via **`next-themes`**; the **`dark`** class on **`html`** drives **`.dark`** variables. Components must use **semantic** classes (`bg-card`, `text-muted-foreground`) so both themes work.

---

## Figma and capture

- **Dashboard / main file:** [Cursor ↔ Figma](https://www.figma.com/design/9SBiK02a2hrINbrIHx0L7Z/Cursor%3C%3EFigma?node-id=0-1&t=XX2g4NE5GPvJe2Du-1)
- **Dashboard (captured from app):** [Home `/` capture](https://www.figma.com/design/9SBiK02a2hrINbrIHx0L7Z?node-id=3-2)
- **Design system / components:** add a second link in this section when available (File → Copy link in Figma).

For **Figma MCP**, paste a **frame or layer** URL so the agent targets a specific node.

**Code → Figma (dev only):** `app/layout.tsx` loads Figma’s capture script in development for HTML-to-design workflows. Remove that `<Script>` when captures are no longer needed.

**Process:** If code and Figma diverge, note it in the PR or Figma comments so design and engineering stay aligned.

---

## Quick checklist before shipping UI

- [ ] Colors from **semantic tokens** (no stray hex unless in token definitions).
- [ ] Spacing from the **Tailwind scale** and matches sibling layouts.
- [ ] Typography uses **Geist**; hierarchy matches nearby pages.
- [ ] Radius and shadow match **card / dialog / table** patterns above.
- [ ] Dark mode verified (`bg-*` / `text-*` semantic).
- [ ] **Reduced motion** respected for new animation.
- [ ] New primitives go to **`packages/payglocal-ui`** and Atlas if reusable.
