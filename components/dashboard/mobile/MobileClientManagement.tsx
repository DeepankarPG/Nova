"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Search, Plus, X, Download, ChevronDown, Check, Loader2, Copy, FileText, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─── Types ───────────────────────────────────────────────────────── */
type BusinessClient = {
  id: string;
  businessName: string;
  primaryContactName: string;
  email: string;
  phone: string;
  country: string;
  countryFlag: string;
  currency: string;
  totalReceived: number;
  createdAt: string;
  billingAddress: string;
};

type ClientTxnStatus = "sent-for-review" | "invoice-pending" | "settled";

type ClientTransaction = {
  id: string;
  amount: number;
  currency: string;
  status: ClientTxnStatus;
  dateTime: string;
  country: string;
  countryFlag: string;
  remitterName: string;
};

/* ─── Mock data ───────────────────────────────────────────────────── */
const CLIENTS: BusinessClient[] = [
  { id: "biz_001", businessName: "Northwind Trading Co.",    primaryContactName: "Amelia Hartley",    email: "amelia.hartley@northwindtrading.co.uk", phone: "+44 791 112 3456",  country: "United Kingdom",      countryFlag: "🇬🇧", currency: "GBP", totalReceived: 53149.99,  createdAt: "2024-11-04", billingAddress: "Unit 7, Chancery House, 53-64 Chancery Lane, London WC2A 1QS, United Kingdom" },
  { id: "biz_002", businessName: "Meridian Logistics LLC",   primaryContactName: "Daniel Okafor",     email: "d.okafor@meridianlogistics.com",        phone: "+1 415 555 0142",   country: "United States",       countryFlag: "🇺🇸", currency: "USD", totalReceived: 132500.00, createdAt: "2024-08-19", billingAddress: "500 Market St, Suite 1200, San Francisco, CA 94105, United States" },
  { id: "biz_003", businessName: "Kessler Maschinenbau GmbH",primaryContactName: "Lena Fischer",      email: "l.fischer@kesslerbau.de",               phone: "+49 151 123 45678", country: "Germany",             countryFlag: "🇩🇪", currency: "EUR", totalReceived: 22350.00,  createdAt: "2025-02-27", billingAddress: "Industriestrasse 14, 70565 Stuttgart, Germany" },
  { id: "biz_004", businessName: "Harbourline Freight Pte Ltd", primaryContactName: "Wei Ling Tan",   email: "weiling.tan@harbourline.sg",            phone: "+65 812 34567",     country: "Singapore",           countryFlag: "🇸🇬", currency: "SGD", totalReceived: 11320.25,  createdAt: "2025-06-03", billingAddress: "1 Marina Blvd, #20-01, Singapore 018989" },
  { id: "biz_005", businessName: "Bluegum Interiors",        primaryContactName: "Chloe Barrett",     email: "chloe.barrett@bluegum.com.au",          phone: "+61 412 345 678",   country: "Australia",           countryFlag: "🇦🇺", currency: "AUD", totalReceived: 10580.00,  createdAt: "2025-01-17", billingAddress: "88 York St, Sydney NSW 2000, Australia" },
  { id: "biz_006", businessName: "Al Noor General Trading",  primaryContactName: "Fatima Al Zaabi",   email: "fatima.z@alnoortrading.ae",             phone: "+971 501 234 567",  country: "United Arab Emirates",countryFlag: "🇦🇪", currency: "AED", totalReceived: 142600.00, createdAt: "2024-09-30", billingAddress: "Sheikh Zayed Rd, Business Bay, Dubai, United Arab Emirates" },
  { id: "biz_007", businessName: "Maple & Birch Studio",     primaryContactName: "Owen Tremblay",     email: "owen.tremblay@maplebirch.ca",           phone: "+1 613 555 0188",   country: "Canada",              countryFlag: "🇨🇦", currency: "CAD", totalReceived: 15380.00,  createdAt: "2025-04-08", billingAddress: "220 Sparks St, Ottawa, ON K1P 5V5, Canada" },
  { id: "biz_008", businessName: "Atelier Rousseau SARL",    primaryContactName: "Camille Rousseau",  email: "camille.rousseau@atelier.fr",           phone: "+33 612 345 678",   country: "France",              countryFlag: "🇫🇷", currency: "EUR", totalReceived: 17960.00,  createdAt: "2024-07-22", billingAddress: "12 Rue de Rivoli, 75004 Paris, France" },
  { id: "biz_009", businessName: "Kiyomizu Craft KK",        primaryContactName: "Haruto Nakamura",   email: "h.nakamura@kiyomizucraft.jp",           phone: "+81 901 234 5678",  country: "Japan",               countryFlag: "🇯🇵", currency: "USD", totalReceived: 59250.00,  createdAt: "2025-05-29", billingAddress: "2-1 Gion-machi, Higashiyama-ku, Kyoto 605-0073, Japan" },
  { id: "biz_010", businessName: "Vaalpark Agri Holdings",   primaryContactName: "Thandiwe Mokoena",  email: "thandiwe.m@vaalparkagri.co.za",         phone: "+27 821 234 567",   country: "South Africa",        countryFlag: "🇿🇦", currency: "USD", totalReceived: 34700.00,  createdAt: "2024-12-11", billingAddress: "45 Bree St, Cape Town 8001, South Africa" },
];

const CLIENT_TXN_STATUS_CFG: Record<ClientTxnStatus, { label: string; text: string; bg: string; dot: string }> = {
  "sent-for-review": { label: "Sent for Review", text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/40",   dot: "bg-amber-500"  },
  "invoice-pending": { label: "Invoice Pending",  text: "text-orange-700 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-950/40", dot: "bg-orange-500" },
  settled:           { label: "Settled",          text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", dot: "bg-emerald-500" },
};

const CLIENT_TRANSACTIONS: Record<string, ClientTransaction[]> = {
  biz_001: [
    { id: "ctx_1", amount: 4310.00,  currency: "GBP", status: "sent-for-review", dateTime: "21 Jul '26 · 08:52 AM", country: "United Kingdom", countryFlag: "🇬🇧", remitterName: "Northwind Trading Co." },
    { id: "ctx_2", amount: 12600.00, currency: "GBP", status: "sent-for-review", dateTime: "3 Jul '26 · 11:27 AM",  country: "United Kingdom", countryFlag: "🇬🇧", remitterName: "Northwind Trading Co." },
    { id: "ctx_3", amount: 9250.50,  currency: "GBP", status: "invoice-pending", dateTime: "28 Jun '26 · 02:41 PM", country: "United Kingdom", countryFlag: "🇬🇧", remitterName: "Northwind Trading Co." },
    { id: "ctx_4", amount: 18400.00, currency: "GBP", status: "settled",         dateTime: "12 Jun '26 · 09:14 AM", country: "United Kingdom", countryFlag: "🇬🇧", remitterName: "Northwind Trading Co." },
    { id: "ctx_5", amount: 7999.99,  currency: "GBP", status: "settled",         dateTime: "19 May '26 · 04:03 PM", country: "United Kingdom", countryFlag: "🇬🇧", remitterName: "Northwind Trading Co." },
    { id: "ctx_6", amount: 26750.00, currency: "GBP", status: "settled",         dateTime: "2 May '26 · 10:02 AM",  country: "United Kingdom", countryFlag: "🇬🇧", remitterName: "Northwind Trading Co." },
  ],
};

function defaultTxnsFor(client: BusinessClient): ClientTransaction[] {
  return CLIENT_TRANSACTIONS[client.id] ?? [
    { id: `${client.id}_t1`, amount: +(client.totalReceived * 0.6).toFixed(2), currency: client.currency, status: "settled",         dateTime: "14 Jun '26 · 10:20 AM", country: client.country, countryFlag: client.countryFlag, remitterName: client.businessName },
    { id: `${client.id}_t2`, amount: +(client.totalReceived * 0.4).toFixed(2), currency: client.currency, status: "sent-for-review", dateTime: "2 Jun '26 · 03:10 PM",  country: client.country, countryFlag: client.countryFlag, remitterName: client.businessName },
  ];
}

const COUNTRY_OPTIONS = Array.from(new Set(CLIENTS.map(c => c.country))).sort();
const COUNTRY_CODES = ["+1", "+44", "+49", "+33", "+65", "+61", "+971", "+81", "+27", "+91"];

type BusinessType = "company" | "partnership" | "sole-proprietorship" | "llp" | "other";

const BUSINESS_TYPES: { id: BusinessType; label: string }[] = [
  { id: "company",              label: "Company"              },
  { id: "partnership",          label: "Partnership"          },
  { id: "sole-proprietorship",  label: "Sole proprietorship"  },
  { id: "llp",                  label: "LLP"                  },
  { id: "other",                label: "Other"                },
];

interface NewClientInput {
  businessName:          string;
  businessType:          BusinessType | null;
  website:                string;
  primaryContactName:    string;
  primaryContactEmail:   string;
  contactCode:            string;
  primaryContactNumber:  string;
  country:                string;
  address:                string;
  city:                   string;
  state:                  string;
  zipcode:                string;
  gstin:                  string;
  notes:                  string;
}

function emptyNewClient(): NewClientInput {
  return {
    businessName: "", businessType: null, website: "",
    primaryContactName: "", primaryContactEmail: "", contactCode: "+1", primaryContactNumber: "",
    country: "", address: "", city: "", state: "", zipcode: "",
    gstin: "", notes: "",
  };
}

function clientToFormInput(client: BusinessClient): NewClientInput {
  const [code, ...rest] = client.phone.split(" ");
  return {
    businessName: client.businessName, businessType: "company", website: "",
    primaryContactName: client.primaryContactName, primaryContactEmail: client.email,
    contactCode: COUNTRY_CODES.includes(code) ? code : "+1", primaryContactNumber: rest.join(" "),
    country: client.country, address: client.billingAddress, city: "", state: "", zipcode: "",
    gstin: "", notes: "",
  };
}

const REQUIRED_FIELDS = [
  "businessName", "businessType", "primaryContactName", "primaryContactEmail",
  "primaryContactNumber", "country", "address", "city", "state", "zipcode",
] as const;

function isFieldMissing(form: NewClientInput, field: string): boolean {
  switch (field) {
    case "businessName":          return !form.businessName.trim();
    case "businessType":          return form.businessType === null;
    case "primaryContactName":    return !form.primaryContactName.trim();
    case "primaryContactEmail":   return !form.primaryContactEmail.trim();
    case "primaryContactNumber":  return !form.primaryContactNumber.trim();
    case "country":                return !form.country.trim();
    case "address":                return !form.address.trim();
    case "city":                   return !form.city.trim();
    case "state":                  return !form.state.trim();
    case "zipcode":                return !form.zipcode.trim();
    default: return false;
  }
}

/* ─── Helpers ─────────────────────────────────────────────────────── */
function fmtAmount(amount: number, currency: string) {
  const sym: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", SGD: "S$", AUD: "A$", AED: "AED ", CAD: "C$" };
  const prefix = sym[currency] ?? "";
  return prefix + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "2-digit" });
}

/* ─── Shared small components — match MobileTransactionDetail conventions ── */
function VDivider() {
  return <span className="inline-block w-px bg-border/50 shrink-0 self-center" style={{ height: 11 }} aria-hidden />;
}

function CopyBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).catch(() => {});
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }
  return (
    <button type="button" onClick={copy}
      className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground"
      aria-label="Copy">
      {done
        ? <Check className="h-[13px] w-[13px] text-emerald-600" strokeWidth={2.5} />
        : <Copy  className="h-[13px] w-[13px]" strokeWidth={2} />}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.09em] px-4 mb-2">
      {children}
    </p>
  );
}

function DetailRow({ label, value, copy, last }: {
  label: string; value: React.ReactNode; copy?: string; last?: boolean;
}) {
  return (
    <div className={cn("px-4 py-3.5", !last && "border-b border-border/50")}>
      <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">{label}</p>
      <div className="inline-flex items-center gap-1 max-w-full min-w-0">
        <div className="min-w-0">
          {typeof value === "string"
            ? <p className="text-[13px] font-medium text-foreground leading-snug">{value}</p>
            : value}
        </div>
        {copy && <CopyBtn value={copy} />}
      </div>
    </div>
  );
}

function FieldLabel({ text }: { text: string }) {
  return <p className="text-[12px] font-semibold text-muted-foreground mb-1.5">{text}</p>;
}

function FormField({
  label, value, onChange, onBlur, placeholder, error, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  onBlur?: () => void; placeholder?: string; error?: string; type?: string;
}) {
  return (
    <div>
      <FieldLabel text={label} />
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border bg-[#f6f8fa] px-3.5 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors",
          error ? "border-red-400" : "border-border"
        )}
      />
      {error && <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function SelectDropdown({ value, placeholder, options, onChange }: {
  value: string; placeholder: string; options: string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-3 text-left"
      >
        <span className={cn("text-[14px] truncate", value ? "text-foreground font-medium" : "text-muted-foreground/60")}>
          {value || placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} strokeWidth={2} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[95]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1.5 z-[96] rounded-xl border border-border bg-card shadow-lg overflow-hidden overflow-y-auto" style={{ maxHeight: 220 }}>
            {options.map((opt) => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-left text-[13px] transition-colors hover:bg-muted",
                  value === opt ? "text-primary font-semibold" : "text-foreground font-medium"
                )}
              >
                {opt}
                {value === opt && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Swipe-to-reveal row action (Edit) ─────────────────────────────── */
const SWIPE_WIDTH = 84;

function SwipeCard({ isOpen, onOpen, onClose, onEdit, children }: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  const [dragX,      setDragX]      = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX     = useRef(0);
  const startY     = useRef(0);
  const gestureDir = useRef<"h" | "v" | null>(null);
  const didMove    = useRef(false);

  const baseX      = isOpen ? -SWIPE_WIDTH : 0;
  const translateX = isDragging
    ? Math.max(-SWIPE_WIDTH, Math.min(0, baseX + dragX))
    : baseX;

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    startX.current     = e.clientX;
    startY.current     = e.clientY;
    gestureDir.current = null;
    didMove.current    = false;
    setDragX(0);
    setIsDragging(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (!gestureDir.current) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      didMove.current    = true;
      gestureDir.current = Math.abs(dx) >= Math.abs(dy) * 2 ? "h" : "v";
      if (gestureDir.current === "v") { setIsDragging(false); return; }
    }
    if (gestureDir.current === "h") setDragX(dx);
  }

  function onPointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    if (!didMove.current) {
      setDragX(0);
      if (isOpen) onClose();
      return;
    }
    const finalX = Math.max(-SWIPE_WIDTH, Math.min(0, baseX + dragX));
    setDragX(0);
    if (isOpen) {
      if (finalX > -(SWIPE_WIDTH * 0.5)) onClose(); else onOpen();
    } else {
      if (finalX < -(SWIPE_WIDTH * 0.3)) onOpen(); else onClose();
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Action button — fixed behind the row */}
      <div className="absolute right-0 top-0 bottom-0 flex" style={{ width: SWIPE_WIDTH }}>
        <button type="button" onClick={onEdit}
          className="flex flex-col items-center justify-center flex-1 bg-amber-500"
        >
          <Pencil className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          <span className="text-[11px] font-medium text-white mt-1">Edit</span>
        </button>
      </div>

      {/* Row content — slides left on swipe */}
      <div
        className="relative z-[1] bg-card"
        style={{
          transform:   `translateX(${translateX}px)`,
          transition:  isDragging ? "none" : "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
          touchAction: "pan-y",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Client Detail — bottom sheet ──────────────────────────────────── */
function ClientDetail({ client, onClose, onTxnLinkTap }: {
  client: BusinessClient;
  onClose: () => void;
  onTxnLinkTap?: () => void;
}) {
  const txns = defaultTxnsFor(client);
  const settled = txns.filter(t => t.status === "settled");
  const outstanding = txns.filter(t => t.status !== "settled");
  const paidTotal = settled.reduce((s, t) => s + t.amount, 0);
  const outstandingTotal = outstanding.reduce((s, t) => s + t.amount, 0);

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-11 flex flex-col bg-[#f6f8fa] overflow-hidden"
      style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%" }}
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-2.5 pb-0.5 shrink-0">
        <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/60 bg-background shrink-0">
        <div className="min-w-0 flex items-center gap-2">
          <span className="text-[16px] leading-none shrink-0">{client.countryFlag}</span>
          <p className="text-[15px] font-bold text-foreground truncate">{client.businessName}</p>
        </div>
        <button type="button" onClick={onClose}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-foreground shrink-0"
          aria-label="Close">
          <X className="h-[17px] w-[17px]" strokeWidth={2.25} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col gap-5 pt-4 pb-10">

          {/* Summary card */}
          <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm px-4 py-4">
            <p className="text-[12px] text-muted-foreground">{client.countryFlag} {client.country}</p>
            <p className="text-[19px] font-bold text-foreground mt-1 leading-tight">{client.businessName}</p>
            <p className="text-[12.5px] font-semibold text-foreground mt-2">{client.primaryContactName}</p>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <span className="text-[12px] text-muted-foreground whitespace-nowrap">{client.phone}</span>
              <VDivider />
              <span className="text-[12px] text-muted-foreground truncate">{client.email}</span>
            </div>
          </div>

          {/* Invoice Summary */}
          <div>
            <SectionLabel>Invoice Summary</SectionLabel>
            <div className="mx-4 grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3">
                <p className="text-[10.5px] font-medium text-muted-foreground mb-1.5 leading-tight">Total invoices</p>
                <p className="text-[18px] font-bold text-foreground tabular-nums leading-tight">{txns.length}</p>
                <p className="text-[10.5px] text-muted-foreground mt-1 truncate">{fmtAmount(paidTotal + outstandingTotal, client.currency)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3">
                <p className="text-[10.5px] font-medium text-muted-foreground mb-1.5 leading-tight">Paid invoices</p>
                <p className="text-[18px] font-bold text-emerald-700 tabular-nums leading-tight">{settled.length}</p>
                <p className="text-[10.5px] text-muted-foreground mt-1 truncate">{fmtAmount(paidTotal, client.currency)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3">
                <p className="text-[10.5px] font-medium text-muted-foreground mb-1.5 leading-tight">Outstanding</p>
                <p className="text-[18px] font-bold text-amber-700 tabular-nums leading-tight">{outstanding.length}</p>
                <p className="text-[10.5px] text-muted-foreground mt-1 truncate">{fmtAmount(outstandingTotal, client.currency)}</p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div>
            <SectionLabel>Transactions</SectionLabel>
            <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden divide-y divide-border/50">
              {txns.map((t) => {
                const cfg = CLIENT_TXN_STATUS_CFG[t.status];
                return (
                  <button key={t.id} type="button" onClick={onTxnLinkTap}
                    className="w-full px-4 py-3.5 text-left active:bg-muted/30 transition-colors duration-100"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-bold text-foreground tabular-nums">{fmtAmount(t.amount, t.currency)}</span>
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold shrink-0", cfg.text, cfg.bg)}>
                        <span className={cn("h-[4px] w-[4px] rounded-full shrink-0", cfg.dot)} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-1">{t.dateTime}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[13px] leading-none">{t.countryFlag}</span>
                      <span className="text-[11.5px] text-muted-foreground">{t.country}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div>
            <SectionLabel>Contact</SectionLabel>
            <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <DetailRow label="Primary contact"  value={client.primaryContactName} />
              <DetailRow label="Email"             value={client.email}    copy={client.email} />
              <DetailRow label="Phone number"      value={client.phone}    copy={client.phone} />
              <DetailRow label="Billing address"   value={client.billingAddress} last />
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

/* ─── Add client — bottom sheet form ────────────────────────────────── */
function AddClientSheet({ open, onClose, contained, editingClient, onAdded, onSaved }: {
  open: boolean;
  onClose: () => void;
  contained: boolean;
  editingClient?: BusinessClient | null;
  onAdded: (client: BusinessClient) => void;
  onSaved?: (client: BusinessClient) => void;
}) {
  const pos = contained ? "absolute" : "fixed";
  const isEdit = !!editingClient;
  const [form,    setForm]    = useState<NewClientInput>(() => editingClient ? clientToFormInput(editingClient) : emptyNewClient());
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);

  const setField = <K extends keyof NewClientInput>(f: K, v: NewClientInput[K]) =>
    setForm((prev) => ({ ...prev, [f]: v }));
  const markTouched = (f: string) => setTouched((t) => ({ ...t, [f]: true }));
  const isComplete = REQUIRED_FIELDS.every((f) => !isFieldMissing(form, f));

  const resetAndClose = () => {
    if (sending) return;
    setForm(emptyNewClient());
    setTouched({});
    onClose();
  };

  function buildClient(): BusinessClient {
    return {
      id: editingClient ? editingClient.id : `biz_${Date.now()}`,
      businessName: form.businessName.trim(),
      primaryContactName: form.primaryContactName.trim(),
      email: form.primaryContactEmail.trim(),
      phone: `${form.contactCode} ${form.primaryContactNumber}`.trim(),
      country: form.country,
      countryFlag: editingClient ? editingClient.countryFlag : "🏳️",
      currency: editingClient ? editingClient.currency : "USD",
      totalReceived: editingClient ? editingClient.totalReceived : 0,
      createdAt: editingClient ? editingClient.createdAt : new Date().toISOString().slice(0, 10),
      billingAddress: [form.address, form.city, form.state, form.zipcode, form.country].filter(Boolean).join(", "),
    };
  }

  function submit(keepOpen: boolean) {
    if (sending) return;
    if (!isComplete) {
      setTouched((t) => ({ ...t, ...Object.fromEntries(REQUIRED_FIELDS.map((f) => [f, true])) }));
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      const client = buildClient();
      if (isEdit) {
        onSaved?.(client);
        toast.success(`${client.businessName}'s details updated`);
        onClose();
        return;
      }
      onAdded(client);
      toast.success(`${client.businessName} added`);
      setForm(emptyNewClient());
      setTouched({});
      if (!keepOpen) onClose();
    }, 900);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={`${pos} inset-0 z-[90] bg-black/40 backdrop-blur-sm`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={resetAndClose}
          />
          <motion.div
            className={`${pos} inset-x-0 bottom-0 z-[91] flex flex-col bg-background overflow-hidden rounded-t-[24px]`}
            style={{ height: "92%" }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden>
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-4 pb-3 border-b border-border/40 shrink-0">
              <div className="min-w-0">
                <p className="text-[17px] font-bold text-foreground tracking-tight leading-tight">{isEdit ? "Edit client" : "Add client"}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {isEdit ? "Update this client's information." : "Add a business client to start tracking their payments."}
                </p>
              </div>
              <button type="button" onClick={resetAndClose}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
              <div className="px-4 py-4 space-y-6">

                {/* Business information */}
                <div className="space-y-4">
                  <p className="text-[13px] font-bold text-foreground">Business information</p>
                  <FormField label="Business name" value={form.businessName} onChange={(v) => setField("businessName", v)}
                    onBlur={() => markTouched("businessName")} placeholder="Enter business name"
                    error={touched.businessName && isFieldMissing(form, "businessName") ? "Required" : undefined} />
                  <div>
                    <FieldLabel text="Business type" />
                    <div className="flex flex-wrap gap-2">
                      {BUSINESS_TYPES.map((bt) => (
                        <button key={bt.id} type="button" onClick={() => setField("businessType", bt.id)}
                          className={cn(
                            "px-3 py-2 rounded-xl border text-[12.5px] font-medium transition-colors",
                            form.businessType === bt.id ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                          )}
                        >
                          {bt.label}
                        </button>
                      ))}
                    </div>
                    {touched.businessType && isFieldMissing(form, "businessType") && (
                      <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">Required</p>
                    )}
                  </div>
                  <FormField label="Website (Optional)" value={form.website} onChange={(v) => setField("website", v)} placeholder="https://example.com" />
                </div>

                {/* Primary contact */}
                <div className="space-y-4">
                  <p className="text-[13px] font-bold text-foreground">Primary contact</p>
                  <FormField label="Primary contact name" value={form.primaryContactName} onChange={(v) => setField("primaryContactName", v)}
                    onBlur={() => markTouched("primaryContactName")} placeholder="Enter contact name"
                    error={touched.primaryContactName && isFieldMissing(form, "primaryContactName") ? "Required" : undefined} />
                  <FormField label="Primary contact email" value={form.primaryContactEmail} onChange={(v) => setField("primaryContactEmail", v)}
                    onBlur={() => markTouched("primaryContactEmail")} type="email" placeholder="name@company.com"
                    error={touched.primaryContactEmail && isFieldMissing(form, "primaryContactEmail") ? "Required" : undefined} />
                  <div>
                    <FieldLabel text="Primary contact number" />
                    <div className="flex gap-2">
                      <div className="w-24 shrink-0">
                        <SelectDropdown value={form.contactCode} placeholder="Code" options={COUNTRY_CODES} onChange={(v) => setField("contactCode", v)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <input type="tel" value={form.primaryContactNumber}
                          onChange={(e) => setField("primaryContactNumber", e.target.value)}
                          onBlur={() => markTouched("primaryContactNumber")}
                          placeholder="Enter contact number"
                          className={cn(
                            "w-full rounded-xl border bg-[#f6f8fa] px-3.5 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors",
                            touched.primaryContactNumber && isFieldMissing(form, "primaryContactNumber") ? "border-red-400" : "border-border"
                          )} />
                      </div>
                    </div>
                    {touched.primaryContactNumber && isFieldMissing(form, "primaryContactNumber") && (
                      <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">Required</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <p className="text-[13px] font-bold text-foreground">Address</p>
                  <div>
                    <FieldLabel text="Country" />
                    <SelectDropdown value={form.country} placeholder="Select country" options={COUNTRY_OPTIONS} onChange={(v) => setField("country", v)} />
                    {touched.country && isFieldMissing(form, "country") && (
                      <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">Required</p>
                    )}
                  </div>
                  <div>
                    <FieldLabel text="Address" />
                    <textarea value={form.address} onChange={(e) => setField("address", e.target.value)}
                      onBlur={() => markTouched("address")} placeholder="Enter street address" rows={2}
                      className={cn(
                        "w-full rounded-xl border bg-[#f6f8fa] px-3.5 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors resize-none",
                        touched.address && isFieldMissing(form, "address") ? "border-red-400" : "border-border"
                      )} />
                    {touched.address && isFieldMissing(form, "address") && (
                      <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">Required</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="City" value={form.city} onChange={(v) => setField("city", v)}
                      onBlur={() => markTouched("city")} placeholder="Enter city"
                      error={touched.city && isFieldMissing(form, "city") ? "Required" : undefined} />
                    <FormField label="State" value={form.state} onChange={(v) => setField("state", v)}
                      onBlur={() => markTouched("state")} placeholder="Enter state"
                      error={touched.state && isFieldMissing(form, "state") ? "Required" : undefined} />
                  </div>
                  <FormField label="Zipcode" value={form.zipcode} onChange={(v) => setField("zipcode", v)}
                    onBlur={() => markTouched("zipcode")} placeholder="Enter zipcode"
                    error={touched.zipcode && isFieldMissing(form, "zipcode") ? "Required" : undefined} />
                </div>

                {/* GST */}
                <div className="space-y-4">
                  <p className="text-[13px] font-bold text-foreground">GST (Optional)</p>
                  <FormField label="GSTIN (Optional)" value={form.gstin} onChange={(v) => setField("gstin", v)} placeholder="Enter GSTIN" />
                </div>

                {/* Additional information */}
                <div className="space-y-4">
                  <p className="text-[13px] font-bold text-foreground">Additional information (Optional)</p>
                  <div>
                    <FieldLabel text="Notes (Optional)" />
                    <textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)}
                      placeholder="Add notes about this client" rows={3}
                      className="w-full rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors resize-none" />
                  </div>
                </div>

                {/* Contract */}
                <div className="space-y-4">
                  <p className="text-[13px] font-bold text-foreground">Contract (Optional)</p>
                  <button type="button" onClick={() => toast("File upload is coming soon")}
                    className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-primary/50 bg-primary/[0.03] active:bg-primary/[0.07] transition-colors"
                    style={{ height: 110 }}
                  >
                    <FileText className="h-6 w-6 text-primary/70" strokeWidth={1.5} />
                    <p className="text-[13px] font-semibold text-primary">Tap to upload contract</p>
                    <p className="text-[11px] text-muted-foreground">PDF or Word, up to 10MB</p>
                  </button>
                </div>

              </div>
            </div>

            {/* Sticky footer */}
            <div
              className="shrink-0 bg-background border-t border-border/60 px-4 pt-3"
              style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
            >
              <div className="flex gap-2.5">
                {isEdit ? (
                  <button type="button" onClick={resetAndClose}
                    className="flex-1 h-12 rounded-2xl border border-border text-[14.5px] font-bold text-foreground active:scale-[0.98] transition-transform"
                  >
                    Cancel
                  </button>
                ) : (
                  <button type="button" aria-disabled={!isComplete} onClick={() => submit(true)}
                    className={cn(
                      "flex-1 h-12 rounded-2xl border text-[14.5px] font-bold transition-all flex items-center justify-center gap-2",
                      isComplete ? "border-border text-foreground active:scale-[0.98]" : "border-border text-muted-foreground"
                    )}
                  >
                    Save and add
                  </button>
                )}
                <button type="button" aria-disabled={!isComplete} onClick={() => submit(false)}
                  className={cn(
                    "flex-1 h-12 rounded-2xl text-[14.5px] font-bold transition-all flex items-center justify-center gap-2",
                    isComplete ? "bg-primary text-white active:scale-[0.98]" : "bg-muted text-muted-foreground"
                  )}
                >
                  {sending
                    ? <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> {isEdit ? "Saving..." : "Adding..."}</>
                    : isEdit ? "Save changes" : "Add client"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Root — Client Management landing screen ───────────────────────── */
export interface MobileClientManagementProps {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
  onTxnLinkTap?: () => void;
}

export function MobileClientManagement({ open, onClose, contained = false, onTxnLinkTap }: MobileClientManagementProps) {
  const pos = contained ? "absolute" : "fixed";
  const [clients,       setClients]       = useState<BusinessClient[]>(CLIENTS);
  const [search,        setSearch]        = useState("");
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [dateSort,      setDateSort]      = useState<"newest" | "oldest" | null>(null);
  const [openChip,      setOpenChip]      = useState<"country" | "date" | null>(null);
  const [addOpen,       setAddOpen]       = useState(false);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<BusinessClient | null>(null);
  const [addSheetToken, setAddSheetToken] = useState(0);
  const [swipedId,      setSwipedId]      = useState<string | null>(null);

  const openAddSheet = () => { setEditingClient(null); setAddSheetToken((t) => t + 1); setAddOpen(true); };
  const closeAddSheet = () => { setAddOpen(false); setEditingClient(null); };
  const requestEdit = (client: BusinessClient) => {
    setSwipedId(null);
    setEditingClient(client);
    setAddSheetToken((t) => t + 1);
    setAddOpen(true);
  };

  const q = search.trim().toLowerCase();
  let filtered = clients
    .filter((c) => !q || c.primaryContactName.toLowerCase().includes(q) || c.businessName.toLowerCase().includes(q))
    .filter((c) => !countryFilter || c.country === countryFilter);
  if (dateSort) {
    filtered = [...filtered].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return dateSort === "newest" ? -diff : diff;
    });
  }

  const selected = selectedId ? (clients.find((c) => c.id === selectedId) ?? null) : null;
  const countryOptions = Array.from(new Set(clients.map((c) => c.country))).sort();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="client-management-screen"
          className={`${pos} inset-x-0 bottom-0 z-[80] flex flex-col bg-background overflow-hidden`}
          style={{ top: 44 }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 bg-background border-b border-border/40 shrink-0"
            style={{ paddingTop: 14, paddingBottom: 14 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-bold text-foreground tracking-tight leading-tight">Client Management</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{clients.length} Clients</p>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            <div className="mx-4 mt-4 mb-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

              {/* Header — matches Payment Links: title + Export + primary "+" */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 gap-2">
                <p className="text-[15px] font-bold text-foreground shrink-0">All Clients</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toast.success("Exporting clients...")}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-[11.5px] font-medium text-muted-foreground active:bg-muted/40 transition-colors"
                  >
                    <Download className="h-[12px] w-[12px]" strokeWidth={2} />
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={openAddSheet}
                    className="h-[30px] w-[30px] flex items-center justify-center rounded-lg bg-primary text-white active:scale-[0.97] transition-all shrink-0"
                    aria-label="Add client"
                  >
                    <Plus className="h-[14px] w-[14px]" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Search — matches Payment Links: single-level wrapper */}
              <div className="px-4 pb-3">
                <div className="flex items-center gap-2.5 bg-muted/50 rounded-xl px-3.5 py-2.5">
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by contact name"
                    className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch("")}>
                      <X className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                <button type="button" onClick={() => toast("Filtering by email is coming soon")}
                  className="flex items-center gap-1 h-8 px-3 rounded-xl border border-dashed border-border bg-white text-muted-foreground text-[12px] font-medium whitespace-nowrap shrink-0"
                >
                  <Plus className="h-[11px] w-[11px] text-muted-foreground/60" strokeWidth={2} />
                  Email
                </button>

                {/* Country chip */}
                <div className="relative shrink-0">
                  <button type="button" onClick={() => setOpenChip(openChip === "country" ? null : "country")}
                    className={cn(
                      "flex items-center gap-1 h-8 px-3 rounded-xl text-[12px] font-medium whitespace-nowrap transition-colors",
                      countryFilter ? "bg-primary text-white" : "border border-dashed border-border bg-white text-muted-foreground"
                    )}
                  >
                    {!countryFilter && <Plus className="h-[11px] w-[11px] text-muted-foreground/60" strokeWidth={2} />}
                    {countryFilter ?? "Country"}
                    {countryFilter && (
                      <span role="button"
                        onClick={(e) => { e.stopPropagation(); setCountryFilter(null); }}
                        className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-white/20 ml-0.5"
                      >
                        <X className="h-[9px] w-[9px] text-white" strokeWidth={2.5} />
                      </span>
                    )}
                  </button>
                  {openChip === "country" && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenChip(null)} />
                      <div className="absolute left-0 top-full mt-1.5 z-20 rounded-2xl border border-border bg-white overflow-hidden overflow-y-auto shadow-lg" style={{ minWidth: 200, maxHeight: 220 }}>
                        {countryOptions.map((c) => (
                          <button key={c} type="button" onClick={() => { setCountryFilter(c); setOpenChip(null); }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-left active:bg-muted/20"
                          >
                            <span className={cn("text-[13px]", countryFilter === c ? "font-semibold text-foreground" : "text-muted-foreground")}>{c}</span>
                            {countryFilter === c && <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Creation date chip — sorts newest/oldest first */}
                <div className="relative shrink-0">
                  <button type="button" onClick={() => setOpenChip(openChip === "date" ? null : "date")}
                    className={cn(
                      "flex items-center gap-1 h-8 px-3 rounded-xl text-[12px] font-medium whitespace-nowrap transition-colors",
                      dateSort ? "bg-primary text-white" : "border border-dashed border-border bg-white text-muted-foreground"
                    )}
                  >
                    {!dateSort && <Plus className="h-[11px] w-[11px] text-muted-foreground/60" strokeWidth={2} />}
                    {dateSort === "newest" ? "Newest first" : dateSort === "oldest" ? "Oldest first" : "Creation date"}
                    {dateSort && (
                      <span role="button"
                        onClick={(e) => { e.stopPropagation(); setDateSort(null); }}
                        className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-white/20 ml-0.5"
                      >
                        <X className="h-[9px] w-[9px] text-white" strokeWidth={2.5} />
                      </span>
                    )}
                  </button>
                  {openChip === "date" && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenChip(null)} />
                      <div className="absolute left-0 top-full mt-1.5 z-20 rounded-2xl border border-border bg-white overflow-hidden shadow-lg" style={{ minWidth: 170 }}>
                        {(["newest", "oldest"] as const).map((s) => (
                          <button key={s} type="button" onClick={() => { setDateSort(s); setOpenChip(null); }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-left active:bg-muted/20"
                          >
                            <span className={cn("text-[13px]", dateSort === s ? "font-semibold text-foreground" : "text-muted-foreground")}>
                              {s === "newest" ? "Newest first" : "Oldest first"}
                            </span>
                            {dateSort === s && <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">No clients found</p>
                ) : filtered.map((c) => (
                  <SwipeCard key={c.id}
                    isOpen={swipedId === c.id}
                    onOpen={() => setSwipedId(c.id)}
                    onClose={() => setSwipedId(null)}
                    onEdit={() => requestEdit(c)}
                  >
                    <button type="button" onClick={() => setSelectedId(c.id)}
                      className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left active:bg-muted/30 transition-colors duration-100"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-bold text-foreground leading-snug truncate">{c.businessName}</p>
                        <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug truncate">{c.primaryContactName}</p>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-snug truncate">{c.email}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[13.5px] font-bold text-foreground tabular-nums leading-snug whitespace-nowrap">
                          {fmtAmount(c.totalReceived, c.currency)}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[12px] leading-none">{c.countryFlag}</span>
                          <p className="text-[11px] text-muted-foreground leading-snug">{c.country}</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{fmtDate(c.createdAt)}</p>
                      </div>
                    </button>
                  </SwipeCard>
                ))}
              </div>
            </div>
          </div>

          {/* Client detail slide-up */}
          <AnimatePresence>
            {selected && (
              <>
                <motion.div
                  key="client-backdrop"
                  className="absolute inset-0 z-10"
                  style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setSelectedId(null)}
                />
                <ClientDetail
                  key={selected.id}
                  client={selected}
                  onClose={() => setSelectedId(null)}
                  onTxnLinkTap={onTxnLinkTap ? () => { setSelectedId(null); onClose(); onTxnLinkTap(); } : undefined}
                />
              </>
            )}
          </AnimatePresence>

          {/* Add / Edit client sheet */}
          <AddClientSheet
            key={addSheetToken}
            open={addOpen}
            contained={contained}
            editingClient={editingClient}
            onClose={closeAddSheet}
            onAdded={(client) => setClients((prev) => [client, ...prev])}
            onSaved={(client) => setClients((prev) => prev.map((c) => c.id === client.id ? client : c))}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
