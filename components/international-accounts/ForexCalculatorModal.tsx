"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Building2, Landmark, Sparkles } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/shared/Dialog";

const PAYGLOCAL_FEE_PCT = 0.5;
const GST_ON_FEE_PCT = 18;
const ILLUSTRATIVE_BANK_SPREAD_DELTA = 0.018;

function useRollingInt(target: number, durationMs = 850) {
  const [display, setDisplay] = useState(target);
  const liveRef = useRef(display);
  liveRef.current = display;

  useEffect(() => {
    const from = liveRef.current;
    if (!Number.isFinite(target)) return;
    if (from === target) {
      setDisplay(target);
      return;
    }

    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
      else setDisplay(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return display;
}

export type ForexCalculatorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  localCurrency: string;
  fxInrPerUnit: number;
  flag?: string;
};

export function ForexCalculatorModal({
  open,
  onOpenChange,
  localCurrency,
  fxInrPerUnit,
  flag,
}: ForexCalculatorModalProps) {
  const [amountStr, setAmountStr] = useState("4000");

  const amount = useMemo(() => {
    const n = parseFloat(amountStr.replace(/,/g, ""));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [amountStr]);

  const inrPerUnit = fxInrPerUnit;
  const converted = amount * inrPerUnit;
  const feeInr = converted * (PAYGLOCAL_FEE_PCT / 100);
  const gstInr = feeInr * (GST_ON_FEE_PCT / 100);
  const feesTotal = feeInr + gstInr;
  const youReceive = Math.max(0, converted - feesTotal);

  const moreOnThisInvoice = useMemo(
    () => Math.round(converted * ILLUSTRATIVE_BANK_SPREAD_DELTA),
    [converted]
  );
  const illustrativeAnnual = useMemo(
    () => Math.round(moreOnThisInvoice * 12),
    [moreOnThisInvoice]
  );

  const bankIllustrativeNet = Math.max(
    0,
    Math.round((youReceive - moreOnThisInvoice) * 100) / 100
  );

  const tConverted = Math.round(converted * 100) / 100;
  const tFees = Math.round(feesTotal * 100) / 100;
  const tReceive = Math.round(youReceive * 100) / 100;

  const rollMore = useRollingInt(moreOnThisInvoice);
  const rollAnnual = useRollingInt(illustrativeAnnual);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="px-5 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle>Forex calculator</DialogTitle>
          <DialogDescription className="mt-1.5">
            What you’d keep in INR after PayGlocal fee and GST — reference rate only.
          </DialogDescription>
        </div>

        <div className="px-5 py-5 space-y-4">
          <p className="text-[11px] text-gray-500">
            1 {localCurrency} ≈ ₹{inrPerUnit.toFixed(2)} (reference)
          </p>

          <div>
            <label htmlFor="fx-modal-amt" className="text-[12px] font-semibold text-gray-800 block mb-2">
              Client pays
            </label>
            <div
              className="flex rounded-xl overflow-hidden min-h-[52px]"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <span className="flex items-center gap-2 px-3 bg-gray-50 border-r border-gray-200 text-[13px] font-medium text-gray-700">
                <span className="text-lg" aria-hidden>
                  {flag ?? "·"}
                </span>
                {localCurrency}
              </span>
              <input
                id="fx-modal-amt"
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="flex-1 min-w-0 px-4 py-3 text-xl font-bold text-gray-900 tabular-nums outline-none bg-white"
              />
            </div>
          </div>

          <div
            className="flex items-center gap-2 rounded-xl px-3 py-3 text-[13px] text-gray-700"
            style={{ border: "1px solid #e5e7eb", background: "#fafafa" }}
          >
            <Landmark className="w-4 h-4 text-gray-500 shrink-0" aria-hidden />
            <span>
              Settles to <span className="font-semibold text-gray-900">INR</span> on PayGlocal · transparent fee + GST
            </span>
          </div>

          <div
            className="rounded-xl px-4 py-4 flex items-center justify-between gap-3"
            style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", border: "1px solid #6ee7b7" }}
          >
            <div>
              <p className="text-[13px] font-semibold text-emerald-950">You&apos;ll receive</p>
              <p className="text-[11px] text-emerald-800/80 mt-0.5">After fee &amp; GST</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-lg" aria-hidden>
                🇮🇳
              </span>
              <span className="text-2xl font-bold text-emerald-950 tabular-nums tracking-tight">
                {formatCurrency(tReceive, "INR")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-3 flex flex-col gap-2"
              style={{ border: "1px solid #e5e7eb", background: "#fff" }}
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <Building2 className="w-3.5 h-3.5" aria-hidden />
                Typical bank*
              </div>
              <p className="text-[15px] font-bold text-gray-900 tabular-nums leading-tight">
                {formatCurrency(bankIllustrativeNet, "INR")}
              </p>
              <p className="text-[11px] text-red-600 font-medium leading-snug">
                ≈ {formatCurrency(moreOnThisInvoice, "INR")} less vs PayGlocal on this amount*
              </p>
            </div>
            <div
              className="rounded-xl p-3 flex flex-col gap-2"
              style={{ border: "1px solid #6ee7b7", background: "#f0fdf4" }}
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5" aria-hidden />
                PayGlocal
              </div>
              <p className="text-[15px] font-bold text-emerald-950 tabular-nums leading-tight">
                {formatCurrency(tReceive, "INR")}
              </p>
              <p className="text-[11px] text-emerald-800 font-medium">After fee + GST (shown above)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-center rounded-xl py-3 px-3 text-[13px] font-medium text-emerald-900"
            style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden />
            <span>
              About <span className="font-bold tabular-nums">+{formatCurrency(rollMore, "INR")}</span> more on this
              invoice vs spread*
            </span>
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 hidden sm:inline" aria-hidden />
          </div>
          <p className="text-center text-[12px] text-gray-600 tabular-nums">
            ≈ <span className="font-semibold text-gray-900">{formatCurrency(rollAnnual, "INR")}</span>
            <span className="text-gray-500"> / year if monthly*</span>
          </p>

          <div className="flex justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100 gap-3">
            <span>Gross INR</span>
            <span className="font-medium text-gray-700 tabular-nums">{formatCurrency(tConverted, "INR")}</span>
          </div>
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>Fees incl. GST</span>
            <span className="font-medium text-gray-700 tabular-nums">− {formatCurrency(tFees, "INR")}</span>
          </div>

          <p id="fx-modal-foot" className="text-[10px] text-gray-400 leading-relaxed pt-1">
            *Illustrative bank comparison (~1.8% worse effective spread on gross INR). Not a guarantee. Settlement rate
            may differ. Annual = 12 similar months. Fees per your agreement.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ForexCalculatorBanner({ onOpen }: { onOpen: () => void }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl",
        "border border-[#c7d9fb] shadow-sm transition-shadow duration-300 hover:shadow-md"
      )}
      style={{
        background:
          "linear-gradient(125deg, #fafbfc 0%, #f4f8ff 28%, #eff4ff 55%, #e8f0fe 82%, #dce9fc 100%)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.85)",
      }}
      role="region"
      aria-label="Forex calculator"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 100% 30%, rgba(0, 97, 227, 0.07) 0%, transparent 55%), radial-gradient(ellipse 50% 45% at 0% 80%, rgba(0, 97, 227, 0.05) 0%, transparent 50%)",
        }}
      />
      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight leading-snug">
            Forex Calculator
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
            Know exactly how much you will receive
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="shrink-0 !text-[#0061E3] sm:self-center"
          onClick={onOpen}
          aria-haspopup="dialog"
        >
          Calculate Now
        </Button>
      </div>
    </div>
  );
}
