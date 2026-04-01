"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders into document.body so `position: fixed` overlays span the full viewport.
 * Prevents clipping when ancestors use transform, filter, or scroll containers (e.g. dashboard `main` / `.page-enter`).
 */
export function ViewPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
}
