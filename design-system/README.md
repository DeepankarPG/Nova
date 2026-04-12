# PayGlocal design system

This folder documents the **in-repo** design system.

## Where the code lives

- **`packages/payglocal-ui/`** — Publishable npm package **`@payglocal/ui`** (TypeScript source). This is the **canonical implementation** for primitives.
- **`components/ui/`** — Thin re-exports from **`../../packages/payglocal-ui/src`** so `@/components/ui/*` works without relying on `node_modules` (fixes Turbopack / workspace link issues). You can still `import { … } from "@payglocal/ui"` elsewhere thanks to **`tsconfig` `paths`**.
- **`components/shared/`** — Legacy copies kept for reference; new work should not add here. Prefer editing **`packages/payglocal-ui/src`** and keeping `shared/` in sync only if you still rely on direct imports.
- **`design-system/payglocal-theme.css`** — Shared **semantic tokens**, **`@theme inline`** bridge, and **motion** variables. Imported by **`app/globals.css`** and **`apps/payglocal-ui-docs/app/globals.css`** so the dashboard and public docs never drift. See **`design-system/CSS_PARITY.md`**.
- **`app/globals.css`** — Tailwind **`@import`**, **`@source`** for the UI package, product-only utilities (Echo, widgets, keyframes).
- **Live docs (Atlas)** — Internal-style docs in **`apps/atlas-docs`** (`npm run dev:atlas` → port **3001**, routes **`/design`**). Deploy with Root Directory **`apps/atlas-docs`**.
- **Public UI docs (open source)** — Standalone site in **`apps/payglocal-ui-docs`**. From repo root: **`npm run dev:ui-docs`** or **`npm run dev:docs`** → **http://localhost:3002** → **`/docs`** (not **`npm run dev`**, which is the dashboard on **3000**). Same PayGlocal tokens and **`@payglocal/ui`** as the product. Deploy: Root Directory **`apps/payglocal-ui-docs`** (**`design-system/HOSTING.md`**). Optional **`NEXT_PUBLIC_UI_DOCS_GITHUB_URL`** for the header repo link.
- The main dashboard no longer serves **`/design`** unless you set **`ATLAS_DOCS_BASE_URL`** to redirect to Atlas.

## Install in another project

After **`@payglocal/ui`** is published to npm (or via `npm link` / `file:` during development):

```bash
npm install @payglocal/ui
```

1. Add **`transpilePackages: ['@payglocal/ui']`** in **Next.js** `next.config`.
2. In your main CSS (Tailwind v4):

```css
@import "tailwindcss";
@source "../node_modules/@payglocal/ui/src/**/*.tsx";
```

3. Mirror semantic tokens from **`design-system/payglocal-theme.css`** (or copy variable blocks from this repo’s **`app/globals.css`** entry, which imports that file).

Full consumer notes: **`packages/payglocal-ui/README.md`**.

## Publish (maintainers)

From the repo root:

```bash
npm publish -w @payglocal/ui --access public
```

Bump **`packages/payglocal-ui/package.json`** `version` first.

To sync implementation from the monorepo app when you change **`packages/payglocal-ui`**, edit files there directly; if you maintain **`components/shared/`** in parallel, update both or remove **`shared`** once all imports go through **`@payglocal/ui`**.

## shadcn alignment

`components.json` at the repository root follows the [shadcn/ui schema](https://ui.shadcn.com/docs/components-json). Tailwind v4 uses `app/globals.css` instead of a classic `tailwind.config.js`.

## Related files

| Path | Purpose |
|------|---------|
| `payglocal-theme.css` | Shared tokens + `@theme` (product + ui-docs) |
| `CSS_PARITY.md` | How dashboard and docs CSS stay aligned |
| `BACKLOG.md` | Roadmap vs large design systems (components, patterns) |
| `DESIGN.md` | Figma links and design ↔ code notes |
| `CONTRIBUTING.md` | PR and UI guidelines |
| `LICENSE` | MIT |
