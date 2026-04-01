import type { Metadata } from "next";
import Link from "next/link";
import { AtlasComponentGrid } from "@/components/design-system/AtlasComponentGrid";
import { ComponentsCatalog } from "@/components/design-system/ComponentsCatalog";

export const metadata: Metadata = {
  title: "Components — Atlas",
  description: "Directory of documented primitives and the full component inventory.",
};

export default function DesignComponentsCatalogPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Atlas</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Components</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Here you can find components that have dedicated doc pages. We are adding more over time. For coverage, status,
          and gaps vs{" "}
          <a
            href="https://ui.shadcn.com/docs/components"
            className="font-medium text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            shadcn/ui
          </a>
          , see the inventory below.
        </p>
      </div>

      <section id="directory" className="scroll-mt-20 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Directory</h2>
        <AtlasComponentGrid />
      </section>

      <section id="inventory" className="scroll-mt-20 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Inventory &amp; roadmap</h2>
        <p className="text-sm text-muted-foreground">
          Living checklist of tokens, <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@/components/ui</code>{" "}
          modules, in-app patterns, and planned work.
        </p>
        <ComponentsCatalog />
      </section>

      <p className="text-sm text-muted-foreground">
        Can&apos;t find what you need? Browse the{" "}
        <a
          href="https://ui.shadcn.com/docs/directory"
          className="font-medium text-primary underline-offset-4 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          shadcn registry directory
        </a>{" "}
        for community-maintained blocks, or propose a new entry via{" "}
        <Link href="/design" className="font-medium text-primary hover:underline">
          Introduction
        </Link>{" "}
        / internal design review.
      </p>
    </div>
  );
}
