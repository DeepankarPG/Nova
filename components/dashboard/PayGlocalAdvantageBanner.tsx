"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Download,
  LineChart,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import { Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils";

const AUTO_MS = 6500;

/** Match StatCard sparkline palette (`presets` in StatCard). */
const CHART_TONES = {
  brand: "#0061E3",
  green: "#10b981",
  blue: "#3b82f6",
} as const;

const springIcon = { type: "spring" as const, stiffness: 380, damping: 28, mass: 0.8 };
const springCopy = { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.65 };

export type PayGlocalInsight = {
  headline: string;
  Icon: LucideIcon;
  /** y-values; x is index (area) or bar slot. */
  sparkline: number[];
  chartTone: keyof typeof CHART_TONES;
  /** Area = trend / time series; bar = rates, comparisons, discrete periods. */
  chartKind: "area" | "bar";
};

const DEFAULT_INSIGHTS: PayGlocalInsight[] = [
  {
    headline: "International revenue up 31% MoM — your fastest growing channel",
    Icon: TrendingUp,
    sparkline: [38, 42, 40, 48, 52, 50, 58, 62, 68, 72, 78, 85, 92],
    chartTone: "brand",
    chartKind: "area",
  },
  {
    headline: "Your payment success rate is 94.2% — 18% above industry average",
    Icon: CheckCircle2,
    sparkline: [72, 76, 80, 84, 88, 91, 94],
    chartTone: "green",
    chartKind: "bar",
  },
  {
    headline: "Average settlement time improved by 2.1 days vs last quarter",
    Icon: LineChart,
    sparkline: [5.2, 4.9, 4.6, 4.4, 4.1, 3.8, 3.5, 3.4],
    chartTone: "blue",
    chartKind: "bar",
  },
];

function AdvantageInsightChart({
  kind,
  values,
  lineColor,
  insightIndex,
  animate,
}: {
  kind: "area" | "bar";
  values: number[];
  lineColor: string;
  insightIndex: number;
  animate: boolean;
}) {
  const gradId = `pg-adv-spark-${insightIndex}`;

  if (kind === "area") {
    const data = values.map((v, i) => ({ i, v }));
    return (
      <motion.div
        key={`a-${insightIndex}`}
        initial={animate ? { opacity: 0.65, scale: 0.98 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="h-full w-full min-h-[52px] sm:min-h-[58px]"
        aria-hidden
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.38} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={lineColor}
              strokeWidth={2.25}
              fill={`url(#${gradId})`}
              dot={false}
              isAnimationActive={animate}
              animationDuration={680}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  const data = values.map((v, i) => ({ i: String(i + 1), v }));

  return (
    <motion.div
      key={`b-${insightIndex}`}
      initial={animate ? { opacity: 0.65, scale: 0.98 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "h-full w-full min-h-[52px] sm:min-h-[58px]",
        /* Stronger than global --chart-bar-track so tracks read on the banner gradient */
        "[--chart-bar-track:rgba(30,58,95,0.22)] dark:[--chart-bar-track:rgba(255,255,255,0.14)]"
      )}
      aria-hidden
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 2, left: 0, bottom: 0 }} barCategoryGap="20%">
          <XAxis dataKey="i" type="category" hide />
          <Bar
            dataKey="v"
            fill={lineColor}
            radius={[3, 3, 0, 0]}
            maxBarSize={10}
            isAnimationActive={animate}
            animationDuration={680}
            animationEasing="ease-out"
            fillOpacity={0.95}
            background={{ fill: "var(--chart-bar-track)", radius: 3 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

/** Progress fill runs inside the active segment only. */
function InsightStepIndicators({
  count,
  index,
  paused,
  durationMs,
  animate,
  onSelect,
}: {
  count: number;
  index: number;
  paused: boolean;
  durationMs: number;
  animate: boolean;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex w-fit gap-1" role="tablist" aria-label="Insight slides">
      {Array.from({ length: count }).map((_, i) => {
        const active = i === index;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`Insight ${i + 1} of ${count}`}
            onClick={() => onSelect(i)}
            className={cn(
              "relative h-[3px] w-5 shrink-0 overflow-hidden rounded-full transition-colors sm:w-[22px]",
              active
                ? "bg-foreground/[0.1] dark:bg-foreground/[0.14]"
                : "bg-foreground/[0.06] hover:bg-foreground/[0.1] dark:bg-foreground/[0.08]"
            )}
          >
            {active && animate && (
              <div
                key={`${index}-${i}-bar`}
                className={cn(
                  "absolute inset-y-0 left-0 w-full origin-left rounded-full bg-primary",
                  "pg-advantage-progress",
                  paused && "pg-advantage-progress--paused"
                )}
                style={{ animationDuration: `${durationMs}ms` }}
              />
            )}
            {active && !animate && (
              <span
                className="absolute inset-y-0 left-0 w-full rounded-full bg-primary/75"
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

type PayGlocalAdvantageBannerProps = {
  insights?: PayGlocalInsight[];
  onKnowMore?: () => void;
  onDownloadReport?: () => void;
  className?: string;
};

export function PayGlocalAdvantageBanner({
  insights = DEFAULT_INSIGHTS,
  onKnowMore,
  onDownloadReport,
  className,
}: PayGlocalAdvantageBannerProps) {
  const reduceMotion = useReducedMotion();
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const indexRef = useRef(0);

  const goTo = useCallback(
    (i: number) => {
      const next = ((i % insights.length) + insights.length) % insights.length;
      indexRef.current = next;
      setIndex(next);
    },
    [insights.length]
  );

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (dismissed || paused || insights.length < 2) return;
    const id = window.setInterval(() => {
      goTo(indexRef.current + 1);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [dismissed, paused, goTo, insights.length]);

  if (dismissed) return null;

  const current = insights[index];
  const Icon = current.Icon;
  const lineColor = CHART_TONES[current.chartTone];
  const showSegmentProgress = !reduceMotion && insights.length > 1;
  const chartAnimate = !reduceMotion;

  const copyMotion = reduceMotion
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 10, filter: "blur(4px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -8, filter: "blur(3px)" },
      };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border/70",
        "bg-card/75 shadow-[0_1px_0_rgba(0,0,0,0.04),0_6px_20px_-4px_rgba(0,0,0,0.06)]",
        "backdrop-blur-md dark:border-border/80 dark:bg-card/55",
        "dark:shadow-[0_1px_0_rgba(255,255,255,0.04),0_8px_28px_-6px_rgba(0,0,0,0.45)]",
        className
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/[0.14] via-primary/[0.05] to-transparent dark:from-primary/[0.18] dark:via-primary/[0.07] dark:to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/42 via-transparent to-primary/[0.03] dark:from-white/[0.04] dark:to-primary/[0.06]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent dark:via-white/10"
          aria-hidden
        />

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className={cn(
            "absolute right-2.5 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full",
            "text-muted-foreground/80 hover:bg-foreground/[0.05] hover:text-foreground",
            "dark:hover:bg-white/[0.06]",
            "transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          )}
          aria-label="Dismiss insight"
        >
          <X className="h-[15px] w-[15px]" strokeWidth={2} />
        </button>

        <div className="relative px-4 pb-4 pr-11 pt-3 sm:px-[1.125rem] sm:pb-[1.125rem] sm:pr-12 sm:pt-3.5">
          {/* [insight column: tag + copy] | [chart] | [CTAs] */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-3 xl:gap-5">
            <div className="flex min-w-0 flex-[1.1] flex-col lg:max-w-xl">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      "absolute -inset-0.5 rounded-[15px] bg-gradient-to-br from-primary/12 via-transparent to-primary/5 opacity-80",
                      "dark:from-primary/20 dark:to-primary/5"
                    )}
                    aria-hidden
                  />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={index}
                      initial={
                        reduceMotion
                          ? { opacity: 1, scale: 1, rotate: 0 }
                          : { opacity: 0, scale: 0.88, rotate: -6 }
                      }
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={
                        reduceMotion
                          ? { opacity: 1, scale: 1, rotate: 0 }
                          : { opacity: 0, scale: 0.88, rotate: 6 }
                      }
                      transition={springIcon}
                      className={cn(
                        "relative flex h-[46px] w-[46px] items-center justify-center rounded-[14px]",
                        "border border-primary/10 bg-gradient-to-br from-card to-primary-light/25",
                        "shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
                        "dark:border-primary/15 dark:from-card dark:to-primary-light/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      )}
                    >
                      <Icon className="h-[20px] w-[20px] text-primary" strokeWidth={2} aria-hidden />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                  <span
                    className={cn(
                      "inline-flex w-fit max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-lg px-3 py-1.5",
                      "bg-emerald-600 text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]",
                      "dark:bg-emerald-600"
                    )}
                  >
                    <span className="text-[9px] font-bold uppercase leading-none tracking-[0.14em] sm:text-[10px] sm:tracking-[0.12em]">
                     Your monthly insight
                    </span>
            
                  
                  </span>
                  <div className="relative flex min-h-[2.75rem] items-center sm:min-h-[3rem]">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p
                        key={current.headline}
                        initial={copyMotion.initial}
                        animate={copyMotion.animate}
                        exit={copyMotion.exit}
                        transition={springCopy}
                        className="text-[15px] font-semibold leading-snug tracking-[-0.015em] text-foreground sm:text-base"
                      >
                        {current.headline}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  <div>
                    <InsightStepIndicators
                      count={insights.length}
                      index={index}
                      paused={paused}
                      durationMs={AUTO_MS}
                      animate={showSegmentProgress}
                      onSelect={goTo}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-[56px] min-w-0 flex-1 items-center justify-center px-1 sm:min-h-[60px] lg:self-center lg:px-3">
              <div className="h-[52px] w-full max-w-[200px] sm:h-[58px] sm:max-w-[220px]">
                <AdvantageInsightChart
                  kind={current.chartKind}
                  values={current.sparkline}
                  lineColor={lineColor}
                  insightIndex={index}
                  animate={chartAnimate}
                />
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-2 lg:w-[12.75rem] lg:min-w-[12.75rem] lg:flex-none lg:self-center">
              <Button
                variant="primary"
                size="sm"
                className="h-8 w-full justify-center whitespace-nowrap px-3"
                rightIcon={<ChevronRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />}
                onClick={() => onKnowMore?.()}
              >
                Know more insights
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full justify-center whitespace-nowrap px-3"
                leftIcon={<Download className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />}
                onClick={() => onDownloadReport?.()}
                title="Download detailed report"
              >
                Download report
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
  );
}
