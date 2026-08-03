"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { InteractiveGlobe } from "@/components/dashboard/InteractiveGlobe";
import type { GlobeHighlight, GlobeHandle } from "@/components/dashboard/InteractiveGlobe";

type PeriodKey = "week" | "1m" | "3m";

const PERIOD_TABS: { id: PeriodKey; label: string }[] = [
  { id: "week", label: "1W" },
  { id: "1m",   label: "1M" },
  { id: "3m",   label: "3M" },
];

const FLAG_MAP: Record<string, string> = {
  US: "🇺🇸", GB: "🇬🇧", SG: "🇸🇬", DE: "🇩🇪", AE: "🇦🇪",
  AU: "🇦🇺", CA: "🇨🇦", JP: "🇯🇵", NL: "🇳🇱", FR: "🇫🇷",
  IE: "🇮🇪", CH: "🇨🇭", NZ: "🇳🇿", IN: "🇮🇳", QA: "🇶🇦",
};

const COUNTRY_DATA: Record<PeriodKey, { code: string; country: string; amountVal: number; amountLabel: string }[]> = {
  week: [
    { code: "US", country: "United States",  amountVal: 28400,  amountLabel: "$28,400"    },
    { code: "GB", country: "United Kingdom", amountVal: 14100,  amountLabel: "$14,100"    },
    { code: "SG", country: "Singapore",      amountVal: 11200,  amountLabel: "$11,200"    },
    { code: "DE", country: "Germany",        amountVal: 7800,   amountLabel: "$7,800"     },
    { code: "AE", country: "UAE",            amountVal: 5600,   amountLabel: "$5,600"     },
    { code: "AU", country: "Australia",      amountVal: 4300,   amountLabel: "$4,300"     },
  ],
  "1m": [
    { code: "US", country: "United States",  amountVal: 118400, amountLabel: "$1,18,400"  },
    { code: "GB", country: "United Kingdom", amountVal: 59200,  amountLabel: "$59,200"    },
    { code: "SG", country: "Singapore",      amountVal: 44600,  amountLabel: "$44,600"    },
    { code: "DE", country: "Germany",        amountVal: 33100,  amountLabel: "$33,100"    },
    { code: "AE", country: "UAE",            amountVal: 24800,  amountLabel: "$24,800"    },
    { code: "AU", country: "Australia",      amountVal: 17500,  amountLabel: "$17,500"    },
  ],
  "3m": [
    { code: "US", country: "United States",  amountVal: 352000, amountLabel: "$3,52,000"  },
    { code: "GB", country: "United Kingdom", amountVal: 176400, amountLabel: "$1,76,400"  },
    { code: "SG", country: "Singapore",      amountVal: 132100, amountLabel: "$1,32,100"  },
    { code: "DE", country: "Germany",        amountVal: 98600,  amountLabel: "$98,600"    },
    { code: "AE", country: "UAE",            amountVal: 71400,  amountLabel: "$71,400"    },
    { code: "AU", country: "Australia",      amountVal: 52800,  amountLabel: "$52,800"    },
  ],
};

const HIGHLIGHT_COLORS = [
  "#0061e3",
  "#2563eb",
  "#4f86f7",
  "#6d28d9",
  "#7c3aed",
  "#a78bfa",
];

function buildHighlights(rows: typeof COUNTRY_DATA["1m"]): GlobeHighlight[] {
  const maxAmt = rows[0]!.amountVal;
  return rows.map((row, i) => ({
    code:    row.code,
    color:   HIGHLIGHT_COLORS[i] ?? "#a78bfa",
    opacity: 0.65 + (row.amountVal / maxAmt) * 0.32,
  }));
}

type GlobeTooltip = { code: string; x: number; y: number };

const cardClass = "rounded-xl border border-border bg-card text-card-foreground shadow-sm";

export function McaCountryInsightsWidget({ preview }: { preview?: boolean }) {
  const [period, setPeriod] = useState<PeriodKey>("1m");
  const [globeTip, setGlobeTip] = useState<GlobeTooltip | null>(null);
  const [mounted, setMounted] = useState(false);
  const globeRef = useRef<GlobeHandle>(null);

  const rows       = COUNTRY_DATA[period];
  const maxAmount  = rows[0]!.amountVal;
  const highlights = buildHighlights(rows);

  useEffect(() => { setMounted(true); }, []);

  const dismissTip = useCallback(() => {
    setGlobeTip(null);
    globeRef.current?.resumeSpin();
  }, []);

  const handleCountryClick = useCallback((code: string, x: number, y: number) => {
    if (!code) { dismissTip(); return; }
    setGlobeTip((prev) => {
      if (prev?.code === code) { globeRef.current?.resumeSpin(); return null; }
      globeRef.current?.pauseSpin();
      return { code, x, y };
    });
  }, [dismissTip]);

  const tipRow   = globeTip ? rows.find((r) => r.code === globeTip.code) : null;
  const tipRank  = tipRow ? rows.indexOf(tipRow) + 1 : null;
  const tipTotal = rows.reduce((s, r) => s + r.amountVal, 0);
  const tipShare = tipRow ? Math.round((tipRow.amountVal / tipTotal) * 100) : 0;
  const tipColor = tipRow ? (HIGHLIGHT_COLORS[rows.indexOf(tipRow)] ?? "#8b5cf6") : "#8b5cf6";

  return (
    <div className={cn(cardClass, "overflow-hidden col-span-12")}>
      <div className="grid lg:grid-cols-[1fr_auto] lg:items-stretch">

        {/* Left: list */}
        <div className="flex flex-col p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Invoice origins</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Total invoice volume by country</p>
            </div>

            {/* Period tabs */}
            {!preview && (
              <LayoutGroup id="mca-country-period-widget">
                <div className="flex shrink-0 rounded-lg border border-border bg-muted/45 p-1" role="tablist">
                  {PERIOD_TABS.map((t) => (
                    <button key={t.id} type="button" role="tab"
                      aria-selected={period === t.id}
                      onClick={() => setPeriod(t.id)}
                      className="relative rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
                    >
                      {period === t.id && (
                        <motion.span layoutId="mca-country-pill-widget"
                          className="absolute inset-0 z-0 rounded-md bg-card shadow-sm ring-1 ring-border"
                          transition={{ type: "spring", stiffness: 520, damping: 38 }}
                          aria-hidden />
                      )}
                      <span className={cn("relative z-10",
                        period === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}>
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </LayoutGroup>
            )}
          </div>

          {/* Country rows */}
          <div className="mt-5 flex-1 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div key={period}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                {rows.map((row, i) => {
                  const pct      = (row.amountVal / maxAmount) * 100;
                  const flag     = FLAG_MAP[row.code] ?? "🌍";
                  const barColor = HIGHLIGHT_COLORS[i] ?? "#8b5cf6";
                  return (
                    <div key={row.code} className="flex items-center gap-3">
                      <div className="flex w-[9.5rem] shrink-0 items-center gap-2">
                        <span className="text-base leading-none">{flag}</span>
                        <span className="truncate text-[13px] font-medium text-foreground">{row.country}</span>
                      </div>
                      <div className="flex flex-1 items-center gap-2">
                        <div className="h-4 flex-1 overflow-hidden rounded-md bg-muted">
                          <motion.div
                            className="h-full rounded-md"
                            style={{ background: barColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.45, delay: i * 0.05, ease: "easeOut" }}
                          />
                        </div>
                        <span className="w-20 shrink-0 text-right text-[13px] font-semibold tabular-nums text-foreground">
                          {row.amountLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom stats strip */}
          <AnimatePresence mode="wait">
            <motion.div key={period}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="mt-auto -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 overflow-hidden rounded-b-xl border-t border-border/60 bg-muted/35 dark:bg-muted/20"
            >
              {(() => {
                const total      = rows.reduce((s, r) => s + r.amountVal, 0);
                const topShare   = Math.round((rows[0]!.amountVal / total) * 100);
                const topCountry = rows[0]!;
                const stats = [
                  { label: "Total invoiced",             value: total >= 100000 ? `$${(total / 1000).toFixed(0)}K` : `$${total.toLocaleString()}`, change: "+18%", pos: true  },
                  { label: "Avg per country",             value: `$${Math.round(total / rows.length / 1000)}K`,                                     change: "+6%",  pos: true  },
                  { label: `${topCountry.country} share`, value: `${topShare}%`,                                                                    change: "-3%",  pos: false },
                  { label: "Active markets",              value: String(rows.length),                                                                change: null,   pos: true  },
                ];
                return (
                  <div className="grid grid-cols-2 divide-y divide-border">
                    {stats.map((s, i) => (
                      <div key={s.label} className={cn(
                        "py-3.5",
                        i % 2 === 0 ? "pl-4 sm:pl-5 pr-5 border-r border-border" : "pl-5 pr-4 sm:pr-5",
                      )}>
                        <p className="text-[11px] font-medium text-muted-foreground">{s.label}</p>
                        <div className="mt-1.5 flex items-baseline gap-2">
                          <p className="text-[1.35rem] font-bold tabular-nums tracking-[-0.03em] text-foreground leading-none">
                            {s.value}
                          </p>
                          {s.change && (
                            <span className={cn(
                              "text-[11px] font-semibold tabular-nums leading-none",
                              s.pos ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                            )}>
                              {s.change}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: interactive globe — hidden in preview mode */}
        {!preview && (
          <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-slate-50/80 to-white/40 dark:from-slate-900/30 dark:to-transparent border-l border-border/60 p-6 w-[380px] xl:w-[440px]">
            <div className="w-full aspect-square">
              <InteractiveGlobe
                ref={globeRef}
                highlights={highlights}
                width={420}
                height={420}
                className="rounded-full"
                onCountryClick={handleCountryClick}
              />
            </div>
          </div>
        )}

        {/* Portal tooltip */}
        {mounted && !preview && createPortal(
          <AnimatePresence>
            {globeTip && tipRow && (() => {
              const TIP_W = 230;
              const TIP_H = 160;
              const flipX = globeTip.x + TIP_W + 16 > window.innerWidth;
              const flipY = globeTip.y + TIP_H + 8  > window.innerHeight;
              return (
                <motion.div
                  key={globeTip.code}
                  initial={{ opacity: 0, scale: 0.93, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.93, y: 4 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none fixed z-[9999]"
                  style={{
                    width: TIP_W,
                    left: flipX ? globeTip.x - TIP_W - 10 : globeTip.x + 14,
                    top:  flipY ? globeTip.y - TIP_H - 10 : globeTip.y + 8,
                  }}
                >
                  <div className="bg-popover border border-border rounded-xl px-3.5 py-3 shadow-xl">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: tipColor }} />
                      <span className="text-[13px] font-semibold text-foreground leading-none">
                        {FLAG_MAP[tipRow.code] ?? "🌍"} {tipRow.country}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[11px] text-muted-foreground">Total invoiced</span>
                        <span className="text-[12px] font-bold tabular-nums text-foreground">{tipRow.amountLabel}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[11px] text-muted-foreground">Invoice volume</span>
                        <span className="text-[12px] font-bold tabular-nums text-foreground">
                          {Math.round(tipRow.amountVal / 4000)} invoices
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[11px] text-muted-foreground">Share</span>
                        <span className="text-[12px] font-bold tabular-nums text-foreground">{tipShare}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[11px] text-muted-foreground">Rank</span>
                        <span className="text-[12px] font-bold tabular-nums text-foreground">#{tipRank} market</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </div>
  );
}
