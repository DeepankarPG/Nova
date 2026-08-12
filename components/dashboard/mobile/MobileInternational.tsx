"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy, Check, AlertTriangle, X, ChevronDown, ChevronRight,
  ArrowLeft, FileText, Download, Loader2, AlertCircle, Landmark,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useHideAmounts, MaskedNumber } from "@/lib/hide-amounts-context";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";

/* ─── Types ───────────────────────────────────────────────────────── */
type TopTab      = "multi-currency" | "withdrawals";
type AccountType = "primary" | "swift";

/* ─── Withdrawals: platforms ──────────────────────────────────────── */
type WithdrawPlatformId = "amazon" | "freelancer" | "upwork" | "toptal" | "deel";

interface WithdrawPlatform {
  id:       WithdrawPlatformId;
  name:     string;
  icon:     string;
  category: string;
}

const WITHDRAW_PLATFORMS: WithdrawPlatform[] = [
  { id: "amazon",     name: "Amazon",     icon: "🛒", category: "Marketplace" },
  { id: "freelancer", name: "Freelancer", icon: "💻", category: "Freelance"   },
  { id: "upwork",     name: "Upwork",     icon: "💼", category: "Freelance"   },
  { id: "toptal",     name: "Toptal",     icon: "⭐", category: "Freelance"   },
  { id: "deel",       name: "Deel",       icon: "🌐", category: "Payroll"     },
];

/* ─── Withdrawals: account + settlement statement ─────────────────── */
interface WithdrawalAccount {
  name:               string;
  paymentMethod:      string;
  accountNumber:      string;
  routingNumber:      string;
  /** Local label for the routing field, e.g. "ACH routing", "Sort code" */
  routingLabel:       string;
  bankName:           string;
  accountHolderName:  string;
  accountType:        string;
  beneficiaryAddress: string;
  routingCodeType:    string;
  badge:              string;
}

/** Only locations with a configured withdrawal account; others show the "no account" state. */
const WITHDRAWAL_ACCOUNTS: Partial<Record<string, WithdrawalAccount>> = {
  US: {
    name: "Primary Account", paymentMethod: "ACH / Fedwire",
    accountNumber: "0332534665", routingNumber: "026073150", routingLabel: "ACH routing",
    bankName: "Community Federal Savings Bank",
    accountHolderName: "Acme Exports Pvt Ltd", accountType: "Business checking account",
    beneficiaryAddress: "5 Penn Plaza, 14th Floor, New York, NY 10001, US",
    routingCodeType: "ach_routing_number", badge: "Preferred by payers in the US",
  },
  UK: {
    name: "Primary Account", paymentMethod: "Faster Payments",
    accountNumber: "80893347", routingNumber: "041234", routingLabel: "Sort code",
    bankName: "Barclays Bank PLC",
    accountHolderName: "Acme Exports Pvt Ltd", accountType: "Business current account",
    beneficiaryAddress: "1 Churchill Place, London E14 5HP, UK",
    routingCodeType: "sort_code", badge: "Preferred by payers in the UK",
  },
  UAE: {
    name: "Primary Account", paymentMethod: "Local Transfer",
    accountNumber: "AE070331234567890123456", routingNumber: "CBAUAEAD", routingLabel: "SWIFT/BIC",
    bankName: "Commercial Bank of Dubai",
    accountHolderName: "Acme Exports FZE", accountType: "Business current account",
    beneficiaryAddress: "Baniyas Road, Deira, Dubai, UAE",
    routingCodeType: "swift_bic", badge: "Preferred by payers in UAE",
  },
  EU: {
    name: "Primary Account", paymentMethod: "SEPA",
    accountNumber: "DE89370400440532013000", routingNumber: "COBADEFFXXX", routingLabel: "SWIFT/BIC",
    bankName: "Commerzbank AG",
    accountHolderName: "Acme Exports GmbH", accountType: "Business current account",
    beneficiaryAddress: "Kaiserplatz, 60311 Frankfurt am Main, Germany",
    routingCodeType: "swift_bic", badge: "Preferred by payers in Europe",
  },
};

interface SettlementForm {
  currency:        string;
  accountNumber:   string;
  routingCode:     string;
  sellerLegalName: string;
  sellerDBAName:   string;
  country:         string;
  sellerAddress:   string;
}

function buildSettlementDefaults(country: Country, account: WithdrawalAccount): SettlementForm {
  return {
    currency:        country.currency,
    accountNumber:   account.accountNumber,
    routingCode:     account.routingNumber,
    sellerLegalName: account.accountHolderName,
    sellerDBAName:   "",
    country:         "",
    sellerAddress:   "",
  };
}

/* ─── Country data ────────────────────────────────────────────────── */
interface Country {
  code:        string;
  name:        string;
  shortName:   string;
  flag:        string;
  /** ISO 3166-1 alpha-2 (lowercase) used for flagcdn.com images; omitted where no real flag exists */
  iso2?:       string;
  currency:    string;
  regionLabel: string;
}

const COUNTRIES: Country[] = [
  { code: "US",  name: "United States",  shortName: "USA",    flag: "🇺🇸", iso2: "us", currency: "USD", regionLabel: "US"            },
  { code: "UK",  name: "United Kingdom", shortName: "UK",     flag: "🇬🇧", iso2: "gb", currency: "GBP", regionLabel: "UK"            },
  { code: "UAE", name: "UAE",            shortName: "UAE",    flag: "🇦🇪", iso2: "ae", currency: "AED", regionLabel: "UAE"           },
  { code: "EU",  name: "Europe",         shortName: "Europe", flag: "🇪🇺", iso2: "eu", currency: "EUR", regionLabel: "EUROPE"        },
  { code: "CA",  name: "Canada",         shortName: "Canada", flag: "🇨🇦", iso2: "ca", currency: "CAD", regionLabel: "CANADA"        },
  { code: "AU",  name: "Australia",      shortName: "AU",     flag: "🇦🇺", iso2: "au", currency: "AUD", regionLabel: "AUSTRALIA"     },
  { code: "SG",  name: "Singapore",      shortName: "SG",     flag: "🇸🇬", iso2: "sg", currency: "SGD", regionLabel: "SINGAPORE"     },
  { code: "ROW", name: "Rest of world",  shortName: "ROW",    flag: "🌍",  currency: "USD", regionLabel: "REST OF WORLD" },
];

/* ─── CountryFlagCircle — real flag image cropped to a filled circle ── */
function CountryFlagCircle({ country, size = 32 }: { country: Country; size?: number }) {
  if (!country.iso2) {
    return (
      <span
        className="flex items-center justify-center rounded-full bg-muted shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.55 }}
      >
        {country.flag}
      </span>
    );
  }
  return (
    <span
      className="relative block overflow-hidden rounded-full shrink-0 ring-1 ring-black/5"
      style={{ width: size, height: size }}
    >
      <Image
        src={`https://flagcdn.com/w80/${country.iso2}.png`}
        alt={`${country.name} flag`}
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
    </span>
  );
}

/* ─── Per-country metrics ─────────────────────────────────────────── */
interface CountryMetrics {
  earning:        { amount: string; currency: string; change: string };
  outstanding:    { amount: string; payers: number; eta: string };
  saved:          { amount: string; pct: string };
}

const METRICS: Record<string, CountryMetrics> = {
  US:  { earning: { amount: "$1,28,400",   currency: "USD", change: "+8.4%"  }, outstanding: { amount: "$14,200",    payers: 3, eta: "1-3 days" }, saved: { amount: "₹8,240",  pct: "4% vs bank"   } },
  UK:  { earning: { amount: "£92,800",     currency: "GBP", change: "+6.1%"  }, outstanding: { amount: "£9,400",     payers: 2, eta: "2-4 days" }, saved: { amount: "₹6,120",  pct: "3.5% vs bank" } },
  UAE: { earning: { amount: "AED 4,82,000",currency: "AED", change: "+11.2%" }, outstanding: { amount: "AED 52,400", payers: 5, eta: "1-2 days" }, saved: { amount: "₹10,480", pct: "4.5% vs bank" } },
  EU:  { earning: { amount: "€1,04,600",   currency: "EUR", change: "+7.8%"  }, outstanding: { amount: "€11,800",   payers: 4, eta: "2-3 days" }, saved: { amount: "₹7,640",  pct: "3.8% vs bank" } },
  CA:  { earning: { amount: "C$1,42,200",  currency: "CAD", change: "+5.3%"  }, outstanding: { amount: "C$16,400",  payers: 2, eta: "3-5 days" }, saved: { amount: "₹5,980",  pct: "3.2% vs bank" } },
  AU:  { earning: { amount: "A$1,68,800",  currency: "AUD", change: "+9.0%"  }, outstanding: { amount: "A$18,200",  payers: 3, eta: "2-4 days" }, saved: { amount: "₹7,200",  pct: "3.6% vs bank" } },
  SG:  { earning: { amount: "S$86,400",    currency: "SGD", change: "+12.5%" }, outstanding: { amount: "S$8,800",   payers: 2, eta: "1-2 days" }, saved: { amount: "₹9,840",  pct: "4.2% vs bank" } },
  ROW: { earning: { amount: "$64,200",     currency: "USD", change: "+4.2%"  }, outstanding: { amount: "$7,600",    payers: 6, eta: "3-7 days" }, saved: { amount: "₹4,120",  pct: "2.8% vs bank" } },
};

/* ─── Primary account details per country ───────────────────────── */
interface PrimaryAccount {
  type:    string;
  account: string;
  routing: string;
  bank:    string;
  badge:   string;
}

const PRIMARY_ACCOUNTS: Record<string, PrimaryAccount> = {
  US:  { type: "ACH / Fedwire",      account: "9876543210",             routing: "021000021",    bank: "JPMorgan Chase",           badge: "Preferred by payers in the US"      },
  UK:  { type: "Faster Payments",    account: "80893347",               routing: "041234",       bank: "Barclays Bank PLC",        badge: "Preferred by payers in the UK"      },
  UAE: { type: "Local Transfer",     account: "AE070331234567890123456",routing: "CBAUAEAD",     bank: "Commercial Bank of Dubai", badge: "Preferred by payers in UAE"         },
  EU:  { type: "SEPA",               account: "DE89370400440532013000", routing: "COBADEFFXXX",  bank: "Commerzbank AG",           badge: "Preferred by payers in Europe"      },
  CA:  { type: "EFT",                account: "4567812340",             routing: "001003334",    bank: "Royal Bank of Canada",     badge: "Preferred by payers in Canada"      },
  AU:  { type: "NPP / BSB",          account: "123456789",              routing: "062000",       bank: "ANZ Bank",                 badge: "Preferred by payers in Australia"   },
  SG:  { type: "FAST / PayNow",      account: "SG29DBS380680000012345", routing: "7171",         bank: "DBS Bank Ltd",             badge: "Preferred by payers in Singapore"   },
  ROW: { type: "International Wire", account: "9988776655",             routing: "TCCLGB3L",     bank: "The Currency Cloud Ltd",   badge: "Use SWIFT for cross-border payments" },
};

/* ─── SWIFT account (shared) ──────────────────────────────────────── */
const SWIFT_ACCOUNT = {
  iban: "GB10TCCL04140480893347",
  bic:  "TCCLGB3L",
  bank: "The Currency Cloud Limited",
};

/* ─── Transactions per country ────────────────────────────────────── */
type TxnStatus = "settlement" | "review" | "success" | "progress";

interface Transaction {
  id:     string;
  amount: string;
  label:  string;
  entity: string;
  status: TxnStatus;
}

const STATUS_CFG: Record<TxnStatus, { label: string; textClass: string; borderClass: string }> = {
  settlement: { label: "Sent for settlement", textClass: "text-blue-700 dark:text-blue-400",       borderClass: "border-blue-500/50"    },
  review:     { label: "Sent for review",      textClass: "text-amber-700 dark:text-amber-400",     borderClass: "border-amber-600/50"   },
  success:    { label: "Success",              textClass: "text-emerald-700 dark:text-emerald-500", borderClass: "border-emerald-500/50" },
  progress:   { label: "In progress",          textClass: "text-orange-700 dark:text-orange-400",   borderClass: "border-orange-500/50"  },
};

const TRANSACTIONS: Record<string, Transaction[]> = {
  US: [
    { id: "u1", amount: "$4,200",    label: "Sent for settlement", entity: "Northwind LLC",  status: "settlement" },
    { id: "u2", amount: "$1,890.50", label: "Sent for review",     entity: "Amazon",         status: "review"     },
    { id: "u3", amount: "$975",      label: "Success",             entity: "Stripe Payouts", status: "success"    },
    { id: "u4", amount: "$12,000",   label: "In progress",         entity: "Contoso Ltd",    status: "progress"   },
  ],
  UK: [
    { id: "g1", amount: "£2,800",   label: "Success",             entity: "HSBC Payments",  status: "success"    },
    { id: "g2", amount: "£5,400",   label: "Sent for settlement", entity: "Aviva Plc",      status: "settlement" },
    { id: "g3", amount: "£1,250",   label: "In progress",         entity: "Barclays Corp",  status: "progress"   },
  ],
  UAE: [
    { id: "a1", amount: "AED 18,400", label: "Success",             entity: "Emirates NBD",  status: "success"  },
    { id: "a2", amount: "AED 7,200",  label: "Sent for review",     entity: "Noon Payments", status: "review"   },
    { id: "a3", amount: "AED 32,000", label: "In progress",         entity: "ADCB",          status: "progress" },
  ],
  EU: [
    { id: "e1", amount: "€4,800", label: "Sent for settlement", entity: "SAP SE",         status: "settlement" },
    { id: "e2", amount: "€1,600", label: "Success",             entity: "Shopify EU",     status: "success"    },
    { id: "e3", amount: "€9,200", label: "In progress",         entity: "Volkswagen AG",  status: "progress"   },
  ],
  CA: [
    { id: "c1", amount: "C$3,400", label: "Success",             entity: "Shopify Canada", status: "success"    },
    { id: "c2", amount: "C$6,800", label: "Sent for settlement", entity: "TD Bank",        status: "settlement" },
  ],
  AU: [
    { id: "au1", amount: "A$5,200", label: "Success",     entity: "Afterpay",        status: "success"  },
    { id: "au2", amount: "A$9,800", label: "In progress", entity: "Westpac Banking", status: "progress" },
  ],
  SG: [
    { id: "s1", amount: "S$2,400", label: "Success",             entity: "Grab Holdings", status: "success"    },
    { id: "s2", amount: "S$4,800", label: "Sent for settlement", entity: "Sea Limited",   status: "settlement" },
  ],
  ROW: [
    { id: "r1", amount: "$2,200", label: "In progress", entity: "Acme Global",    status: "progress" },
    { id: "r2", amount: "$800",   label: "Success",     entity: "Various Payees", status: "success"  },
  ],
};

/* ─── Copy hook ────────────────────────────────────────────────────── */
function useCopy() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copy = (field: string, value: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return { copiedField, copy };
}

/* ─── CopyButton ───────────────────────────────────────────────────── */
function CopyButton({ field, value, copiedField, onCopy }: {
  field:       string;
  value:       string;
  copiedField: string | null;
  onCopy:      (field: string, value: string) => void;
}) {
  const copied = copiedField === field;
  return (
    <button
      type="button"
      onClick={() => onCopy(field, value)}
      className="shrink-0 h-7 w-7 flex items-center justify-center text-muted-foreground transition-opacity active:opacity-60"
      aria-label={copied ? "Copied" : `Copy ${field}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "check" : "copy"}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-center"
        >
          {copied
            ? <Check className="h-4.5 w-4.5 text-emerald-600" strokeWidth={2.5} />
            : <Copy  className="h-4.5 w-4.5" strokeWidth={2} />
          }
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/* ─── MetricCard ──────────────────────────────────────────────────── */
function MetricCard({ title, primary, secondary, tertiary }: {
  title:     string;
  primary:   string;
  secondary: string;
  tertiary?: string;
}) {
  const { hidden } = useHideAmounts();
  return (
    <div className="shrink-0 w-[75vw] max-w-70 rounded-2xl border border-border bg-card shadow-sm p-4">
      <p className="text-[11.5px] font-semibold text-muted-foreground mb-2 truncate">{title}</p>
      <p className="text-[22px] font-bold text-foreground tabular-nums leading-tight">
        <MaskedNumber value={primary} hidden={hidden} />
      </p>
      <p className="text-[12px] text-muted-foreground mt-1 leading-snug">{secondary}</p>
      {tertiary && (
        <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-snug">{tertiary}</p>
      )}
    </div>
  );
}

/* ─── PillToggle ──────────────────────────────────────────────────── */
function PillToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options:   { id: T; label: string }[];
  value:     T;
  onChange:  (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex bg-card p-1 rounded-2xl gap-1 border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.05)]", className)}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "flex-1 py-2.5 text-[13.5px] font-semibold rounded-xl transition-all",
            value === opt.id
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground/70 hover:text-muted-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ─── ClientLocationSelector — shared by Multi-currency & Withdrawals ─ */
function ClientLocationSelector({
  selectedCountry,
  setSelectedCountry,
  countryPickerVariant,
  onOpenCountrySheet,
}: {
  selectedCountry:       Country;
  setSelectedCountry:    (c: Country) => void;
  countryPickerVariant:  "sheet" | "carousel";
  onOpenCountrySheet?:   () => void;
}) {
  return countryPickerVariant === "carousel" ? (
    <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 -mb-1 snap-x snap-mandatory scrollbar-hidden scroll-pl-4 scroll-pr-4">
      {COUNTRIES.map((c) => {
        const isSelected = c.code === selectedCountry.code;
        return (
          <button
            key={c.code}
            type="button"
            onClick={() => setSelectedCountry(c)}
            className={cn(
              "shrink-0 snap-start flex flex-col items-center gap-1.5 rounded-2xl border px-4 py-3 text-center transition-colors",
              isSelected
                ? "border-primary bg-primary/[0.06] shadow-sm"
                : "border-border bg-card shadow-sm"
            )}
            style={{ width: 84 }}
          >
            <CountryFlagCircle country={c} size={36} />
            <p className={cn("text-[11.5px] font-bold leading-tight truncate w-full", isSelected ? "text-primary" : "text-foreground")}>
              {c.shortName}
            </p>
            <span className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
              isSelected ? "text-primary bg-primary/[0.1]" : "text-muted-foreground bg-muted"
            )}>
              {c.currency}
            </span>
          </button>
        );
      })}
    </div>
  ) : (
    <div className="mx-4">
      <button
        type="button"
        onClick={() => onOpenCountrySheet?.()}
        className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card shadow-sm px-4 py-3.5 text-left"
      >
        <span className="text-[28px] leading-none shrink-0">{selectedCountry.flag}</span>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <p className="text-[15px] font-bold text-foreground">{selectedCountry.name}</p>
          <span className="shrink-0 text-[11px] font-semibold text-primary bg-primary/[0.08] px-2 py-0.5 rounded-md">
            {selectedCountry.currency}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} />
      </button>
    </div>
  );
}

/* ─── DetailRow — stacked label + value ───────────────────────────── */
function DetailRow({ label, value, copyable, field, copiedField, onCopy }: {
  label:       string;
  value:       string;
  copyable?:   boolean;
  field?:      string;
  copiedField: string | null;
  onCopy:      (field: string, value: string) => void;
}) {
  return (
    <div className="py-3 border-b border-border/60 last:border-b-0">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[15px] font-semibold text-foreground leading-snug">{value}</p>
        {copyable && field && (
          <CopyButton field={field} value={value} copiedField={copiedField} onCopy={onCopy} />
        )}
      </div>
    </div>
  );
}

/* ─── AccountDetailsCard ──────────────────────────────────────────── */
function AccountDetailsCard({
  country,
  accountType,
}: {
  country:     Country;
  accountType: AccountType;
}) {
  const { copiedField, copy } = useCopy();
  const primary = PRIMARY_ACCOUNTS[country.code] ?? PRIMARY_ACCOUNTS["US"];

  if (accountType === "primary") {
    return (
      <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Header — badge wraps below title when text is too long */}
        <div className="px-4 pt-4 pb-4 border-b border-border/50">
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            <div className="flex-1 min-w-32.5">
              <p className="text-[16px] font-bold text-foreground leading-tight">Primary Account</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">{primary.type}</p>
            </div>
            <span className="self-start shrink-0 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-400/60 rounded-xl px-2.5 py-1.5 leading-tight bg-emerald-50/80 dark:bg-emerald-950/30 mt-0.5">
              {primary.badge}
            </span>
          </div>
        </div>

        {/* Fields — stacked label + value */}
        <div className="px-4">
          <DetailRow label="Account no." value={primary.account} copyable field="account" copiedField={copiedField} onCopy={copy} />
          <DetailRow label="Routing no." value={primary.routing} copyable field="routing" copiedField={copiedField} onCopy={copy} />
          <DetailRow label="Bank name"   value={primary.bank}    copyable field="bank"    copiedField={copiedField} onCopy={copy} />
          <DetailRow label="Currency"    value={country.currency} copiedField={copiedField} onCopy={copy} />
        </div>
      </div>
    );
  }

  // SWIFT
  return (
    <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Warning banner */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-800/40">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-[12px] text-amber-800 dark:text-amber-400 font-medium leading-snug">
          Payers may incur SWIFT intermediary charges. Prefer local accounts when available.
        </p>
      </div>

      {/* Header */}
      <div className="px-4 pt-3.5 pb-2 border-b border-border/50">
        <p className="text-[14px] font-bold text-foreground">SWIFT Account</p>
        <p className="text-[12px] text-muted-foreground mt-0.5">International wire transfer</p>
      </div>

      {/* Fields */}
      <div className="px-4">
        <DetailRow label="IBAN"      value={SWIFT_ACCOUNT.iban} copyable field="iban"      copiedField={copiedField} onCopy={copy} />
        <DetailRow label="BIC/SWIFT" value={SWIFT_ACCOUNT.bic}  copyable field="bic"       copiedField={copiedField} onCopy={copy} />
        <DetailRow label="Bank name" value={SWIFT_ACCOUNT.bank} copyable field="swiftBank" copiedField={copiedField} onCopy={copy} />
        <DetailRow label="Currency"  value={country.currency}   copiedField={copiedField} onCopy={copy} />
      </div>
    </div>
  );
}

/* ─── ActionButtons ───────────────────────────────────────────────── */
function ActionButtons({ country, accountType }: { country: Country; accountType: AccountType }) {
  const primary = PRIMARY_ACCOUNTS[country.code] ?? PRIMARY_ACCOUNTS["US"];

  const allDetails =
    accountType === "primary"
      ? `Account: ${primary.account}\nRouting: ${primary.routing}\nBank: ${primary.bank}\nCurrency: ${country.currency}`
      : `IBAN: ${SWIFT_ACCOUNT.iban}\nBIC/SWIFT: ${SWIFT_ACCOUNT.bic}\nBank: ${SWIFT_ACCOUNT.bank}\nCurrency: ${country.currency}`;

  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(allDetails).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: `${country.name} Account Details`, text: allDetails }).catch(() => {});
    }
  };

  return (
    <div className="mx-4 flex flex-row items-stretch gap-2.5">
      <button
        type="button"
        onClick={handleShare}
        className="flex-1 py-3.5 rounded-2xl border border-border bg-card text-[14px] font-bold text-foreground shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        Share details
      </button>
      <button
        type="button"
        onClick={handleCopyAll}
        className="flex-1 py-3.5 rounded-2xl bg-primary text-[14px] font-bold text-primary-foreground shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
      >
        {copied
          ? <><Check className="h-4 w-4" strokeWidth={2.5} /> Copied</>
          : <><Copy  className="h-4 w-4" strokeWidth={2} /> Copy details</>
        }
      </button>
    </div>
  );
}

/* ─── RecentTransactions ──────────────────────────────────────────── */
function RecentTransactions({ country }: { country: Country }) {
  const { hidden } = useHideAmounts();
  const txns = TRANSACTIONS[country.code] ?? TRANSACTIONS["US"];

  return (
    <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="text-[15px] font-bold text-foreground">Recent transactions</p>
        <span className="text-[12px] text-primary font-medium">{country.name}</span>
      </div>

      <div className="divide-y divide-border border-t border-border">
        {txns.map((txn) => {
          const cfg = STATUS_CFG[txn.status];
          return (
            <div key={txn.id} className="flex items-center gap-3.5 px-4 py-3.5">
              <div
                className="shrink-0 h-2 w-2 rounded-full mt-0.5"
                style={{
                  backgroundColor:
                    txn.status === "success"    ? "var(--tw-emerald-600, #059669)"
                    : txn.status === "settlement" ? "#2563eb"
                    : txn.status === "review"     ? "#d97706"
                    : "#ea580c",
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-bold text-foreground truncate">{txn.entity}</p>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">{txn.label}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">
                  <MaskedNumber value={txn.amount} hidden={hidden} />
                </p>
                <span className={cn(
                  "mt-1 inline-block text-[10.5px] font-medium px-2 py-0.5 rounded-md border bg-transparent",
                  cfg.textClass, cfg.borderClass
                )}>
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── CountrySheet — kept for backward compatibility ──────────────── */
export { COUNTRIES };
export type { Country };
export type { TopTab };

export function CountrySheet({
  open,
  selected,
  onSelect,
  onClose,
  contained = false,
}: {
  open:       boolean;
  selected:   Country;
  onSelect:   (c: Country) => void;
  onClose:    () => void;
  contained?: boolean;
}) {
  const pos = contained ? "absolute" : "fixed";
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={`${pos} inset-0 z-51 bg-black/45`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          <motion.div
            className={`${pos} inset-x-0 bottom-0 z-52 bg-background rounded-t-4xl border-t border-border`}
            style={{ maxHeight: "80vh" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
          >
            <div className="flex justify-center pt-3 pb-0" aria-hidden>
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="flex items-center justify-between px-4 pt-3 pb-4 border-b border-border/50">
              <h3 className="text-[16px] font-bold text-foreground">Select country</h3>
              <button
                type="button"
                onClick={onClose}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="divide-y divide-border/50 overflow-y-auto" style={{ maxHeight: "calc(80vh - 80px)" }}>
              {COUNTRIES.map((c) => {
                const isSelected = c.code === selected.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => { onSelect(c); onClose(); }}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-5 py-4 text-left transition-colors",
                      isSelected ? "bg-primary/6" : "hover:bg-muted/40"
                    )}
                  >
                    <span className="text-[26px] leading-none shrink-0">{c.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-[14px] font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                        {c.name}
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{c.currency}</p>
                    </div>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── App-frame containment ─────────────────────────────────────────
 * Preview pages render the mobile app inside a fixed-size phone mockup
 * (marked with data-app-frame) so `position: fixed` overlays would
 * otherwise escape the phone bezel and cover the whole browser window.
 * When that container exists we portal into it and switch to absolute
 * positioning; on the real app (no mockup) this is a no-op and overlays
 * render fixed to the true viewport as normal.
 * ────────────────────────────────────────────────────────────────── */
function useAppFrameContainer(): HTMLElement | null {
  return useSyncExternalStore(
    () => () => {},
    () => document.querySelector<HTMLElement>("[data-app-frame]"),
    () => null
  );
}

/* ─── SelectSheet — generic bottom-sheet list picker ───────────────── */
interface SelectItem { id: string; label: string; sublabel?: string; icon?: string; }

function SelectSheet({
  open,
  title,
  items,
  selectedId,
  onSelect,
  onClose,
}: {
  open:       boolean;
  title:      string;
  items:      SelectItem[];
  selectedId: string | null;
  onSelect:   (item: SelectItem) => void;
  onClose:    () => void;
}) {
  const frame = useAppFrameContainer();
  const pos = frame ? "absolute" : "fixed";
  const content = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={`${pos} inset-0 z-[90] bg-black/45`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          <motion.div
            className={`${pos} inset-x-0 bottom-0 z-[91] bg-background rounded-t-4xl border-t border-border`}
            style={{ maxHeight: "80vh" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
          >
            <div className="flex justify-center pt-3 pb-0" aria-hidden>
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="flex items-center justify-between px-4 pt-3 pb-4 border-b border-border/50">
              <h3 className="text-[16px] font-bold text-foreground">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="divide-y divide-border/50 overflow-y-auto" style={{ maxHeight: "calc(80vh - 80px)" }}>
              {items.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item)}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-5 py-4 text-left transition-colors",
                      isSelected ? "bg-primary/6" : "hover:bg-muted/40"
                    )}
                  >
                    {item.icon && <span className="text-[26px] leading-none shrink-0">{item.icon}</span>}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-[14px] font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                        {item.label}
                      </p>
                      {item.sublabel && <p className="text-[12px] text-muted-foreground mt-0.5">{item.sublabel}</p>}
                    </div>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
  return frame ? createPortal(content, frame) : content;
}

/* ─── Settlement form field helpers ─────────────────────────────────── */
function FormLabel({ text }: { text: string }) {
  return <p className="text-[12px] font-semibold text-muted-foreground mb-1.5">{text}</p>;
}

function FormField({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  multiline,
}: {
  label:        string;
  value:        string;
  onChange:     (v: string) => void;
  onBlur?:      () => void;
  placeholder?: string;
  error?:       string;
  multiline?:   boolean;
}) {
  const fieldClass = cn(
    "w-full rounded-xl border bg-[#f6f8fa] px-3.5 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors",
    error ? "border-red-400" : "border-border"
  );
  return (
    <div>
      <FormLabel text={label} />
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={cn(fieldClass, "resize-none leading-relaxed")}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={fieldClass}
        />
      )}
      {error && <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
}

/* ─── SettlementStatementSheet — full-screen "generate statement" flow ─ */
const SETTLEMENT_REQUIRED_FIELDS: (keyof SettlementForm)[] = [
  "accountNumber", "routingCode", "sellerLegalName", "country", "sellerAddress",
];

function SettlementStatementSheet({
  open,
  onClose,
  country,
  platform,
  form,
  onFormChange,
}: {
  open:         boolean;
  onClose:      () => void;
  country:      Country;
  platform:     WithdrawPlatform;
  form:         SettlementForm;
  onFormChange: (form: SettlementForm) => void;
}) {
  const [isCurrencySheetOpen, setIsCurrencySheetOpen] = useState(false);
  const [isCountrySheetOpen,  setIsCountrySheetOpen]  = useState(false);
  const [touched,             setTouched]             = useState<Record<string, boolean>>({});
  const [isGenerating,        setIsGenerating]        = useState(false);
  const [generateError,       setGenerateError]       = useState<string | null>(null);
  const frame = useAppFrameContainer();
  const pos = frame ? "absolute" : "fixed";

  const isMissing    = (field: keyof SettlementForm) => !form[field]?.trim();
  const isComplete   = SETTLEMENT_REQUIRED_FIELDS.every((f) => !isMissing(f));
  const canDownload  = isComplete && !isGenerating;

  const setField     = (field: keyof SettlementForm, value: string) => onFormChange({ ...form, [field]: value });
  const markTouched  = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const currencyOptions: SelectItem[] = COUNTRIES
    .filter((c) => WITHDRAWAL_ACCOUNTS[c.code])
    .map((c) => ({ id: c.currency, label: c.currency, sublabel: c.name, icon: c.flag }));

  const countryOptions: SelectItem[] = COUNTRIES
    .map((c) => ({ id: c.name, label: c.name, sublabel: c.currency, icon: c.flag }));

  const handleDownload = () => {
    if (isGenerating) return;
    if (!isComplete) {
      setTouched((t) => ({ ...t, ...Object.fromEntries(SETTLEMENT_REQUIRED_FIELDS.map((f) => [f, true])) }));
      return;
    }
    setIsGenerating(true);
    setGenerateError(null);
    setTimeout(() => {
      setIsGenerating(false);
      if (Math.random() < 0.12) {
        setGenerateError("Couldn't generate the statement. Please try again.");
      } else {
        toast.success("Settlement statement downloaded");
        onClose();
      }
    }, 1100);
  };

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — blurred */}
          <motion.div
            className={`${pos} inset-0 z-[80] bg-black/40 backdrop-blur-sm`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Bottom sheet — covers 3/4 of the screen */}
          <motion.div
            key="settlement-sheet"
            className={`${pos} inset-x-0 bottom-0 z-[81] flex flex-col bg-background overflow-hidden rounded-t-[24px]`}
            style={{ height: "75%" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden>
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 pb-3 border-b border-border/40 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              </button>
              <p className="text-[17px] font-bold text-foreground tracking-tight flex-1">Settlement statement</p>
            </div>

            {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            <div className="px-4 py-4 space-y-4">
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Generate a settlement statement for withdrawals from{" "}
                <span className="font-semibold text-foreground">{platform.name}</span> to your {country.name} account.
              </p>

              {/* Currency */}
              <div>
                <FormLabel text="Currency" />
                <button
                  type="button"
                  onClick={() => setIsCurrencySheetOpen(true)}
                  className="w-full flex items-center gap-2.5 rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-3 text-left"
                >
                  <span className="text-[18px] leading-none">
                    {COUNTRIES.find((c) => c.currency === form.currency)?.flag ?? "🌍"}
                  </span>
                  <span className="flex-1 text-[14px] font-semibold text-foreground">{form.currency}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                </button>
              </div>

              <FormField
                label="Account number"
                value={form.accountNumber}
                onChange={(v) => setField("accountNumber", v)}
                onBlur={() => markTouched("accountNumber")}
                error={touched.accountNumber && isMissing("accountNumber") ? "Please enter the account number" : undefined}
              />
              <FormField
                label="Routing code"
                value={form.routingCode}
                onChange={(v) => setField("routingCode", v)}
                onBlur={() => markTouched("routingCode")}
                error={touched.routingCode && isMissing("routingCode") ? "Please enter the routing code" : undefined}
              />
              <FormField
                label="Seller legal name"
                value={form.sellerLegalName}
                onChange={(v) => setField("sellerLegalName", v)}
                onBlur={() => markTouched("sellerLegalName")}
                error={touched.sellerLegalName && isMissing("sellerLegalName") ? "Please enter the seller legal name" : undefined}
              />
              <FormField
                label="Seller DBA name"
                value={form.sellerDBAName}
                onChange={(v) => setField("sellerDBAName", v)}
                placeholder="Enter seller DBA name"
              />

              {/* Country */}
              <div>
                <FormLabel text="Country" />
                <button
                  type="button"
                  onClick={() => setIsCountrySheetOpen(true)}
                  onBlur={() => markTouched("country")}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-xl border bg-[#f6f8fa] px-3.5 py-3 text-left",
                    touched.country && isMissing("country") ? "border-red-400" : "border-border"
                  )}
                >
                  <span className={cn("flex-1 text-[14px]", form.country ? "font-semibold text-foreground" : "text-muted-foreground/60")}>
                    {form.country || "Enter country"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                </button>
                {touched.country && isMissing("country") && (
                  <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">Please select the country</p>
                )}
              </div>

              <FormField
                label="Seller address"
                value={form.sellerAddress}
                onChange={(v) => setField("sellerAddress", v)}
                onBlur={() => markTouched("sellerAddress")}
                placeholder="Enter seller address"
                multiline
                error={touched.sellerAddress && isMissing("sellerAddress") ? "Please enter the seller address" : undefined}
              />

              {generateError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 px-3.5 py-3">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[12.5px] text-red-700 dark:text-red-400 leading-snug">{generateError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky footer CTA */}
          <div
            className="shrink-0 bg-background border-t border-border/60 px-4 pt-3"
            style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
          >
            <button
              type="button"
              aria-disabled={!canDownload}
              onClick={handleDownload}
              className={cn(
                "w-full h-12 rounded-2xl text-[14.5px] font-bold transition-all flex items-center justify-center gap-2",
                canDownload ? "bg-primary text-white active:scale-[0.98]" : "bg-muted text-muted-foreground"
              )}
            >
              {isGenerating && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />}
              {isGenerating ? "Generating..." : "Download"}
            </button>
          </div>

            <SelectSheet
              open={isCurrencySheetOpen}
              title="Select currency"
              items={currencyOptions}
              selectedId={form.currency}
              onSelect={(item) => { setField("currency", item.id); setIsCurrencySheetOpen(false); }}
              onClose={() => setIsCurrencySheetOpen(false)}
            />
            <SelectSheet
              open={isCountrySheetOpen}
              title="Select country"
              items={countryOptions}
              selectedId={form.country || null}
              onSelect={(item) => { setField("country", item.id); markTouched("country"); setIsCountrySheetOpen(false); }}
              onClose={() => setIsCountrySheetOpen(false)}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
  return frame ? createPortal(content, frame) : content;
}

/* ─── WithdrawalsHowItWorks — full-page walkthrough (6 steps) ──────── */
const HOW_IT_WORKS_STEPS: { step: number; lines: string[] }[] = [
  { step: 1, lines: ["Login to your account"] },
  { step: 2, lines: ["Go to your profile", "Click 'Withdraw funds'"] },
  { step: 3, lines: ["Click 'Express Withdrawal'"] },
  { step: 4, lines: ["Verify your identity by entering the code sent to your email"] },
  { step: 5, lines: ["Select 'United States'", "Enter 'Withdraw amount'"] },
  { step: 6, lines: ["Enter your Local USD account details", "Click 'Withdraw Funds'"] },
];

export function WithdrawalsHowItWorks({ open, onClose }: { open: boolean; onClose: () => void }) {
  const frame = useAppFrameContainer();
  const pos = frame ? "absolute" : "fixed";
  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="how-it-works"
          className={`${pos} inset-0 z-[80] flex flex-col bg-background overflow-hidden`}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 bg-background border-b border-border/40 shrink-0"
            style={{ paddingTop: "max(20px, env(safe-area-inset-top))", paddingBottom: 14 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <p className="text-[17px] font-bold text-foreground tracking-tight flex-1">How withdrawals work</p>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            <div className="px-4 py-4">
              {HOW_IT_WORKS_STEPS.map((s) => (
                <div key={s.step} className="mb-7 last:mb-2">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="h-6 w-6 rounded-full bg-primary text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                      {s.step}
                    </span>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Step {s.step}</p>
                  </div>
                  <div className="mb-3 pl-8">
                    {s.lines.map((line, i) => (
                      <p
                        key={i}
                        className={i === 0
                          ? "text-[15px] font-bold text-foreground leading-snug"
                          : "text-[13.5px] text-muted-foreground mt-1 leading-snug"}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                  <div className="w-full aspect-4/3 rounded-2xl border border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="h-7 w-7 text-muted-foreground/40" strokeWidth={1.5} />
                    <p className="text-[12px] text-muted-foreground/60">Step {s.step} screenshot</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  return frame ? createPortal(content, frame) : content;
}

/* ─── WithdrawalsPanel — Withdrawals tab landing screen ────────────── */
/** Collapsible account-details drawer — remounted (via `key`) whenever the
 * platform/location changes so it always starts collapsed again. */
function AccountDetailsSection({ account }: { account: WithdrawalAccount }) {
  const [expanded, setExpanded] = useState(false);
  const { copiedField, copy } = useCopy();

  return (
    <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-4 border-b border-border/50">
        <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
          <div className="flex-1 min-w-32.5">
            <p className="text-[16px] font-bold text-foreground leading-tight">{account.name}</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">{account.paymentMethod}</p>
          </div>
          <span className="self-start shrink-0 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-400/60 rounded-xl px-2.5 py-1.5 leading-tight bg-emerald-50/80 dark:bg-emerald-950/30 mt-0.5">
            {account.badge}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5"
      >
        <span className="text-[13.5px] font-semibold text-foreground">Account details</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")} strokeWidth={2} />
      </button>
      {expanded && (
        <div className="px-4 pb-4 -mt-1">
          <DetailRow label="Payment method"      value={account.paymentMethod}                                  copiedField={copiedField} onCopy={copy} />
          <DetailRow label="Account number"      value={account.accountNumber}      copyable field="account"     copiedField={copiedField} onCopy={copy} />
          <DetailRow label="Bank name"           value={account.bankName}                                       copiedField={copiedField} onCopy={copy} />
          <DetailRow label="Account holder name" value={account.accountHolderName}                              copiedField={copiedField} onCopy={copy} />
          <DetailRow label="Account type"        value={account.accountType}                                    copiedField={copiedField} onCopy={copy} />
          <DetailRow label="Beneficiary address" value={account.beneficiaryAddress}                             copiedField={copiedField} onCopy={copy} />
          <DetailRow label={account.routingLabel} value={account.routingNumber}     copyable field="routing"     copiedField={copiedField} onCopy={copy} />
          <DetailRow label="Routing code type"   value={account.routingCodeType}                                copiedField={copiedField} onCopy={copy} />
        </div>
      )}
    </div>
  );
}

function WithdrawalsPanel({
  withdrawCountry,
  setWithdrawCountry,
  account,
  selectedPlatform,
  setSelectedPlatform,
  onGenerateStatement,
}: {
  withdrawCountry:      Country;
  setWithdrawCountry:   (c: Country) => void;
  account:              WithdrawalAccount | undefined;
  selectedPlatform:     WithdrawPlatform;
  setSelectedPlatform:  (p: WithdrawPlatform) => void;
  onGenerateStatement:  () => void;
}) {
  const [isCurrencySheetOpen, setIsCurrencySheetOpen] = useState(false);
  const [downloadingBank, setDownloadingBank] = useState(false);
  const [bankError,       setBankError]       = useState<string | null>(null);

  const currencyOptions: SelectItem[] = COUNTRIES
    .filter((c) => WITHDRAWAL_ACCOUNTS[c.code])
    .map((c) => ({ id: c.code, label: c.currency, sublabel: c.name, icon: c.flag }));

  const handleBankStatementDownload = () => {
    if (downloadingBank) return;
    setDownloadingBank(true);
    setBankError(null);
    setTimeout(() => {
      setDownloadingBank(false);
      if (Math.random() < 0.12) {
        setBankError("Couldn't download the statement. Please try again.");
      } else {
        toast.success("Bank settlement statement downloaded");
      }
    }, 900);
  };

  return (
    <div className="space-y-3">
      {/* Withdraw from (marketplace) — carousel, matching the client-location selector */}
      <div>
        <p className="mx-4 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Withdraw from
        </p>
        <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 -mb-1 snap-x snap-mandatory scrollbar-hidden scroll-pl-4 scroll-pr-4">
          {WITHDRAW_PLATFORMS.map((p) => {
            const isSelected = p.id === selectedPlatform.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlatform(p)}
                className={cn(
                  "shrink-0 snap-start flex flex-col items-center gap-1.5 rounded-2xl border px-4 py-3 text-center transition-colors",
                  isSelected
                    ? "border-primary bg-primary/[0.06] shadow-sm"
                    : "border-border bg-card shadow-sm"
                )}
                style={{ width: 84 }}
              >
                <span
                  className="flex items-center justify-center rounded-full bg-muted shrink-0"
                  style={{ width: 36, height: 36, fontSize: 18 }}
                >
                  {p.icon}
                </span>
                <p className={cn("text-[11.5px] font-bold leading-tight truncate w-full", isSelected ? "text-primary" : "text-foreground")}>
                  {p.name}
                </p>
                <span className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                  isSelected ? "text-primary bg-primary/[0.1]" : "text-muted-foreground bg-muted"
                )}>
                  {p.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Connect your account to {platform} + compact currency selector */}
      <div className="mx-4 flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-foreground min-w-0 truncate">
          Connect your account to {selectedPlatform.name}
        </p>
        <button
          type="button"
          onClick={() => setIsCurrencySheetOpen(true)}
          className="shrink-0 flex items-center gap-1.5 rounded-xl border border-border bg-card shadow-sm pl-2.5 pr-2 py-1.5"
        >
          <span className="text-[15px] leading-none">{withdrawCountry.flag}</span>
          <span className="text-[13px] font-bold text-foreground">{withdrawCountry.currency}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
        </button>
      </div>

      {!account ? (
        <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm p-8 flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <Landmark className="h-6 w-6 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <p className="text-[15px] font-bold text-foreground">No withdrawal account available</p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Your withdrawal account for {withdrawCountry.name} has not been configured yet.
          </p>
        </div>
      ) : (
        <>
          {/* Documents — moved up, right after platform/account selection */}
          <div className="px-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Documents</p>
          </div>
          <div className="mx-4 space-y-2.5">
            <button
              type="button"
              onClick={onGenerateStatement}
              className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card shadow-sm px-4 py-3.5 text-left active:scale-[0.99] transition-transform"
            >
              <span className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-primary" strokeWidth={2} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-foreground">Generate settlement statement</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{selectedPlatform.name}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={handleBankStatementDownload}
              disabled={downloadingBank}
              className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card shadow-sm px-4 py-3.5 text-left active:scale-[0.99] transition-transform disabled:opacity-60"
            >
              <span className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                {downloadingBank
                  ? <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" strokeWidth={2} />
                  : <Download className="h-4 w-4 text-muted-foreground" strokeWidth={2} />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-foreground">Bank settlement statement</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{downloadingBank ? "Downloading..." : "Last 3 months"}</p>
              </div>
            </button>
            {bankError && (
              <p className="text-[12px] text-red-600 dark:text-red-400 px-1">{bankError}</p>
            )}
          </div>

          {/* Region label */}
          <div className="px-4">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/55">
              {withdrawCountry.flag} {withdrawCountry.regionLabel} Account
            </p>
          </div>

          {/* Account details — collapsible, always starts collapsed */}
          <AccountDetailsSection key={`${selectedPlatform.id}-${withdrawCountry.code}`} account={account} />
        </>
      )}

      <SelectSheet
        open={isCurrencySheetOpen}
        title="Select currency"
        items={currencyOptions}
        selectedId={withdrawCountry.code}
        onSelect={(item) => {
          const c = COUNTRIES.find((c) => c.code === item.id);
          if (c) setWithdrawCountry(c);
          setIsCurrencySheetOpen(false);
        }}
        onClose={() => setIsCurrencySheetOpen(false)}
      />
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────────────── */
export function MobileInternational({
  onOpenCountrySheet,
  externalCountry,
  onCountryChange,
  countryPickerVariant = "sheet",
  onTopTabChange,
}: {
  onOpenCountrySheet?: () => void;
  externalCountry?:    Country;
  onCountryChange?:    (c: Country) => void;
  countryPickerVariant?: "sheet" | "carousel";
  onTopTabChange?:     (tab: TopTab) => void;
} = {}) {
  const [topTab,            _setTopTab]           = useState<TopTab>("multi-currency");
  const setTopTab = (tab: TopTab) => {
    _setTopTab(tab);
    onTopTabChange?.(tab);
  };
  const [_selectedCountry,  _setSelectedCountry]  = useState<Country>(COUNTRIES[0]);
  const [accountType,       setAccountType]       = useState<AccountType>("primary");
  const chipScrollRef = useHorizontalScroll<HTMLDivElement>();

  // Withdrawals workflow state — decoupled from Multi-currency's location
  const [withdrawCountry,      setWithdrawCountry]      = useState<Country>(COUNTRIES[0]);
  const [selectedPlatform,     setSelectedPlatform]     = useState<WithdrawPlatform>(WITHDRAW_PLATFORMS[0]);
  const [isSettlementSheetOpen, setIsSettlementSheetOpen] = useState(false);
  const [settlementForm,       setSettlementForm]       = useState<SettlementForm | null>(null);
  const [settlementFormKey,    setSettlementFormKey]    = useState<string | null>(null);

  // Use external country control when provided (page-level state), else internal
  const selectedCountry    = externalCountry ?? _selectedCountry;
  const setSelectedCountry = (c: Country) => {
    _setSelectedCountry(c);
    onCountryChange?.(c);
  };

  const metrics = METRICS[selectedCountry.code] ?? METRICS["US"];
  const withdrawalAccount = WITHDRAWAL_ACCOUNTS[withdrawCountry.code];

  const handleOpenSettlementStatement = () => {
    if (!withdrawalAccount) return;
    const key = `${withdrawCountry.code}:${selectedPlatform.id}`;
    if (settlementFormKey !== key) {
      setSettlementForm(buildSettlementDefaults(withdrawCountry, withdrawalAccount));
      setSettlementFormKey(key);
    }
    setIsSettlementSheetOpen(true);
  };

  return (
    <div className="relative space-y-3 pb-10 bg-background">

      {/* ① Top segment toggle */}
      <div className="px-4 pt-1">
        <PillToggle
          options={[
            { id: "multi-currency" as TopTab, label: "Multi-currency" },
            { id: "withdrawals"    as TopTab, label: "Withdrawals"    },
          ]}
          value={topTab}
          onChange={setTopTab}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {topTab === "withdrawals" ? (
          <motion.div
            key="withdrawals"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <WithdrawalsPanel
              withdrawCountry={withdrawCountry}
              setWithdrawCountry={setWithdrawCountry}
              account={withdrawalAccount}
              selectedPlatform={selectedPlatform}
              setSelectedPlatform={setSelectedPlatform}
              onGenerateStatement={handleOpenSettlementStatement}
            />
          </motion.div>
        ) : (
          <motion.div
            key="multi-currency"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3"
          >

            {/* ② Country selector with section label */}
            <div>
              <p className="mx-4 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                Your client location
              </p>
              <ClientLocationSelector
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                countryPickerVariant={countryPickerVariant}
                onOpenCountrySheet={onOpenCountrySheet}
              />
            </div>

            {/* ③ Dynamic section label: [FLAG] [REGION] ACCOUNT */}
            <div className="px-4">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/55">
                {selectedCountry.flag} {selectedCountry.regionLabel} Account
              </p>
            </div>

            {/* ④ Account details card */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${selectedCountry.code}-${accountType}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <AccountDetailsCard country={selectedCountry} accountType={accountType} />
              </motion.div>
            </AnimatePresence>

            {/* ⑤ Action buttons */}
            <ActionButtons country={selectedCountry} accountType={accountType} />

            {/* ⑥ Recent transactions */}
            <RecentTransactions country={selectedCountry} />

          </motion.div>
        )}
      </AnimatePresence>


      {/* Withdrawals: settlement statement full-screen sheet */}
      {withdrawalAccount && settlementForm && (
        <SettlementStatementSheet
          open={isSettlementSheetOpen}
          onClose={() => setIsSettlementSheetOpen(false)}
          country={withdrawCountry}
          platform={selectedPlatform}
          form={settlementForm}
          onFormChange={setSettlementForm}
        />
      )}
    </div>
  );
}
