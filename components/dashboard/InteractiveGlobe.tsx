"use client";

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import * as topojson from "topojson-client";
import {
  geoOrthographic,
  geoPath,
} from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
/* eslint-disable @typescript-eslint/no-explicit-any */
type TopoTopology = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ISO alpha-2 -> ISO numeric */
const A2_TO_N: Record<string, number> = {
  AF: 4,   AL: 8,   DZ: 12,  AO: 24,  AR: 32,  AM: 51,  AU: 36,
  AT: 40,  AZ: 31,  BD: 50,  BE: 56,  BJ: 204, BR: 76,  BG: 100,
  BF: 854, BY: 112, CA: 124, CL: 152, CM: 120, CN: 156, CO: 170,
  CD: 180, CG: 178, CR: 188, CU: 192, CY: 196, CZ: 203, DK: 208,
  DO: 214, EC: 218, EG: 818, ET: 231, FI: 246, FR: 250, GA: 266,
  DE: 276, GH: 288, GR: 300, GT: 320, GN: 324, HT: 332, HN: 340,
  HU: 348, IN: 356, ID: 360, IR: 364, IQ: 368, IE: 372, IL: 376,
  IT: 380, JM: 388, JP: 392, JO: 400, KZ: 398, KE: 404, KW: 414,
  LA: 418, LB: 422, LY: 434, MG: 450, MY: 458, ML: 466, MR: 478,
  MX: 484, MA: 504, MZ: 508, MM: 104, NP: 524, NL: 528, NZ: 554,
  NI: 558, NG: 566, KP: 408, NO: 578, OM: 512, PK: 586, PA: 591,
  PG: 598, PE: 604, PH: 608, PL: 616, PT: 620, PR: 630, QA: 634,
  RO: 642, RU: 643, SA: 682, SN: 686, SL: 694, SO: 706, ZA: 710,
  SS: 728, ES: 724, LK: 144, SD: 729, SE: 752, SY: 760, TW: 158,
  TJ: 762, TZ: 834, TH: 764, TN: 788, TR: 792, TM: 795, UG: 800,
  UA: 804, AE: 784, GB: 826, US: 840, UZ: 860, VE: 862, VN: 704,
  YE: 887, ZM: 894, ZW: 716, SG: 702, CH: 756,
};

const N_TO_A2: Record<number, string> = {};
for (const [a2, n] of Object.entries(A2_TO_N)) N_TO_A2[n] = a2;

export type GlobeHighlight = {
  code: string;
  color: string;
  opacity: number;
};

export type GlobeHandle = {
  pauseSpin: () => void;
  resumeSpin: () => void;
};

interface InteractiveGlobeProps {
  highlights?: GlobeHighlight[];
  width?: number;
  height?: number;
  className?: string;
  onCountryClick?: (code: string, x: number, y: number) => void;
}

const OCEAN_COLOR  = "#f5f7fa";
const LAND_DEFAULT = "#dde5ef";
const BORDER_COLOR = "#f0f3f7";
const SPHERE_STROKE = "#d4dce8";

export const InteractiveGlobe = forwardRef<GlobeHandle, InteractiveGlobeProps>(
  function InteractiveGlobe(
    { highlights = [], width = 280, height = 280, className, onCountryClick },
    ref
  ) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const featuresRef  = useRef<GeoPermissibleObjects[]>([]);
  const rotRef       = useRef<[number, number]>([-15, -20]);
  const dragRef      = useRef<{ x: number; y: number; rot: [number, number]; moved: boolean } | null>(null);
  const rafRef       = useRef<number | null>(null);
  const highlightRef = useRef<GlobeHighlight[]>(highlights);
  // When true the RAF loop skips rotation updates (tooltip open)
  const spinPausedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    pauseSpin:  () => { spinPausedRef.current = true; },
    resumeSpin: () => { spinPausedRef.current = false; },
  }), []);

  useEffect(() => {
    highlightRef.current = highlights;
    draw();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlights]);

  const makeProjection = useCallback((W: number, H: number) =>
    geoOrthographic()
      .scale(Math.min(W, H) / 2 - 4)
      .translate([W / 2, H / 2])
      .rotate([rotRef.current[0], rotRef.current[1], 0])
      .clipAngle(90),
  []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || featuresRef.current.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.clientWidth;
    const H   = canvas.clientHeight;

    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const projection = makeProjection(W, H);
    const path = geoPath(projection, ctx);

    ctx.beginPath();
    path({ type: "Sphere" });
    ctx.fillStyle = OCEAN_COLOR;
    ctx.fill();

    const hlMap = new Map<number, GlobeHighlight>();
    for (const hl of highlightRef.current) {
      const n = A2_TO_N[hl.code];
      if (n != null) hlMap.set(n, hl);
    }

    for (const feat of featuresRef.current) {
      const f = feat as { id?: string | number };
      const numId = typeof f.id === "string" ? parseInt(f.id, 10) : (f.id ?? -1);
      const hl    = hlMap.get(numId);

      ctx.beginPath();
      path(feat);

      if (hl) {
        ctx.fillStyle   = hexToRgba(hl.color, hl.opacity);
        ctx.strokeStyle = hexToRgba(hl.color, Math.min(1, hl.opacity + 0.25));
        ctx.lineWidth   = 0.75;
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle   = LAND_DEFAULT;
        ctx.strokeStyle = BORDER_COLOR;
        ctx.lineWidth   = 0.5;
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.beginPath();
    path({ type: "Sphere" });
    ctx.strokeStyle = SPHERE_STROKE;
    ctx.lineWidth   = 1.2;
    ctx.stroke();
  }, [makeProjection]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch("/world-110m.json")
      .then((r) => r.json())
      .then((topo: TopoTopology) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const collection = (topojson.feature as any)(topo, topo.objects["countries"]);
        featuresRef.current =
          collection.type === "FeatureCollection"
            ? collection.features
            : [collection];
        draw();
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-spin loop — skips rotation when paused or dragging
  useEffect(() => {
    let last = 0;
    const spin = (ts: number) => {
      const paused = spinPausedRef.current || dragRef.current !== null;
      if (!paused) {
        const dt = ts - last;
        if (dt > 0 && dt < 200) {
          rotRef.current = [rotRef.current[0] + dt * 0.008, rotRef.current[1]];
          draw();
        }
      }
      last = ts;
      rafRef.current = requestAnimationFrame(spin);
    };
    rafRef.current = requestAnimationFrame(spin);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hitTestHighlighted = useCallback((px: number, py: number): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    const projection = makeProjection(W, H);

    const offscreen = document.createElement("canvas");
    offscreen.width  = W;
    offscreen.height = H;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return null;

    const path  = geoPath(projection, ctx);
    const hlSet = new Set(
      highlightRef.current.map((h) => A2_TO_N[h.code]).filter((n): n is number => n != null)
    );

    let found: string | null = null;
    for (const feat of featuresRef.current) {
      const f = feat as { id?: string | number };
      const numId = typeof f.id === "string" ? parseInt(f.id, 10) : (f.id ?? -1);
      if (!hlSet.has(numId)) continue;
      ctx.beginPath();
      path(feat);
      if (ctx.isPointInPath(px, py)) found = N_TO_A2[numId] ?? null;
    }
    return found;
  }, [makeProjection]);

  const getXY = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = getXY(e);
    dragRef.current = { x, y, rot: [...rotRef.current] as [number, number], moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { x, y } = getXY(e);
    const dx = x - dragRef.current.x;
    const dy = y - dragRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
    const sensitivity = 0.4;
    rotRef.current = [
      dragRef.current.rot[0] + dx * sensitivity,
      Math.max(-70, Math.min(70, dragRef.current.rot[1] - dy * sensitivity)),
    ];
    draw();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const wasDrag = dragRef.current?.moved ?? false;
    const { x, y } = getXY(e);
    dragRef.current = null;
    if (!wasDrag && onCountryClick) {
      const code = hitTestHighlighted(x, y);
      // Pass viewport coordinates so caller can portal-position the popup
      const rect = canvasRef.current!.getBoundingClientRect();
      const vx = rect.left + x;
      const vy = rect.top  + y;
      if (code) {
        onCountryClick(code, vx, vy);
      } else {
        onCountryClick("", vx, vy);
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ cursor: "grab", touchAction: "none", display: "block", width: "100%", height: "100%" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => { dragRef.current = null; }}
      aria-label="Interactive world globe showing invoice origins"
    />
  );
});

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
