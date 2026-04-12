"use client";

import { ChartSkeleton, Shimmer, Stack, StatCardSkeleton, TableRowSkeleton } from "@payglocal/ui";

export function SkeletonPlayground() {
  return (
    <Stack gap="lg" className="w-full text-left">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Shimmer (radii)</p>
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          <Shimmer className="h-4 w-3/5 max-w-xs rounded-md" />
          <Shimmer className="h-4 w-2/5 max-w-[10rem] rounded-full" />
          <Shimmer className="h-10 w-full max-w-md rounded-lg" />
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Table row</p>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <TableRowSkeleton cols={4} />
              <TableRowSkeleton cols={4} comfortable />
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Stat card</p>
        <div className="max-w-xs">
          <StatCardSkeleton />
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Chart block</p>
        <div className="max-w-md rounded-lg border border-border bg-card p-3">
          <ChartSkeleton height="h-36" />
        </div>
      </div>
    </Stack>
  );
}
