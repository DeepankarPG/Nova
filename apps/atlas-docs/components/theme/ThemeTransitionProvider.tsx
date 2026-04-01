"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { THEME_PAGE_BACKGROUND } from "@/lib/theme-backgrounds";

const DURATION_MS = 700;

const OVERLAY_Z = 2147483646;

function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function computeMaxRadius(ox: number, oy: number, W: number, H: number): number {
  const userR = Math.ceil(
    Math.sqrt(Math.max(ox, W - ox) ** 2 + Math.max(oy, H - oy) ** 2)
  );
  const cornerR = Math.ceil(
    Math.max(
      Math.hypot(ox, oy),
      Math.hypot(W - ox, oy),
      Math.hypot(ox, H - oy),
      Math.hypot(W - ox, H - oy)
    )
  );
  return Math.max(userR, cornerR);
}

type ThemeTransitionContextValue = {
  startThemeToggleFromButton: (button: HTMLElement | null) => void;
};

const ThemeTransitionContext = createContext<ThemeTransitionContextValue | null>(null);

export function useThemeSurfaceTransition() {
  const ctx = useContext(ThemeTransitionContext);
  if (!ctx) {
    throw new Error("useThemeSurfaceTransition must be used within ThemeTransitionProvider");
  }
  return ctx.startThemeToggleFromButton;
}

export function ThemeTransitionProvider({ children }: { children: ReactNode }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const busyRef = useRef(false);
  const rafRef = useRef<number>(0);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const stopAnim = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  useEffect(() => () => stopAnim(), [stopAnim]);

  const startThemeToggleFromButton = useCallback(
    (btn: HTMLElement | null) => {
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const current = resolvedTheme ?? theme ?? "light";
      const next: "light" | "dark" = current === "dark" ? "light" : "dark";
      const targetColor =
        next === "dark" ? THEME_PAGE_BACKGROUND.dark : THEME_PAGE_BACKGROUND.light;

      if (prefersReduced) {
        setTheme(next);
        return;
      }

      if (busyRef.current) return;
      busyRef.current = true;

      const canvas = canvasRef.current;
      if (!canvas) {
        setTheme(next);
        busyRef.current = false;
        return;
      }

      const ctx2d = canvas.getContext("2d");
      if (!ctx2d) {
        setTheme(next);
        busyRef.current = false;
        return;
      }

      const W = window.innerWidth;
      const H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      let ox: number;
      let oy: number;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        ox = rect.left + rect.width / 2;
        oy = rect.top + rect.height / 2;
      } else {
        ox = W / 2;
        oy = H / 2;
      }

      const maxR = computeMaxRadius(ox, oy, W, H);

      canvas.style.display = "block";
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      const start = performance.now();

      const frame = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / DURATION_MS);
        const eased = easeInOutQuart(t);
        const r = maxR * eased;
        const feather = Math.max(40, maxR * 0.12);
        const innerR = Math.max(0, r - feather);
        const outerR = r + feather * 0.3;

        ctx2d.clearRect(0, 0, W, H);

        const g = ctx2d.createRadialGradient(ox, oy, innerR, ox, oy, outerR);
        g.addColorStop(0, targetColor);
        g.addColorStop(0.6, targetColor);
        g.addColorStop(1, hexToRgba(targetColor, 0));

        ctx2d.fillStyle = g;
        ctx2d.fillRect(0, 0, W, H);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(frame);
        } else {
          ctx2d.fillStyle = targetColor;
          ctx2d.fillRect(0, 0, W, H);
          setTheme(next);
          rafRef.current = 0;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              canvas.style.display = "none";
              ctx2d.setTransform(1, 0, 0, 1, 0, 0);
              ctx2d.clearRect(0, 0, canvas.width, canvas.height);
              busyRef.current = false;
            });
          });
        }
      };

      rafRef.current = requestAnimationFrame(frame);
    },
    [resolvedTheme, theme, setTheme]
  );

  const overlayCanvas = (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none"
      style={{
        display: "none",
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        maxWidth: "100%",
        zIndex: OVERLAY_Z,
      }}
    />
  );

  return (
    <ThemeTransitionContext.Provider value={{ startThemeToggleFromButton }}>
      {portalReady ? createPortal(overlayCanvas, document.body) : null}
      {children}
    </ThemeTransitionContext.Provider>
  );
}
