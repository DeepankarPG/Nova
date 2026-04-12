"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const ECHO_PANEL_MIN_WIDTH = 300;
export const ECHO_PANEL_MAX_WIDTH = 640;
export const ECHO_PANEL_DEFAULT_WIDTH = 420;

const STORAGE_KEY = "payglocal-echo-panel-w";

function clampPanelWidth(w: number): number {
  return Math.round(
    Math.min(ECHO_PANEL_MAX_WIDTH, Math.max(ECHO_PANEL_MIN_WIDTH, w))
  );
}

type EchoPanelContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  /** Restore focus to last opener on close */
  openerRef: React.RefObject<HTMLElement | null>;
  panelWidth: number;
  setPanelWidth: (w: number) => void;
};

const EchoPanelContext = createContext<EchoPanelContextValue | null>(null);

export function EchoPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const [panelWidth, setPanelWidthState] = useState(ECHO_PANEL_DEFAULT_WIDTH);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const n = parseInt(raw, 10);
      if (Number.isFinite(n)) {
        setPanelWidthState(clampPanelWidth(n));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setOpen = useCallback((v: boolean) => {
    setOpenState((prev) => {
      if (prev && !v) {
        queueMicrotask(() => openerRef.current?.focus?.());
      }
      return v;
    });
  }, []);

  const toggle = useCallback(() => {
    setOpenState((o) => {
      const next = !o;
      if (o && !next) {
        queueMicrotask(() => openerRef.current?.focus?.());
      }
      return next;
    });
  }, []);

  const setPanelWidth = useCallback((w: number) => {
    const c = clampPanelWidth(w);
    setPanelWidthState(c);
    try {
      sessionStorage.setItem(STORAGE_KEY, String(c));
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
      openerRef,
      panelWidth,
      setPanelWidth,
    }),
    [open, setOpen, toggle, panelWidth, setPanelWidth]
  );

  return (
    <EchoPanelContext.Provider value={value}>{children}</EchoPanelContext.Provider>
  );
}

export function useEchoPanel() {
  const ctx = useContext(EchoPanelContext);
  if (!ctx) throw new Error("useEchoPanel must be used within EchoPanelProvider");
  return ctx;
}
