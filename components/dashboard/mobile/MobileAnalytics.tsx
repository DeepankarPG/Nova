"use client";

import { useState, useEffect } from "react";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDownRight, GripVertical,
  PlusCircle, MinusCircle, Search, X, SlidersHorizontal, ArrowLeft, Check,
  ChevronRight, PiggyBank,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHideAmounts, MaskedNumber } from "@/lib/hide-amounts-context";

/* ─── Types ──────────────────────────────────────────────────────────── */
type Period   = "1D" | "1W" | "1M" | "3M" | "YTD";
type ProductTab = "payment-gateway" | "multi-currency";
type Category = "Revenue" | "Payments" | "Subscribers" | "Disputes" | "Methods" | "Regional" | "Traffic";
type Chip     = "All" | Category;
type Dat      = { t: string; cur: number; prev: number };
type Summ     = { cur: string; prev: string; chg: string; up: boolean; range: string; prevRange: string };

export interface ChartDef {
  id: string; label: string; category: Category;
  type: "area" | "bar";
  cur: string; prev: string; fill?: string;
  prevDashed?: boolean; lowerBetter?: boolean;
  getDat: (p: Period) => Dat[];
  getSumm: (p: Period) => Summ;
  fmtY: (v: number) => string;
  yDomain?: [number, number];
}

/* ─── Constants ──────────────────────────────────────────────────────── */
const PERIODS: { id: Period; label: string }[] = [
  { id: "1D", label: "Today" }, { id: "1W", label: "1W" },
  { id: "1M", label: "1M" },   { id: "3M", label: "3M" }, { id: "YTD", label: "YTD" },
];
const CHIPS: Chip[] = ["All","Revenue","Payments","Subscribers","Disputes","Methods","Regional","Traffic"];
export const DEFAULT_ANALYTICS_CHARTS = ["gross-volume","success-rate","successful-payments","payment-attempts"];
const STORAGE_KEY = "pg-analytics-charts-v1";

/* ─── Persistence ────────────────────────────────────────────────────── */
export function loadAnalyticsCharts(): string[] {
  if (typeof window === "undefined") return DEFAULT_ANALYTICS_CHARTS;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length) return p; }
  } catch {}
  return DEFAULT_ANALYTICS_CHARTS;
}
export function saveAnalyticsCharts(ids: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch {}
}

/* ─── Base data ──────────────────────────────────────────────────────── */
const TS: Record<Period, Dat[]> = {
  "1D":  [{t:"00",cur:12000,prev:18000},{t:"02",cur:25000,prev:32000},{t:"04",cur:45000,prev:55000},{t:"06",cur:80000,prev:95000},{t:"08",cur:148000,prev:172000},{t:"10",cur:290000,prev:315000},{t:"12",cur:425000,prev:462000},{t:"14",cur:582000,prev:618000},{t:"16",cur:725000,prev:750000},{t:"18",cur:848000,prev:872000},{t:"20",cur:912000,prev:934000},{t:"22",cur:942800,prev:960000}],
  "1W":  [{t:"Mon",cur:142000,prev:128000},{t:"Tue",cur:198000,prev:175000},{t:"Wed",cur:225000,prev:210000},{t:"Thu",cur:187000,prev:195000},{t:"Fri",cur:312000,prev:285000},{t:"Sat",cur:278000,prev:258000},{t:"Sun",cur:135000,prev:142000}],
  "1M":  [{t:"W1",cur:1240000,prev:1180000},{t:"W2",cur:1580000,prev:1450000},{t:"W3",cur:1820000,prev:1720000},{t:"W4",cur:2100000,prev:1980000}],
  "3M":  [{t:"Jan",cur:4850000,prev:4120000},{t:"Feb",cur:5280000,prev:4750000},{t:"Mar",cur:6140000,prev:5620000}],
  "YTD": [{t:"Jan",cur:4850000,prev:4120000},{t:"Feb",cur:5280000,prev:4750000},{t:"Mar",cur:6140000,prev:5620000},{t:"Apr",cur:7200000,prev:6450000},{t:"May",cur:8100000,prev:7380000},{t:"Jun",cur:9420000,prev:8250000}],
};
const PSR: Record<Period, Dat[]> = {
  "1D":  [{t:"00",cur:93.1,prev:91.5},{t:"04",cur:95.2,prev:94.0},{t:"08",cur:94.8,prev:93.8},{t:"12",cur:93.9,prev:94.5},{t:"16",cur:94.5,prev:93.2},{t:"20",cur:94.2,prev:94.1}],
  "1W":  [{t:"Mon",cur:94.2,prev:93.8},{t:"Tue",cur:95.1,prev:94.2},{t:"Wed",cur:93.8,prev:94.0},{t:"Thu",cur:94.7,prev:93.5},{t:"Fri",cur:95.3,prev:94.8},{t:"Sat",cur:94.1,prev:93.2},{t:"Sun",cur:93.6,prev:92.8}],
  "1M":  [{t:"W1",cur:94.2,prev:93.5},{t:"W2",cur:94.8,prev:94.1},{t:"W3",cur:95.1,prev:94.3},{t:"W4",cur:94.5,prev:93.8}],
  "3M":  [{t:"Jan",cur:94.2,prev:93.1},{t:"Feb",cur:94.8,prev:94.0},{t:"Mar",cur:95.2,prev:94.5}],
  "YTD": [{t:"Jan",cur:93.8,prev:92.5},{t:"Feb",cur:94.2,prev:93.1},{t:"Mar",cur:94.8,prev:94.0},{t:"Apr",cur:95.1,prev:94.5},{t:"May",cur:94.5,prev:93.8},{t:"Jun",cur:94.2,prev:94.1}],
};
const FAIL: Record<Period, Dat[]> = {
  "1D":  [{t:"00",cur:2,prev:4},{t:"04",cur:1,prev:3},{t:"08",cur:5,prev:8},{t:"12",cur:3,prev:6},{t:"16",cur:4,prev:7},{t:"20",cur:3,prev:5}],
  "1W":  [{t:"Mon",cur:12,prev:18},{t:"Tue",cur:8,prev:14},{t:"Wed",cur:15,prev:20},{t:"Thu",cur:10,prev:16},{t:"Fri",cur:7,prev:12},{t:"Sat",cur:9,prev:15},{t:"Sun",cur:11,prev:14}],
  "1M":  [{t:"W1",cur:68,prev:92},{t:"W2",cur:45,prev:78},{t:"W3",cur:52,prev:68},{t:"W4",cur:38,prev:55}],
  "3M":  [{t:"Jan",cur:203,prev:285},{t:"Feb",cur:178,prev:242},{t:"Mar",cur:145,prev:198}],
  "YTD": [{t:"Jan",cur:203,prev:285},{t:"Feb",cur:178,prev:242},{t:"Mar",cur:145,prev:198},{t:"Apr",cur:132,prev:175},{t:"May",cur:118,prev:158},{t:"Jun",cur:78,prev:120}],
};

/* ─── Data generators ────────────────────────────────────────────────── */
const sTS  = (p: Period, f: number): Dat[] => TS[p].map(d => ({t:d.t,cur:Math.round(d.cur*f),prev:Math.round(d.prev*f)}));
const sFAIL= (p: Period, f: number): Dat[] => FAIL[p].map(d => ({t:d.t,cur:Math.round(d.cur*f),prev:Math.round(d.prev*f)}));
const txn  = (p: Period, f = 1): Dat[]      => TS[p].map(d => ({t:d.t,cur:Math.round(d.cur/3500*f),prev:Math.round(d.prev/3500*f)}));
const avg  = (p: Period): Dat[]             => { const t=txn(p); return TS[p].map((d,i)=>({t:d.t,cur:Math.round(d.cur/(t[i].cur||1)),prev:Math.round(d.prev/(t[i].prev||1))})); };
const sPSR = (p: Period, base: number): Dat[]=> PSR[p].map(d=>({t:d.t,cur:+(d.cur*base/94.5).toFixed(1),prev:+(d.prev*base/94.5).toFixed(1)}));

/* ─── Helpers ────────────────────────────────────────────────────────── */
function fmtV(v: number) {
  if (v >= 10000000) return `₹${(v/10000000).toFixed(1)}Cr`;
  if (v >= 100000)   return `₹${(v/100000).toFixed(1)}L`;
  if (v >= 1000)     return `₹${(v/1000).toFixed(0)}K`;
  return `₹${v}`;
}
function fmtN(v: number) { return v >= 1000 ? `${(v/1000).toFixed(1)}K` : String(v); }
function fmtPct(v: number) { return `${v.toFixed(1)}%`; }

const RANGE: Record<Period,[string,string]> = {
  "1D":["Today","Yesterday"],
  "1W":["Jun 27–Today","Jun 20–26"],
  "1M":["Jun 1–Today","May 1–31"],
  "3M":["Apr 1–Today","Jan 1–Mar 31"],
  "YTD":["Jan 1–Today","Jan–Jun 2025"],
};
function buildSumm(dat: Dat[], fmt: (v:number)=>string, lb: boolean, p: Period, mode: "sum"|"last" = "sum"): Summ {
  const ref = mode === "last"
    ? dat[dat.length-1]
    : dat.reduce((a,d)=>({t:"",cur:a.cur+d.cur,prev:a.prev+d.prev}),{t:"",cur:0,prev:0});
  const raw = ref.prev ? (ref.cur-ref.prev)/ref.prev*100 : 0;
  const [range,prevRange] = RANGE[p];
  return {cur:fmt(ref.cur),prev:fmt(ref.prev),chg:`${raw>=0?"+":""}${raw.toFixed(1)}%`,up:lb?raw<0:raw>=0,range,prevRange};
}

/* ─── Core chart summaries (real business values) ────────────────────── */
const CORE: Record<Period,{gv:Summ;psr:Summ;sp:Summ;att:Summ}> = {
  "1D": {
    gv: {cur:"₹9,42,800",prev:"₹9,60,000",chg:"-1.8%",up:false,range:"Today",prevRange:"Yesterday"},
    psr:{cur:"94.2%",prev:"93.8%",chg:"+0.4%",up:true,range:"Today",prevRange:"Yesterday"},
    sp: {cur:"1,284",prev:"1,310",chg:"-2.0%",up:false,range:"Today",prevRange:"Yesterday"},
    att:{cur:"1,352",prev:"1,374",chg:"-1.6%",up:false,range:"Today",prevRange:"Yesterday"},
  },
  "1W": {
    gv: {cur:"₹47,77,000",prev:"₹42,93,000",chg:"+11.3%",up:true,range:"Jun 27–Today",prevRange:"Jun 20–26"},
    psr:{cur:"94.5%",prev:"93.7%",chg:"+0.8%",up:true,range:"Jun 27–Today",prevRange:"Jun 20–26"},
    sp: {cur:"6,425",prev:"5,890",chg:"+9.1%",up:true,range:"Jun 27–Today",prevRange:"Jun 20–26"},
    att:{cur:"6,795",prev:"6,248",chg:"+8.7%",up:true,range:"Jun 27–Today",prevRange:"Jun 20–26"},
  },
  "1M": {
    gv: {cur:"₹1,87,40,000",prev:"₹1,63,30,000",chg:"+14.8%",up:true,range:"Jun 1–Today",prevRange:"May 1–31"},
    psr:{cur:"94.6%",prev:"93.9%",chg:"+0.7%",up:true,range:"Jun 1–Today",prevRange:"May 1–31"},
    sp: {cur:"25,340",prev:"22,870",chg:"+10.8%",up:true,range:"Jun 1–Today",prevRange:"May 1–31"},
    att:{cur:"26,820",prev:"24,140",chg:"+11.1%",up:true,range:"Jun 1–Today",prevRange:"May 1–31"},
  },
  "3M": {
    gv: {cur:"₹5,82,20,000",prev:"₹5,14,90,000",chg:"+13.1%",up:true,range:"Apr 1–Today",prevRange:"Jan 1–Mar 31"},
    psr:{cur:"94.7%",prev:"93.9%",chg:"+0.8%",up:true,range:"Apr 1–Today",prevRange:"Jan 1–Mar 31"},
    sp: {cur:"76,480",prev:"69,320",chg:"+10.3%",up:true,range:"Apr 1–Today",prevRange:"Jan 1–Mar 31"},
    att:{cur:"81,020",prev:"73,540",chg:"+10.2%",up:true,range:"Apr 1–Today",prevRange:"Jan 1–Mar 31"},
  },
  "YTD":{
    gv: {cur:"₹9,42,00,000",prev:"₹8,18,00,000",chg:"+15.2%",up:true,range:"Jan 1–Today",prevRange:"Jan–Jun 2025"},
    psr:{cur:"94.4%",prev:"93.5%",chg:"+0.9%",up:true,range:"Jan 1–Today",prevRange:"Jan–Jun 2025"},
    sp: {cur:"1,24,800",prev:"1,10,250",chg:"+13.2%",up:true,range:"Jan 1–Today",prevRange:"Jan–Jun 2025"},
    att:{cur:"1,32,200",prev:"1,16,700",chg:"+13.3%",up:true,range:"Jan 1–Today",prevRange:"Jan–Jun 2025"},
  },
};

/* ─── Recharts style constants ───────────────────────────────────────── */
const TT = {background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:11,color:"var(--foreground)",boxShadow:"0 4px 20px rgba(0,0,0,0.09)"};
const AX = {tick:{fontSize:9,fill:"var(--muted-foreground)"},tickLine:false,axisLine:false} as const;

/* ─── Chart Registry ─────────────────────────────────────────────────── */
export const CHART_REGISTRY: ChartDef[] = [
  // Revenue
  {id:"gross-volume",      label:"Gross Volume",           category:"Revenue",
   type:"area",cur:"#0061e3",prev:"#93c5fd",fill:"#dbeafe",prevDashed:true,
   getDat:(p)=>TS[p], getSumm:(p)=>CORE[p].gv, fmtY:fmtV},
  {id:"mrr",               label:"Monthly Recurring Revenue",category:"Revenue",
   type:"area",cur:"#0061e3",prev:"#93c5fd",fill:"#dbeafe",prevDashed:true,
   getDat:(p)=>sTS(p,0.30), getSumm:(p)=>buildSumm(sTS(p,0.30),fmtV,false,p), fmtY:fmtV},
  {id:"revenue-per-sub",   label:"Revenue per Subscriber", category:"Revenue",
   type:"area",cur:"#0061e3",prev:"#93c5fd",fill:"#dbeafe",prevDashed:true,
   getDat:(p)=>sTS(p,0.00023), getSumm:(p)=>buildSumm(sTS(p,0.00023),fmtV,false,p,"last"), fmtY:fmtV},
  {id:"churned-revenue",   label:"Churned Revenue",        category:"Revenue",
   type:"area",cur:"#dc2626",prev:"#fca5a5",fill:"#fee2e2",prevDashed:true,lowerBetter:true,
   getDat:(p)=>sTS(p,0.018), getSumm:(p)=>buildSumm(sTS(p,0.018),fmtV,true,p), fmtY:fmtV},
  {id:"net-vs-gross",      label:"Net vs Gross (after fees)",category:"Revenue",
   type:"area",cur:"#0061e3",prev:"#93c5fd",fill:"#dbeafe",prevDashed:true,
   getDat:(p)=>sTS(p,0.975), getSumm:(p)=>buildSumm(sTS(p,0.975),fmtV,false,p), fmtY:fmtV},
  {id:"inr-vs-fx",         label:"INR vs FX Volume",       category:"Revenue",
   type:"area",cur:"#1d4ed8",prev:"#93c5fd",fill:"#eff6ff",prevDashed:true,
   getDat:(p)=>sTS(p,0.34), getSumm:(p)=>buildSumm(sTS(p,0.34),fmtV,false,p), fmtY:fmtV},

  // Payments
  {id:"successful-payments",label:"Successful Payments",   category:"Payments",
   type:"bar",cur:"#2563eb",prev:"#bfdbfe",
   getDat:(p)=>txn(p), getSumm:(p)=>CORE[p].sp, fmtY:fmtN},
  {id:"payment-attempts",  label:"Payment Attempts",       category:"Payments",
   type:"bar",cur:"#2563eb",prev:"#bfdbfe",
   getDat:(p)=>txn(p,1.054), getSumm:(p)=>CORE[p].att, fmtY:fmtN},
  {id:"success-rate",      label:"Success Rate",           category:"Payments",
   type:"area",cur:"#0284c7",prev:"#7dd3fc",fill:"#e0f2fe",prevDashed:true,
   getDat:(p)=>PSR[p], getSumm:(p)=>CORE[p].psr, fmtY:fmtPct, yDomain:[90,97]},
  {id:"failed-payments",   label:"Failed Payments",        category:"Payments",
   type:"bar",cur:"#dc2626",prev:"#fca5a5",lowerBetter:true,
   getDat:(p)=>FAIL[p], getSumm:(p)=>buildSumm(FAIL[p],fmtN,true,p), fmtY:fmtN},
  {id:"high-risk",         label:"High Risk Payments",     category:"Payments",
   type:"bar",cur:"#f59e0b",prev:"#fde68a",lowerBetter:true,
   getDat:(p)=>sFAIL(p,0.35), getSumm:(p)=>buildSumm(sFAIL(p,0.35),fmtN,true,p), fmtY:fmtN},
  {id:"avg-ticket",        label:"Average Ticket Size",    category:"Payments",
   type:"area",cur:"#0369a1",prev:"#7dd3fc",fill:"#f0f9ff",prevDashed:true,
   getDat:avg, getSumm:(p)=>buildSumm(avg(p),fmtV,false,p,"last"), fmtY:fmtV},

  // Subscribers
  {id:"active-subscribers",label:"Active Subscribers",    category:"Subscribers",
   type:"area",cur:"#0891b2",prev:"#a5f3fc",fill:"#cffafe",prevDashed:true,
   getDat:(p)=>TS[p].map(d=>({t:d.t,cur:Math.round(4200+d.cur/50000),prev:Math.round(3950+d.prev/50000)})),
   getSumm:(p)=>buildSumm(TS[p].map(d=>({t:d.t,cur:Math.round(4200+d.cur/50000),prev:Math.round(3950+d.prev/50000)})),fmtN,false,p,"last"), fmtY:fmtN},
  {id:"new-subscribers",   label:"New Subscribers",        category:"Subscribers",
   type:"bar",cur:"#0891b2",prev:"#a5f3fc",
   getDat:(p)=>txn(p,0.008), getSumm:(p)=>buildSumm(txn(p,0.008),fmtN,false,p), fmtY:fmtN},
  {id:"new-trials",        label:"New Trials",             category:"Subscribers",
   type:"bar",cur:"#0891b2",prev:"#a5f3fc",
   getDat:(p)=>txn(p,0.015), getSumm:(p)=>buildSumm(txn(p,0.015),fmtN,false,p), fmtY:fmtN},
  {id:"trial-conversion",  label:"Trial Conversion Rate",  category:"Subscribers",
   type:"area",cur:"#0891b2",prev:"#a5f3fc",fill:"#cffafe",prevDashed:true,
   getDat:(p)=>sPSR(p,78), getSumm:(p)=>buildSumm(sPSR(p,78),fmtPct,false,p,"last"), fmtY:fmtPct, yDomain:[70,90]},
  {id:"sub-churn-rate",    label:"Subscriber Churn Rate",  category:"Subscribers",
   type:"area",cur:"#dc2626",prev:"#fca5a5",fill:"#fee2e2",prevDashed:true,lowerBetter:true,
   getDat:(p)=>sPSR(p,3.2), getSumm:(p)=>buildSumm(sPSR(p,3.2),fmtPct,true,p,"last"), fmtY:fmtPct},
  {id:"subscriber-ltv",    label:"Subscriber Lifetime Value",category:"Subscribers",
   type:"area",cur:"#0891b2",prev:"#a5f3fc",fill:"#cffafe",prevDashed:true,
   getDat:(p)=>sTS(p,0.000052), getSumm:(p)=>buildSumm(sTS(p,0.000052),fmtV,false,p,"last"), fmtY:fmtV},
  {id:"spend-per-customer",label:"Spend per Customer",     category:"Subscribers",
   type:"area",cur:"#0891b2",prev:"#a5f3fc",fill:"#cffafe",prevDashed:true,
   getDat:(p)=>sTS(p,0.000018), getSumm:(p)=>buildSumm(sTS(p,0.000018),fmtV,false,p,"last"), fmtY:fmtV},

  // Disputes
  {id:"dispute-activity",  label:"Dispute Activity",       category:"Disputes",
   type:"bar",cur:"#d97706",prev:"#fde68a",lowerBetter:true,
   getDat:(p)=>sFAIL(p,0.18), getSumm:(p)=>buildSumm(sFAIL(p,0.18),fmtN,true,p), fmtY:fmtN},
  {id:"dispute-count",     label:"Dispute Count",          category:"Disputes",
   type:"bar",cur:"#d97706",prev:"#fde68a",lowerBetter:true,
   getDat:(p)=>sFAIL(p,0.12), getSumm:(p)=>buildSumm(sFAIL(p,0.12),fmtN,true,p), fmtY:fmtN},

  // Methods
  {id:"payment-method-split",label:"Payment Method Split", category:"Methods",
   type:"bar",cur:"#7c3aed",prev:"#ddd6fe",
   getDat:(p)=>txn(p).map(d=>({t:d.t,cur:Math.round(d.cur*0.62),prev:Math.round(d.prev*0.58)})),
   getSumm:(p)=>buildSumm(txn(p).map(d=>({t:d.t,cur:Math.round(d.cur*0.62),prev:Math.round(d.prev*0.58)})),fmtN,false,p), fmtY:fmtN},
  {id:"upi-vs-card",       label:"UPI vs Card (weekly)",   category:"Methods",
   type:"bar",cur:"#7c3aed",prev:"#ddd6fe",
   getDat:(p)=>txn(p).map(d=>({t:d.t,cur:Math.round(d.cur*0.55),prev:Math.round(d.prev*0.51)})),
   getSumm:(p)=>buildSumm(txn(p).map(d=>({t:d.t,cur:Math.round(d.cur*0.55),prev:Math.round(d.prev*0.51)})),fmtN,false,p), fmtY:fmtN},

  // Regional
  {id:"gross-volume-split",label:"Gross Volume Split (Intl vs Domestic)",category:"Regional",
   type:"area",cur:"#059669",prev:"#6ee7b7",fill:"#d1fae5",prevDashed:true,
   getDat:(p)=>sTS(p,0.34), getSumm:(p)=>buildSumm(sTS(p,0.34),fmtV,false,p), fmtY:fmtV},
  {id:"india-state-volume",label:"India — State Volume",   category:"Regional",
   type:"bar",cur:"#059669",prev:"#6ee7b7",
   getDat:(p)=>TS[p].map(d=>({t:d.t,cur:Math.round(d.cur*0.66),prev:Math.round(d.prev*0.69)})),
   getSumm:(p)=>buildSumm(TS[p].map(d=>({t:d.t,cur:Math.round(d.cur*0.66),prev:Math.round(d.prev*0.69)})),fmtV,false,p), fmtY:fmtV},

  // Traffic
  {id:"hourly-traffic",    label:"Hourly Traffic",         category:"Traffic",
   type:"area",cur:"#6366f1",prev:"#c7d2fe",fill:"#e0e7ff",prevDashed:true,
   getDat:(p)=>txn(p,1.08), getSumm:(p)=>buildSumm(txn(p,1.08),fmtN,false,p), fmtY:fmtN},
  {id:"monthly-volume",    label:"Monthly Volume",         category:"Traffic",
   type:"bar",cur:"#6366f1",prev:"#c7d2fe",
   getDat:(p)=>sTS(p,1), getSumm:(p)=>buildSumm(sTS(p,1),fmtV,false,p), fmtY:fmtV},
];

export const CHART_MAP = Object.fromEntries(CHART_REGISTRY.map(c => [c.id, c]));

/* ─── Sub-components ─────────────────────────────────────────────────── */
function InCardLegend({ curColor, prevColor, prevDashed }: { curColor:string; prevColor:string; prevDashed?:boolean }) {
  return (
    <div className="flex items-center gap-4 px-4 pt-1 pb-3.5">
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-[2px] w-5 rounded-full" style={{background:curColor}} />
        <span className="text-[10px] text-muted-foreground font-medium">Current</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-[2px] w-5 rounded-full"
          style={prevDashed
            ? {backgroundImage:`repeating-linear-gradient(to right,${prevColor} 0 5px,transparent 5px 8px)`}
            : {background:prevColor}} />
        <span className="text-[10px] text-muted-foreground font-medium">Previous</span>
      </div>
    </div>
  );
}

function Card({title,curVal,prevVal,curRange,prevRange,change,up,curColor,legendCurColor,legendPrevColor,legendPrevDashed,children}: {
  title:string;curVal:string;prevVal:string;curRange:string;prevRange:string;
  change:string;up:boolean;curColor:string;
  legendCurColor:string;legendPrevColor:string;legendPrevDashed?:boolean;
  children:React.ReactNode;
}) {
  const { hidden } = useHideAmounts();
  return (
    <div className="mx-4 mb-3 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <p className="text-[13.5px] font-bold text-foreground">{title}</p>
      </div>
      <div className="flex px-4 pb-3 items-end gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[24px] font-bold tabular-nums leading-tight" style={{color:curColor}}>
            <MaskedNumber value={curVal} hidden={hidden} />
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-muted-foreground">{curRange}</span>
            <span className={cn("flex items-center gap-0.5 text-[11px] font-semibold",up?"text-emerald-600":"text-destructive")}>
              {up ? <ArrowUpRight className="h-3 w-3"/> : <ArrowDownRight className="h-3 w-3"/>}
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
      <div className="border-t border-border/40">
        <div className="h-[150px] px-1 pt-2 pb-0">{children}</div>
        <InCardLegend curColor={legendCurColor} prevColor={legendPrevColor} prevDashed={legendPrevDashed} />
      </div>
    </div>
  );
}

function ChartRenderer({ def, period }: { def: ChartDef; period: Period }) {
  const dat  = def.getDat(period);
  const summ = def.getSumm(period);
  const gid  = `grad${def.id.replace(/-/g,"")}`;
  return (
    <Card title={def.label} curColor={def.cur}
      curVal={summ.cur} prevVal={summ.prev} curRange={summ.range} prevRange={summ.prevRange}
      change={summ.chg} up={summ.up} legendCurColor={def.cur} legendPrevColor={def.prev} legendPrevDashed={def.prevDashed}
    >
      <ResponsiveContainer width="100%" height="100%">
        {def.type === "area" ? (
          <AreaChart data={dat} margin={{top:4,right:8,left:0,bottom:0}}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={def.cur} stopOpacity={0.28}/>
                <stop offset="100%" stopColor={def.cur} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="t" {...AX}/>
            <YAxis tickFormatter={def.fmtY} {...AX} width={32} domain={def.yDomain}/>
            <Tooltip contentStyle={TT} formatter={(v:unknown)=>[def.fmtY(Number(v))]}/>
            <Area dataKey="prev" stroke={def.prev} strokeWidth={1.5} strokeDasharray={def.prevDashed?"5 4":undefined} fill="transparent" dot={false} name="Previous"/>
            <Area dataKey="cur"  stroke={def.cur}  strokeWidth={2.5} fill={`url(#${gid})`} dot={false} activeDot={{r:4,strokeWidth:0,fill:def.cur}} name="Current"/>
          </AreaChart>
        ) : (
          <BarChart data={dat} margin={{top:4,right:8,left:0,bottom:0}} barCategoryGap="28%">
            <XAxis dataKey="t" {...AX}/>
            <YAxis tickFormatter={def.fmtY} {...AX} width={32}/>
            <Tooltip contentStyle={TT} formatter={(v:unknown)=>[def.fmtY(Number(v))]}/>
            <Bar dataKey="prev" fill={def.prev} radius={[3,3,0,0]} name="Previous"/>
            <Bar dataKey="cur"  fill={def.cur}  radius={[3,3,0,0]} name="Current"/>
          </BarChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
}

/* ─── Sortable row (edit overlay active list) ────────────────────────── */
function SortableRow({ id, label, onRemove }: { id: string; label: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined, opacity: isDragging ? 0.85 : 1 }}
      className="flex items-center gap-3 px-4 py-3 bg-background"
    >
      <button type="button" {...attributes} {...listeners}
        className="touch-none text-muted-foreground/35 shrink-0 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.5}/>
      </button>
      <span className="flex-1 text-[14px] font-medium text-foreground">{label}</span>
      <button type="button" onClick={onRemove} className="shrink-0 text-destructive/70 active:opacity-60">
        <MinusCircle className="h-5 w-5" strokeWidth={1.75}/>
      </button>
    </div>
  );
}

/* ─── Edit overlay ────────────────────────────────────────────────────── */
const CATEGORY_ORDER: Category[] = ["Revenue","Payments","Subscribers","Disputes","Methods","Regional","Traffic"];

/* ─── Group filter data ──────────────────────────────────────────────── */
const FILTER_GROUPS = [
  { id:"revenue",         emoji:"💰", label:"Revenue",          ids:["gross-volume","monthly-volume","net-vs-gross","mrr","revenue-per-sub","churned-revenue","inr-vs-fx"] },
  { id:"payments",        emoji:"💳", label:"Payments",         ids:["successful-payments","failed-payments","payment-attempts","success-rate","avg-ticket","high-risk"] },
  { id:"customers",       emoji:"👥", label:"Customers",        ids:["active-subscribers","new-subscribers","spend-per-customer","subscriber-ltv"] },
  { id:"growth",          emoji:"📈", label:"Growth",           ids:["new-trials","trial-conversion","sub-churn-rate"] },
  { id:"payment-methods", emoji:"🏦", label:"Payment Methods",  ids:["payment-method-split","upi-vs-card"] },
  { id:"geography",       emoji:"🌍", label:"Geography",        ids:["india-state-volume","gross-volume-split"] },
  { id:"risk-disputes",   emoji:"⚠️", label:"Risk & Disputes", ids:["dispute-activity","dispute-count"] },
  { id:"traffic",         emoji:"⏱️", label:"Traffic",          ids:["hourly-traffic"] },
] as const;

/* ─── Group filter sheet (stacks inside Edit overlay) ────────────────── */
function GroupFilterSheet({
  open,
  applied,
  onBack,
  onApply,
}: {
  open: boolean;
  applied: string[];
  onBack: () => void;
  onApply: (groups: string[]) => void;
}) {
  const [draft, setDraft] = useState<string[]>([]);
  useEffect(() => { if (open) setDraft([...applied]); }, [open, applied]);

  function toggle(id: string) {
    setDraft(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const isDirty = draft.length !== applied.length || draft.some(id => !applied.includes(id));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="group-filter-sheet"
          className="absolute inset-0 z-10 flex flex-col bg-background overflow-hidden"
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 pt-5 pb-3 shrink-0 border-b border-border/30">
            <button type="button" onClick={onBack}
              className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground active:bg-muted shrink-0"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2}/>
            </button>
            <p className="flex-1 text-center text-[15px] font-medium text-foreground">Filter by group</p>
            <div className="h-9 w-9 shrink-0"/>
          </div>

          {/* Group list */}
          <div className="flex-1 overflow-y-auto pb-20">
            <div className="divide-y divide-border/40">
              {FILTER_GROUPS.map(group => {
                const checked = draft.includes(group.id);
                return (
                  <button key={group.id} type="button" onClick={() => toggle(group.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-muted/30 transition-colors"
                  >
                    <span className="flex-1 text-[14px] text-foreground text-left">{group.label}</span>
                    <span className={cn(
                      "h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                      checked ? "bg-primary border-primary" : "border-border bg-transparent",
                    )}>
                      {checked && <Check className="h-3 w-3 text-white" strokeWidth={3}/>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="absolute inset-x-0 bottom-0 px-4 pt-3 bg-background border-t border-border/40">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => onApply([])}
                className="h-11 px-5 rounded-2xl border border-border text-[14px] font-medium text-foreground active:bg-muted/30 transition-colors shrink-0"
              >
                Reset
              </button>
              <button type="button" disabled={!isDirty} onClick={() => isDirty && onApply(draft)}
                className={cn(
                  "flex-1 h-11 rounded-2xl text-[14px] font-bold transition-all",
                  isDirty ? "bg-primary text-primary-foreground shadow-sm active:scale-[0.98]" : "bg-muted text-muted-foreground",
                )}
              >
                Apply
              </button>
            </div>
            <div style={{ height: "env(safe-area-inset-bottom)", minHeight: 8 }}/>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AnalyticsEditOverlay({
  open, chartIds, onClose, onApply,
}: {
  open: boolean;
  chartIds: string[];
  onClose: () => void;
  onApply: (ids: string[]) => void;
}) {
  const [draft,           setDraft]           = useState<string[]>([]);
  const [search,          setSearch]          = useState("");
  const [groupFilterOpen, setGroupFilterOpen] = useState(false);
  const [appliedGroups,   setAppliedGroups]   = useState<string[]>([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => { if (open) { setDraft([...chartIds]); setSearch(""); setGroupFilterOpen(false); } }, [open, chartIds]);

  const q = search.trim().toLowerCase();

  const activeCharts   = draft.map(id => CHART_MAP[id]).filter(Boolean);
  const availableCharts = CHART_REGISTRY.filter(c => !draft.includes(c.id));

  const groupAllowedIds: Set<string> | null = appliedGroups.length > 0
    ? new Set(FILTER_GROUPS.filter(g => appliedGroups.includes(g.id)).flatMap(g => g.ids))
    : null;

  const filteredActive    = activeCharts.filter(c =>
    (!q || c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) &&
    (!groupAllowedIds || groupAllowedIds.has(c.id)));
  const filteredAvailable = availableCharts.filter(c =>
    (!q || c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) &&
    (!groupAllowedIds || groupAllowedIds.has(c.id)));

  const availableByCategory = CATEGORY_ORDER.map(cat => ({
    cat,
    items: filteredAvailable.filter(c => c.category === cat),
  })).filter(g => g.items.length > 0);

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setDraft(prev => {
        const oi = prev.indexOf(String(active.id));
        const ni = prev.indexOf(String(over.id));
        return arrayMove(prev, oi, ni);
      });
    }
  }
  function remove(id: string) { setDraft(prev => prev.filter(x => x !== id)); }
  function add(id: string)    { setDraft(prev => [...prev, id]); }

  const isDirty = draft.length !== chartIds.length || draft.some((id, i) => id !== chartIds[i]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="edit-analytics-bd"
            className="absolute inset-0 z-[79]"
            style={{ backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", background:"rgba(0,0,0,0.2)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          <motion.div key="edit-analytics-sheet"
            className="absolute inset-x-0 bottom-0 z-[80] flex flex-col bg-background overflow-hidden"
            style={{ height:"93%", borderTopLeftRadius:24, borderTopRightRadius:24 }}
            initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
            transition={{ duration:0.3, ease:[0.32,0.72,0,1] }}
          >
            {/* Row 1 — title + X */}
            <div className="flex items-start gap-3 px-4 pt-5 pb-3 shrink-0 border-b border-border/30">
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-foreground leading-snug">Edit charts</p>
                <p className="text-[12px] text-muted-foreground/60 mt-0.5">Choose charts and apply. Reorder by dragging.</p>
              </div>
              <button type="button" onClick={onClose}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0"
              >
                <X className="h-4 w-4" strokeWidth={2}/>
              </button>
            </div>

            {/* Row 2 — search + sort */}
            <div className="flex items-center gap-2 px-4 py-2.5 shrink-0">
              <div className="flex-1 flex items-center gap-2 h-9 rounded-lg border border-border bg-muted/30 px-2.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.75}/>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 min-w-0 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
              </div>
              <button type="button" onClick={() => setGroupFilterOpen(true)}
                className="relative h-9 w-9 rounded-lg border border-border bg-muted/30 flex items-center justify-center text-muted-foreground shrink-0 active:bg-muted transition-colors"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75}/>
                {appliedGroups.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-1.75 w-1.75 rounded-full bg-primary border border-background" aria-hidden/>
                )}
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto pb-[84px]">
              {/* Active charts */}
              <p className="px-4 pt-4 pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Your Charts
              </p>
              {filteredActive.length === 0 ? (
                <p className="px-4 py-2 text-[13px] text-muted-foreground">No active charts{q ? " match your search" : ""}.</p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={draft.filter(id => filteredActive.some(c => c.id === id))} strategy={verticalListSortingStrategy}>
                    <div className="divide-y divide-border/40">
                      {filteredActive.map(c => (
                        <SortableRow key={c.id} id={c.id} label={c.label} onRemove={() => remove(c.id)}/>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Available charts */}
              <p className="px-4 pt-5 pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                More Charts
              </p>
              {availableByCategory.length === 0 ? (
                <p className="px-4 py-2 text-[13px] text-muted-foreground">All charts are active{q ? " or none match your search" : ""}.</p>
              ) : availableByCategory.map(({ cat, items }, gi) => (
                <div key={cat} className={cn(gi > 0 && "border-t border-border/30")}>
                  <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">{cat}</p>
                  <div className="divide-y divide-border/30">
                    {items.map(c => (
                      <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                        <button type="button" onClick={() => add(c.id)} className="shrink-0 text-emerald-600 active:opacity-60">
                          <PlusCircle className="h-5 w-5" strokeWidth={1.75}/>
                        </button>
                        <span className="flex-1 text-[14px] text-foreground">{c.label}</span>
                        <GripVertical className="h-4 w-4 text-muted-foreground/20 shrink-0" strokeWidth={1.5}/>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="absolute inset-x-0 bottom-0 px-4 pt-3 bg-background border-t border-border/40">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => onApply(DEFAULT_ANALYTICS_CHARTS)}
                  className="h-11 px-5 rounded-2xl border border-border text-[14px] font-medium text-foreground active:bg-muted/30 transition-colors shrink-0"
                >
                  Reset
                </button>
                <button type="button" disabled={!isDirty} onClick={() => isDirty && onApply(draft)}
                  className={cn(
                    "flex-1 h-11 rounded-2xl text-[14px] font-bold transition-all",
                    isDirty ? "bg-primary text-primary-foreground shadow-sm active:scale-[0.98]" : "bg-muted text-muted-foreground",
                  )}
                >
                  Apply
                </button>
              </div>
              <div style={{ height:"env(safe-area-inset-bottom)", minHeight:8 }}/>
            </div>

            {/* Group filter sheet — stacks on top inside this overlay */}
            <GroupFilterSheet
              open={groupFilterOpen}
              applied={appliedGroups}
              onBack={() => setGroupFilterOpen(false)}
              onApply={(groups) => { setAppliedGroups(groups); setGroupFilterOpen(false); }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── MCA Analytics — mock data + cards ──────────────────────────────── */
const MCA_REVENUE_SERIES = [
  { t: "Feb", cur: 118000 }, { t: "Mar", cur: 120000 }, { t: "Apr", cur: 122000 },
  { t: "May", cur: 398000 }, { t: "Jun", cur: 210000 }, { t: "Jul", cur: 58000 }, { t: "Aug", cur: 62000 },
];
const MCA_REVENUE_TOTAL  = "₹9.30L";
const MCA_REVENUE_CHANGE = "+14.1%";

const MCA_CLIENT_ANALYTICS = [
  { name: "Acme Corp",        amount: "₹1.63L", pct: 100 },
  { name: "GlobalTech Ltd",   amount: "₹1.23L", pct: 75  },
  { name: "Nordic Solutions", amount: "₹97.8K", pct: 60  },
  { name: "Pacific Trade Co", amount: "₹88.0K", pct: 54  },
  { name: "Meridian Exports", amount: "₹61.4K", pct: 38  },
];

const MCA_COUNTRY_TXNS = [
  { flag: "🇺🇸", country: "United States", amount: "$118,400", pct: 100, color: "#2563eb" },
  { flag: "🇬🇧", country: "United Kingdom", amount: "$59,200",  pct: 50,  color: "#2563eb" },
  { flag: "🇸🇬", country: "Singapore",      amount: "$44,600",  pct: 38,  color: "#2563eb" },
  { flag: "🇩🇪", country: "Germany",        amount: "$33,100",  pct: 28,  color: "#7c3aed" },
  { flag: "🇦🇪", country: "UAE",            amount: "$24,800",  pct: 21,  color: "#7c3aed" },
  { flag: "🇦🇺", country: "Australia",      amount: "$17,500",  pct: 15,  color: "#059669" },
];
const MCA_COUNTRY_STATS: { label: string; value: string; delta: string | null; up: boolean }[] = [
  { label: "Total invoiced",      value: "$298K", delta: "+18%", up: true  },
  { label: "Avg per country",     value: "$50K",  delta: "+6%",  up: true  },
  { label: "United States share", value: "40%",   delta: "-3%",  up: false },
  { label: "Active markets",      value: "6",     delta: null,   up: true  },
];

const MCA_INVOICE_TREND = [
  { t: "Jan", paid: 48, outstanding: 12 },
  { t: "Feb", paid: 62, outstanding: 8  },
  { t: "Mar", paid: 54, outstanding: 13 },
  { t: "Apr", paid: 74, outstanding: 9  },
  { t: "May", paid: 80, outstanding: 7  },
  { t: "Jun", paid: 68, outstanding: 10 },
  { t: "Jul", paid: 15, outstanding: 6  },
];

const MCA_CURRENCY_SPLIT_VOLUME = [
  { key: "usd",   label: "USD",   value: 52, color: "#2563eb" },
  { key: "eur",   label: "EUR",   value: 22, color: "#7c3aed" },
  { key: "gbp",   label: "GBP",   value: 13, color: "#60a5fa" },
  { key: "sgd",   label: "SGD",   value: 8,  color: "#059669" },
  { key: "other", label: "Other", value: 5,  color: "#94a3b8" },
];
const MCA_CURRENCY_SPLIT_COUNT = [
  { key: "usd",   label: "USD",   value: 45, color: "#2563eb" },
  { key: "eur",   label: "EUR",   value: 26, color: "#7c3aed" },
  { key: "gbp",   label: "GBP",   value: 15, color: "#60a5fa" },
  { key: "sgd",   label: "SGD",   value: 9,  color: "#059669" },
  { key: "other", label: "Other", value: 5,  color: "#94a3b8" },
];

function McaRevenueCard() {
  const { hidden } = useHideAmounts();
  return (
    <div className="mx-4 mb-3 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <p className="text-[13.5px] font-bold text-foreground">Revenue</p>
      </div>
      <div className="px-4 pb-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[24px] font-bold text-foreground tabular-nums leading-tight">
            <MaskedNumber value={MCA_REVENUE_TOTAL} hidden={hidden} />
          </span>
          <span className="text-[12px] font-medium text-muted-foreground">INR</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <ArrowUpRight className="h-3 w-3 text-emerald-600" />
          <span className="text-[11px] font-semibold text-emerald-600">{MCA_REVENUE_CHANGE} vs last month</span>
        </div>
      </div>
      <div className="border-t border-border/40">
        <div className="h-[150px] px-1 pt-2 pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MCA_REVENUE_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mcaRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" {...AX} />
              <YAxis {...AX} width={32} tickFormatter={fmtN} />
              <Tooltip contentStyle={TT} formatter={(v: unknown) => [fmtN(Number(v))]} />
              <Area dataKey="cur" stroke="#2563eb" strokeWidth={2.5} fill="url(#mcaRevenueGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: "#2563eb" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function McaClientAnalyticsCard() {
  const { hidden } = useHideAmounts();
  return (
    <div className="mx-4 mb-3 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="text-[13.5px] font-bold text-foreground">Client analytics</p>
        <button type="button" className="flex items-center gap-0.5 text-[12px] font-semibold text-primary active:opacity-60">
          View all
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
      <div className="px-4 pb-4 space-y-3.5">
        {MCA_CLIENT_ANALYTICS.map((c) => (
          <div key={c.name}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[12.5px] font-semibold text-foreground">{c.name}</p>
              <p className="text-[12.5px] font-bold text-foreground tabular-nums">
                <MaskedNumber value={c.amount} hidden={hidden} />
              </p>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${c.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function McaCountryTransactionsCard() {
  const { hidden } = useHideAmounts();
  return (
    <div className="mx-4 mb-3 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <p className="text-[13.5px] font-bold text-foreground">Transactions</p>
        <p className="text-[11.5px] text-muted-foreground mt-0.5">Total transaction volume by country</p>
      </div>
      <div className="px-4 pb-3 space-y-3">
        {MCA_COUNTRY_TXNS.map((c) => (
          <div key={c.country}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground">
                <span className="text-[14px] leading-none">{c.flag}</span>
                {c.country}
              </span>
              <span className="text-[12.5px] font-bold text-foreground tabular-nums">
                <MaskedNumber value={c.amount} hidden={hidden} />
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border/40 px-4 py-3.5 grid grid-cols-2 gap-y-3">
        {MCA_COUNTRY_STATS.map((s) => (
          <div key={s.label}>
            <p className="text-[11px] text-muted-foreground mb-0.5">{s.label}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-foreground tabular-nums">{s.value}</span>
              {s.delta && (
                <span className={cn("flex items-center gap-0.5 text-[10.5px] font-semibold", s.up ? "text-emerald-600" : "text-destructive")}>
                  {s.up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                  {s.delta}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function McaSummaryTilesRow() {
  const { hidden } = useHideAmounts();
  return (
    <div className="mx-4 mb-3 grid grid-cols-3 gap-2.5">
      <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3">
        <p className="text-[10.5px] font-medium text-muted-foreground mb-1.5 leading-tight">Total invoiced</p>
        <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">
          <MaskedNumber value="$2,97,600" hidden={hidden} />
        </p>
        <span className="flex items-center gap-0.5 text-[10.5px] font-semibold text-emerald-600 mt-1">
          <ArrowUpRight className="h-2.5 w-2.5" /> +18%
        </span>
      </div>
      <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3">
        <p className="text-[10.5px] font-medium text-muted-foreground mb-1.5 leading-tight">Outstanding</p>
        <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">
          <MaskedNumber value="$41,500" hidden={hidden} />
        </p>
        <span className="flex items-center gap-0.5 text-[10.5px] font-semibold text-destructive mt-1">
          <ArrowDownRight className="h-2.5 w-2.5" /> -8%
        </span>
      </div>
      <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
        <div className="h-6 w-6 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-1.5">
          <PiggyBank className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
        </div>
        <p className="text-[10.5px] font-medium text-muted-foreground mb-1 leading-tight">Saved amount</p>
        <p className="text-[13px] font-bold text-foreground tabular-nums leading-tight">
          <MaskedNumber value="₹8,240.25" hidden={hidden} />
        </p>
      </div>
    </div>
  );
}

function McaInvoiceTrendCard() {
  return (
    <div className="mx-4 mb-3 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-1">
        <p className="text-[13.5px] font-bold text-foreground">Invoice trend</p>
        <p className="text-[11.5px] text-muted-foreground mt-0.5">Paid vs outstanding invoices by month</p>
      </div>
      <div className="h-[150px] px-1 pt-3 pb-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MCA_INVOICE_TREND} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="32%" barGap={3}>
            <XAxis dataKey="t" {...AX} />
            <YAxis {...AX} width={26} />
            <Tooltip contentStyle={TT} />
            <Bar dataKey="paid" fill="#2563eb" radius={[3, 3, 0, 0]} name="Paid" />
            <Bar dataKey="outstanding" fill="#bfdbfe" radius={[3, 3, 0, 0]} name="Outstanding" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 px-4 pt-1 pb-3.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#2563eb" }} />
          <span className="text-[10px] text-muted-foreground font-medium">Paid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#bfdbfe" }} />
          <span className="text-[10px] text-muted-foreground font-medium">Outstanding</span>
        </div>
      </div>
    </div>
  );
}

function McaCurrencySplitCard() {
  const [mode, setMode] = useState<"volume" | "count">("volume");
  const data = mode === "volume" ? MCA_CURRENCY_SPLIT_VOLUME : MCA_CURRENCY_SPLIT_COUNT;
  return (
    <div className="mx-4 mb-3 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-start justify-between px-4 pt-4 pb-1 gap-2">
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-foreground">Currency split</p>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">Share of total volume by currency</p>
        </div>
        <div className="flex items-center bg-muted/60 rounded-lg p-0.5 shrink-0">
          {(["volume", "count"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[10.5px] font-semibold capitalize transition-colors",
                mode === m ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 px-4 py-4">
        <div className="h-[110px] w-[110px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="label" innerRadius={30} outerRadius={50} paddingAngle={2} strokeWidth={0}>
                {data.map((d) => <Cell key={d.key} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          {data.map((d) => (
            <div key={d.key} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-foreground min-w-0">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                {d.label}
              </span>
              <span className="text-[12px] font-bold text-foreground tabular-nums shrink-0">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function McaAnalyticsSection() {
  return (
    <div className="pt-3 bg-background">
      <McaRevenueCard />
      <McaClientAnalyticsCard />
      <McaCountryTransactionsCard />
      <McaSummaryTilesRow />
      <McaInvoiceTrendCard />
      <McaCurrencySplitCard />
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────────────────── */
export function MobileAnalytics({
  chartIds,
  onEditOpen,
  productTab = "payment-gateway",
}: {
  chartIds: string[];
  onEditOpen: () => void;
  productTab?: ProductTab;
}) {
  const isMca = productTab === "multi-currency";
  const [period,    setPeriod]    = useState<Period>("1W");
  const [activeChip, setActiveChip] = useState<Chip>("All");
  const chipsScrollRef = useHorizontalScroll();

  const visibleDefs = CHART_REGISTRY
    .filter(c => chartIds.includes(c.id))
    .filter(c => activeChip === "All" || c.category === activeChip)
    .sort((a, b) => chartIds.indexOf(a.id) - chartIds.indexOf(b.id));

  const pillBase = "px-3 py-1.5 text-[12px] font-semibold transition-colors rounded-lg";
  const pillActive = "bg-primary text-primary-foreground shadow-sm";
  const pillInactive = "text-muted-foreground hover:bg-muted";

  return (
    <div className="bg-background">
      {/* Sticky header: period pills + category chips */}
      <div className="sticky top-0 z-20 bg-background border-b border-border/30">
        {/* Period pills + Edit */}
        <div className="flex items-center justify-between gap-2 px-4 pt-1 pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            {PERIODS.map(per => (
              <button key={per.id} type="button" onClick={() => setPeriod(per.id)}
                className={cn(pillBase, "shrink-0", period === per.id ? pillActive : pillInactive)}
              >
                {per.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={onEditOpen}
            className="text-[13px] font-medium text-primary active:opacity-60 shrink-0"
          >
            Edit
          </button>
        </div>
        {/* Category chips — PG only */}
        {!isMca && (
          <div ref={chipsScrollRef} className="pb-2.5 [&::-webkit-scrollbar]:hidden" style={{overflowX:"scroll", scrollbarWidth:"none", WebkitOverflowScrolling:"touch", cursor:"grab"} as React.CSSProperties}>
            <div className="flex items-center gap-1.5 px-4 w-max">
              {CHIPS.map(chip => (
                <button key={chip} type="button" onClick={() => setActiveChip(chip)}
                  className={cn("shrink-0 px-3 py-1 text-[11.5px] font-semibold rounded-lg border transition-colors",
                    activeChip === chip ? "bg-primary text-primary-foreground border-primary shadow-sm" : "border-border text-muted-foreground bg-card hover:bg-muted/40"
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart list */}
      {isMca ? (
        <McaAnalyticsSection />
      ) : (
        <div className="pt-3 bg-background">
          {visibleDefs.length === 0 ? (
            <div className="mx-4 py-10 flex flex-col items-center gap-2 text-center">
              <p className="text-[14px] font-medium text-muted-foreground">No charts in this category</p>
              <button type="button" onClick={() => setActiveChip("All")} className="text-[13px] text-primary font-medium">Show all</button>
            </div>
          ) : (
            visibleDefs.map(def => <ChartRenderer key={def.id} def={def} period={period}/>)
          )}
        </div>
      )}
    </div>
  );
}
