import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, LayoutGrid, LayoutTemplate, Move, Type } from "lucide-react";

export const metadata: Metadata = {
  title: "Foundations",
  description: "PayGlocal tokens: motion, typography, spacing — shared with the dashboard app.",
};

export default function FoundationsIndexPage() {
  const tokenPages = [
    {
      href: "/docs/foundations/motion",
      title: "Motion",
      description: "Duration and easing variables, Tailwind utilities, and reduced-motion policy.",
      icon: Move,
        preview: (
        <div className="mt-5 rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Hover the card</p>
          <div className="h-2 w-1/4 rounded-full bg-primary transition-all duration-pg-slow ease-pg-standard group-hover:w-full" />
        </div>
      ),
    },
    {
      href: "/docs/foundations/typography",
      title: "Typography",
      description: "Geist Sans / Mono, type scale, and patterns for dashboard copy.",
      icon: Type,
        preview: (
        <div className="mt-5 space-y-2 border-t border-border pt-4">
          <p className="text-xl font-semibold tracking-tight text-foreground">Merchant dashboard</p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">Secondary body at 13–15px</p>
        </div>
      ),
    },
    {
      href: "/docs/foundations/spacing",
      title: "Spacing",
      description: "Layout primitive scale (Box / Stack / Inline) and page gutters.",
      icon: LayoutGrid,
        preview: (
        <div className="mt-5 flex h-14 items-end justify-center gap-1.5 border-t border-border pt-4">
          {[10, 14, 18, 22, 26].map((h) => (
            <span
              key={h}
              className="w-2.5 rounded-sm bg-primary/35 transition-transform duration-pg-fast ease-pg-standard group-hover:scale-y-110"
              style={{ height: h }}
            />
          ))}
        </div>
      ),
    },
  ];

  const patternLinks = [
    {
      href: "/docs/patterns",
      title: "Patterns hub",
      description: "Dashboard shell, forms, and how recipes relate to components.",
      icon: LayoutTemplate,
    },
    {
      href: "/docs/components",
      title: "Live components",
      description: "Interactive previews with controls — that is the “playground” experience.",
      icon: Boxes,
    },
  ];

  return (
    <article className="space-y-12 pb-16">
      <header id="overview" className="scroll-mt-24 space-y-4 border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">PayGlocal UI · Documentation site</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Foundations</h1>
        <div className="max-w-2xl space-y-3 text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          <p>
            <strong className="font-medium text-foreground">What you are looking at:</strong> the{" "}
            <strong className="font-medium text-foreground">reference area</strong> for design tokens (motion, type, spacing).
            These pages explain variables and usage — they are not full-screen product mocks.
          </p>
          <p>
            <strong className="font-medium text-foreground">For interactive UI:</strong> open{" "}
            <Link href="/docs/components" className="font-medium text-primary underline-offset-4 hover:underline">
              Components
            </Link>{" "}
            in the sidebar (e.g. Button, Card, Data table) — there you get live previews, surface toggles, and playgrounds.
          </p>
          <p>
            Tokens are defined in{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">
              design-system/payglocal-theme.css
            </code>
            , shared by the merchant app and this site so colors and motion stay aligned.
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Token guides</h2>
        <ul className="grid gap-4 lg:grid-cols-3">
          {tokenPages.map((p) => {
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
                  <h3 className="mt-5 text-lg font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                  {p.preview}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Related</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {patternLinks.map((p) => {
            const Icon = p.icon;
            return (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors duration-pg-fast ease-pg-standard hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-sm ring-1 ring-border">
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{p.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{p.description}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
}
