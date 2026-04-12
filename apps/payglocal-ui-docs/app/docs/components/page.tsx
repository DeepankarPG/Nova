import type { Metadata } from "next";
import Link from "next/link";
import { getSortedComponentPages } from "@/lib/component-registry";

export const metadata: Metadata = {
  title: "Components",
  description: "All documented primitives in @payglocal/ui — same components PayGlocal ships in production.",
};

export default function ComponentsCatalogPage() {
  const pages = getSortedComponentPages();

  return (
    <article className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Components</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-[15px]">
          Here you can find the primitives shipped in{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@payglocal/ui</code>. Each page includes a live
          preview, install reminder, and copy-paste examples — similar to the{" "}
          <a
            href="https://ui.shadcn.com/docs/components"
            className="font-medium text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            shadcn/ui components directory
          </a>
          , with PayGlocal tokens and styling.
        </p>
      </div>

      <section id="catalog" className="scroll-mt-24 space-y-4">
        <h2 className="sr-only">All components</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => (
            <Link
              key={p.slug}
              href={`/docs/components/${p.slug}`}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/35 hover:shadow-md"
            >
              {p.title}
            </Link>
          ))}
        </div>
      </section>

      <section id="roadmap" className="scroll-mt-24 space-y-3 border-t border-border pt-10">
        <h2 className="text-lg font-semibold text-foreground">Roadmap</h2>
        <p className="text-sm text-muted-foreground sm:text-[15px]">
          More primitives (sheet, checkbox, combobox, command menu, …) land as we promote them from product. Follow the
          monorepo or open an issue on GitHub to request a component.
        </p>
      </section>
    </article>
  );
}
