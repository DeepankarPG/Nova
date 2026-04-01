import type { Metadata } from "next";
import { TokenSwatch } from "@/components/design-system/TokenSwatch";

export const metadata: Metadata = {
  title: "Foundations — Atlas",
  description: "Design tokens: CSS variables for light and dark themes.",
};

const SEMANTIC_TOKENS = [
  { name: "background", variable: "--background", description: "App canvas behind content" },
  { name: "foreground", variable: "--foreground", description: "Default text" },
  { name: "card", variable: "--card", description: "Raised surfaces (cards, panels)" },
  { name: "card-foreground", variable: "--card-foreground", description: "Text on card surfaces" },
  { name: "border", variable: "--border", description: "Dividers and outlines" },
  { name: "muted", variable: "--muted", description: "Subtle fills" },
  { name: "muted-foreground", variable: "--muted-foreground", description: "Secondary text" },
  { name: "primary", variable: "--primary", description: "Brand actions and focus" },
  { name: "primary-foreground", variable: "--primary-foreground", description: "Text on primary" },
  { name: "ring", variable: "--ring", description: "Focus rings" },
  { name: "popover", variable: "--popover", description: "Dropdowns and overlays" },
  { name: "input", variable: "--input", description: "Input borders" },
] as const;

export default function DesignFoundationsPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Foundations</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Semantic tokens are defined as CSS variables in{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">app/globals.css</code> under{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">:root</code> and{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.dark</code>. Components should prefer Tailwind
          utilities mapped in <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@theme inline</code> (e.g.{" "}
          <code className="text-xs">bg-background</code>, <code className="text-xs">text-primary</code>).
        </p>
        <p className="text-xs text-muted-foreground">
          Use the header theme toggle to preview swatches in light and dark mode.
        </p>
      </div>

      <section id="semantic-colors" className="scroll-mt-20 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Semantic colors (live)</h2>
        <p className="text-xs text-muted-foreground">
          Swatches reflect the active theme. Variable names reference{" "}
          <code className="font-mono">var(--token)</code>.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SEMANTIC_TOKENS.map((t) => (
            <TokenSwatch key={t.name} name={t.name} variable={t.variable} description={t.description} />
          ))}
        </div>
      </section>

      <section id="typography" className="scroll-mt-20 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Typography</h2>
        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          <p className="font-sans text-foreground">Sans — Geist Sans via <code className="text-xs">--font-geist-sans</code></p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Mono — Geist Mono for code and numeric UI
          </p>
        </div>
      </section>

      <section id="tailwind-v4" className="scroll-mt-20 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Tailwind v4</h2>
        <p className="text-sm text-muted-foreground">
          This project uses Tailwind CSS v4 with <code className="rounded bg-muted px-1 font-mono text-xs">@import &quot;tailwindcss&quot;</code>{" "}
          and <code className="rounded bg-muted px-1 font-mono text-xs">@theme inline</code> in{" "}
          <code className="font-mono text-xs">globals.css</code>. Official shadcn examples may reference a{" "}
          <code className="font-mono text-xs">tailwind.config</code> file; map new utilities to CSS variables here when in doubt.
        </p>
      </section>

      <section id="figma" className="scroll-mt-20 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Figma</h2>
        <p className="text-sm text-muted-foreground">
          Product layouts and composite patterns are tracked in Figma. Canonical links live in the repository root file{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">DESIGN.md</code>.
        </p>
      </section>
    </div>
  );
}
