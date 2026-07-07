"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

interface HeaderActionsCtx {
  headerRight: ReactNode;
  setHeaderRight: (node: ReactNode) => void;
  clearHeaderRight: () => void;
}

export const HeaderActionsContext = createContext<HeaderActionsCtx>({
  headerRight: null,
  setHeaderRight: () => {},
  clearHeaderRight: () => {},
});

export function useHeaderActionsProvider() {
  const [headerRight, setHeaderRight] = useState<ReactNode>(null);
  const clearHeaderRight = useCallback(() => setHeaderRight(null), []);
  const ctxValue = useMemo<HeaderActionsCtx>(
    () => ({ headerRight, setHeaderRight, clearHeaderRight }),
    [headerRight, clearHeaderRight],
  );
  return { headerRight, ctxValue };
}

export function useHeaderActions(): HeaderActionsCtx {
  return useContext(HeaderActionsContext);
}
