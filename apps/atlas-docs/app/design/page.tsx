import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Atlas — PayGlocal UI",
  description: "Primitives, tokens, and documentation for the PayGlocal portal.",
};

export default function DesignDocsHomePage() {
  return (
    <div className="space-y-8">
      <div id="introduction" className="scroll-mt-20 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Introduction</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          <strong className="font-semibold text-foreground">Atlas</strong> is the PayGlocal UI layer for the revamped portal.
          It follows patterns popularised by{" "}
          <a
            href="https://ui.shadcn.com/docs/components"
            className="font-medium text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            shadcn/ui
          </a>
          : token-driven styles, Radix primitives where it helps, and copy-friendly source you can own.
        </p>
      </div>

      <div id="how-to-use" className="scroll-mt-20 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">How to use</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-muted-foreground">
          <li>
            Import primitives from <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@/components/ui</code> in
            new features.
          </li>
          <li>
            Design tokens live in <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">app/globals.css</code> — see{" "}
            <Link href="/design/foundations" className="font-medium text-primary hover:underline">
              Foundations
            </Link>
            .
          </li>
          <li>
            App code imports from <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@/components/ui/…</code>;
            each file re-exports from <code className="font-mono text-xs">components/shared</code> until implementations move
            into <code className="font-mono text-xs">ui</code> for a future package.
          </li>
          <li>
            Open the{" "}
            <Link href="/design/components" className="font-medium text-primary hover:underline">
              Component inventory
            </Link>{" "}
            for categories, status, and gaps vs shadcn.
          </li>
        </ul>
      </div>

      <div id="explore" className="scroll-mt-20 grid gap-3 sm:grid-cols-2">
        <Link
          href="/design/foundations"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/30"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">Foundations</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Semantic colors and CSS variables</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <Link
          href="/design/components"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/30"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">Component inventory</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Categories, stats, and roadmap</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <Link
          href="/design/button"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/30"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">Button</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Variants, sizes, and loading state</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <Link
          href="/design/card"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/30"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">Card</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Header, content, footer, and size</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <Link
          href="/design/input"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/30"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">Input</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Field, groups, invalid and disabled</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <Link
          href="/design/chart"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/30"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">Chart</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Recharts + ChartContainer</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        Open-source packaging is documented in the monorepo at{" "}
        <code className="font-mono">design-system/README.md</code>.
      </p>
    </div>
  );
}
