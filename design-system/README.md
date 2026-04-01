# PayGlocal design system

This folder documents the **in-repo** design system.

## Where the code lives

- **`packages/payglocal-ui/`** — Publishable npm package **`@payglocal/ui`** (TypeScript source). This is the **canonical implementation** for primitives.
- **`components/ui/`** — Thin re-exports from **`../../packages/payglocal-ui/src`** so `@/components/ui/*` works without relying on `node_modules` (fixes Turbopack / workspace link issues). You can still `import { … } from "@payglocal/ui"` elsewhere thanks to **`tsconfig` `paths`**.
- **`components/shared/`** — Legacy copies kept for reference; new work should not add here. Prefer editing **`packages/payglocal-ui/src`** and keeping `shared/` in sync only if you still rely on direct imports.
- **`app/globals.css`** — Design tokens and Tailwind v4 **`@source`** entry for the UI package (`../packages/payglocal-ui/src/**/*.tsx`).
- **Live docs (Atlas)** — Standalone Next app **`apps/atlas-docs`** (`npm run dev:atlas` → [http://localhost:3001](http://localhost:3001), routes **`/design`**, **`/design/components`**). Deploy on Vercel with Root Directory **`apps/atlas-docs`** (step-by-step: **`design-system/HOSTING.md`**). The main dashboard no longer serves **`/design`** unless you set **`ATLAS_DOCS_BASE_URL`** to redirect to Atlas.

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

3. Mirror semantic tokens from this app’s **`app/globals.css`** (`--background`, `--foreground`, `--destructive`, `--chart-1`, …).

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
| `DESIGN.md` | Figma links and design ↔ code notes |
| `CONTRIBUTING.md` | PR and UI guidelines |
| `LICENSE` | MIT |
