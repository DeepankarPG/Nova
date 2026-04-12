import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export const metadata: Metadata = {
  title: "Dashboard shell",
  description: "Layout pattern matching the PayGlocal dashboard main region.",
};

const SHELL = `/* Merchant app: app/(dashboard)/layout.tsx (simplified) */
<div className="flex h-screen overflow-hidden bg-background">
  <aside>{/* Sidebar */}</aside>
  <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
    <header className="h-[57px] shrink-0 border-b border-header-border bg-header">
      {/* Toolbar */}
    </header>
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="p-4 md:p-6">{/* Page content — same gutters as production */}</div>
    </main>
  </div>
</div>`;

const PREVIEW_HINT = `<!-- In docs previews, choose "Dashboard" surface to approximate this canvas -->`;

export default function DashboardShellPatternPage() {
  return (
    <article className="space-y-10 pb-16">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="text-sm font-medium text-muted-foreground">
          <Link href="/docs/patterns" className="hover:text-foreground">
            Patterns
          </Link>
          <span className="mx-2 text-border">/</span>
          Dashboard shell
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Dashboard shell</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          Production pages use a fixed chrome height for the header, a scrollable <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">main</code>, and{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">p-4 md:p-6</code> on the inner content. Use the docs{" "}
          <strong className="font-medium text-foreground">Dashboard</strong> preview surface to see components in a similar frame.
        </p>
      </header>

      <section id="structure" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Structure</h2>
        <CodeBlock code={SHELL} />
      </section>

      <section id="tokens" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Tokens</h2>
        <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>
            <code className="rounded bg-muted px-1 font-mono text-xs">bg-background</code> — page canvas
          </li>
          <li>
            <code className="rounded bg-muted px-1 font-mono text-xs">bg-header</code> /{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">border-header-border</code> — top bar
          </li>
          <li>
            <code className="rounded bg-muted px-1 font-mono text-xs">bg-sidebar</code> — rail (see product{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">Sidebar</code>)
          </li>
        </ul>
      </section>

      <section id="docs-preview" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Docs previews</h2>
        <CodeBlock code={PREVIEW_HINT} />
      </section>
    </article>
  );
}
