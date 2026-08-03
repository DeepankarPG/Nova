"use client";

import { useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Period = "1M" | "3M" | "6M";

interface RadarPoint {
  label: string;
  shortLabel: string[];
  thisMonth: number;
  lastMonth: number;
}

const DATA: Record<Period, RadarPoint[]> = {
  "1M": [
    { label: "Session Timeout",    shortLabel: ["Session", "Timeout"],    thisMonth: 68, lastMonth: 74 },
    { label: "OTP Not Entered",    shortLabel: ["OTP Not", "Entered"],    thisMonth: 52, lastMonth: 61 },
    { label: "Left Payment Page",  shortLabel: ["Left Payment", "Page"],  thisMonth: 81, lastMonth: 69 },
    { label: "Bank Page Timeout",  shortLabel: ["Bank Page", "Timeout"],  thisMonth: 44, lastMonth: 58 },
    { label: "Network Error",      shortLabel: ["Network", "Error"],      thisMonth: 37, lastMonth: 42 },
    { label: "Insufficient Funds", shortLabel: ["Insufficient", "Funds"], thisMonth: 56, lastMonth: 48 },
    { label: "Navigated Away",     shortLabel: ["Navigated", "Away"],     thisMonth: 63, lastMonth: 71 },
    { label: "Card Declined",      shortLabel: ["Card", "Declined"],      thisMonth: 29, lastMonth: 35 },
  ],
  "3M": [
    { label: "Session Timeout",    shortLabel: ["Session", "Timeout"],    thisMonth: 72, lastMonth: 65 },
    { label: "OTP Not Entered",    shortLabel: ["OTP Not", "Entered"],    thisMonth: 48, lastMonth: 55 },
    { label: "Left Payment Page",  shortLabel: ["Left Payment", "Page"],  thisMonth: 77, lastMonth: 82 },
    { label: "Bank Page Timeout",  shortLabel: ["Bank Page", "Timeout"],  thisMonth: 51, lastMonth: 63 },
    { label: "Network Error",      shortLabel: ["Network", "Error"],      thisMonth: 33, lastMonth: 45 },
    { label: "Insufficient Funds", shortLabel: ["Insufficient", "Funds"], thisMonth: 60, lastMonth: 52 },
    { label: "Navigated Away",     shortLabel: ["Navigated", "Away"],     thisMonth: 58, lastMonth: 66 },
    { label: "Card Declined",      shortLabel: ["Card", "Declined"],      thisMonth: 25, lastMonth: 31 },
  ],
  "6M": [
    { label: "Session Timeout",    shortLabel: ["Session", "Timeout"],    thisMonth: 64, lastMonth: 70 },
    { label: "OTP Not Entered",    shortLabel: ["OTP Not", "Entered"],    thisMonth: 55, lastMonth: 60 },
    { label: "Left Payment Page",  shortLabel: ["Left Payment", "Page"],  thisMonth: 74, lastMonth: 79 },
    { label: "Bank Page Timeout",  shortLabel: ["Bank Page", "Timeout"],  thisMonth: 47, lastMonth: 55 },
    { label: "Network Error",      shortLabel: ["Network", "Error"],      thisMonth: 40, lastMonth: 38 },
    { label: "Insufficient Funds", shortLabel: ["Insufficient", "Funds"], thisMonth: 53, lastMonth: 49 },
    { label: "Navigated Away",     shortLabel: ["Navigated", "Away"],     thisMonth: 67, lastMonth: 73 },
    { label: "Card Declined",      shortLabel: ["Card", "Declined"],      thisMonth: 32, lastMonth: 28 },
  ],
};

// Design token colors from payglocal-theme.css
const COLOR_THIS = "#0061e3"; // --chart-1 (primary brand blue)
const COLOR_LAST = "#c4b5fd"; // --chart-3 family violet-200 (soft, distinct from blue)
const COLOR_LAST_STROKE = "#7c3aed"; // violet-700 for dashed stroke

const SVG_SIZE = 440;
const CX = SVG_SIZE / 2;
const CY = SVG_SIZE / 2;
const RADIUS = 148;
const LEVELS = 4;

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function buildPolygonPoints(points: RadarPoint[], key: "thisMonth" | "lastMonth"): string {
  const n = points.length;
  return points
    .map((p, i) => {
      const { x, y } = polarToXY((360 / n) * i, (p[key] / 100) * RADIUS);
      return `${x},${y}`;
    })
    .join(" ");
}

function RadarChart({ points }: { points: RadarPoint[] }) {
  const n = points.length;

  const rings = Array.from({ length: LEVELS }, (_, lvl) => {
    const r = ((lvl + 1) / LEVELS) * RADIUS;
    return points.map((_, i) => polarToXY((360 / n) * i, r));
  });

  const polyThis = buildPolygonPoints(points, "thisMonth");
  const polyLast = buildPolygonPoints(points, "lastMonth");

  return (
    <svg
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Grid rings */}
      {rings.map((ringPts, lvl) => (
        <polygon
          key={lvl}
          points={ringPts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="var(--border)"
          strokeWidth={lvl === LEVELS - 1 ? 1.5 : 1}
          opacity={lvl === LEVELS - 1 ? 0.8 : 0.5}
        />
      ))}

      {/* Spokes */}
      {points.map((_, i) => {
        const { x, y } = polarToXY((360 / n) * i, RADIUS);
        return (
          <line
            key={i}
            x1={CX} y1={CY} x2={x} y2={y}
            stroke="var(--border)"
            strokeWidth={1}
            opacity={0.45}
          />
        );
      })}

      {/* Ring % ticks along top spoke (index 0 = top) */}
      {Array.from({ length: LEVELS }, (_, lvl) => {
        const r = ((lvl + 1) / LEVELS) * RADIUS;
        const pct = Math.round(((lvl + 1) / LEVELS) * 100);
        // place slightly right of center spoke so not overlapping
        return (
          <text
            key={lvl}
            x={CX + 6}
            y={CY - r + 4}
            fontSize={9}
            fill="var(--muted-foreground)"
            opacity={0.55}
            fontFamily="inherit"
          >
            {pct}%
          </text>
        );
      })}

      {/* Last month polygon */}
      <motion.polygon
        animate={{ points: polyLast }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        fill={COLOR_LAST}
        fillOpacity={0.18}
        stroke={COLOR_LAST_STROKE}
        strokeWidth={1.5}
        strokeDasharray="5 3"
        strokeLinejoin="round"
      />

      {/* This month polygon */}
      <motion.polygon
        animate={{ points: polyThis }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        fill={COLOR_THIS}
        fillOpacity={0.14}
        stroke={COLOR_THIS}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Dots -- last month (behind) */}
      {points.map((p, i) => {
        const { x, y } = polarToXY((360 / n) * i, (p.lastMonth / 100) * RADIUS);
        return (
          <motion.circle
            key={i}
            animate={{ cx: x, cy: y }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            r={3.5}
            fill={COLOR_LAST_STROKE}
            stroke="var(--card)"
            strokeWidth={1.5}
            opacity={0.7}
          />
        );
      })}

      {/* Dots -- this month (on top) */}
      {points.map((p, i) => {
        const { x, y } = polarToXY((360 / n) * i, (p.thisMonth / 100) * RADIUS);
        return (
          <motion.circle
            key={i}
            animate={{ cx: x, cy: y }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            r={4.5}
            fill={COLOR_THIS}
            stroke="var(--card)"
            strokeWidth={2}
          />
        );
      })}

      {/* Axis labels */}
      {points.map((p, i) => {
        const angle = (360 / n) * i;
        const { x, y } = polarToXY(angle, RADIUS + 30);

        const norm = ((angle % 360) + 360) % 360;
        const anchor: "start" | "middle" | "end" =
          norm > 20 && norm < 160 ? "start" : norm > 200 && norm < 340 ? "end" : "middle";

        // Nudge top/bottom labels
        const yOff = norm < 10 || norm > 350 ? -4 : norm > 170 && norm < 190 ? 4 : 0;

        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor}
            fill="var(--muted-foreground)"
            fontSize={10.5}
            fontWeight={500}
            fontFamily="inherit"
          >
            {p.shortLabel.map((line, li) => (
              <tspan key={li} x={x} dy={li === 0 ? yOff : 13}>
                {line}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

const cardClass = "bg-card text-card-foreground rounded-xl border border-border shadow-sm";

interface Props {
  preview?: boolean;
}

export function AbandonmentRadarWidget({ preview = false }: Props) {
  const [period, setPeriod] = useState<Period>("1M");
  const data = DATA[period];

  const totalThis = data.reduce((s, p) => s + p.thisMonth, 0);
  const totalLast = data.reduce((s, p) => s + p.lastMonth, 0);
  const delta = totalThis - totalLast;
  const topReason = [...data].sort((a, b) => b.thisMonth - a.thisMonth)[0];
  const maxVal = Math.max(...data.map((p) => p.thisMonth));

  return (
    <div className={cn(cardClass, "flex flex-col h-full overflow-hidden")}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-3 shrink-0">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-muted-foreground">Abandonment Reasons</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[1.25rem] font-bold text-foreground leading-none tabular-nums">
              {data.length} reasons
            </span>
            <span
              className={cn(
                "text-[12px] font-semibold",
                delta < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
              )}
            >
              {delta < 0 ? "" : "+"}{delta} pts
            </span>
            <span className="text-[11px] text-muted-foreground">vs last period</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="inline-block w-5 h-0.5 rounded-full" style={{ background: COLOR_THIS }} />
              This month
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <svg width="20" height="2" viewBox="0 0 20 2" style={{ display: "inline-block" }}>
                <line x1="0" y1="1" x2="20" y2="1" stroke={COLOR_LAST_STROKE} strokeWidth="1.5" strokeDasharray="4 2.5" />
              </svg>
              Last month
            </span>
          </div>

          {/* Period toggle */}
          <LayoutGroup id="abandonment-period-tabs">
            <div
              className="flex shrink-0 gap-0 rounded-lg border border-border bg-muted/45 p-1 dark:bg-muted/25"
              role="tablist"
            >
              {(["1M", "3M", "6M"] as Period[]).map((p) => (
                <button
                  key={p}
                  role="tab"
                  aria-selected={period === p}
                  onClick={() => setPeriod(p)}
                  className="relative rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors"
                >
                  {period === p && (
                    <motion.span
                      layoutId="abandonment-period-pill"
                      className="absolute inset-0 z-0 rounded-md bg-card shadow-sm ring-1 ring-border"
                      transition={{ type: "spring", stiffness: 520, damping: 38 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10",
                      period === p ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p}
                  </span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mx-0 mt-4 shrink-0" />

      {/* Body: chart + ranked list */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Radar chart area */}
        <div
          className="relative flex-1 min-h-0 flex items-center justify-center p-4"
          style={{ minHeight: preview ? 220 : 360 }}
        >
          <div
            className="relative"
            style={{
              width: "100%",
              height: "100%",
              maxWidth: preview ? 260 : 420,
              maxHeight: preview ? 260 : 420,
              aspectRatio: "1 / 1",
            }}
          >
            <div className="absolute inset-0">
              <RadarChart points={data} />
            </div>
          </div>
        </div>

        {/* Right panel: ranked list + callout */}
        {!preview && (
          <div className="hidden lg:flex flex-col shrink-0 w-[280px] border-l border-border bg-muted/20 dark:bg-muted/10 px-5 py-4 gap-0 overflow-y-auto">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Ranked by this month
            </span>
            <div className="flex flex-col gap-3">
              {[...data]
                .sort((a, b) => b.thisMonth - a.thisMonth)
                .map((p, i) => {
                  const trend = p.thisMonth - p.lastMonth;
                  const barPct = (p.thisMonth / maxVal) * 100;
                  const isTop = i === 0;
                  return (
                    <div key={p.label} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="text-[10px] font-bold tabular-nums w-4 shrink-0"
                            style={{ color: isTop ? COLOR_THIS : "var(--muted-foreground)" }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-[11.5px] text-foreground font-medium truncate">{p.label}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[11px] font-bold tabular-nums text-foreground">{p.thisMonth}%</span>
                          <span
                            className={cn(
                              "text-[10px] font-semibold tabular-nums",
                              trend > 0 ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                            )}
                          >
                            {trend > 0 ? "+" : ""}{trend}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-1 w-full rounded-full bg-border/60 overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${barPct}%` }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
                          style={{
                            background: isTop ? COLOR_THIS : i < 3 ? "#3b82f6" : "var(--muted-foreground)",
                            opacity: isTop ? 1 : 0.6 + (1 - i / data.length) * 0.4,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Callout */}
            <div className="mt-4 rounded-lg border border-border bg-card px-3 py-3 shrink-0">
              <span className="text-[9.5px] text-muted-foreground uppercase tracking-widest font-semibold block mb-1">
                Highest this month
              </span>
              <span className="text-[13px] font-semibold text-foreground block leading-snug">{topReason.label}</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-[15px] font-bold tabular-nums" style={{ color: COLOR_THIS }}>
                  {topReason.thisMonth}%
                </span>
                <span className="text-[10px] text-muted-foreground">session share</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
