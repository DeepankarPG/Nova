"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export interface MobileOverlayCtx {
  pushOverlay: (node: ReactNode) => void;
  popOverlay: () => void;
}

export const MobileOverlayContext = createContext<MobileOverlayCtx | null>(null);

export function useMobileOverlay(): MobileOverlayCtx {
  const ctx = useContext(MobileOverlayContext);
  if (!ctx) throw new Error("useMobileOverlay must be used within MobileOverlayContext.Provider");
  return ctx;
}
