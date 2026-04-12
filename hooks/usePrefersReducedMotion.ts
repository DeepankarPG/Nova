"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** SSR / first paint: assume full motion so hydrated markup matches client default. */
function getServerSnapshot() {
  return false;
}

/**
 * Reliable `prefers-reduced-motion: reduce` (unlike ad-hoc `useState(matchMedia)` on first paint).
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
