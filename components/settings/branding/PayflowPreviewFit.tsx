"use client";

import { cn } from "@/lib/utils";

/**
 * Scales checkout mock so the full page fits in the preview shell without inner scroll.
 * Uses CSS `zoom` so layout height shrinks with the visual (Chromium, Safari, recent Firefox).
 */
export function PayflowPreviewFit({
  children,
  className,
  /** Stronger scale-down inside the phone frame */
  compact,
}: {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  /** Compact: stronger scale + fill-height flex so checkout does not “float” with empty space below */
  const zoom = compact ? 0.56 : 0.64;

  return (
    <div className={cn("flex h-full min-h-0 w-full flex-col overflow-hidden", className)}>
      <div
        className={cn(
          "flex min-h-0 flex-1 overflow-x-hidden overflow-y-hidden",
          compact ? "items-stretch px-1 pb-2 pt-0" : "items-start justify-center px-0.5 pb-3 pt-1"
        )}
      >
        <div
          className={cn(
            "box-border w-full max-w-md origin-top",
            compact ? "flex h-full min-h-0 flex-1 flex-col pb-1" : "pb-2"
          )}
          style={{ zoom } as React.CSSProperties & { zoom?: number }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
