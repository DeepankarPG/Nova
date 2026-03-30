"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function StandardChartTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: readonly any[];
  label?: string | number;
  formatValue?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover text-popover-foreground border border-border rounded-xl px-3 py-2.5 text-xs shadow-xl">
      <p className="font-semibold text-muted-foreground mb-1.5 text-[11px]">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-sm shrink-0"
            style={{ background: entry.color ?? entry.fill ?? "#0061E3" }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {formatValue && entry.value !== undefined
              ? formatValue(entry.value as number)
              : (entry.value as number)?.toLocaleString("en-IN") ?? String(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
