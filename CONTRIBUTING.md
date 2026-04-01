# Contributing

Thank you for helping improve the PayGlocal portal and its design system.

## Design system (`components/ui`)

- **Tokens first** — Prefer semantic utilities (`bg-card`, `text-muted-foreground`, `border-border`) backed by variables in `app/globals.css`. Avoid hard-coded hex in primitives unless documented.
- **Dark mode** — Every new or updated primitive must be checked in light and dark theme (run **`npm run dev:atlas`** and use **`/design`** plus the header toggle).
- **Accessibility** — Visible focus states, sufficient contrast, and meaningful labels on interactive controls.
- **Dependencies** — Keep `components/ui` free of imports from `app/`, route handlers, or `lib/mock-data`. Radix and `cn`/`tailwind-merge` are fine.

## Documentation

- Live docs (**Atlas**) run from **`apps/atlas-docs`** (`npm run dev:atlas` → **http://localhost:3001/design**).
- When adding a component under `components/ui`, add a nav entry in **`apps/atlas-docs/components/design-system/design-docs-nav.ts`** and a page under **`apps/atlas-docs/app/design/<name>/page.tsx`** with a preview and copyable snippet.

## Pull requests

1. Describe UI changes with screenshots or short screen recordings when helpful.
2. Run `npx tsc --noEmit` and `npm run lint` before requesting review.
3. Keep changes scoped; avoid unrelated refactors in the same PR.

## License

By contributing, you agree that your contributions will be licensed under the same terms as the project (see [LICENSE](LICENSE)).
