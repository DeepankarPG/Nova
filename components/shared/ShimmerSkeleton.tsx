import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Shimmer({ className, rounded = "md" }: ShimmerProps) {
  const r = { sm: "rounded", md: "rounded-lg", lg: "rounded-xl", full: "rounded-full" }[rounded];
  return <div className={cn("shimmer", r, className)} />;
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 flex flex-col gap-3"
      style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between">
        <Shimmer className="h-3 w-28" />
        <Shimmer className="h-10 w-10" rounded="full" />
      </div>
      <Shimmer className="h-9 w-44 mt-1" />
      <Shimmer className="h-3 w-32" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <Shimmer className={cn("h-3.5", i === 0 ? "w-20" : i === cols - 1 ? "w-14" : "w-28")} />
        </td>
      ))}
    </tr>
  );
}

export function ChartSkeleton({ height = "h-48" }: { height?: string }) {
  return (
    <div className={cn("flex items-end gap-2 px-2", height)}>
      {[55, 72, 40, 88, 65, 82, 48, 95, 60, 70].map((h, i) => (
        <div key={i} className="flex-1 shimmer rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}
