"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy, Check, ArrowUpRight, AlertTriangle, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHideAmounts, MaskedNumber } from "@/lib/hide-amounts-context";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";

/* ─── Types ───────────────────────────────────────────────────────── */
type TopTab      = "multi-currency" | "withdrawals";
type AccountType = "primary" | "swift";

/* ─── Country data ────────────────────────────────────────────────── */
interface Country {
  code:        string;
  name:        string;
  flag:        string;
  currency:    string;
  regionLabel: string;
}

const COUNTRIES: Country[] = [
  { code: "US",  name: "United States",  flag: "🇺🇸", currency: "USD", regionLabel: "US"            },
  { code: "UK",  name: "United Kingdom", flag: "🇬🇧", currency: "GBP", regionLabel: "UK"            },
  { code: "UAE", name: "UAE",            flag: "🇦🇪", currency: "AED", regionLabel: "UAE"           },
  { code: "EU",  name: "Europe",         flag: "🇪🇺", currency: "EUR", regionLabel: "EUROPE"        },
  { code: "CA",  name: "Canada",         flag: "🇨🇦", currency: "CAD", regionLabel: "CANADA"        },
  { code: "AU",  name: "Australia",      flag: "🇦🇺", currency: "AUD", regionLabel: "AUSTRALIA"     },
  { code: "SG",  name: "Singapore",      flag: "🇸🇬", currency: "SGD", regionLabel: "SINGAPORE"     },
  { code: "ROW", name: "Rest of world",  flag: "🌍",  currency: "USD", regionLabel: "REST OF WORLD" },
];

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

/* ─── WithdrawalsComingSoon ───────────────────────────────────────── */
function WithdrawalsComingSoon() {
  return (
    <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm p-8 flex flex-col items-center gap-3">
      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
        <ArrowUpRight className="h-6 w-6 text-primary" strokeWidth={2} />
      </div>
      <p className="text-[16px] font-bold text-foreground">Coming soon</p>
      <p className="text-[13px] text-muted-foreground text-center leading-relaxed">
        Withdrawals to your bank account will be available here soon.
      </p>
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────────────── */
export function MobileInternational({
  onOpenCountrySheet: _onOpenCountrySheet,
  externalCountry,
  onCountryChange,
}: {
  onOpenCountrySheet?: () => void;
  externalCountry?:    Country;
  onCountryChange?:    (c: Country) => void;
} = {}) {
  const [topTab,            setTopTab]            = useState<TopTab>("multi-currency");
  const [_selectedCountry,  _setSelectedCountry]  = useState<Country>(COUNTRIES[0]);
  const [accountType,       setAccountType]       = useState<AccountType>("primary");
  const chipScrollRef = useHorizontalScroll<HTMLDivElement>();

  // Use external country control when provided (page-level state), else internal
  const selectedCountry    = externalCountry ?? _selectedCountry;
  const setSelectedCountry = (c: Country) => {
    _setSelectedCountry(c);
    onCountryChange?.(c);
  };

  const metrics = METRICS[selectedCountry.code] ?? METRICS["US"];

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
            <WithdrawalsComingSoon />
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

            {/* ② Horizontally scrollable currency chip selector */}
            <div
              ref={chipScrollRef}
              className="px-4 [&::-webkit-scrollbar]:hidden"
              style={{
                overflowX: "scroll",
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
                cursor: "grab",
              } as React.CSSProperties}
            >
              <div className="flex gap-2 w-max">
                {COUNTRIES.map((c) => {
                  const isSelected = c.code === selectedCountry.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCountry(c)}
                      className={cn(
                        "flex items-center gap-1.5 h-9 px-3.5 rounded-full shrink-0 transition-colors",
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-[#F5F5F5] dark:bg-muted text-muted-foreground border border-border/50"
                      )}
                    >
                      <span className="text-[16px] leading-none">{c.flag}</span>
                      <span className="text-[13px] font-semibold">{c.currency}</span>
                    </button>
                  );
                })}
              </div>
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
    </div>
  );
}
