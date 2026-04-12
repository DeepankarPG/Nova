"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Bar widths — center widest, tapering toward edges (spherical silhouette). */
const WIDTHS = [2, 2.2, 2.5, 2.8, 3.2, 2.8, 2.5, 2.2, 2] as const;
/** Bar heights — center tallest, symmetric taper. */
const HEIGHTS = [10, 14, 18, 22, 26, 22, 18, 14, 10] as const;
const GAP = 1.35;
const VIEW_H = 40;

/**
 * Echo mark: nine vertical pills with vertical blue gradient and clear gaps (sound-wave / globe cue).
 */
export function EchoIcon({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `echo-icon-grad-${uid}`;

  let x = 2.2;
  const rects: ReactNode[] = [];
  for (let i = 0; i < 9; i++) {
    const w = WIDTHS[i]!;
    const h = HEIGHTS[i]!;
    const y = (VIEW_H - h) / 2;
    const rx = w / 2;
    rects.push(
      <rect
        key={i}
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={`url(#${gradId})`}
      />
    );
    x += w + GAP;
  }
  const viewW = Math.ceil(x - GAP + 2.2);

  return (
    <svg
      viewBox={`0 0 ${viewW} ${VIEW_H}`}
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="55%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
      </defs>
      {rects}
    </svg>
  );
}
