import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileInput, LayoutDashboard, Move } from "lucide-react";

export const metadata: Metadata = {
  title: "Patterns",
  description: "Reusable layout and flow patterns aligned with the PayGlocal merchant dashboard.",
};

export default function PatternsIndexPage() {
  const pages = [
    {
      href: "/docs/patterns/dashboard-shell",
      title: "Dashboard shell",
      description: "Header height, scrollable main, and p-4 md:p-6 gutters — mirrors app/(dashboard)/layout.",
      icon: LayoutDashboard,
      preview: (
        <div className="mt-5 rounded-lg border border-dashed border-border bg-card p-3 shadow-sm">
          <div className="mb-2 flex min-h-8 items-center rounded-md bg-header/80 px-3 py-1 text-[9px] font-medium text-muted-foreground ring-1 ring-header-border">
            Header
          </div>
          <div className="min-h-[56px] rounded-md border border-border bg-background p-3 text-[9px] leading-relaxed text-muted-foreground">
            Main · overflow-y-auto · content gutters
          </div>
        </div>
      ),
    },
    {
      href: "/docs/patterns/forms",
      title: "Forms & fields",
      description: "FieldGroup → Field → label, description, Input — plus action row patterns.",
      icon: FileInput,
      preview: (
        <div className="mt-5 space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="h-2 w-1/3 rounded bg-muted-foreground/20" />
          <div className="h-1.5 w-2/3 rounded bg-muted-foreground/15" />
          <div className="h-11 w-full rounded-lg border border-border bg-card px-3 shadow-sm" />
        </div>
      ),
    },
    {
      href: "/docs/foundations/motion",
      title: "Motion tokens",
      description: "Durations and easings referenced by patterns and components — documented under Foundations.",
      icon: Move,
      preview: (
        <div className="mt-5 rounded-lg border border-border bg-card p-4 shadow-sm dark:border-border">
          <div className="h-1.5 w-2/5 rounded-full bg-primary/50 transition-all duration-pg-slow ease-pg-standard group-hover:w-4/5" />
        </div>
      ),
    },
  ];

  return (
    <article className="space-y-12 pb-16">
      <header id="overview" className="scroll-mt-24 space-y-4 border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">PayGlocal UI · Documentation site</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Patterns</h1>
        <div className="max-w-2xl space-y-3 text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          <p>
            <strong className="font-medium text-foreground">What this section is:</strong> copy-paste friendly{" "}
            <strong className="font-medium text-foreground">layouts and flows</strong> that match the merchant dashboard. Most
            patterns are <strong className="font-medium text-foreground">documentation + code snippets</strong>, not a separate
            npm export — you compose real pages from <code className="rounded bg-muted px-1 font-mono text-sm">@payglocal/ui</code>{" "}
            primitives.
          </p>
          <p>
            <strong className="font-medium text-foreground">For pixel-level component demos</strong> (variants, playgrounds,
            chart templates), use{" "}
            <Link href="/docs/components" className="font-medium text-primary underline-offset-4 hover:underline">
              Components
            </Link>{" "}
            in the sidebar.
          </p>
          <p>
            Chart-heavy dashboards:{" "}
            <Link
              href="/docs/components/chart-templates"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Chart templates
            </Link>
            .
          </p>
        </div>
      </header>

      <ul className="grid gap-4 lg:grid-cols-3">
        {pages.map((p) => {
          const Icon = p.icon;
          return (
            <li key={p.href}>
              <Link
                href={p.href}
                className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-colors duration-pg-fast ease-pg-standard hover:border-primary/35 hover:shadow-md sm:p-7"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-foreground">{p.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                {p.preview}
              </Link>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
