import type { Metadata } from "next";
import Link from "next/link";
import { DocsIntroHero } from "@/components/docs/DocsIntroHero";

export const metadata: Metadata = {
  title: "Introduction",
  description: "PayGlocal UI is open code you install and own — React, Tailwind v4, Radix, and semantic tokens.",
};

export default function IntroductionPage() {
  return (
    <article className="space-y-10">
      <DocsIntroHero />

      <section id="philosophy" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Philosophy</h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          <strong className="font-medium text-foreground">This is not a black-box component library.</strong> You install
          dependencies, copy or import source-style primitives, and keep full control. That means you can theme, fork, and
          extend without waiting on a vendor release cycle.
        </p>
      </section>

      <section id="open-code" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Open code</h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground sm:text-[15px]">
          <li>
            <strong className="font-medium text-foreground">Composition</strong> — small pieces (Field, Input, Dialog) that
            combine into flows you define.
          </li>
          <li>
            <strong className="font-medium text-foreground">Distribution</strong> — npm package with TypeScript source
            exports; optional path aliases in a monorepo.
          </li>
          <li>
            <strong className="font-medium text-foreground">Beautiful defaults</strong> — PayGlocal blue, neutral surfaces,
            and chart tokens out of the box.
          </li>
          <li>
            <strong className="font-medium text-foreground">Accessible</strong> — Radix primitives where it matters; visible
            focus and keyboard support.
          </li>
        </ul>
      </section>

      <section id="stack" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Stack</h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          React 18+, Tailwind CSS v4 with <code className="font-mono text-xs">@source</code> over the package, CSS variables
          for theming, and optional Recharts for the chart layer. See{" "}
          <Link href="/docs/installation" className="font-medium text-primary hover:underline">
            Installation
          </Link>{" "}
          for the fastest path to a working app.           Use the sidebar for <strong className="font-medium text-foreground">Foundations</strong> (Motion, Typography, Spacing),{" "}
          <strong className="font-medium text-foreground">Patterns</strong> (dashboard shell, forms), and the full component catalog.
        </p>
      </section>

      <section id="license" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">License</h2>
        <p className="text-sm text-muted-foreground sm:text-[15px]">
          <code className="font-mono text-xs">@payglocal/ui</code> is released under the MIT License.
        </p>
      </section>
    </article>
  );
}
