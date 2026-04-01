import type { Metadata } from "next";
import { PrimitiveDocLayout } from "@/components/design-system/PrimitiveDocLayout";
import { Shimmer, ChartSkeleton, TableRowSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Skeleton — PayGlocal UI",
  description: "Loading placeholders using the global shimmer style.",
};

const IMPORT = `import {
  Shimmer,
  ChartSkeleton,
  TableRowSkeleton,
  StatCardSkeleton,
} from "@/components/ui/skeleton";`;

const USAGE = `<Shimmer className="h-4 w-32" />
<ChartSkeleton height="h-40" />

<table>
  <tbody>
    <TableRowSkeleton cols={4} />
  </tbody>
</table>`;

export default function DesignSkeletonPage() {
  return (
    <PrimitiveDocLayout
      title="Skeleton"
      description="Shimmer blocks and composed patterns for charts, table rows, and stat cards while data loads."
      importSnippet={IMPORT}
      usageSnippet={USAGE}
      preview={
        <div className="space-y-4">
          <Shimmer className="h-4 w-40" />
          <ChartSkeleton height="h-32" />
          <table className="w-full border border-border rounded-lg overflow-hidden">
            <tbody>
              <TableRowSkeleton cols={4} />
            </tbody>
          </table>
        </div>
      }
    />
  );
}
