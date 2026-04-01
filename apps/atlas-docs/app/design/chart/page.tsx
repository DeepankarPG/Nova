import type { Metadata } from "next";
import Link from "next/link";
import { ChartDesignDemo } from "@/components/design-system/demos/ChartDesignDemo";
import { CodeBlock } from "@/components/design-system/CodeBlock";

export const metadata: Metadata = {
  title: "Chart — PayGlocal UI",
  description: "Recharts composition layer aligned with shadcn/ui Chart.",
};

const IMPORT_SNIPPET = `import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";`;

const USAGE_SNIPPET = `const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

<ChartContainer config={chartConfig} className="min-h-[220px] w-full aspect-auto">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>`;

export default function DesignChartPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Chart</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Same mental model as{" "}
          <a
            href="https://ui.shadcn.com/docs/components/radix/chart"
            className="font-medium text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            shadcn/ui Chart
          </a>
          : compose normal Recharts components, wrap in <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ChartContainer</code>, drive colors from <code className="font-mono text-xs">ChartConfig</code> and{" "}
          <code className="font-mono text-xs">var(--color-*)</code> / <code className="font-mono text-xs">var(--chart-1)</code> in{" "}
          <code className="font-mono text-xs">globals.css</code>. Existing dashboard charts keep their current implementation; use this for new work.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Preview</h2>
        <div className="rounded-2xl border border-border bg-muted/20 p-6 dark:bg-muted/10">
          <ChartDesignDemo />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Import</h2>
        <CodeBlock code={IMPORT_SNIPPET} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Usage</h2>
        <CodeBlock code={USAGE_SNIPPET} />
      </section>

      <p className="text-xs text-muted-foreground">
        See{" "}
        <Link href="/design/components" className="font-medium text-primary hover:underline">
          Component inventory
        </Link>{" "}
        for parity with the rest of the shadcn set.
      </p>
    </div>
  );
}
