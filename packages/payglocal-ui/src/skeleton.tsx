import { cn } from "./utils";

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
    <div className="bg-card text-card-foreground rounded-xl p-5 flex flex-col gap-3 border border-border shadow-sm">
      <div className="flex items-center justify-between">
        <Shimmer className="h-3 w-28" />
        <Shimmer className="h-10 w-10" rounded="full" />
      </div>
      <Shimmer className="h-9 w-44 mt-1" />
      <Shimmer className="h-3 w-32" />
    </div>
  );
}

export function TableRowSkeleton({
  cols = 6,
  comfortable = false,
  density: densityProp,
  snug = false,
}: {
  cols?: number;
  /** @deprecated prefer `density` */
  comfortable?: boolean;
  density?: "default" | "comfortable" | "compact";
  snug?: boolean;
}) {
  const density =
    densityProp ??
    (comfortable ? "comfortable" : "default");
  const cellPad =
    density === "comfortable"
      ? "px-5 py-4"
      : density === "compact"
        ? snug
          ? "pl-1.5 pr-2.5 py-2.5"
          : "px-3 py-2.5"
        : "px-4 py-3.5";
  return (
    <tr
      className={cn(
        "border-b border-border/60",
        density === "comfortable" && "min-h-[56px]",
        density === "compact" && "min-h-[44px]"
      )}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className={cellPad}>
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
