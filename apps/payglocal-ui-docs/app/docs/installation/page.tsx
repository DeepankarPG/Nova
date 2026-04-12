import type { Metadata } from "next";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { getNpmInstallCommand } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Installation",
  description: "Install @payglocal/ui with one command and wire Next.js + Tailwind v4.",
};

const INSTALL = getNpmInstallCommand();

const NEXT_CONFIG = `// next.config.ts
const nextConfig = {
  transpilePackages: ["@payglocal/ui"],
};
export default nextConfig;`;

const GLOBALS = `/* app/globals.css */
@import "tailwindcss";

@source "../node_modules/@payglocal/ui/src/**/*.{ts,tsx}";
/* Monorepo: @source is resolved from this file's folder. */
/* Root Next app (globals.css in /app): */
/* @source "../packages/payglocal-ui/src/**/*.{ts,tsx}"; */
/* Nested app e.g. apps/ui-docs/app/globals.css — three levels to repo root: */
/* @source "../../../packages/payglocal-ui/src/**/*.{ts,tsx}"; */

@custom-variant dark (&:where(.dark, .dark *));`;

const TOKENS_NOTE = `Mirror semantic variables from the PayGlocal repo — preferably import design-system/payglocal-theme.css after Tailwind (same as the dashboard and this docs app):
--background, --foreground, --card, --border, --primary, --ring, --chart-1 … --chart-5, motion tokens, sidebar/header chrome, etc.`;

export default function InstallationPage() {
  return (
    <article className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Installation</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-[15px]">
          Add the package, enable transpilation, scan Tailwind over the library, and align CSS variables. Same steps we use
          internally.
        </p>
      </div>

      <section id="quick" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">One-command install</h2>
        <p className="text-sm text-muted-foreground">
          From your project root (npm, pnpm, or yarn — shown with npm):
        </p>
        <CodeBlock code={INSTALL} />
        <p className="text-sm text-muted-foreground">
          Peer dependencies: <code className="font-mono text-xs">react</code> and{" "}
          <code className="font-mono text-xs">react-dom</code> (18+ or 19+).
        </p>
      </section>

      <section id="next" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Next.js</h2>
        <p className="text-sm text-muted-foreground">
          Transpile the workspace package so App Router can compile TypeScript source exports:
        </p>
        <CodeBlock code={NEXT_CONFIG} />
      </section>

      <section id="tailwind" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Tailwind v4</h2>
        <p className="text-sm text-muted-foreground">
          Tailwind must see class names used inside <code className="font-mono text-xs">@payglocal/ui</code>:
        </p>
        <CodeBlock code={GLOBALS} />
      </section>

      <section id="tokens" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Design tokens</h2>
        <p className="text-sm whitespace-pre-wrap text-muted-foreground">{TOKENS_NOTE}</p>
        <p className="text-sm text-muted-foreground">
          The canonical source is <code className="font-mono text-xs">design-system/payglocal-theme.css</code> in the monorepo (
          <code className="font-mono text-xs">design-system/CSS_PARITY.md</code> explains how product and docs stay aligned).
        </p>
      </section>

      <section id="monorepo" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Monorepo / workspace</h2>
        <p className="text-sm text-muted-foreground">
          Use <code className="font-mono text-xs">@payglocal/ui: &quot;workspace:*&quot;</code> (or{" "}
          <code className="font-mono text-xs">file:../../packages/payglocal-ui</code>) and keep{" "}
          <code className="font-mono text-xs">@source</code> pointed at the package <code className="font-mono text-xs">src</code>{" "}
          directory. Run install from the repo root so dependencies hoist correctly.
        </p>
      </section>
    </article>
  );
}
