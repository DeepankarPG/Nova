"use client";

import { useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── palette (payglocal-theme.css tokens only) ───────────────────────────── */
const BRAND   = "#0061e3";
const BRAND_2 = "#3b82f6";
const BRAND_3 = "#60a5fa";
const BRAND_4 = "#93c5fd";
const BRAND_5 = "#bfdbfe";
const GREEN   = "#059669";
const AMBER   = "#d97706";
const RED     = "#dc2626";
const SLATE   = "#64748b";

/* UPI app palette — violet family */
const V1 = "#7c3aed"; const V2 = "#8b5cf6"; const V3 = "#a78bfa"; const V4 = "#c4b5fd";
/* Card network palette — indigo family */
const I1 = "#4338ca"; const I2 = "#6366f1"; const I3 = "#818cf8"; const I4 = "#a5b4fc";

/* ─── SVG coordinate system ───────────────────────────────────────────────────
 *
 *  Four columns:
 *
 *  [LBL-A] [A] [flow] [B] [LBL-B] [flow] [C] [flow] [D] [LBL-D]
 *
 *  A = Initiated bar       bx=160
 *  B = Outcome bars        bx=310  LBL-B = 332..490
 *  C = Method bars         bx=510  no label (too narrow zone)
 *  D = Sub-breakdown bars  bx=690  LBL-D = 712..
 *
 *  C method labels: shown to the LEFT of col-C bar (right-anchored at 502)
 *  D labels: shown to the RIGHT of col-D bar (left-anchored at 712)
 *
 *  viewBox: 0 0 1020 300
 * ─────────────────────────────────────────────────────────────────────────── */

const SVG_W = 1020;
const SVG_H = 640;
const BAR_W = 20;
const GAP   = 10;
const PAD_T = 48;  // top padding (col header + breathing room)
const PAD_B = 32;  // bottom padding
const BAR_H = SVG_H - PAD_T - PAD_B;

const AX = 160;  // initiated
const BX = 310;  // outcomes
const CX = 500;  // methods
const DX = 700;  // sub-breakdown (UPI apps / card networks)

const LBL_A  = AX - 8;            // right-anchored
const LBL_B  = BX + BAR_W + 8;    // left-anchored  (330)
const LBL_C  = CX - 8;            // right-anchored (to left of C bar — avoids flow C→D zone)
const LBL_D  = DX + BAR_W + 8;    // left-anchored  (720)

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function fmt(n: number) {
  if (n >= 10_00_000) return `${(n / 10_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000)  return `${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-IN");
}
function pct(n: number, d: number) { return `${((n / d) * 100).toFixed(1)}%`; }

function ribbon(
  x0: number, y0t: number, y0b: number,
  x1: number, y1t: number, y1b: number,
) {
  const mx = (x0 + x1) / 2;
  return [
    `M${x0} ${y0t}`,
    `C${mx} ${y0t} ${mx} ${y1t} ${x1} ${y1t}`,
    `L${x1} ${y1b}`,
    `C${mx} ${y1b} ${mx} ${y0b} ${x0} ${y0b}`,
    "Z",
  ].join(" ");
}

/* ─── data ────────────────────────────────────────────────────────────────── */
type Period = "1W" | "1M" | "3M";

interface SubItem { label: string; value: number; color: string }
interface Method  { label: string; value: number; color: string; subs?: SubItem[] }
interface PData {
  total: number; successful: number; abandoned: number; errors: number;
  methods: Method[];
}

const PDATA: Record<Period, PData> = {
  "1W": {
    total: 100_000, successful: 75_400, abandoned: 18_400, errors: 6_200,
    methods: [
      {
        label: "UPI", value: 36_192, color: BRAND,
        subs: [
          { label: "PhonePe",    value: 14_477, color: V1 },
          { label: "GPay",       value: 10_857, color: V2 },
          { label: "Paytm",      value: 7_238,  color: V3 },
          { label: "Others",     value: 3_620,  color: V4 },
        ],
      },
      {
        label: "Cards", value: 22_620, color: BRAND_2,
        subs: [
          { label: "Visa",       value: 9_726,  color: I1 },
          { label: "Mastercard", value: 7_693,  color: I2 },
          { label: "RuPay",      value: 3_619,  color: I3 },
          { label: "Amex",       value: 1_582,  color: I4 },
        ],
      },
      { label: "Net banking", value: 9_048,  color: BRAND_3 },
      { label: "Wallets",     value: 5_278,  color: BRAND_4 },
      { label: "BNPL",        value: 2_262,  color: BRAND_5 },
    ],
  },
  "1M": {
    total: 420_000, successful: 331_800, abandoned: 65_100, errors: 23_100,
    methods: [
      {
        label: "UPI", value: 179_172, color: BRAND,
        subs: [
          { label: "PhonePe",    value: 78_836, color: V1 },
          { label: "GPay",       value: 57_335, color: V2 },
          { label: "Paytm",      value: 30_459, color: V3 },
          { label: "Others",     value: 12_542, color: V4 },
        ],
      },
      {
        label: "Cards", value: 76_314, color: BRAND_2,
        subs: [
          { label: "Visa",       value: 31_289, color: I1 },
          { label: "Mastercard", value: 26_710, color: I2 },
          { label: "RuPay",      value: 13_736, color: I3 },
          { label: "Amex",       value: 4_579,  color: I4 },
        ],
      },
      { label: "Net banking", value: 46_756,  color: BRAND_3 },
      { label: "Wallets",     value: 22_922,  color: BRAND_4 },
      { label: "BNPL",        value: 6_636,   color: BRAND_5 },
    ],
  },
  "3M": {
    total: 1_260_000, successful: 1_071_000, abandoned: 138_600, errors: 50_400,
    methods: [
      {
        label: "UPI", value: 706_860, color: BRAND,
        subs: [
          { label: "PhonePe",    value: 353_430, color: V1 },
          { label: "GPay",       value: 233_265, color: V2 },
          { label: "Paytm",      value: 92_892,  color: V3 },
          { label: "Others",     value: 27_273,  color: V4 },
        ],
      },
      {
        label: "Cards", value: 128_520, color: BRAND_2,
        subs: [
          { label: "Visa",       value: 57_834, color: I1 },
          { label: "Mastercard", value: 41_126, color: I2 },
          { label: "RuPay",      value: 22_491, color: I3 },
          { label: "Amex",       value: 7_069,  color: I4 },
        ],
      },
      { label: "Net banking", value: 149_940, color: BRAND_3 },
      { label: "Wallets",     value: 64_260,  color: BRAND_4 },
      { label: "BNPL",        value: 21_420,  color: BRAND_5 },
    ],
  },
};

/* ─── node ────────────────────────────────────────────────────────────────── */
interface Node {
  id: string; label: string; value: number; color: string;
  bx: number; y: number; h: number;
}

function computeLayout(d: PData) {
  const { total, successful, abandoned, errors } = d;

  /* Col A */
  const initNode: Node = {
    id: "init", label: "Initiated", value: total, color: SLATE,
    bx: AX, y: PAD_T, h: BAR_H,
  };

  /* Col B */
  const sucH = Math.round((successful / total) * BAR_H);
  const abaH = Math.round((abandoned  / total) * BAR_H);
  const errH = BAR_H - sucH - abaH;

  const sucNode: Node = { id: "success",   label: "Successful", value: successful, color: GREEN,
    bx: BX, y: PAD_T,                         h: Math.max(sucH - GAP, 6) };
  const abaNode: Node = { id: "abandoned", label: "Abandoned",  value: abandoned,  color: AMBER,
    bx: BX, y: PAD_T + sucH + GAP,            h: Math.max(abaH - GAP, 6) };
  const errNode: Node = { id: "errors",    label: "Errors",     value: errors,     color: RED,
    bx: BX, y: PAD_T + sucH + abaH + GAP * 2, h: Math.max(errH - GAP * 2, 4) };

  /* Col C: methods proportional to sucNode height */
  const methNodes: Node[] = [];
  let mY = PAD_T;
  d.methods.forEach((m, i) => {
    const h = Math.max(Math.round((m.value / successful) * sucNode.h) - GAP, 4);
    methNodes.push({ id: `m${i}`, label: m.label, value: m.value, color: m.color,
      bx: CX, y: mY, h });
    mY += h + GAP;
  });

  /* Col D: sub-breakdown nodes for UPI (m0) and Cards (m1) only */
  const subNodes: Node[][] = d.methods.map((m, mi) => {
    if (!m.subs) return [];
    const parentNode = methNodes[mi]!;
    const nodes: Node[] = [];
    let sY = parentNode.y;
    m.subs.forEach((s, si) => {
      const h = Math.max(Math.round((s.value / m.value) * parentNode.h) - GAP, 4);
      nodes.push({ id: `s${mi}-${si}`, label: s.label, value: s.value, color: s.color,
        bx: DX, y: sY, h });
      sY += h + GAP;
    });
    return nodes;
  });

  return { initNode, sucNode, abaNode, errNode, methNodes, subNodes };
}

/* ─── BarLabel ────────────────────────────────────────────────────────────── */
const labelTransition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const };

function BarLabel({
  x, barY, barH, name, value, pctStr, color, anchor = "start",
}: {
  x: number; barY: number; barH: number;
  name: string; value: string; pctStr: string;
  color: string; anchor?: "start" | "end";
}) {
  const mid     = barY + barH / 2;
  const clamped = Math.max(PAD_T + 9, Math.min(SVG_H - PAD_B - 9, mid));
  const small   = barH < 28;

  if (small) {
    return (
      <motion.text x={x} animate={{ y: clamped + 4 }} transition={labelTransition} textAnchor={anchor}
        fontSize={10} fontWeight={600} fill="var(--foreground)">
        {name}{"  "}
        <tspan fontWeight={700} fontSize={11}>{value}</tspan>
        {" "}<tspan fontSize={9} fontWeight={400} fill={color}>{pctStr}</tspan>
      </motion.text>
    );
  }
  return (
    <g>
      <motion.text x={x} animate={{ y: clamped - 8 }} transition={labelTransition} textAnchor={anchor}
        fontSize={11} fontWeight={500} fill="var(--muted-foreground)">{name}</motion.text>
      <motion.text x={x} animate={{ y: clamped + 9 }} transition={labelTransition} textAnchor={anchor}
        fontSize={14} fontWeight={700} fill="var(--foreground)">
        {value}{" "}
        <tspan fontSize={10} fontWeight={400} fill={color}>{pctStr}</tspan>
      </motion.text>
    </g>
  );
}

/* ─── ColHeader ───────────────────────────────────────────────────────────── */
function ColHeader({ x, label }: { x: number; label: string }) {
  return (
    <text x={x} y={PAD_T - 16} textAnchor="middle"
      fontSize={10} fontWeight={500} letterSpacing={1}
      fill="var(--muted-foreground)">{label}</text>
  );
}

/* ─── component ───────────────────────────────────────────────────────────── */
export function PaymentFlowSankeyWidget({ preview }: { preview?: boolean }) {
  const [period, setPeriod] = useState<Period>("1W");
  const d = PDATA[period];
  const { initNode, sucNode, abaNode, errNode, methNodes, subNodes } = computeLayout(d);

  /* ribbons A → B */
  const rAB: { id: string; d: string; color: string }[] = [];
  {
    const segs = [
      { n: sucNode, v: d.successful },
      { n: abaNode, v: d.abandoned  },
      { n: errNode, v: d.errors     },
    ];
    let off = 0;
    for (const s of segs) {
      const sh = Math.round((s.v / d.total) * initNode.h);
      rAB.push({ id: `ab-${s.n.id}`, color: s.n.color,
        d: ribbon(AX + BAR_W, initNode.y + off, initNode.y + off + sh,
                  BX,         s.n.y,            s.n.y + s.n.h) });
      off += sh;
    }
  }

  /* ribbons B(suc) → C */
  const rBC: { id: string; d: string; color: string }[] = [];
  {
    let off = 0;
    for (const m of methNodes) {
      const sh = Math.round((m.value / d.successful) * sucNode.h);
      rBC.push({ id: `bc-${m.id}`, color: m.color,
        d: ribbon(BX + BAR_W, sucNode.y + off, sucNode.y + off + sh,
                  CX,         m.y,             m.y + m.h) });
      off += sh;
    }
  }

  /* ribbons C(UPI) → D(UPI apps)  and  C(Cards) → D(card networks) */
  const rCD: { id: string; d: string; color: string }[] = [];
  subNodes.forEach((subs, mi) => {
    if (subs.length === 0) return;
    const parent = methNodes[mi]!;
    let off = 0;
    for (const s of subs) {
      const sh = Math.round((s.value / parent.value) * parent.h);
      rCD.push({ id: `cd-${s.id}`, color: s.color,
        d: ribbon(CX + BAR_W, parent.y + off, parent.y + off + sh,
                  DX,         s.y,            s.y + s.h) });
      off += sh;
    }
  });

  return (
    <motion.div
      initial={preview ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card text-card-foreground rounded-xl border border-border shadow-sm px-5 pt-4 pb-4 flex flex-col gap-3 h-full"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Payment flow</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Session funnel — outcome, method, and instrument breakdown
          </p>
        </div>

        {!preview && (
          <LayoutGroup id="sankey-period-tabs">
            <div
              className="flex shrink-0 gap-0 rounded-lg border border-border bg-muted/45 p-1 dark:bg-muted/25"
              role="tablist"
            >
              {(["1W", "1M", "3M"] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="tab"
                  aria-selected={period === p}
                  onClick={() => setPeriod(p)}
                  className="relative rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors"
                >
                  {period === p && (
                    <motion.span
                      layoutId="sankey-period-pill"
                      className="absolute inset-0 z-0 rounded-md bg-card shadow-sm ring-1 ring-border"
                      transition={{ type: "spring", stiffness: 520, damping: 38 }}
                      aria-hidden
                    />
                  )}
                  <span className={cn(
                    "relative z-10",
                    period === p ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}>
                    {p}
                  </span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        )}
      </div>

      {/* ── Sankey ── */}
      {/*
        Stable outer div — never changes height.
        Animated child uses absolute inset-0 so the container
        height stays constant throughout the exit animation,
        preventing the "instant" collapse effect.
      */}
      <div
        className="relative flex-1 min-h-0"
        style={{ minHeight: preview ? 220 : 560 }}
      >
        <div className="absolute inset-0">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width="100%"
            height="100%"
            style={{ display: "block", overflow: "visible" }}
          >
            {/* Column headers */}
            {!preview && (
              <>
                <ColHeader x={AX + BAR_W / 2} label="SESSIONS" />
                <ColHeader x={BX + BAR_W / 2} label="OUTCOME"  />
                <ColHeader x={CX + BAR_W / 2} label="METHOD"   />
                <ColHeader x={DX + BAR_W / 2} label="INSTRUMENT" />
              </>
            )}

            {/* Ribbons — rendered behind all bars */}
            {rAB.map(r => (
              <motion.path key={r.id} animate={{ d: r.d }} transition={labelTransition}
                fill={r.color} fillOpacity={0.11} stroke="none" />
            ))}
            {rBC.map(r => (
              <motion.path key={r.id} animate={{ d: r.d }} transition={labelTransition}
                fill={r.color} fillOpacity={0.13} stroke="none" />
            ))}
            {rCD.map(r => (
              <motion.path key={r.id} animate={{ d: r.d }} transition={labelTransition}
                fill={r.color} fillOpacity={0.16} stroke="none" />
            ))}

            {/* Col A: initiated */}
            <motion.rect x={initNode.bx} animate={{ y: initNode.y, height: initNode.h }}
              transition={labelTransition} width={BAR_W} rx={4} fill={initNode.color} />
            <BarLabel
              x={LBL_A} barY={initNode.y} barH={initNode.h}
              name="Initiated" value={fmt(d.total)} pctStr="100%"
              color={SLATE} anchor="end"
            />

            {/* Col B: outcomes */}
            {[sucNode, abaNode, errNode].map(n => (
              <g key={n.id}>
                <motion.rect x={n.bx} animate={{ y: n.y, height: n.h }}
                  transition={labelTransition} width={BAR_W} rx={4} fill={n.color} />
                <BarLabel
                  x={LBL_B} barY={n.y} barH={n.h}
                  name={n.label} value={fmt(n.value)} pctStr={pct(n.value, d.total)}
                  color={n.color}
                />
              </g>
            ))}

            {/* Col C: methods — label to the LEFT of bar (right-anchored) */}
            {methNodes.map(m => (
              <g key={m.id}>
                <motion.rect x={m.bx} animate={{ y: m.y, height: m.h }}
                  transition={labelTransition} width={BAR_W} rx={3} fill={m.color} />
                <BarLabel
                  x={LBL_C} barY={m.y} barH={m.h}
                  name={m.label} value={fmt(m.value)} pctStr={pct(m.value, d.successful)}
                  color={m.color} anchor="end"
                />
              </g>
            ))}

            {/* Col D: sub-breakdown — label to the RIGHT */}
            {subNodes.map((subs, mi) =>
              subs.map(s => {
                const parent = methNodes[mi]!;
                return (
                  <g key={s.id}>
                    <motion.rect x={s.bx} animate={{ y: s.y, height: s.h }}
                      transition={labelTransition} width={BAR_W} rx={3} fill={s.color} />
                    <BarLabel
                      x={LBL_D} barY={s.y} barH={s.h}
                      name={s.label} value={fmt(s.value)} pctStr={pct(s.value, parent.value)}
                      color={s.color}
                    />
                  </g>
                );
              })
            )}
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
