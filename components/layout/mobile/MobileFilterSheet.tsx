"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterId } from "@/components/dashboard/mobile/MobileTransactions";

const FILTER_CHIPS = [
  { id: "date" as FilterId,     label: "Date & Time"    },
  { id: "amount" as FilterId,   label: "Amount"         },
  { id: "currency" as FilterId, label: "Currency"       },
  { id: "status" as FilterId,   label: "Status"         },
  { id: "method" as FilterId,   label: "Payment method" },
  { id: "more" as FilterId,     label: "More filters"   },
];

function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-border bg-card px-3.5 py-3 text-[14px] text-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

interface Props {
  open: FilterId | null;
  onClose: () => void;
  onApply: (id: FilterId, summary: string) => void;
  contained?: boolean;
}

export function MobileFilterSheet({ open, onClose, onApply, contained = false }: Props) {
  const pos = contained ? "absolute" : "fixed";

  const [dateMode, setDateMode] = useState("is in the last");
  const [dateN,    setDateN]    = useState("7");
  const [dateUnit, setDateUnit] = useState("days");
  const [dateTz,   setDateTz]   = useState<"kolkata" | "utc">("kolkata");
  const [amtMode,  setAmtMode]  = useState("is equal to");
  const [amtVal,   setAmtVal]   = useState("");
  const [currFilt, setCurrFilt] = useState("INR");
  const [selStatus, setSelStatus] = useState<Set<string>>(new Set());
  const [methodFilt, setMethodFilt] = useState("Card");

  const toggleStatus = (s: string) => {
    setSelStatus(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  const filterLabel = FILTER_CHIPS.find(c => c.id === open)?.label ?? "";

  const handleApply = () => {
    if (!open) return;
    let summary = "";
    if (open === "date")        summary = `Last ${dateN} ${dateUnit}`;
    else if (open === "amount") {
      const sym = amtMode === "is equal to" ? "=" : amtMode === "is greater than" ? ">" : "<";
      summary = `${sym} ₹${amtVal || "0"}`;
    }
    else if (open === "currency") summary = currFilt;
    else if (open === "status")   summary = selStatus.size > 0 ? `${selStatus.size} status${selStatus.size > 1 ? "es" : ""}` : "";
    else if (open === "method")   summary = methodFilt;
    else if (open === "more")     summary = "active";

    if (summary) onApply(open, summary);
    else onClose();
  };

  const renderContent = () => {
    switch (open) {
      case "date":
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <FilterSelect value={dateMode} onChange={setDateMode}
              options={["is in the last", "is after", "is before", "is in range"]} />
            <div className="flex gap-3">
              <input type="text" value={dateN} onChange={e => setDateN(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-card px-3.5 py-3 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex-1">
                <FilterSelect value={dateUnit} onChange={setDateUnit} options={["days", "weeks", "months"]} />
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground mb-2.5">Timezone</p>
              <div className="flex gap-4">
                {(["kolkata", "utc"] as const).map(tz => (
                  <button key={tz} type="button" onClick={() => setDateTz(tz)}
                    className="flex items-center gap-2 text-[13.5px] text-foreground"
                  >
                    <span className={cn(
                      "h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      dateTz === tz ? "border-primary" : "border-border"
                    )}>
                      {dateTz === tz && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </span>
                    {tz === "kolkata" ? "Kolkata Time" : "UTC"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case "amount":
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            <FilterSelect value={amtMode} onChange={setAmtMode}
              options={["is equal to", "is greater than", "is less than"]} />
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-muted-foreground font-medium shrink-0">₹</span>
              <input type="number" value={amtVal} onChange={e => setAmtVal(e.target.value)}
                placeholder="0"
                className="flex-1 rounded-xl border border-border bg-card px-3.5 py-3 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        );
      case "currency":
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <FilterSelect value={currFilt} onChange={setCurrFilt}
              options={["INR", "USD", "EUR", "GBP", "AED", "SGD"]} />
          </div>
        );
      case "status":
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {["Success", "Failed", "Pending", "Refunded"].map((s, i) => (
              <button key={s} type="button" onClick={() => toggleStatus(s)}
                className={cn(
                  "w-full flex items-center gap-3.5 py-3.5 text-left transition-colors",
                  i > 0 && "border-t border-border/40"
                )}
              >
                <span className={cn(
                  "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                  selStatus.has(s) ? "border-primary bg-primary" : "border-border"
                )}>
                  {selStatus.has(s) && (
                    <svg viewBox="0 0 10 8" className="h-2.5 w-2.5" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span className="text-[14px] font-medium text-foreground">{s}</span>
              </button>
            ))}
          </div>
        );
      case "method":
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <FilterSelect value={methodFilt} onChange={setMethodFilt}
              options={["Card", "UPI", "Net Banking", "Wire"]} />
          </div>
        );
      case "more":
        return (
          <div className="flex-1 px-5 py-8 flex items-center justify-center">
            <p className="text-[14px] text-muted-foreground text-center">Additional filters coming soon</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="filter-bd"
            className={`${pos} inset-0 z-[51] bg-black/45`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            key="filter-sheet"
            className={`${pos} inset-x-0 bottom-0 z-[52] bg-background rounded-t-[24px] flex flex-col`}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-0 shrink-0">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-border/50 shrink-0">
              <h3 className="text-[16px] font-bold text-foreground">Filter by: {filterLabel}</h3>
              <button type="button" onClick={onClose}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            {/* Content */}
            {renderContent()}
            {/* Apply */}
            <div className="px-5 pb-6 pt-3 shrink-0">
              <button type="button" onClick={handleApply}
                className="w-full py-4 rounded-2xl bg-primary text-white text-[15px] font-bold active:scale-[0.98] transition-all"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
