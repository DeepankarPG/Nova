"use client";

import { type ElementType, useState, useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, ChevronDown, Search, Check, Eye, ArrowLeft, Receipt, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Currencies ──────────────────────────────────────────────────── */
const CURRENCIES = [
  { code: "INR", name: "Indian Rupee",      symbol: "₹",   flag: "🇮🇳" },
  { code: "USD", name: "US Dollar",         symbol: "$",   flag: "🇺🇸" },
  { code: "EUR", name: "Euro",              symbol: "€",   flag: "🇪🇺" },
  { code: "GBP", name: "British Pound",     symbol: "£",   flag: "🇬🇧" },
  { code: "AED", name: "UAE Dirham",        symbol: "AED", flag: "🇦🇪" },
  { code: "SGD", name: "Singapore Dollar",  symbol: "S$",  flag: "🇸🇬" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$",  flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar",   symbol: "C$",  flag: "🇨🇦" },
  { code: "JPY", name: "Japanese Yen",      symbol: "¥",   flag: "🇯🇵" },
  { code: "HKD", name: "Hong Kong Dollar",  symbol: "HK$", flag: "🇭🇰" },
  { code: "CHF", name: "Swiss Franc",       symbol: "CHF", flag: "🇨🇭" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM",  flag: "🇲🇾" },
  { code: "SAR", name: "Saudi Riyal",       symbol: "SAR", flag: "🇸🇦" },
  { code: "QAR", name: "Qatari Riyal",      symbol: "QAR", flag: "🇶🇦" },
] as const;
type CurrencyCode = typeof CURRENCIES[number]["code"];

/* ─── Countries ───────────────────────────────────────────────────── */
const COUNTRIES = [
  { code: "IN", name: "India",          flag: "🇮🇳" },
  { code: "US", name: "United States",  flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AE", name: "UAE",            flag: "🇦🇪" },
  { code: "SG", name: "Singapore",      flag: "🇸🇬" },
  { code: "AU", name: "Australia",      flag: "🇦🇺" },
  { code: "CA", name: "Canada",         flag: "🇨🇦" },
  { code: "JP", name: "Japan",          flag: "🇯🇵" },
  { code: "DE", name: "Germany",        flag: "🇩🇪" },
  { code: "FR", name: "France",         flag: "🇫🇷" },
  { code: "NL", name: "Netherlands",    flag: "🇳🇱" },
  { code: "CH", name: "Switzerland",    flag: "🇨🇭" },
  { code: "HK", name: "Hong Kong",      flag: "🇭🇰" },
  { code: "MY", name: "Malaysia",       flag: "🇲🇾" },
  { code: "TH", name: "Thailand",       flag: "🇹🇭" },
  { code: "SA", name: "Saudi Arabia",   flag: "🇸🇦" },
  { code: "QA", name: "Qatar",          flag: "🇶🇦" },
  { code: "KW", name: "Kuwait",         flag: "🇰🇼" },
  { code: "PH", name: "Philippines",    flag: "🇵🇭" },
  { code: "ID", name: "Indonesia",      flag: "🇮🇩" },
];

type Sheet = "none" | "currency" | "country";

/* ─── Sub-components ──────────────────────────────────────────────── */
function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <p className="text-[12px] font-medium text-muted-foreground mb-1.5">
      {text}{required && <span className="text-red-500 ml-0.5">*</span>}
    </p>
  );
}

function SectionHeader({
  icon: Icon, iconBg, iconColor, label, expanded, onToggle,
}: {
  icon: ElementType; iconBg: string; iconColor: string;
  label: string; expanded: boolean; onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3.5"
    >
      <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        <Icon className={cn("h-[15px] w-[15px]", iconColor)} strokeWidth={2} />
      </div>
      <p className="flex-1 text-[15px] font-bold text-foreground">{label}</p>
      <ChevronDown
        className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
          expanded && "rotate-180"
        )}
        strokeWidth={2}
      />
    </button>
  );
}

/* ─── Props ───────────────────────────────────────────────────────── */
interface Props { open: boolean; onClose: () => void; contained?: boolean; }

/* ─── Component ───────────────────────────────────────────────────── */
export function MobileCreateMcaLink({ open, onClose, contained = false }: Props) {
  const pos = contained ? "absolute" : "fixed";

  const [sheet,           setSheet]           = useState<Sheet>("none");
  const [showPreview,     setShowPreview]     = useState(false);
  const [payOpen,         setPayOpen]         = useState(true);
  const [custOpen,        setCustOpen]        = useState(false);

  const [currency,        setCurrency]        = useState<CurrencyCode>("INR");
  const [amount,          setAmount]          = useState("");
  const [invoiceNo,       setInvoiceNo]       = useState("");
  const [productDesc,     setProductDesc]     = useState("");
  const [fullName,        setFullName]        = useState("");
  const [email,           setEmail]           = useState("");
  const [customerCountry, setCustomerCountry] = useState("");

  const [currencySearch,  setCurrencySearch]  = useState("");
  const [countrySearch,   setCountrySearch]   = useState("");
  const [attempted,       setAttempted]       = useState(false);

  const filteredCurrencies = useMemo(() =>
    CURRENCIES.filter(c =>
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.name.toLowerCase().includes(currencySearch.toLowerCase())
    ), [currencySearch]);

  const filteredCountries = useMemo(() =>
    COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
    ), [countrySearch]);

  const selectedCurrency = CURRENCIES.find(c => c.code === currency);
  const selectedCountry  = COUNTRIES.find(c => c.code === customerCountry);

  const payFieldErrors = {
    amount:      attempted && !amount.trim(),
    invoiceNo:   attempted && !invoiceNo.trim(),
    productDesc: attempted && !productDesc.trim(),
  };
  const custFieldErrors = {
    fullName: attempted && !fullName.trim(),
    email:    attempted && !email.trim(),
    country:  attempted && !customerCountry,
  };

  const hasPayErrors  = Object.values(payFieldErrors).some(Boolean);
  const hasCustErrors = Object.values(custFieldErrors).some(Boolean);

  const handleCreate = () => {
    setAttempted(true);
    const payValid  = amount.trim() && invoiceNo.trim() && productDesc.trim();
    const custValid = fullName.trim() && email.trim() && customerCountry;
    if (!payValid)  { setPayOpen(true);  return; }
    if (!custValid) { setCustOpen(true); return; }
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSheet("none"); setShowPreview(false);
      setPayOpen(true); setCustOpen(false);
      setCurrency("INR"); setAmount(""); setInvoiceNo(""); setProductDesc("");
      setFullName(""); setEmail(""); setCustomerCountry("");
      setCurrencySearch(""); setCountrySearch("");
      setAttempted(false);
    }, 350);
  };

  /* ─── Bottom sheet helper ─────────────────────────────────────────── */
  function BottomSheet({
    sheetKey, title, onDismiss, children,
  }: { sheetKey: string; title: string; onDismiss: () => void; children: React.ReactNode }) {
    return (
      <>
        <motion.div key={`${sheetKey}-bd`}
          className="absolute inset-0 z-10 bg-black/35 rounded-t-[24px]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onDismiss}
        />
        <motion.div key={`${sheetKey}-sheet`}
          className="absolute inset-x-0 bottom-0 z-20 flex flex-col bg-background rounded-t-[24px] overflow-hidden"
          style={{ top: contained ? "72px" : "80px" }}
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden>
            <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
          </div>
          <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-border/50 shrink-0">
            <h2 className="text-[17px] font-bold text-foreground">{title}</h2>
            <button type="button" onClick={onDismiss}
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          {children}
        </motion.div>
      </>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mca-create-bd"
            className={`${pos} inset-0 z-50`}
            style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleClose}
          />

          {/* Main sheet */}
          <motion.div
            key="mca-create-sheet"
            className={`${pos} inset-x-0 bottom-0 z-[51] flex flex-col bg-background overflow-hidden`}
            style={{
              height: contained ? "93%" : "100dvh",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >

            {/* Currency picker sheet */}
            <AnimatePresence>
              {sheet === "currency" && (
                <BottomSheet
                  sheetKey="currency"
                  title="Select Currency"
                  onDismiss={() => { setSheet("none"); setCurrencySearch(""); }}
                >
                  <div className="px-4 py-3 shrink-0">
                    <div className="flex items-center gap-2.5 bg-muted rounded-xl px-3.5 py-2.5">
                      <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} />
                      <input type="text" value={currencySearch} onChange={e => setCurrencySearch(e.target.value)}
                        placeholder="Search currencies"
                        className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {filteredCurrencies.map((c, i) => (
                      <button key={c.code} type="button"
                        onClick={() => { setCurrency(c.code); setSheet("none"); setCurrencySearch(""); }}
                        className={cn(
                          "w-full flex items-center justify-between px-5 py-4 text-left transition-colors active:bg-muted/50",
                          i > 0 && "border-t border-border/40"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-[20px]">{c.flag}</span>
                          <span>
                            <span className="text-[14px] font-semibold text-foreground">{c.code}</span>
                            <span className="text-[14px] text-muted-foreground ml-2">— {c.name}</span>
                          </span>
                        </span>
                        {currency === c.code && <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2.5} />}
                      </button>
                    ))}
                  </div>
                </BottomSheet>
              )}
            </AnimatePresence>

            {/* Country picker sheet */}
            <AnimatePresence>
              {sheet === "country" && (
                <BottomSheet
                  sheetKey="country"
                  title="Select Country"
                  onDismiss={() => { setSheet("none"); setCountrySearch(""); }}
                >
                  <div className="px-4 py-3 shrink-0">
                    <div className="flex items-center gap-2.5 bg-muted rounded-xl px-3.5 py-2.5">
                      <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} />
                      <input type="text" value={countrySearch} onChange={e => setCountrySearch(e.target.value)}
                        placeholder="Search countries"
                        className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {filteredCountries.map((c, i) => (
                      <button key={c.code} type="button"
                        onClick={() => { setCustomerCountry(c.code); setSheet("none"); setCountrySearch(""); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-5 py-4 text-left transition-colors active:bg-muted/50",
                          i > 0 && "border-t border-border/40"
                        )}
                      >
                        <span className="text-[20px]">{c.flag}</span>
                        <span className="flex-1 text-[14px] font-medium text-foreground">{c.name}</span>
                        {customerCountry === c.code && <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2.5} />}
                      </button>
                    ))}
                  </div>
                </BottomSheet>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 pt-5 pb-3 shrink-0 border-b border-border/30">
              <div className="min-w-0">
                <p className="text-[15px] font-normal text-muted-foreground leading-none">Create MCA link</p>
              </div>
              <button type="button" onClick={handleClose}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {/* Scrollable form */}
            <div
              className="flex-1 overflow-y-auto pb-[96px] [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >

              {/* Section 1 — Payment Details */}
              <div className="mx-4 mt-4 bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <SectionHeader
                  icon={Receipt} iconBg="bg-primary/10" iconColor="text-primary"
                  label="Payment Details"
                  expanded={payOpen}
                  onToggle={() => setPayOpen(p => !p)}
                />
                <AnimatePresence initial={false}>
                  {payOpen && (
                    <motion.div key="pay-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/40">

                        {/* Payment Amount — currency + amount side by side */}
                        <div>
                          <FieldLabel text="Payment Amount" required />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSheet("currency")}
                              className="flex items-center gap-1.5 rounded-xl border border-border bg-[#f6f8fa] px-3 py-2.5 shrink-0"
                              style={{ width: "40%" }}
                            >
                              <span className="text-[15px] leading-none">{selectedCurrency?.flag}</span>
                              <span className="text-[13px] font-medium text-foreground">{selectedCurrency?.symbol} {currency}</span>
                              <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto shrink-0" strokeWidth={2} />
                            </button>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={amount}
                              onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                              placeholder="0.00"
                              className={cn(
                                "flex-1 min-w-0 rounded-xl border bg-[#f6f8fa] px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow",
                                payFieldErrors.amount ? "border-red-400" : "border-border"
                              )}
                            />
                          </div>
                          {payFieldErrors.amount && (
                            <p className="text-[11px] text-red-500 mt-1">Amount is required</p>
                          )}
                        </div>

                        {/* Invoice No. */}
                        <div>
                          <FieldLabel text="Invoice No." required />
                          <input
                            type="text"
                            value={invoiceNo}
                            onChange={e => setInvoiceNo(e.target.value)}
                            placeholder="Eg. INV-12345"
                            className={cn(
                              "w-full rounded-xl border bg-[#f6f8fa] px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow",
                              payFieldErrors.invoiceNo ? "border-red-400" : "border-border"
                            )}
                          />
                          {payFieldErrors.invoiceNo && (
                            <p className="text-[11px] text-red-500 mt-1">Invoice number is required</p>
                          )}
                        </div>

                        {/* Product Description */}
                        <div>
                          <FieldLabel text="Product Description" required />
                          <input
                            type="text"
                            value={productDesc}
                            onChange={e => setProductDesc(e.target.value)}
                            placeholder="Eg. Payment for freelancer services"
                            className={cn(
                              "w-full rounded-xl border bg-[#f6f8fa] px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow",
                              payFieldErrors.productDesc ? "border-red-400" : "border-border"
                            )}
                          />
                          {payFieldErrors.productDesc && (
                            <p className="text-[11px] text-red-500 mt-1">Product description is required</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section 2 — Customer Details */}
              <div className="mx-4 mt-3 mb-4 bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <SectionHeader
                  icon={Users} iconBg="bg-primary/10" iconColor="text-primary"
                  label="Customer Details"
                  expanded={custOpen}
                  onToggle={() => setCustOpen(p => !p)}
                />
                <AnimatePresence initial={false}>
                  {custOpen && (
                    <motion.div key="cust-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/40">

                        {/* Full Name */}
                        <div>
                          <FieldLabel text="Full Name" required />
                          <input
                            type="text"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="Eg. John Doe"
                            className={cn(
                              "w-full rounded-xl border bg-[#f6f8fa] px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow",
                              custFieldErrors.fullName ? "border-red-400" : "border-border"
                            )}
                          />
                          {custFieldErrors.fullName && (
                            <p className="text-[11px] text-red-500 mt-1">Full name is required</p>
                          )}
                        </div>

                        {/* Email ID */}
                        <div>
                          <FieldLabel text="Email ID" required />
                          <input
                            type="email"
                            inputMode="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Eg. john.doe@example.com"
                            className={cn(
                              "w-full rounded-xl border bg-[#f6f8fa] px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow",
                              custFieldErrors.email ? "border-red-400" : "border-border"
                            )}
                          />
                          {custFieldErrors.email && (
                            <p className="text-[11px] text-red-500 mt-1">Email is required</p>
                          )}
                        </div>

                        {/* Customer Country */}
                        <div>
                          <FieldLabel text="Customer Country" required />
                          <button
                            type="button"
                            onClick={() => setSheet("country")}
                            className={cn(
                              "w-full flex items-center justify-between rounded-xl border bg-[#f6f8fa] px-3.5 py-2.5 text-[13.5px] text-left",
                              custFieldErrors.country ? "border-red-400" : "border-border"
                            )}
                          >
                            {selectedCountry ? (
                              <span className="flex items-center gap-2.5">
                                <span className="text-[18px]">{selectedCountry.flag}</span>
                                <span className="text-foreground">{selectedCountry.name}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Select Country</span>
                            )}
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
                          </button>
                          {custFieldErrors.country && (
                            <p className="text-[11px] text-red-500 mt-1">Country is required</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Fixed bottom bar */}
            <div className="absolute inset-x-0 bottom-0 px-4 pt-3 shrink-0 bg-background border-t border-border/40">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-1.5 h-11 px-4 rounded-2xl border border-border bg-background text-[13px] font-medium text-foreground active:bg-muted/20 transition-colors shrink-0"
                >
                  <Eye className="h-[14px] w-[14px]" strokeWidth={2} />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-primary text-primary-foreground text-[14px] font-bold shadow-sm active:scale-[0.98] transition-all"
                >
                  Create MCA link
                  <Check className="h-[14px] w-[14px]" strokeWidth={2.5} />
                </button>
              </div>
              <div style={{ height: "env(safe-area-inset-bottom)", minHeight: 8 }} />
            </div>

            {/* ── MCA Link Preview overlay (stacked on top, form preserved) ── */}
            <AnimatePresence>
              {showPreview && (
                <>
                  <motion.div
                    key="mca-preview-bd"
                    className="absolute inset-0 z-30"
                    style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.div
                    key="mca-preview-sheet"
                    className="absolute inset-x-0 bottom-0 z-40 flex flex-col bg-background rounded-t-[24px] overflow-hidden"
                    style={{ top: 0 }}
                    initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                    transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                  >
                    {/* Preview header */}
                    <div className="flex items-center justify-between gap-3 px-4 pt-5 pb-3 shrink-0 border-b border-border/30">
                      <div className="min-w-0">
                        <p className="text-[15px] font-normal text-muted-foreground leading-none">MCA link preview</p>
                      </div>
                      <button type="button" onClick={handleClose}
                        className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0"
                      >
                        <X className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>

                    {/* Scrollable preview content */}
                    <div className="flex-1 overflow-y-auto pb-[80px] [&::-webkit-scrollbar]:hidden p-4" style={{ scrollbarWidth: "none" }}>
                      {/* Paper card — matches Invoice Preview card style */}
                      <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}>

                        {/* Block 1 — Header row (light blue tint, matches Invoice Preview) */}
                        <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4" style={{ background: "rgba(59,130,246,0.06)" }}>
                          <div className="flex flex-col items-start gap-0.5">
                            <p className="text-[22px] font-bold text-foreground leading-none mb-2">MCA link</p>
                            <p className="text-[9.5px] text-muted-foreground leading-none">Transaction ID</p>
                            <p className="text-[11px] font-semibold text-foreground leading-snug">6DHSETFS83493</p>
                          </div>
                          <div className="flex flex-col items-end gap-2.5">
                            <div className="h-[48px] w-[48px] rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              <Image src="/PG-logo.svg" alt="PayGlocal" width={32} height={32} className="h-8 w-8 object-contain" />
                            </div>
                            <p className="text-[11.5px] font-bold text-foreground leading-snug max-w-[100px] text-right">
                              PayGlocal Technologies
                            </p>
                          </div>
                        </div>

                        {/* Block 2 — Amount band */}
                        <div className="px-4 py-3 border-b border-border/30">
                          <div className="rounded-[10px] px-4 py-3 flex items-center justify-between" style={{ background: "#2D3142" }}>
                            <p className="text-[13px] text-white/60">Total amount</p>
                            <p className="text-[18px] font-semibold text-white tabular-nums">
                              {currency} {amount ? parseFloat(amount).toFixed(2) : "0.00"}
                            </p>
                          </div>
                        </div>

                        {/* Block 3 — Complete your transaction */}
                        <div className="px-5 py-4 border-b border-border/30">
                          <p className="text-[12px] font-bold text-foreground mb-1.5">Complete your transaction</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Use the below bank details to initiate a bank transfer request. Please use the correct bank account and details.
                          </p>
                        </div>

                        {/* Block 4 — Receiving account section header (matches Invoice column header) */}
                        <div className="flex items-center gap-1 px-3 py-2 border-b border-border/30" style={{ background: "rgba(59,130,246,0.04)" }}>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide flex-1 min-w-0">
                            Receiving Account
                          </p>
                        </div>

                        {/* Block 4 — Account field rows (matches Invoice line item row style) */}
                        {[
                          { label: "Account holder name", value: "PayGlocal Technologies" },
                          { label: "Bank name",            value: "Chase Bank" },
                          { label: "ACH routing number",   value: "021000021" },
                          { label: "Account number",       value: "••••5678" },
                          { label: "Bank address",         value: "270 Park Ave, New York" },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between px-3 py-2.5 border-b border-border/20">
                            <p className="text-[11px] text-muted-foreground">{row.label}</p>
                            <p className="text-[11px] text-foreground tabular-nums text-right">{row.value}</p>
                          </div>
                        ))}

                        {/* Block 5 + 6 — Summary + Amount Due (matches Invoice totals section) */}
                        <div className="px-5 py-4 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-muted-foreground">Product description</p>
                            <p className="text-[11px] text-foreground tabular-nums">{productDesc || "—"}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-muted-foreground">Invoice no.</p>
                            <p className="text-[11px] text-foreground tabular-nums">{invoiceNo || "—"}</p>
                          </div>
                          <div className="border-t border-border/40 my-1" />
                          <div className="flex items-center justify-between">
                            <p className="text-[13px] font-bold text-foreground">Amount due</p>
                            <p className="text-[13px] font-bold text-foreground tabular-nums">
                              {currency} {amount ? parseFloat(amount).toFixed(2) : "0.00"}
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Preview bottom bar — Back to editing */}
                    <div className="absolute inset-x-0 bottom-0 px-4 pt-3 bg-background border-t border-border/40">
                      <button
                        type="button"
                        onClick={() => setShowPreview(false)}
                        className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl border border-border bg-background text-[14px] font-semibold text-foreground active:bg-muted/20 transition-colors"
                      >
                        <ArrowLeft className="h-[15px] w-[15px]" strokeWidth={2} />
                        Back to editing
                      </button>
                      <div style={{ height: "env(safe-area-inset-bottom)", minHeight: 8 }} />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
