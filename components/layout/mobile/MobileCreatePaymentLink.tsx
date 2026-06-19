"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import dynamic from "next/dynamic";
import _successAnim from "@/public/6f797eea-116b-11ee-a5f2-539c765ca237.json";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

/* Replace the teal-green [0, 0.792, 0.553, 1] → dark green #166534 */
function recolor(obj: unknown, src: number[], dst: number[], tol = 0.01): unknown {
  if (Array.isArray(obj)) {
    // Check if this array matches the source color
    if (
      obj.length === 4 &&
      Math.abs((obj[0] as number) - src[0]) < tol &&
      Math.abs((obj[1] as number) - src[1]) < tol &&
      Math.abs((obj[2] as number) - src[2]) < tol
    ) return [...dst];
    return obj.map(v => recolor(v, src, dst, tol));
  }
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, recolor(v, src, dst, tol)])
    );
  }
  return obj;
}

const successAnim = recolor(
  _successAnim,
  [0, 0.7922, 0.5529, 1],        // original teal-green
  [0.0863, 0.3961, 0.2039, 1],   // #166534 dark green
) as typeof _successAnim;
import {
  X, ChevronRight, Search, Delete,
  Check, Copy, Share2, Plus, User, Mail, Phone,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─── Currencies ──────────────────────────────────────────────────── */
const CURRENCIES = [
  { code:"INR", name:"Indian Rupee",        symbol:"₹"   },
  { code:"USD", name:"US Dollar",           symbol:"$"   },
  { code:"EUR", name:"Euro",                symbol:"€"   },
  { code:"GBP", name:"British Pound",       symbol:"£"   },
  { code:"AED", name:"UAE Dirham",          symbol:"AED" },
  { code:"SGD", name:"Singapore Dollar",    symbol:"S$"  },
  { code:"AUD", name:"Australian Dollar",   symbol:"A$"  },
  { code:"CAD", name:"Canadian Dollar",     symbol:"C$"  },
  { code:"JPY", name:"Japanese Yen",        symbol:"¥"   },
  { code:"HKD", name:"Hong Kong Dollar",    symbol:"HK$" },
  { code:"CHF", name:"Swiss Franc",         symbol:"CHF" },
  { code:"MYR", name:"Malaysian Ringgit",   symbol:"RM"  },
  { code:"THB", name:"Thai Baht",           symbol:"฿"  },
  { code:"IDR", name:"Indonesian Rupiah",   symbol:"Rp"  },
  { code:"PHP", name:"Philippine Peso",     symbol:"₱"   },
  { code:"SAR", name:"Saudi Riyal",         symbol:"SAR" },
  { code:"QAR", name:"Qatari Riyal",        symbol:"QAR" },
  { code:"KWD", name:"Kuwaiti Dinar",       symbol:"KWD" },
] as const;
type CurrencyCode = typeof CURRENCIES[number]["code"];

/* ─── Country dial codes ──────────────────────────────────────────── */
const DIAL_CODES = [
  { code:"+91",  flag:"🇮🇳", country:"India"         },
  { code:"+1",   flag:"🇺🇸", country:"USA"           },
  { code:"+44",  flag:"🇬🇧", country:"UK"            },
  { code:"+971", flag:"🇦🇪", country:"UAE"           },
  { code:"+65",  flag:"🇸🇬", country:"Singapore"     },
  { code:"+61",  flag:"🇦🇺", country:"Australia"     },
  { code:"+81",  flag:"🇯🇵", country:"Japan"         },
  { code:"+49",  flag:"🇩🇪", country:"Germany"       },
  { code:"+33",  flag:"🇫🇷", country:"France"        },
  { code:"+86",  flag:"🇨🇳", country:"China"         },
  { code:"+60",  flag:"🇲🇾", country:"Malaysia"      },
  { code:"+66",  flag:"🇹🇭", country:"Thailand"      },
  { code:"+63",  flag:"🇵🇭", country:"Philippines"   },
  { code:"+966", flag:"🇸🇦", country:"Saudi Arabia"  },
] as const;

/* ─── Expiry chips ────────────────────────────────────────────────── */
const EXPIRY_OPTS = [
  { id:"none", label:"No expiry"  },
  { id:"24h",  label:"24 hours"   },
  { id:"7d",   label:"7 days"     },
  { id:"30d",  label:"30 days"    },
  { id:"90d",  label:"90 days"    },
] as const;
type ExpiryId = typeof EXPIRY_OPTS[number]["id"];

/* ─── Numpad ──────────────────────────────────────────────────────── */
const PAD_KEYS = ["1","2","3","4","5","6","7","8","9",".","0","⌫"] as const;

/* ─── Helpers ─────────────────────────────────────────────────────── */
function mockLinkId() { return `pl_${Math.random().toString(36).slice(2,10)}`; }

/** Format integer part with locale-aware thousands separators. */
function formatInt(intStr: string, currencyCode: string): string {
  const n = parseInt(intStr || "0", 10);
  if (isNaN(n)) return intStr;
  return n.toLocaleString(currencyCode === "INR" ? "en-IN" : "en-US");
}

/** Return display string for the amount, formatted per currency. */
function displayAmount(raw: string, currencyCode: string): string {
  if (!raw) return "0";
  const [intPart, decPart] = raw.split(".");
  const formatted = formatInt(intPart ?? "", currencyCode);
  return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
}

/* ─── Props ───────────────────────────────────────────────────────── */
interface Props { open:boolean; onClose:()=>void; contained?:boolean; }
type Step = "amount" | "currency" | "dialCode" | "success";
type FocusMode = "amount" | "description";

/* ─── Component ───────────────────────────────────────────────────── */
export function MobileCreatePaymentLink({ open, onClose, contained=false }: Props) {
  const pos = contained ? "absolute" : "fixed";

  const [step,          setStep]          = useState<Step>("amount");
  const [focusMode,     setFocusMode]     = useState<FocusMode>("amount");
  const [currency,      setCurrency]      = useState<CurrencyCode>("INR");
  const [amountRaw,     setAmountRaw]     = useState("");
  const [amountScope,   animateAmount]    = useAnimate();
  const [description,   setDescription]  = useState("");
  const [showCustomer,  setShowCustomer]  = useState(false);
  const [custName,      setCustName]      = useState("");
  const [custEmail,     setCustEmail]     = useState("");
  const [custDial,      setCustDial]      = useState("+91");
  const [custPhone,     setCustPhone]     = useState("");
  const [expiry,        setExpiry]        = useState<ExpiryId>("none");
  const [searchQ,       setSearchQ]       = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const descRef = useRef<HTMLInputElement>(null);

  // Auto-focus description when switching to description mode
  useEffect(() => {
    if (focusMode === "description") {
      setTimeout(() => descRef.current?.focus(), 50);
    }
  }, [focusMode]);

  const sym = CURRENCIES.find(c => c.code === currency)?.symbol ?? "₹";
  const hasAmount = amountRaw !== "" && amountRaw !== "0";

  const filteredCurrencies = useMemo(() =>
    CURRENCIES.filter(c =>
      c.code.toLowerCase().includes(searchQ.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQ.toLowerCase())
    ), [searchQ]
  );

  const bounce = () => {
    void animateAmount(amountScope.current, { scale:[1,1.1,1] }, { duration:0.18, ease:"easeOut" });
  };

  const onKey = (k: string) => {
    if (k === "⌫") { setAmountRaw(p => p.slice(0,-1)); bounce(); return; }
    if (k === "." && amountRaw.includes(".")) return;
    if (k === "." && amountRaw === "") { setAmountRaw("0."); bounce(); return; }
    if (amountRaw.includes(".") && amountRaw.split(".")[1]!.length >= 2) return;
    if (amountRaw === "0" && k !== ".") { setAmountRaw(k); bounce(); return; }
    setAmountRaw(p => p + k);
    bounce();
  };

  const handleCreate = () => {
    setGeneratedLink(`https://pay.payglocal.in/l/${mockLinkId()}`);
    setStep("success");
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("amount"); setAmountRaw(""); setDescription(""); setFocusMode("amount");
      setCustName(""); setCustEmail(""); setCustPhone(""); setShowCustomer(false);
      setExpiry("none"); setSearchQ(""); setGeneratedLink("");
    }, 350);
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(generatedLink).then(
      () => toast.success("Link copied"),
      () => toast.error("Could not copy")
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Outer backdrop */}
          <motion.div
            key="cpl-backdrop"
            className={`${pos} inset-0 z-50 bg-black/50`}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.22 }}
            onClick={step === "amount" ? handleClose : undefined}
          />

          {/* Main sheet */}
          <motion.div
            key="cpl-sheet"
            className={`${pos} inset-x-0 bottom-0 z-[51] flex flex-col bg-background overflow-hidden rounded-t-[24px]`}
            style={{ height: contained ? "100%" : "100dvh" }}
            initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
            transition={{ duration:0.32, ease:[0.32,0.72,0,1] }}
          >

            {/* ── Currency bottom sheet (NOT full screen — leaves gap at top) ── */}
            <AnimatePresence>
              {step === "currency" && (
                <>
                  {/* Inner backdrop */}
                  <motion.div
                    key="curr-bd"
                    className="absolute inset-0 z-10 bg-black/35 rounded-t-[24px]"
                    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    transition={{ duration:0.2 }}
                    onClick={() => { setStep("amount"); setSearchQ(""); }}
                  />
                  {/* Currency sheet */}
                  <motion.div
                    key="curr-sheet"
                    className="absolute inset-x-0 bottom-0 z-20 flex flex-col bg-background rounded-t-[24px] overflow-hidden"
                    style={{ top: contained ? "72px" : "80px" }}
                    initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
                    transition={{ duration:0.3, ease:[0.32,0.72,0,1] }}
                  >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden>
                      <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
                    </div>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-border/50 shrink-0">
                      <h2 className="text-[17px] font-bold text-foreground">Select Currency</h2>
                      <button type="button" onClick={() => { setStep("amount"); setSearchQ(""); }}
                        className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                    {/* Search */}
                    <div className="px-4 py-3 shrink-0">
                      <div className="flex items-center gap-2.5 bg-muted rounded-xl px-3.5 py-2.5">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} />
                        <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                          placeholder="Search currencies"
                          className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                      </div>
                    </div>
                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                      {filteredCurrencies.map((c, i) => (
                        <button key={c.code} type="button"
                          onClick={() => { setCurrency(c.code); setStep("amount"); setSearchQ(""); }}
                          className={cn(
                            "w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/50",
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

            {/* ── Dial code bottom sheet ── */}
            <AnimatePresence>
              {step === "dialCode" && (
                <>
                  <motion.div key="dial-bd"
                    className="absolute inset-0 z-10 bg-black/35 rounded-t-[24px]"
                    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    transition={{ duration:0.2 }}
                    onClick={() => setStep("amount")}
                  />
                  <motion.div key="dial-sheet"
                    className="absolute inset-x-0 bottom-0 z-20 flex flex-col bg-background rounded-t-[24px] overflow-hidden"
                    style={{ top: contained ? "72px" : "80px" }}
                    initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
                    transition={{ duration:0.3, ease:[0.32,0.72,0,1] }}
                  >
                    <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden>
                      <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
                    </div>
                    <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-border/50 shrink-0">
                      <h2 className="text-[17px] font-bold text-foreground">Country Code</h2>
                      <button type="button" onClick={() => setStep("amount")}
                        className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        <X className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {DIAL_CODES.map((d, i) => (
                        <button key={d.code} type="button"
                          onClick={() => { setCustDial(d.code); setStep("amount"); }}
                          className={cn(
                            "w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50",
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

            {/* ── Amount + form step ── */}
            {step !== "success" && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-5 pb-3 shrink-0 border-b border-border/30">
                  <div className="w-9" />
                  <h2 className="text-[16px] font-bold text-foreground">Create payment link</h2>
                  <button type="button" onClick={handleClose}
                    className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>

                {/* Scrollable form */}
                <div className="flex-1 overflow-y-auto">
                  {/* Currency selector */}
                  <div className="flex justify-center pt-5 pb-1">
                    <button type="button" onClick={() => setStep("currency")}
                      className="flex items-center gap-1.5"
                    >
                      <span className="text-[13px] text-muted-foreground">Currency:</span>
                      <span className="text-[13px] font-semibold text-primary">{currency}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Amount display — tap to return to numpad mode */}
                  <button
                    type="button"
                    onClick={() => setFocusMode("amount")}
                    className="w-full flex items-baseline justify-center gap-2 px-6 py-5"
                  >
                    <span className="text-[32px] font-semibold text-muted-foreground/60 tabular-nums">{sym}</span>
                    <span
                      ref={amountScope}
                      className={cn(
                        "text-[52px] font-bold tabular-nums leading-none tracking-tight transition-colors inline-block",
                        hasAmount ? "text-foreground" : "text-muted-foreground/35"
                      )}
                    >
                      {displayAmount(amountRaw, currency)}
                    </span>
                  </button>

                  <div className="mb-5" />

                  {/* Description — tapping focuses text keyboard */}
                  <div className="px-5 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[13.5px] font-semibold text-foreground">Description</p>
                      <span className="text-[11px] text-muted-foreground bg-transparent border border-border/70 px-2 py-0.5 rounded-md">Optional</span>
                    </div>
                    <input
                      ref={descRef}
                      type="text"
                      inputMode="text"
                      value={description}
                      onFocus={() => setFocusMode("description")}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Add description"
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    />
                  </div>

                  {/* Customer — expandable form */}
                  <div className="px-5 mb-4">
                    <p className="text-[13.5px] font-semibold text-foreground mb-2">Customer</p>
                    <AnimatePresence initial={false}>
                      {!showCustomer ? (
                        <motion.button
                          key="add-btn"
                          type="button"
                          initial={{ opacity:1 }}
                          exit={{ opacity:0, height:0 }}
                          onClick={() => setShowCustomer(true)}
                          className="flex items-center gap-1.5 text-primary"
                        >
                          <Plus className="h-4 w-4" strokeWidth={2.5} />
                          <span className="text-[13.5px] font-semibold">Add customer</span>
                        </motion.button>
                      ) : (
                        <motion.div
                          key="customer-form"
                          initial={{ opacity:0, height:0 }}
                          animate={{ opacity:1, height:"auto" }}
                          exit={{ opacity:0, height:0 }}
                          transition={{ duration:0.22, ease:[0.22,1,0.36,1] }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2.5">
                            {/* Name — same style as description */}
                            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5">
                              <User className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
                              <input type="text" inputMode="text" value={custName}
                                onChange={e => setCustName(e.target.value)} placeholder="Full name"
                                className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                              />
                            </div>
                            {/* Email */}
                            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5">
                              <Mail className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
                              <input type="email" inputMode="email" value={custEmail}
                                onChange={e => setCustEmail(e.target.value)} placeholder="Email address"
                                className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                              />
                            </div>
                            {/* Phone — no icon, dial code opens sheet */}
                            <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden">
                              <button type="button" onClick={() => setStep("dialCode")}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 border-r border-border/60 text-[14px] font-medium text-foreground shrink-0 hover:bg-muted/40 transition-colors"
                              >
                                <span className="text-[16px]">{DIAL_CODES.find(d => d.code === custDial)?.flag}</span>
                                <span>{custDial}</span>
                                <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={2} />
                              </button>
                              <input type="tel" inputMode="tel" value={custPhone}
                                onChange={e => setCustPhone(e.target.value)} placeholder="Phone number"
                                className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none px-3.5 py-2.5 min-w-0"
                              />
                            </div>
                            <button type="button"
                              onClick={() => { setShowCustomer(false); setCustName(""); setCustEmail(""); setCustPhone(""); }}
                              className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Remove customer
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Expiry chips */}
                  <div className="px-5 mb-6">
                    <div className="flex items-center gap-2 mb-2.5">
                      <p className="text-[13.5px] font-semibold text-foreground">Expiry</p>
                      <span className="text-[11px] text-muted-foreground bg-transparent border border-border/70 px-2 py-0.5 rounded-md">Optional</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {EXPIRY_OPTS.map((opt) => (
                        <button key={opt.id} type="button"
                          onClick={() => setExpiry(opt.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border",
                            expiry === opt.id
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-card text-muted-foreground border-border hover:bg-muted/50"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Create link button */}
                <div className="px-5 pt-2 pb-2 shrink-0">
                  <button type="button" disabled={!hasAmount} onClick={handleCreate}
                    className={cn(
                      "w-full py-4 rounded-2xl text-[15px] font-bold transition-all duration-200",
                      hasAmount
                        ? "bg-primary text-primary-foreground shadow-sm active:scale-[0.98]"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                    )}
                  >
                    Create link
                  </button>
                </div>

                {/* Numpad — shown when focusMode is amount */}
                <AnimatePresence>
                  {focusMode === "amount" && (
                    <motion.div
                      key="numpad"
                      initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
                      transition={{ duration:0.22, ease:[0.32,0.72,0,1] }}
                      className="grid grid-cols-3 shrink-0 border-t border-border/40"
                    >
                      {PAD_KEYS.map((k) => (
                        <button key={k} type="button" onClick={() => onKey(k)}
                          className="flex flex-col items-center justify-center py-[14px] text-foreground active:bg-muted/60 transition-colors select-none"
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

                <div style={{ height:"env(safe-area-inset-bottom)" }} className="shrink-0 bg-background" />
              </>
            )}

            {/* ── Success state ── */}
            {step === "success" && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex justify-end px-4 pt-5 pb-2 shrink-0">
                  <button type="button" onClick={handleClose}
                    className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
                  >
                    <X className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 overflow-y-auto">
                  {/* Checkmark */}
                  <motion.div
                    initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
                    transition={{ type:"spring", stiffness:300, damping:22, delay:0.05 }}
                    className="mb-6"
                  >
                    <Lottie
                      animationData={successAnim}
                      loop={true}
                      className="h-[115px] w-[115px]"
                    />
                  </motion.div>

                  <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.35, delay:0.25, ease:[0.22,1,0.36,1] }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-[22px] font-bold text-foreground mb-1.5">Payment link created!</h2>
                    <p className="text-[14px] text-muted-foreground">
                      Share this link to collect{" "}
                      <span className="font-semibold text-foreground">{sym} {displayAmount(amountRaw, currency)}</span>
                      {description ? ` for ${description}` : ""}
                    </p>
                  </motion.div>

                  {/* Link card */}
                  <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.35, delay:0.35, ease:[0.22,1,0.36,1] }}
                    className="w-full mb-6"
                  >
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <p className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Payment link</p>
                      <p className="text-[20px] font-bold text-foreground tabular-nums mb-0.5">{sym} {displayAmount(amountRaw, currency)}</p>
                      {description && <p className="text-[13px] text-muted-foreground mb-2">{description}</p>}
                      {expiry !== "none" && (
                        <p className="text-[12px] text-muted-foreground mb-2">
                          Expires in: {EXPIRY_OPTS.find(e => e.id === expiry)?.label}
                        </p>
                      )}
                      <p className="font-mono text-[11px] text-muted-foreground break-all mt-2 mb-4">{generatedLink}</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={handleCopy}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground hover:opacity-90 active:opacity-80 transition-opacity"
                        >
                          <Copy className="h-4 w-4" strokeWidth={2} /> Copy link
                        </button>
                        <button type="button" onClick={async () => {
                          if (navigator.share) {
                            try { await navigator.share({ title:`Payment — ${sym} ${amountRaw}`, url:generatedLink }); }
                            catch {}
                          } else { handleCopy(); }
                        }}
                          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground hover:bg-muted transition-colors"
                        >
                          <Share2 className="h-4 w-4" strokeWidth={2} /> Share
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
                    className="flex flex-col items-center gap-3 w-full"
                  >
                    <a href="/payment-products/payment-links"
                      className="flex items-center gap-1.5 text-[13px] text-primary font-semibold"
                    >
                      View all payment links
                    </a>
                    <button type="button"
                      onClick={() => {
                        setStep("amount"); setAmountRaw(""); setDescription("");
                        setExpiry("none"); setGeneratedLink("");
                        setShowCustomer(false); setCustName(""); setCustEmail(""); setCustPhone("");
                      }}
                      className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Create another link
                    </button>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
