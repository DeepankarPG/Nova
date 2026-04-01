# Design source

Dashboard and product UI are designed in Figma. Use this file as the canonical link for the team and for tools (e.g. Cursor MCP).

## Code — PayGlocal UI (in-app docs)

- **Live design system (Atlas):** run **`npm run dev:atlas`** and open **http://localhost:3001/design** (introduction, foundations, component previews).
- **Primitives:** npm package **`@payglocal/ui`** (`packages/payglocal-ui/`); the app re-exports via `components/ui/*`. See `design-system/README.md` and `packages/payglocal-ui/README.md`.

## Figma

- **Dashboard / main file:** [Cursor ↔ Figma](https://www.figma.com/design/9SBiK02a2hrINbrIHx0L7Z/Cursor%3C%3EFigma?node-id=0-1&t=XX2g4NE5GPvJe2Du-1)
- **Dashboard (captured from app):** [Home `/` capture](https://www.figma.com/design/9SBiK02a2hrINbrIHx0L7Z?node-id=3-2) — HTML-to-design import of the running Next.js dashboard (Mar 2026).
- **Design system / components:** _optional second link — paste from Figma via File → Copy link_

For MCP, paste a **frame or layer** link when you want the agent to target a specific node.

## Code → Figma capture

In **development** only, `app/layout.tsx` loads Figma’s capture script so you can send the live UI into this file via MCP (`generate_figma_design` + browser hash URL). Remove that `<Script>` block when you no longer need captures.

## Notes

- Keep links updated when files move or are duplicated for releases.
- If a page in code diverges from Figma, note it in the PR or in Figma comments so design and eng stay aligned.
