"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import {
  X, Delete, Nfc, ChevronRight, Search, Check,
  Plus, User, Mail, ChevronDown, SendHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Currencies ──────────────────────────────────────────────── */
const CURRENCIES = [
  { code: "INR", name: "Indian Rupee",      symbol: "₹"   },
  { code: "USD", name: "US Dollar",         symbol: "$"   },
  { code: "EUR", name: "Euro",              symbol: "€"   },
  { code: "GBP", name: "British Pound",     symbol: "£"   },
  { code: "AED", name: "UAE Dirham",        symbol: "AED" },
  { code: "SGD", name: "Singapore Dollar",  symbol: "S$"  },
  { code: "AUD", name: "Australian Dollar", symbol: "A$"  },
  { code: "CAD", name: "Canadian Dollar",   symbol: "C$"  },
  { code: "JPY", name: "Japanese Yen",      symbol: "¥"   },
] as const;
type CurrencyCode = typeof CURRENCIES[number]["code"];

/* ─── Dial codes ──────────────────────────────────────────────── */
const DIAL_CODES = [
  { code: "+91",  flag: "🇮🇳", country: "India"       },
  { code: "+1",   flag: "🇺🇸", country: "USA"         },
  { code: "+44",  flag: "🇬🇧", country: "UK"          },
  { code: "+971", flag: "🇦🇪", country: "UAE"         },
  { code: "+65",  flag: "🇸🇬", country: "Singapore"   },
  { code: "+61",  flag: "🇦🇺", country: "Australia"   },
  { code: "+81",  flag: "🇯🇵", country: "Japan"       },
  { code: "+49",  flag: "🇩🇪", country: "Germany"     },
  { code: "+33",  flag: "🇫🇷", country: "France"      },
  { code: "+966", flag: "🇸🇦", country: "Saudi Arabia"},
] as const;

const PAD_KEYS = ["1","2","3","4","5","6","7","8","9",".","0","⌫"] as const;

/* SVG progress ring circumference for r=40 */
const RING_C = 251.3;

type TapStep = "amount" | "currency" | "dialCode" | "ready" | "scanning" | "done";
type FocusMode = "amount" | "customer";

interface Props { open: boolean; onClose: () => void; contained?: boolean; }

export function MobileTapToPay({ open, onClose, contained = false }: Props) {
  const pos = contained ? "absolute" : "fixed";

  /* ── Amount screen state ── */
  const [step,       setStep]       = useState<TapStep>("amount");
  const [focusMode,  setFocusMode]  = useState<FocusMode>("amount");
  const [currency,   setCurrency]   = useState<CurrencyCode>("INR");
  const [amountRaw,  setAmountRaw]  = useState("");
  const [searchQ,    setSearchQ]    = useState("");

  /* ── Customer state ── */
  const [showCustomer, setShowCustomer] = useState(false);
  const [custName,  setCustName]  = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custDial,  setCustDial]  = useState("+91");
  const [custPhone, setCustPhone] = useState("");

  /* ── Animation refs ── */
  const [amtScope, animAmt]   = useAnimate();
  const [zoneScope, animZone] = useAnimate();
  const nameRef  = useRef<HTMLInputElement>(null);

  const sym      = CURRENCIES.find(c => c.code === currency)?.symbol ?? "₹";
  const hasAmount = amountRaw !== "" && amountRaw !== "0";
  const hasCustomer = !!(custName.trim() || custEmail.trim() || custPhone.trim());

  const filteredCurrencies = useMemo(() =>
    CURRENCIES.filter(c =>
      c.code.toLowerCase().includes(searchQ.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQ.toLowerCase())
    ), [searchQ]);

  /* Focus name field when customer section opens */
  useEffect(() => {
    if (showCustomer) setTimeout(() => nameRef.current?.focus(), 60);
  }, [showCustomer]);

  /* ── Helpers ── */
  const displayAmt = () => {
    if (!amountRaw) return "0";
    const [int, dec] = amountRaw.split(".");
    const fmt = parseInt(int || "0", 10).toLocaleString(currency === "INR" ? "en-IN" : "en-US");
    return dec !== undefined ? `${fmt}.${dec}` : fmt;
  };

  const bounce = () => {
    if (!amtScope.current) return;
    void animAmt(amtScope.current, { scale: [1, 1.1, 1] }, { duration: 0.18, ease: "easeOut" });
  };

  const onKey = (k: string) => {
    if (k === "⌫") { setAmountRaw(p => p.slice(0, -1)); bounce(); return; }
    if (k === "." && amountRaw.includes(".")) return;
    if (k === "." && amountRaw === "") { setAmountRaw("0."); bounce(); return; }
    if (amountRaw.includes(".") && amountRaw.split(".")[1]!.length >= 2) return;
    if (amountRaw === "0" && k !== ".") { setAmountRaw(k); bounce(); return; }
    setAmountRaw(p => p + k);
    bounce();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("amount"); setAmountRaw(""); setFocusMode("amount");
      setShowCustomer(false); setCustName(""); setCustEmail(""); setCustPhone("");
      setSearchQ("");
    }, 350);
  };

  const handleCardTap = async () => {
    if (step !== "ready") return;
    if (zoneScope.current) {
      await animZone(
        zoneScope.current,
        { scale: [1, 0.97, 1.02, 1] },
        { duration: 0.32, ease: "easeOut" }
      );
    }
    setStep("scanning");
  };

  /* ── Scan zone border animate config ── */
  const zoneBorderAnim = {
    ready:    { borderColor: "rgba(0,97,227,0.22)",  backgroundColor: "rgba(0,97,227,0.03)", boxShadow: "0 0 0 0px rgba(0,97,227,0)" },
    scanning: { borderColor: "#0061e3",              backgroundColor: "rgba(0,97,227,0.06)", boxShadow: "0 0 0 6px rgba(0,97,227,0.09)" },
    done:     { borderColor: "#0061e3",              backgroundColor: "rgba(0,97,227,0.06)", boxShadow: "0 0 0 8px rgba(0,97,227,0.07)" },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ttp-bd"
            className={`${pos} inset-0 z-50 bg-black/50`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={step === "amount" ? handleClose : undefined}
          />

          {/* Main sheet */}
          <motion.div
            key="ttp-sheet"
            className={`${pos} inset-x-0 bottom-0 z-[51] flex flex-col bg-background overflow-hidden rounded-t-[24px]`}
            style={{ height: contained ? "100%" : "100dvh" }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          >
            <AnimatePresence mode="wait">

              {/* ════════════════════════════════════════
                  AMOUNT SCREEN (amount | currency | dialCode)
              ════════════════════════════════════════ */}
              {(step === "amount" || step === "currency" || step === "dialCode") && (
                <motion.div key="s-amount" className="flex flex-col flex-1 min-h-0"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}
                >

                  {/* Currency sub-sheet */}
                  <AnimatePresence>
                    {step === "currency" && (
                      <>
                        <motion.div key="curr-bd"
                          className="absolute inset-0 z-10 bg-black/35 rounded-t-[24px]"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => { setStep("amount"); setSearchQ(""); }}
                        />
                        <motion.div key="curr-sheet"
                          className="absolute inset-x-0 bottom-0 z-20 flex flex-col bg-background rounded-t-[24px] overflow-hidden"
                          style={{ top: contained ? "72px" : "80px" }}
                          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                        >
                          <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden>
                            <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
                          </div>
                          <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-border/50 shrink-0">
                            <h2 className="text-[17px] font-bold text-foreground">Select Currency</h2>
                            <button type="button" onClick={() => { setStep("amount"); setSearchQ(""); }}
                              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
                            >
                              <X className="h-4 w-4" strokeWidth={2} />
                            </button>
                          </div>
                          <div className="px-4 py-3 shrink-0">
                            <div className="flex items-center gap-2.5 bg-muted rounded-xl px-3.5 py-2.5">
                              <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} />
                              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                                placeholder="Search currencies"
                                className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex-1 overflow-y-auto">
                            {filteredCurrencies.map((c, i) => (
                              <button key={c.code} type="button"
                                onClick={() => { setCurrency(c.code); setStep("amount"); setSearchQ(""); }}
                                className={cn(
                                  "w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors",
                                  i > 0 && "border-t border-border/40"
                                )}
                              >
                                <span>
                                  <span className="text-[14px] font-semibold text-foreground">{c.code}</span>
                                  <span className="text-[14px] text-muted-foreground ml-2">— {c.name}</span>
                                </span>
                                {currency === c.code && <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2.5} />}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  {/* Dial code sub-sheet */}
                  <AnimatePresence>
                    {step === "dialCode" && (
                      <>
                        <motion.div key="dial-bd"
                          className="absolute inset-0 z-10 bg-black/35 rounded-t-[24px]"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setStep("amount")}
                        />
                        <motion.div key="dial-sheet"
                          className="absolute inset-x-0 bottom-0 z-20 flex flex-col bg-background rounded-t-[24px] overflow-hidden"
                          style={{ top: contained ? "72px" : "80px" }}
                          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                        >
                          <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden>
                            <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
                          </div>
                          <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-border/50 shrink-0">
                            <h2 className="text-[17px] font-bold text-foreground">Country Code</h2>
                            <button type="button" onClick={() => setStep("amount")}
                              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
                            >
                              <X className="h-4 w-4" strokeWidth={2} />
                            </button>
                          </div>
                          <div className="flex-1 overflow-y-auto">
                            {DIAL_CODES.map((d, i) => (
                              <button key={d.code} type="button"
                                onClick={() => { setCustDial(d.code); setStep("amount"); }}
                                className={cn(
                                  "w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/50 transition-colors",
                                  i > 0 && "border-t border-border/40"
                                )}
                              >
                                <span className="text-[22px]">{d.flag}</span>
                                <span className="flex-1 text-[14px] font-medium text-foreground">{d.country}</span>
                                <span className="text-[14px] text-muted-foreground font-mono">{d.code}</span>
                                {custDial === d.code && <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2.5} />}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 pt-5 pb-3 shrink-0 border-b border-border/30">
                    <div className="w-9" />
                    <h2 className="text-[16px] font-bold text-foreground">Tap to Pay</h2>
                    <button type="button" onClick={handleClose}
                      className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                      <X className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>

                  {/* Scrollable form */}
                  <div className="flex-1 overflow-y-auto flex flex-col">

                    {/* ── Centered: currency + amount ── */}
                    <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-[180px]">
                      {/* Currency selector */}
                      <button type="button" onClick={() => setStep("currency")}
                        className="flex items-center gap-1.5 mb-6"
                      >
                        <span className="text-[13px] text-muted-foreground">Currency:</span>
                        <span className="text-[13px] font-semibold text-primary">{currency}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                      </button>

                      {/* Amount display */}
                      <button
                        type="button"
                        onClick={() => setFocusMode("amount")}
                        className="flex items-baseline justify-center gap-2"
                      >
                        <span className="text-[32px] font-semibold text-muted-foreground/60 tabular-nums">{sym}</span>
                        <span
                          ref={amtScope}
                          className={cn(
                            "text-[52px] font-bold tabular-nums leading-none tracking-tight inline-block transition-colors",
                            hasAmount ? "text-foreground" : "text-muted-foreground/35"
                          )}
                        >
                          {displayAmt()}
                        </span>
                      </button>
                    </div>

                    {/* ── Customer section — separated with generous top spacing ── */}
                    <div className="px-5 pt-6 pb-6">
                      <div className="flex items-center gap-2 mb-2.5">
                        <p className="text-[13.5px] font-semibold text-foreground">Customer</p>
                        <span className="text-[11px] text-muted-foreground border border-border/70 px-2 py-0.5 rounded-md">Optional</span>
                      </div>

                      <AnimatePresence initial={false}>
                        {!showCustomer ? (
                          <motion.button
                            key="add-btn"
                            type="button"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            onClick={() => { setShowCustomer(true); setFocusMode("customer"); }}
                            className="flex items-center gap-1.5 text-primary"
                          >
                            <Plus className="h-4 w-4" strokeWidth={2.5} />
                            <span className="text-[13.5px] font-semibold">Add customer</span>
                          </motion.button>
                        ) : (
                          <motion.div
                            key="cust-form"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5">
                                <User className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
                                <input
                                  ref={nameRef}
                                  type="text"
                                  value={custName}
                                  onFocus={() => setFocusMode("customer")}
                                  onChange={e => setCustName(e.target.value)}
                                  placeholder="Full name"
                                  className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                                />
                              </div>
                              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5">
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
                                <input
                                  type="email"
                                  value={custEmail}
                                  onFocus={() => setFocusMode("customer")}
                                  onChange={e => setCustEmail(e.target.value)}
                                  placeholder="Email address"
                                  className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                                />
                              </div>
                              {/* Phone with dial code */}
                              <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden">
                                <button type="button" onClick={() => setStep("dialCode")}
                                  className="flex items-center gap-1.5 px-3.5 py-2.5 border-r border-border/60 text-[14px] font-medium text-foreground shrink-0 hover:bg-muted/40 transition-colors"
                                >
                                  <span className="text-[16px]">{DIAL_CODES.find(d => d.code === custDial)?.flag}</span>
                                  <span>{custDial}</span>
                                  <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={2} />
                                </button>
                                <input
                                  type="tel"
                                  value={custPhone}
                                  onFocus={() => setFocusMode("customer")}
                                  onChange={e => setCustPhone(e.target.value)}
                                  placeholder="Phone number"
                                  className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none px-3.5 py-2.5 min-w-0"
                                />
                              </div>
                              <button type="button"
                                onClick={() => {
                                  setShowCustomer(false);
                                  setCustName(""); setCustEmail(""); setCustPhone("");
                                  setFocusMode("amount");
                                }}
                                className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Remove customer
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="px-5 pt-2 pb-3 shrink-0">
                    <button type="button" disabled={!hasAmount} onClick={() => setStep("ready")}
                      className={cn(
                        "w-full py-4 rounded-2xl text-[15px] font-bold transition-all duration-200",
                        hasAmount
                          ? "bg-primary text-primary-foreground shadow-sm active:scale-[0.98]"
                          : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                      )}
                    >
                      {hasAmount ? `Charge ${sym}${displayAmt()}` : "Enter amount"}
                    </button>
                  </div>

                  {/* Numpad — hides when in customer mode */}
                  <AnimatePresence>
                    {focusMode === "amount" && (
                      <motion.div
                        key="numpad"
                        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                        className="grid grid-cols-3 shrink-0 border-t border-border/40"
                      >
                        {PAD_KEYS.map((k) => (
                          <button key={k} type="button" onClick={() => onKey(k)}
                            className="flex items-center justify-center py-[14px] text-foreground active:bg-muted/60 transition-colors select-none"
                          >
                            {k === "⌫"
                              ? <Delete className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
                              : <span className="text-[22px] font-medium leading-none">{k}</span>
                            }
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div style={{ height: "env(safe-area-inset-bottom)" }} className="shrink-0 bg-background" />
                </motion.div>
              )}

              {/* ════════════════════════════════════════
                  SCAN SCREEN (ready → scanning → done, no re-mount)
              ════════════════════════════════════════ */}
              {(step === "ready" || step === "scanning" || step === "done") && (
                <motion.div key="s-scan" className="flex flex-col flex-1 min-h-0"
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 pt-5 pb-3 shrink-0">
                    <button type="button" onClick={() => step === "done" ? handleClose() : setStep("amount")}
                      className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                      <X className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <h2 className="text-[16px] font-bold text-foreground">Tap to Pay</h2>
                    {step === "done" && hasCustomer && (custEmail || custPhone) ? (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors"
                      >
                        <SendHorizontal className="h-4 w-4" strokeWidth={2} />
                      </motion.button>
                    ) : (
                      <div className="w-9" />
                    )}
                  </div>

                  {/* Scrollable content */}
                  <div className="flex-1 overflow-y-auto flex flex-col items-center px-6" style={{ scrollbarWidth: "none" }}>
                    {/* Vertical centering spacer when not done */}
                    <div className="flex flex-col items-center w-full flex-1 justify-center">

                      {/* ── Scan zone ── */}
                      <motion.button
                        ref={zoneScope}
                        type="button"
                        onClick={handleCardTap}
                        disabled={step !== "ready"}
                        className="relative flex items-center justify-center mb-8 focus:outline-none"
                        style={{ width: 220, height: 220 }}
                        whileTap={step === "ready" ? { scale: 0.97 } : {}}
                      >
                        {/* Animated border backdrop */}
                        <motion.div
                          className="absolute inset-0 rounded-[36px]"
                          style={{ borderWidth: 2, borderStyle: "solid" }}
                          animate={
                            step === "done"    ? zoneBorderAnim.done    :
                            step === "scanning"? zoneBorderAnim.scanning:
                                                 zoneBorderAnim.ready
                          }
                          transition={{ duration: 0.4 }}
                        />

                        {/* Ripple rings — ready only */}
                        <AnimatePresence>
                          {step === "ready" && (
                            <>
                              {[0, 1, 2].map((i) => (
                                <motion.span
                                  key={`ring-${i}`}
                                  className="absolute rounded-full border border-primary/20 pointer-events-none"
                                  style={{ width: 72, height: 72 }}
                                  initial={{ scale: 1, opacity: 0.4 }}
                                  animate={{ scale: 3.0, opacity: 0 }}
                                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                                  transition={{
                                    duration: 2.1,
                                    delay: i * 0.68,
                                    repeat: Infinity,
                                    ease: [0.2, 0.6, 0.4, 1],
                                  }}
                                />
                              ))}
                            </>
                          )}
                        </AnimatePresence>

                        {/* Progress ring — scanning only */}
                        <AnimatePresence>
                          {step === "scanning" && (
                            <motion.svg
                              key="prog"
                              className="absolute -rotate-90"
                              width={104} height={104} viewBox="0 0 104 104"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <circle cx="52" cy="52" r="40" fill="none" stroke="rgba(0,97,227,0.1)" strokeWidth="4.5" />
                              <motion.circle
                                cx="52" cy="52" r="40"
                                fill="none" stroke="#0061e3" strokeWidth="4.5"
                                strokeLinecap="round"
                                strokeDasharray={RING_C}
                                initial={{ strokeDashoffset: RING_C }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 2.3, ease: "easeInOut" }}
                                onAnimationComplete={() => {
                                  setTimeout(() => setStep("done"), 140);
                                }}
                              />
                            </motion.svg>
                          )}
                        </AnimatePresence>

                        {/* Icon area — NFC (ready/scanning) or Checkmark (done) */}
                        <AnimatePresence mode="wait">
                          {step !== "done" ? (
                            <motion.div
                              key="nfc-icon"
                              className="relative z-10"
                              animate={step === "ready" ? { scale: [1, 1.07, 1] } : { scale: 1 }}
                              transition={step === "ready"
                                ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
                                : { duration: 0.3 }
                              }
                              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.18 } }}
                            >
                              <Nfc
                                className={cn(
                                  "h-14 w-14 transition-colors duration-300",
                                  step === "scanning" ? "text-primary" : "text-primary/60"
                                )}
                                strokeWidth={1.4}
                              />
                            </motion.div>
                          ) : (
                            /* Blue animated checkmark */
                            <motion.div
                              key="check-icon"
                              className="relative z-10"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: "spring", stiffness: 380, damping: 22 }}
                            >
                              <svg viewBox="0 0 80 80" className="h-[72px] w-[72px]">
                                <motion.circle
                                  cx="40" cy="40" r="36"
                                  fill="#0061e3"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                                />
                                <motion.path
                                  d="M 22 42 L 35 56 L 58 25"
                                  stroke="white"
                                  strokeWidth={5.5}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  fill="none"
                                  initial={{ pathLength: 0, opacity: 0 }}
                                  animate={{ pathLength: 1, opacity: 1 }}
                                  transition={{ duration: 0.45, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                />
                              </svg>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>

                      {/* Status label */}
                      <AnimatePresence mode="wait">
                        {step === "ready" && (
                          <motion.div key="t-ready" className="text-center"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
                          >
                            <p className="text-[18px] font-bold text-foreground mb-1.5">Ready to receive</p>
                            <p className="text-[13.5px] text-muted-foreground">Hold card to back of phone</p>
                          </motion.div>
                        )}
                        {step === "scanning" && (
                          <motion.div key="t-scan" className="text-center"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
                          >
                            <p className="text-[18px] font-bold text-primary mb-1.5">Card detected</p>
                            <p className="text-[13.5px] text-muted-foreground">Processing payment…</p>
                          </motion.div>
                        )}
                        {step === "done" && (
                          <motion.div key="t-done" className="text-center"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, delay: 0.1 }}
                          >
                            <p className="text-[18px] font-bold text-foreground mb-1.5">Payment received!</p>
                            <p className="text-[13.5px] text-muted-foreground">
                              Charged{" "}
                              <span className="font-semibold text-foreground">{sym}{displayAmt()}</span>
                              {" "}via Tap to Pay
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* "Charging" amount — visible in ready/scanning, fades out on done */}
                      <AnimatePresence>
                        {step !== "done" && (
                          <motion.div
                            key="charge-amt"
                            className="mt-8 text-center"
                            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Charging</p>
                            <p className="text-[40px] font-bold text-foreground tabular-nums leading-none">{sym}{displayAmt()}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Demo hint — ready only */}
                      {step === "ready" && (
                        <motion.p
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
                          className="mt-5 text-[11px] text-muted-foreground/40 text-center"
                        >
                          Tap the area above to simulate
                        </motion.p>
                      )}
                    </div>

                    {/* ── Receipt + actions — slides in on done ── */}
                    <AnimatePresence>
                      {/* receipt removed — actions moved to bottom footer */}
                    </AnimatePresence>
                  </div>

                  {/* ── Trust markers — only on ready / scanning ── */}
                  <AnimatePresence>
                    {step !== "done" && (
                      <motion.div
                        key="trust-marks"
                        className="shrink-0 px-5 pb-5 pt-3 mb-5"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6, transition: { duration: 0.18 } }}
                        transition={{ duration: 0.3, delay: step === "ready" ? 0.7 : 0 }}
                      >
                        <p className="text-[9.5px] font-semibold uppercase tracking-widest text-muted-foreground/45 text-center mb-2.5">
                          Supported card networks
                        </p>
                        <div className="flex items-center justify-center gap-2">

                          {/* Visa */}
                          <div className="h-[26px] w-[42px] rounded-md border border-border/50 bg-white dark:bg-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] flex items-center justify-center">
                            <span style={{
                              fontFamily: "'Arial Black', Arial, sans-serif",
                              fontStyle: "italic",
                              fontWeight: 900,
                              fontSize: 11,
                              color: "#1A1F71",
                              letterSpacing: -0.5,
                              lineHeight: 1,
                            }}>
                              VISA
                            </span>
                          </div>

                          {/* Mastercard */}
                          <div className="h-[26px] w-[42px] rounded-md border border-border/50 bg-white dark:bg-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] flex items-center justify-center">
                            <div className="relative" style={{ width: 24, height: 15 }}>
                              <div style={{ position: "absolute", left: 0, top: 0, width: 15, height: 15, borderRadius: "50%", backgroundColor: "#EB001B" }} />
                              <div style={{ position: "absolute", left: 9, top: 0, width: 15, height: 15, borderRadius: "50%", backgroundColor: "#F79E1B", opacity: 0.93 }} />
                            </div>
                          </div>

                          {/* Amex */}
                          <div className="h-[26px] w-[42px] rounded-md border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-center" style={{ backgroundColor: "#016FD0" }}>
                            <span style={{
                              fontFamily: "Arial, sans-serif",
                              fontWeight: 900,
                              fontSize: 8.5,
                              color: "white",
                              letterSpacing: 1,
                              lineHeight: 1,
                            }}>
                              AMEX
                            </span>
                          </div>

                          {/* Discover */}
                          <div className="h-[26px] w-[42px] rounded-md border border-border/50 bg-white dark:bg-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] flex items-center justify-center gap-1 overflow-hidden">
                            <span style={{
                              fontFamily: "Arial, sans-serif",
                              fontWeight: 800,
                              fontSize: 6,
                              color: "#231F20",
                              letterSpacing: 0.2,
                              lineHeight: 1,
                            }}>
                              DISC
                            </span>
                            <div style={{
                              width: 11,
                              height: 11,
                              borderRadius: "50%",
                              background: "radial-gradient(circle at 38% 38%, #F8A14F, #E8650A)",
                              flexShrink: 0,
                            }} />
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Done-state action buttons — pinned to bottom ── */}
                  <AnimatePresence>
                    {step === "done" && (
                      <motion.div
                        key="done-actions"
                        className="shrink-0 px-5 pb-6 pt-2 flex flex-col gap-3"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16, transition: { duration: 0.18 } }}
                        transition={{ duration: 0.35, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {/* Done — primary */}
                        <button
                          type="button"
                          onClick={handleClose}
                          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-[15px] font-bold shadow-sm active:scale-[0.98] transition-transform"
                        >
                          Done
                        </button>

                        {/* New payment — ghost */}
                        <button
                          type="button"
                          onClick={() => { setStep("amount"); setAmountRaw(""); }}
                          className="w-full py-4 rounded-2xl border border-border bg-card text-[15px] font-semibold text-muted-foreground hover:bg-muted active:scale-[0.98] transition-all"
                        >
                          New payment
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
