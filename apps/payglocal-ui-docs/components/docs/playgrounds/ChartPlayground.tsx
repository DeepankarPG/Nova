"use client";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@payglocal/ui";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartData = [
  { m: "Jan", settled: 40, pending: 18 },
  { m: "Feb", settled: 72, pending: 22 },
  { m: "Mar", settled: 58, pending: 30 },
  { m: "Apr", settled: 64, pending: 12 },
];

const chartConfig = {
  settled: { label: "Settled", color: "var(--chart-1)" },
  pending: { label: "Pending", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartPlayground() {
  return (
    <div className="w-full max-w-2xl space-y-2 text-left">
      <p className="text-sm text-muted-foreground">Bar chart with tooltip and legend (ChartLegend + ChartLegendContent).</p>
      <ChartContainer config={chartConfig} className="h-72 w-full">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/60" />
          <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="settled" fill="var(--color-settled)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
