"use client";

import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHideAmounts, MaskedNumber } from "@/lib/hide-amounts-context";

/* ─── PayGlocal blue-spectrum palette ────────────────────────────── */
// All chart lines stay within the blue family — primary → sky → deep-blue.
// "prev" is always a lighter tonal of the same hue so the legend reads cleanly.
// Failed is the only exception: red is semantic and expected.
const PALETTE = {
  grossVol:  { cur: "#0061e3", prev: "#93c5fd", fill: "#dbeafe", prevFill: "transparent" }, // brand primary
  psr:       { cur: "#0284c7", prev: "#7dd3fc", fill: "#e0f2fe", prevFill: "transparent" }, // sky-600
  txns:      { cur: "#2563eb", prev: "#bfdbfe", fill: "#eff6ff", prevFill: "#bfdbfe"     }, // blue-600 bars
  intl:      { cur: "#1d4ed8", prev: "#93c5fd", fill: "#eff6ff", prevFill: "transparent" }, // blue-700
  avgTicket: { cur: "#0369a1", prev: "#7dd3fc", fill: "#f0f9ff", prevFill: "transparent" }, // sky-700
  failed:    { cur: "#dc2626", prev: "#fca5a5", fill: "#fee2e2", prevFill: "#fca5a5"     }, // red — semantic
} as const;

const TT = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 11,
  color: "var(--foreground)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.09)",
};
const AX = {
  tick: { fontSize: 9, fill: "var(--muted-foreground)" },
  tickLine: false, axisLine: false,
} as const;

/* ─── Periods ─────────────────────────────────────────────────────── */
const PERIODS = [
  { id: "1D",  label: "Today" },
  { id: "1W",  label: "1W"    },
  { id: "1M",  label: "1M"    },
  { id: "3M",  label: "3M"    },
  { id: "YTD", label: "YTD"   },
] as const;
type Period = typeof PERIODS[number]["id"];

/* ─── Time-series ─────────────────────────────────────────────────── */
const TS: Record<Period, { t: string; cur: number; prev: number }[]> = {
  "1D":  [{t:"00",cur:12000,prev:18000},{t:"02",cur:25000,prev:32000},{t:"04",cur:45000,prev:55000},{t:"06",cur:80000,prev:95000},{t:"08",cur:148000,prev:172000},{t:"10",cur:290000,prev:315000},{t:"12",cur:425000,prev:462000},{t:"14",cur:582000,prev:618000},{t:"16",cur:725000,prev:750000},{t:"18",cur:848000,prev:872000},{t:"20",cur:912000,prev:934000},{t:"22",cur:942800,prev:960000}],
  "1W":  [{t:"Mon",cur:142000,prev:128000},{t:"Tue",cur:198000,prev:175000},{t:"Wed",cur:225000,prev:210000},{t:"Thu",cur:187000,prev:195000},{t:"Fri",cur:312000,prev:285000},{t:"Sat",cur:278000,prev:258000},{t:"Sun",cur:135000,prev:142000}],
  "1M":  [{t:"W1",cur:1240000,prev:1180000},{t:"W2",cur:1580000,prev:1450000},{t:"W3",cur:1820000,prev:1720000},{t:"W4",cur:2100000,prev:1980000}],
  "3M":  [{t:"Jan",cur:4850000,prev:4120000},{t:"Feb",cur:5280000,prev:4750000},{t:"Mar",cur:6140000,prev:5620000}],
  "YTD": [{t:"Jan",cur:4850000,prev:4120000},{t:"Feb",cur:5280000,prev:4750000},{t:"Mar",cur:6140000,prev:5620000},{t:"Apr",cur:7200000,prev:6450000},{t:"May",cur:8100000,prev:7380000},{t:"Jun",cur:9420000,prev:8250000}],
};
const PSR: Record<Period, { t: string; cur: number; prev: number }[]> = {
  "1D":  [{t:"00",cur:93.1,prev:91.5},{t:"04",cur:95.2,prev:94.0},{t:"08",cur:94.8,prev:93.8},{t:"12",cur:93.9,prev:94.5},{t:"16",cur:94.5,prev:93.2},{t:"20",cur:94.2,prev:94.1}],
  "1W":  [{t:"Mon",cur:94.2,prev:93.8},{t:"Tue",cur:95.1,prev:94.2},{t:"Wed",cur:93.8,prev:94.0},{t:"Thu",cur:94.7,prev:93.5},{t:"Fri",cur:95.3,prev:94.8},{t:"Sat",cur:94.1,prev:93.2},{t:"Sun",cur:93.6,prev:92.8}],
  "1M":  [{t:"W1",cur:94.2,prev:93.5},{t:"W2",cur:94.8,prev:94.1},{t:"W3",cur:95.1,prev:94.3},{t:"W4",cur:94.5,prev:93.8}],
  "3M":  [{t:"Jan",cur:94.2,prev:93.1},{t:"Feb",cur:94.8,prev:94.0},{t:"Mar",cur:95.2,prev:94.5}],
  "YTD": [{t:"Jan",cur:93.8,prev:92.5},{t:"Feb",cur:94.2,prev:93.1},{t:"Mar",cur:94.8,prev:94.0},{t:"Apr",cur:95.1,prev:94.5},{t:"May",cur:94.5,prev:93.8},{t:"Jun",cur:94.2,prev:94.1}],
};
const FAIL: Record<Period, { t: string; cur: number; prev: number }[]> = {
  "1D":  [{t:"00",cur:2,prev:4},{t:"04",cur:1,prev:3},{t:"08",cur:5,prev:8},{t:"12",cur:3,prev:6},{t:"16",cur:4,prev:7},{t:"20",cur:3,prev:5}],
  "1W":  [{t:"Mon",cur:12,prev:18},{t:"Tue",cur:8,prev:14},{t:"Wed",cur:15,prev:20},{t:"Thu",cur:10,prev:16},{t:"Fri",cur:7,prev:12},{t:"Sat",cur:9,prev:15},{t:"Sun",cur:11,prev:14}],
  "1M":  [{t:"W1",cur:68,prev:92},{t:"W2",cur:45,prev:78},{t:"W3",cur:52,prev:68},{t:"W4",cur:38,prev:55}],
  "3M":  [{t:"Jan",cur:203,prev:285},{t:"Feb",cur:178,prev:242},{t:"Mar",cur:145,prev:198}],
  "YTD": [{t:"Jan",cur:203,prev:285},{t:"Feb",cur:178,prev:242},{t:"Mar",cur:145,prev:198},{t:"Apr",cur:132,prev:175},{t:"May",cur:118,prev:158},{t:"Jun",cur:78,prev:120}],
};

/* ─── Summary values ──────────────────────────────────────────────── */
const SUM: Record<Period, {
  range: string; prevRange: string;
  gv:   [string,string,string,boolean];
  psr:  [string,string,string,boolean];
  txn:  [string,string,string,boolean];
  intl: [string,string,string,boolean];
  avg:  [string,string,string,boolean];
  fail: [string,string,string,boolean];
}> = {
  "1D":  { range:"Today",        prevRange:"Yesterday",    gv:["₹9,42,800","₹9,60,000","-1.8%",false], psr:["94.2%","93.8%","+0.4%",true],  txn:["1,284","1,310","-2.0%",false], intl:["₹3,11,124","₹2,88,000","+8.0%",true],  avg:["₹7,343","₹7,328","+0.2%",true],  fail:["18","28","-35.7%",true]  },
  "1W":  { range:"Jun 27–Today", prevRange:"Jun 20–26",    gv:["₹47,77,000","₹42,93,000","+11.3%",true], psr:["94.5%","93.7%","+0.8%",true], txn:["6,425","5,890","+9.1%",true],  intl:["₹16,71,950","₹13,30,830","+25.6%",true], avg:["₹7,435","₹7,289","+2.0%",true], fail:["72","109","-33.9%",true]  },
  "1M":  { range:"Jun 1–Today",  prevRange:"May 1–31",     gv:["₹1,87,40,000","₹1,63,30,000","+14.8%",true], psr:["94.6%","93.9%","+0.7%",true], txn:["25,340","22,870","+10.8%",true], intl:["₹67,46,400","₹53,88,900","+25.2%",true], avg:["₹7,396","₹7,141","+3.6%",true], fail:["203","312","-34.9%",true] },
  "3M":  { range:"Apr 1–Today",  prevRange:"Jan 1–Mar 31", gv:["₹5,82,20,000","₹5,14,90,000","+13.1%",true], psr:["94.7%","93.9%","+0.8%",true], txn:["76,480","69,320","+10.3%",true], intl:["₹2,15,41,400","₹1,80,21,500","+19.5%",true], avg:["₹7,611","₹7,428","+2.5%",true], fail:["526","725","-27.4%",true] },
  "YTD": { range:"Jan 1–Today",  prevRange:"Jan–Jun 2025", gv:["₹9,42,00,000","₹8,18,00,000","+15.2%",true], psr:["94.4%","93.5%","+0.9%",true], txn:["1,24,800","1,10,250","+13.2%",true], intl:["₹3,57,96,000","₹2,86,30,000","+25.0%",true], avg:["₹7,549","₹7,420","+1.7%",true], fail:["854","1,278","-33.2%",true] },
};

/* ─── Helpers ─────────────────────────────────────────────────────── */
function fmtV(v: number) {
  if (v >= 10000000) return `₹${(v/10000000).toFixed(1)}Cr`;
  if (v >= 100000)   return `₹${(v/100000).toFixed(1)}L`;
  if (v >= 1000)     return `₹${(v/1000).toFixed(0)}K`;
  return `₹${v}`;
}
function fmtN(v: number) {
  if (v >= 1000) return `${(v/1000).toFixed(1)}K`;
  return String(v);
}

/* ─── In-card legend ──────────────────────────────────────────────── */
function InCardLegend({ curColor, prevColor, prevDashed }: { curColor: string; prevColor: string; prevDashed?: boolean }) {
  return (
    <div className="flex items-center gap-4 px-4 pt-1 pb-3.5">
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-[2px] w-5 rounded-full" style={{ background: curColor }} />
        <span className="text-[10px] text-muted-foreground font-medium">Current</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-[2px] w-5 rounded-full"
          style={prevDashed
            ? { backgroundImage: `repeating-linear-gradient(to right, ${prevColor} 0 5px, transparent 5px 8px)` }
            : { background: prevColor }}
        />
        <span className="text-[10px] text-muted-foreground font-medium">Previous</span>
      </div>
    </div>
  );
}

/* ─── Chart Card ──────────────────────────────────────────────────── */
function Card({
  title, curVal, prevVal, curRange, prevRange, change, up, curColor,
  legendCurColor, legendPrevColor, legendPrevDashed,
  children,
}: {
  title: string;
  curVal: string; prevVal: string; curRange: string; prevRange: string;
  change: string; up: boolean;
  curColor: string;
  legendCurColor: string; legendPrevColor: string; legendPrevDashed?: boolean;
  children: React.ReactNode;
}) {
  const { hidden } = useHideAmounts();
  return (
    <div className="mx-4 mb-3 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header row — title only */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-[13.5px] font-bold text-foreground">{title}</p>
      </div>

      {/* Values — current large, previous smaller */}
      <div className="flex px-4 pb-3 items-end gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[24px] font-bold tabular-nums leading-tight" style={{ color: curColor }}>
            <MaskedNumber value={curVal} hidden={hidden} />
          </p>
          {/* Date range + % change inline */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-muted-foreground">{curRange}</span>
            <span className={cn("flex items-center gap-0.5 text-[11px] font-semibold", up ? "text-emerald-600" : "text-destructive")}>
              {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {change}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0 text-right">
          <p className="text-[17px] font-semibold text-muted-foreground/60 tabular-nums leading-tight">
            <MaskedNumber value={prevVal} hidden={hidden} />
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{prevRange}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="border-t border-border/40">
        <div className="h-[150px] px-1 pt-2 pb-0">
          {children}
        </div>
        {/* Legend lives inside the card */}
        <InCardLegend curColor={legendCurColor} prevColor={legendPrevColor} prevDashed={legendPrevDashed} />
      </div>
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────────────── */
export function MobileAnalytics() {
  const [period, setPeriod] = useState<Period>("1W");
  const ts   = TS[period];
  const psr  = PSR[period];
  const fail = FAIL[period];
  const intl = ts.map(d => ({ t: d.t, cur: Math.round(d.cur * 0.34), prev: Math.round(d.prev * 0.31) }));
  const txns = ts.map(d => ({ t: d.t, cur: Math.round(d.cur / 3500), prev: Math.round(d.prev / 3500) }));
  const avgData = ts.map((d, i) => ({ t: d.t, cur: Math.round(d.cur / (txns[Math.min(i,txns.length-1)].cur || 1)), prev: Math.round(d.prev / (txns[Math.min(i,txns.length-1)].prev || 1)) }));
  const s = SUM[period];
  const p = PALETTE;

  return (
    <div className="bg-background">

      {/* ── Period pills ── */}
      <div className="sticky top-0 z-20 bg-background px-4 pt-1 pb-2.5 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          {PERIODS.map((per) => (
            <button key={per.id} type="button" onClick={() => setPeriod(per.id)}
              className={cn(
                "px-3.5 py-1.5 text-[12px] font-semibold transition-colors rounded-lg",
                period === per.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {per.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="pt-3 bg-background">

        {/* 1. Gross Volume — primary blue */}
        <Card title="Gross Volume" curColor={p.grossVol.cur}
          curVal={s.gv[0]} prevVal={s.gv[1]} change={s.gv[2]} up={s.gv[3] as boolean}
          curRange={s.range} prevRange={s.prevRange}
          legendCurColor={p.grossVol.cur} legendPrevColor={p.grossVol.prev} legendPrevDashed
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ts} margin={{ top:4, right:8, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="aGV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={p.grossVol.cur} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={p.grossVol.cur} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" {...AX} />
              <YAxis tickFormatter={fmtV} {...AX} width={30} />
              <Tooltip contentStyle={TT} formatter={(v:unknown)=>[fmtV(Number(v))]} />
              <Area dataKey="prev" stroke={p.grossVol.prev} strokeWidth={1.5} strokeDasharray="5 4" fill="transparent" dot={false} name="Previous" />
              <Area dataKey="cur"  stroke={p.grossVol.cur}  strokeWidth={2.5} fill="url(#aGV)" dot={false} activeDot={{ r:4, strokeWidth:0, fill:p.grossVol.cur }} name="Current" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* 2. Success Rate — sky blue */}
        <Card title="Success Rate" curColor={p.psr.cur}
          curVal={s.psr[0]} prevVal={s.psr[1]} change={s.psr[2]} up={s.psr[3] as boolean}
          curRange={s.range} prevRange={s.prevRange}
          legendCurColor={p.psr.cur} legendPrevColor={p.psr.prev} legendPrevDashed
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={psr} margin={{ top:4, right:8, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="aPSR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={p.psr.cur} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={p.psr.cur} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" {...AX} />
              <YAxis domain={[90,97]} tickFormatter={(v)=>`${v}%`} {...AX} width={30} />
              <Tooltip contentStyle={TT} formatter={(v:unknown)=>[`${v}%`]} />
              <Area dataKey="prev" stroke={p.psr.prev} strokeWidth={1.5} strokeDasharray="5 4" fill="transparent" dot={false} name="Previous" />
              <Area dataKey="cur"  stroke={p.psr.cur}  strokeWidth={2.5} fill="url(#aPSR)" dot={false} activeDot={{ r:4, strokeWidth:0, fill:p.psr.cur }} name="Current" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* 3. Transactions — blue-600 bars */}
        <Card title="Transactions" curColor={p.txns.cur}
          curVal={s.txn[0]} prevVal={s.txn[1]} change={s.txn[2]} up={s.txn[3] as boolean}
          curRange={s.range} prevRange={s.prevRange}
          legendCurColor={p.txns.cur} legendPrevColor={p.txns.prev}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={txns} margin={{ top:4, right:8, left:0, bottom:0 }} barCategoryGap="28%">
              <XAxis dataKey="t" {...AX} />
              <YAxis tickFormatter={fmtN} {...AX} width={30} />
              <Tooltip contentStyle={TT} formatter={(v:unknown)=>[fmtN(Number(v))]} />
              <Bar dataKey="prev" fill={p.txns.prev} radius={[3,3,0,0]} name="Previous" />
              <Bar dataKey="cur"  fill={p.txns.cur}  radius={[3,3,0,0]} name="Current" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 4. International Volume — indigo */}
        <Card title="International Volume" curColor={p.intl.cur}
          curVal={s.intl[0]} prevVal={s.intl[1]} change={s.intl[2]} up={s.intl[3] as boolean}
          curRange={s.range} prevRange={s.prevRange}
          legendCurColor={p.intl.cur} legendPrevColor={p.intl.prev} legendPrevDashed
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={intl} margin={{ top:4, right:8, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="aIntl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={p.intl.cur} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={p.intl.cur} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" {...AX} />
              <YAxis tickFormatter={fmtV} {...AX} width={30} />
              <Tooltip contentStyle={TT} formatter={(v:unknown)=>[fmtV(Number(v))]} />
              <Area dataKey="prev" stroke={p.intl.prev} strokeWidth={1.5} strokeDasharray="5 4" fill="transparent" dot={false} name="Previous" />
              <Area dataKey="cur"  stroke={p.intl.cur}  strokeWidth={2.5} fill="url(#aIntl)" dot={false} activeDot={{ r:4, strokeWidth:0, fill:p.intl.cur }} name="Current" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* 5. Avg Ticket — violet */}
        <Card title="Avg Ticket Size" curColor={p.avgTicket.cur}
          curVal={s.avg[0]} prevVal={s.avg[1]} change={s.avg[2]} up={s.avg[3] as boolean}
          curRange={s.range} prevRange={s.prevRange}
          legendCurColor={p.avgTicket.cur} legendPrevColor={p.avgTicket.prev} legendPrevDashed
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={avgData} margin={{ top:4, right:8, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="aAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={p.avgTicket.cur} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={p.avgTicket.cur} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" {...AX} />
              <YAxis tickFormatter={fmtV} {...AX} width={30} />
              <Tooltip contentStyle={TT} formatter={(v:unknown)=>[fmtV(Number(v))]} />
              <Area dataKey="prev" stroke={p.avgTicket.prev} strokeWidth={1.5} strokeDasharray="5 4" fill="transparent" dot={false} name="Previous" />
              <Area dataKey="cur"  stroke={p.avgTicket.cur}  strokeWidth={2.5} fill="url(#aAvg)" dot={false} activeDot={{ r:4, strokeWidth:0, fill:p.avgTicket.cur }} name="Current" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* 6. Failed Transactions — red bars */}
        <Card title="Failed Transactions" curColor={p.failed.cur}
          curVal={s.fail[0]} prevVal={s.fail[1]} change={s.fail[2]} up={s.fail[3] as boolean}
          curRange={s.range} prevRange={s.prevRange}
          legendCurColor={p.failed.cur} legendPrevColor={p.failed.prev}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fail} margin={{ top:4, right:8, left:0, bottom:0 }} barCategoryGap="28%">
              <XAxis dataKey="t" {...AX} />
              <YAxis {...AX} width={24} />
              <Tooltip contentStyle={TT} />
              <Bar dataKey="prev" fill={p.failed.prev} radius={[3,3,0,0]} name="Previous" />
              <Bar dataKey="cur"  fill={p.failed.cur}  radius={[3,3,0,0]} name="Current" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

      </div>
    </div>
  );
}
