"use client";

import { useTheme } from "next-themes";

/** Recharts sometimes fails to resolve `fill="var(--…)"` on bar backgrounds; use explicit colors per theme. */
export function useChartBarTrackFill(): string {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.07)" : "#f3f4f6";
}
