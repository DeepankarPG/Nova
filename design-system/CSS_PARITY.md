# CSS parity: dashboard app vs UI docs

## Source of truth

Semantic colors, chart tokens, sidebar/header chrome, PayGlocal widget tokens (`--pg-*`), radii, and motion durations are defined once in:

**[`payglocal-theme.css`](./payglocal-theme.css)**

Both of these files import it:

- [`app/globals.css`](../app/globals.css) — product dashboard
- [`apps/payglocal-ui-docs/app/globals.css`](../apps/payglocal-ui-docs/app/globals.css) — public docs

Each app keeps its own Tailwind `@source` paths, scrollbar/focus/shimmer utilities, and product-only animations (Echo, widgets) in its local `globals.css`.

## Fonts

Both apps use **Next.js `next/font`** (`Geist`, `Geist_Mono`) with the same CSS variables (`--font-geist-sans`, `--font-geist-mono`) on `<body>`, so typography matches.

## What to update when tokens change

1. Edit **`design-system/payglocal-theme.css`** only.
2. Run UI docs and dashboard side-by-side and spot-check light/dark.
3. Mirror any new semantic roles in [`DESIGN.md`](../DESIGN.md) if they are part of the contract.
