# @payglocal/ui

React component primitives used by the PayGlocal portal: **Input**, **Field**, **Dialog**, **DataTable**, **Chart** (Recharts), **Button**, and more. Styles assume **Tailwind CSS v4** and design tokens (`background`, `foreground`, `primary`, `destructive`, `input`, chart tokens, etc.).

## Install

```bash
npm install @payglocal/ui
# or
pnpm add @payglocal/ui
```

Peer dependencies: `react`, `react-dom` (18+ or 19+).

## Tailwind v4 — scan package classes

So utilities used inside this library are generated, point Tailwind at the published source:

```css
@import "tailwindcss";

@source "../node_modules/@payglocal/ui/src/**/*.tsx";
```

Adjust the relative path from your `globals.css` (or main CSS entry). In a monorepo with `workspace:*`, the path may be `../../packages/payglocal-ui/src/**/*.tsx`.

## Design tokens

Copy or align CSS variables with your app. This library expects semantic tokens such as:

- `--background`, `--foreground`, `--card`, `--border`, `--muted`, `--muted-foreground`
- `--primary`, `--primary-foreground`, `--ring`, `--input`
- `--destructive`, `--destructive-foreground`, `--radius`
- `--chart-1` … `--chart-5` (for charts)

See **`design-system/payglocal-theme.css`** in this monorepo (imported by `app/globals.css`) for the canonical variable list, including sidebar, header, chart chrome, and motion tokens.

## Usage

```tsx
import { Input, Field, FieldLabel, FieldGroup, Button } from "@payglocal/ui";

export function Example() {
  return (
    <FieldGroup className="max-w-sm">
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" type="email" placeholder="you@example.com" />
      </Field>
    </FieldGroup>
  );
}
```

Granular imports (tree-shaking friendly with a modern bundler):

```tsx
import { Input } from "@payglocal/ui";
```

The package entry re-exports all public components from `src/index.ts`.

## Publish (maintainers)

From repo root, after versioning `packages/payglocal-ui/package.json`:

```bash
cd packages/payglocal-ui
npm publish --access public
```

Or use your org’s npm trust / CI workflow.

## License

MIT
