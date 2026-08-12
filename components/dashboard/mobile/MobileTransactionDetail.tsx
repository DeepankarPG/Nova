"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Clock, ChevronRight, Wallet, Landmark } from "lucide-react";

const BANK_CFG: Record<string, { short: string; bg: string }> = {
  "HDFC Bank":  { short: "HDFC",  bg: "#004C8F" },
  "Axis Bank":  { short: "AXIS",  bg: "#97144D" },
  "ICICI Bank": { short: "ICICI", bg: "#F7861C" },
  "SBI":        { short: "SBI",   bg: "#22409A" },
  "Kotak Bank": { short: "KMB",   bg: "#ED1C24" },
  "Yes Bank":   { short: "YES",   bg: "#003087" },
};

function IndiaFlag() {
  return (
    <svg
      width="14" height="10" viewBox="0 0 20 14"
      style={{ borderRadius: 1.5, flexShrink: 0, display: "inline-block" }}
      aria-label="India"
    >
      <rect width="20" height="4.67" fill="#FF9933" />
      <rect y="4.67" width="20" height="4.67" fill="#FFFFFF" />
      <rect y="9.33" width="20" height="4.67" fill="#138808" />
      <g transform="translate(10,7)">
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1="0" y1="0" x2="0" y2="-1.7"
            stroke="#000080" strokeWidth="0.28"
            transform={`rotate(${i * 15})`} />
        ))}
        <circle r="1.7" fill="none" stroke="#000080" strokeWidth="0.35" />
        <circle r="0.28" fill="#000080" />
      </g>
    </svg>
  );
}

function BankBadge({ name }: { name: string }) {
  const cfg = BANK_CFG[name] ?? { short: name.slice(0, 4).toUpperCase(), bg: "#6B7280" };
  return (
    <span
      className="inline-flex items-center justify-center rounded px-1 h-[14px] text-[7.5px] font-bold text-white shrink-0 tracking-wide"
      style={{ backgroundColor: cfg.bg }}
    >
      {cfg.short}
    </span>
  );
}
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────── */
export type RecentTxnItem = {
  id: string;
  name: string;
  amount: string;
  method: string;
  status: "success" | "failed" | "pending";
  time: string;
  date?: string;
};

type StatusNotes = {
  reason: string;
  errorCode: string;
};

type LinkedTransaction = {
  gid: string;
  name: string;
  displayAmount: string;
  status: "success" | "failed" | "pending";
  relation: string;
  txItem: RecentTxnItem;
};

type TxnDetail = {
  transactionId: string;
  email: string;
  phone: string;
  address: string;
  merchantTxnId: string;
  cardType: string;
  cardLast4: string | null;
  paymentCategory: string;
  issuerName: string;
  settlementStatus: string;
  settlementDate: string;
  utrNumber: string | null;
  comments: string;
  currency: string;
  createdAt: string;
  expectedSettlementDate?: string;
  creditedBank?: string;
  statusNotes?: StatusNotes;
  linkedTransaction?: LinkedTransaction;
  /* MCA-only fields */
  country?:               string;
  countryFlag?:           string;
  remitterName?:          string;
  settlementStatusLabel?: string;
};

/* ── Mock detail data ─────────────────────────────────────────────── */
const TXN_DETAIL_MAP: Record<string, TxnDetail> = {
  tx1: {
    transactionId: "gl_o-9d4a2b1c3e5f7g8h9i0j",
    email: "priya.mehta@gmail.com",
    phone: "+91 98765 43210",
    address: "42, Lotus Heights, Bandra West, Mumbai 400050, Maharashtra",
    merchantTxnId: "MTX-2026-PRI-001",
    cardType: "—",
    cardLast4: null,
    paymentCategory: "P2P Transfer",
    issuerName: "—",
    settlementStatus: "settled",
    settlementDate: "05 Jun 2026",
    utrNumber: "UTR2026060498765432",
    creditedBank: "HDFC Bank",
    comments: "—",
    currency: "INR",
    createdAt: "04 Jun 2026 · 10:50 AM",
    linkedTransaction: {
      gid: "GID-002",
      name: "SwiftPay Ltd",
      displayAmount: "-₹890",
      status: "failed",
      relation: "Refund attempted",
      txItem: { id: "tx3", name: "SwiftPay Ltd", amount: "₹890", method: "Net Banking", status: "failed", time: "34m ago" },
    },
  },
  tx2: {
    transactionId: "gl_o-2e5f8a1b4c7d0e3f6g9h",
    email: "accounts@rajanstores.in",
    phone: "+91 88001 22334",
    address: "Shop 12, Sarojini Nagar Market, New Delhi 110023",
    merchantTxnId: "MTX-2026-RAJ-002",
    cardType: "Mastercard",
    cardLast4: "1234",
    paymentCategory: "B2B Payment",
    issuerName: "HDFC Bank",
    settlementStatus: "settled",
    settlementDate: "04 Jun 2026",
    utrNumber: "UTR2026060488001223",
    creditedBank: "Axis Bank",
    comments: "Bulk order payment",
    currency: "INR",
    createdAt: "04 Jun 2026 · 09:32 AM",
  },
  tx3: {
    transactionId: "gl_o-3f6g9b2c5d8e1f4g7h0i",
    email: "finance@swiftpay.co",
    phone: "+91 70000 11223",
    address: "Level 3, Raheja Towers, MG Road, Bengaluru 560001, Karnataka",
    merchantTxnId: "MTX-2026-SWI-003",
    cardType: "—",
    cardLast4: null,
    paymentCategory: "Wire Transfer",
    issuerName: "—",
    settlementStatus: "—",
    settlementDate: "—",
    utrNumber: null,
    comments: "—",
    currency: "INR",
    createdAt: "04 Jun 2026 · 08:15 AM",
    statusNotes: {
      reason: "Refund declined by issuing bank",
      errorCode: "BANK_REFUND_REJECTED",
    },
    linkedTransaction: {
      gid: "GID-001",
      name: "Priya Mehta",
      displayAmount: "+₹4,500",
      status: "success",
      relation: "Refund for",
      txItem: { id: "tx1", name: "Priya Mehta", amount: "₹4,500", method: "UPI", status: "success", time: "2m ago" },
    },
  },
  tx4: {
    transactionId: "gl_o-4g7h0c3d6e9f2g5h8i1j",
    email: "ananya.kapoor@yahoo.in",
    phone: "+91 99887 66554",
    address: "C-204, Vasant Kunj Apartments, Vasant Kunj, New Delhi 110070",
    merchantTxnId: "MTX-2026-ANA-004",
    cardType: "—",
    cardLast4: null,
    paymentCategory: "P2P Transfer",
    issuerName: "—",
    settlementStatus: "pending",
    settlementDate: "—",
    expectedSettlementDate: "07 Jun 2026",
    utrNumber: null,
    comments: "—",
    currency: "INR",
    createdAt: "04 Jun 2026 · 07:58 AM",
  },
  tx5: {
    transactionId: "gl_o-5h8i1d4e7f0g3h6i9j2k",
    email: "payments@globaltech.com",
    phone: "+1 415 555 0123",
    address: "500 Oracle Parkway, Redwood Shores, CA 94065, USA",
    merchantTxnId: "MTX-2026-GLO-005",
    cardType: "Visa",
    cardLast4: "5100",
    paymentCategory: "B2B Payment",
    issuerName: "JP Morgan Chase",
    settlementStatus: "pending",
    settlementDate: "—",
    expectedSettlementDate: "06 Jun 2026",
    utrNumber: null,
    comments: "Q2 software license",
    currency: "INR",
    createdAt: "04 Jun 2026 · 06:00 AM",
  },
  tx6: {
    transactionId: "gl_o-6j2k5l8m1n4o7p0q3r6s",
    email: "yajat.gupta@payglo.in",
    phone: "+91 98765 00006",
    address: "Mumbai, Maharashtra",
    merchantTxnId: "MTX-2026-YAJ-006",
    cardType: "Visa",
    cardLast4: "990",
    paymentCategory: "P2P Transfer",
    issuerName: "—",
    settlementStatus: "pending",
    settlementDate: "—",
    expectedSettlementDate: "13 Mar 2026",
    utrNumber: null,
    comments: "—",
    currency: "INR",
    createdAt: "12 Mar 2026 · 03:22 PM",
  },
  tx8: {
    transactionId: "gl_o-8ka9pb1rc2sd3te4uf5vg",
    email: "karan.kapoor@gmail.com",
    phone: "+91 98100 55678",
    address: "14, Linking Road, Bandra West, Mumbai 400050, Maharashtra",
    merchantTxnId: "MTX-2026-KAP-008",
    cardType: "—",
    cardLast4: "3391",
    paymentCategory: "E-Commerce",
    issuerName: "—",
    settlementStatus: "—",
    settlementDate: "—",
    utrNumber: null,
    comments: "—",
    currency: "INR",
    createdAt: "04 Jun 2026 · 07:22 AM",
    statusNotes: {
      reason: "Transaction declined due to insufficient funds in the customer's account.",
      errorCode: "INSUFFICIENT_FUNDS",
    },
  },
};

/* ── MCA mock detail data ──────────────────────────────────────────── */
const MCA_TXN_DETAIL_MAP: Record<string, TxnDetail> = {
  mtx1: {
    transactionId: "mca_o-7a2b4c6d8e0f2g4h6i8j",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "sent-for-review", settlementStatusLabel: "Sent for Review",
    settlementDate: "—", expectedSettlementDate: "29 Jul 2026",
    utrNumber: null, comments: "—",
    currency: "CAD", createdAt: "27 Jul 2026 · 09:35 AM",
    country: "Canada", countryFlag: "🇨🇦", remitterName: "frm2",
  },
  mtx2: {
    transactionId: "mca_o-2b4c6d8e0f2g4h6i8j0k",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "invoice-pending", settlementStatusLabel: "Invoice Pending",
    settlementDate: "—", expectedSettlementDate: "—",
    utrNumber: null, comments: "Invoice must be uploaded before this transaction can be settled.",
    currency: "USD", createdAt: "24 Jul 2026 · 03:32 PM",
    country: "United States", countryFlag: "🇺🇸", remitterName: "frm",
  },
  mtx3: {
    transactionId: "mca_o-3c6d8e0f2g4h6i8j0k2l",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "invoice-pending", settlementStatusLabel: "Invoice Pending",
    settlementDate: "—", expectedSettlementDate: "—",
    utrNumber: null, comments: "Invoice must be uploaded before this transaction can be settled.",
    currency: "CAD", createdAt: "24 Jul 2026 · 12:28 PM",
    country: "Canada", countryFlag: "🇨🇦", remitterName: "puneethv",
  },
  mtx4: {
    transactionId: "mca_o-4d8e0f2g4h6i8j0k2l4m",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "invoice-pending", settlementStatusLabel: "Invoice Pending",
    settlementDate: "—", expectedSettlementDate: "—",
    utrNumber: null, comments: "Invoice must be uploaded before this transaction can be settled.",
    currency: "USD", createdAt: "24 Jul 2026 · 12:27 PM",
    country: "United States", countryFlag: "🇺🇸", remitterName: "puneethv",
  },
  mtx5: {
    transactionId: "mca_o-5e0f2g4h6i8j0k2l4m6n",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "settled", settlementStatusLabel: "Settled",
    settlementDate: "25 Jul 2026", utrNumber: "UTR2607US004512",
    comments: "—",
    currency: "USD", createdAt: "23 Jul 2026 · 10:23 AM",
    country: "United States", countryFlag: "🇺🇸", remitterName: "apple",
  },
  mtx6: {
    transactionId: "mca_o-6f2g4h6i8j0k2l4m6n8o",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "sent-for-review", settlementStatusLabel: "Sent for Review",
    settlementDate: "—", expectedSettlementDate: "25 Jul 2026",
    utrNumber: null, comments: "—",
    currency: "USD", createdAt: "22 Jul 2026 · 05:21 PM",
    country: "United States", countryFlag: "🇺🇸", remitterName: "test",
  },
  mtx7: {
    transactionId: "mca_o-7g4h6i8j0k2l4m6n8o0p",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "settled", settlementStatusLabel: "Settled",
    settlementDate: "24 Jul 2026", utrNumber: "UTR2207US009845",
    comments: "—",
    currency: "USD", createdAt: "22 Jul 2026 · 03:52 PM",
    country: "United States", countryFlag: "🇺🇸", remitterName: "EEFC",
  },
  mtx8: {
    transactionId: "mca_o-8h6i8j0k2l4m6n8o0p2q",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "settled", settlementStatusLabel: "Settled",
    settlementDate: "24 Jul 2026", utrNumber: "UTR2207US007731",
    comments: "—",
    currency: "USD", createdAt: "22 Jul 2026 · 02:42 PM",
    country: "United States", countryFlag: "🇺🇸", remitterName: "puneethv",
  },
  mtx9: {
    transactionId: "mca_o-9i8j0k2l4m6n8o0p2q4r",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "sent-for-review", settlementStatusLabel: "Sent for Review",
    settlementDate: "—", expectedSettlementDate: "25 Jul 2026",
    utrNumber: null, comments: "—",
    currency: "USD", createdAt: "22 Jul 2026 · 02:39 PM",
    country: "United States", countryFlag: "🇺🇸", remitterName: "puneethv",
  },
  mtx10: {
    transactionId: "mca_o-0j0k2l4m6n8o0p2q4r6s",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "sent-for-review", settlementStatusLabel: "Sent for Review",
    settlementDate: "—", expectedSettlementDate: "25 Jul 2026",
    utrNumber: null, comments: "—",
    currency: "CAD", createdAt: "22 Jul 2026 · 02:23 PM",
    country: "Canada", countryFlag: "🇨🇦", remitterName: "test",
  },
};

/* ── Status configs ───────────────────────────────────────────────── */
const STATUS_CONFIG = {
  success: { label: "Completed",   dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  failed:  { label: "Failed",      dot: "bg-red-500",     text: "text-red-700 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-950/40"         },
  pending: { label: "In Progress", dot: "bg-amber-500",   text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/40"     },
} as const;


/* ── Copy button ──────────────────────────────────────────────────── */
function VDivider() {
  return (
    <span
      className="inline-block w-px bg-border/50 shrink-0 self-center"
      style={{ height: 11 }}
      aria-hidden
    />
  );
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

/* ── Skeleton ─────────────────────────────────────────────────────── */
function Sk({ className }: { className?: string }) {
  return <div className={cn("rounded-md bg-muted/70 animate-pulse", className)} />;
}

function SkSection({ rows }: { rows: number }) {
  return (
    <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm p-4 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Sk className="h-3 w-20" />
          <Sk className="h-[18px] w-3/4" />
        </div>
      ))}
    </div>
  );
}

/* ── Section label ────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.09em] px-4 mb-2">
      {children}
    </p>
  );
}

/* ── Detail row — stacked label above value ───────────────────────── */
function DetailRow({ label, value, copy, last }: {
  label: string;
  value: React.ReactNode;
  copy?: string;
  last?: boolean;
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

/* ── Paired row — two half-width columns with vertical divider ─────── */
function PairedRow({
  left,
  right,
  last,
}: {
  left: { label: string; value: React.ReactNode };
  right: { label: string; value: React.ReactNode };
  last?: boolean;
}) {
  return (
    <div className={cn("flex", !last && "border-b border-border/50")}>
      <div className="flex-1 min-w-0 px-4 py-3.5 border-r border-border/50">
        <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">{left.label}</p>
        <div className="min-w-0">
          {typeof left.value === "string"
            ? <p className="text-[13px] font-medium text-foreground leading-snug">{left.value}</p>
            : left.value}
        </div>
      </div>
      <div className="flex-1 min-w-0 px-4 py-3.5">
        <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">{right.label}</p>
        <div className="min-w-0">
          {typeof right.value === "string"
            ? <p className="text-[13px] font-medium text-foreground leading-snug">{right.value}</p>
            : right.value}
        </div>
      </div>
    </div>
  );
}


/* ── Linked transaction row ───────────────────────────────────────── */
function LinkedTxnRow({
  linked,
  onOpen,
}: {
  linked: LinkedTransaction;
  onOpen?: (txn: RecentTxnItem) => void;
}) {
  const statusCfg = STATUS_CONFIG[linked.status];
  return (
    <button
      type="button"
      onClick={() => onOpen?.(linked.txItem)}
      className="flex items-center gap-3 w-full px-4 py-3.5 text-left active:bg-muted/30 transition-colors duration-100"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground leading-none mb-1">
          {linked.relation}
        </p>
        <p className="text-[13px] font-semibold text-foreground leading-snug">
          {linked.gid}
        </p>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {linked.name}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex flex-col items-end gap-1">
          <span className="text-[13px] font-semibold text-foreground">{linked.displayAmount}</span>
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
            statusCfg.text, statusCfg.bg,
          )}>
            <span className={cn("h-[4px] w-[4px] rounded-full shrink-0", statusCfg.dot)} />
            {statusCfg.label}
          </span>
        </div>
        <ChevronRight className="h-[15px] w-[15px] text-muted-foreground" strokeWidth={2} />
      </div>
    </button>
  );
}

/* ── Main component ───────────────────────────────────────────────── */
export function MobileTransactionDetail({
  txn,
  onClose,
  onOpenTransaction,
}: {
  txn: RecentTxnItem;
  onClose: () => void;
  onOpenTransaction?: (txn: RecentTxnItem) => void;
}) {
  const [loading, setLoading] = useState(true);

  const detail    = TXN_DETAIL_MAP[txn.id] ?? MCA_TXN_DETAIL_MAP[txn.id] ?? null;
  const isMca     = !!detail?.remitterName;
  const statusCfg = STATUS_CONFIG[txn.status];

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [txn.id]);

  /* PayGlocal Transaction ID for header */
  const txnId          = detail?.transactionId ?? txn.id.toUpperCase();
  const txnIdShort     = txnId.length > 12 ? `${txnId.slice(0, 8)}........${txnId.slice(-4)}` : txnId;

  /* Merchant Txn ID truncated for Payment Details card */
  const merchantId      = detail?.merchantTxnId ?? txn.id.toUpperCase();
  const merchantIdShort = merchantId.length > 8 ? `${merchantId.slice(0, 4)}......${merchantId.slice(-4)}` : merchantId;

  /* Date + time parts for summary card */
  const createdAtStr   = detail?.createdAt ?? (txn.date ? `${txn.date} · ${txn.time}` : txn.time);
  const createdAtParts = createdAtStr.split(" · ");

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

      {/* Drag handle */}
      <div className="flex justify-center pt-2.5 pb-0.5 shrink-0">
        <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/60 bg-background shrink-0">

        {/* Transaction ID label + grey pill */}
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">
            Transaction ID
          </p>
          <div className="inline-flex items-center gap-0.5 bg-muted-foreground/[0.12] rounded-full px-3 h-8 shrink-0">
            <span className="text-[12px] font-mono font-medium text-foreground leading-none">
              {txnIdShort}
            </span>
            <CopyBtn value={txnId} />
          </div>
        </div>

        {/* X close */}
        <button type="button" onClick={onClose}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-foreground shrink-0"
          aria-label="Close">
          <X className="h-[17px] w-[17px]" strokeWidth={2.25} />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col gap-5 pt-4 pb-10">

          {/* §0 Summary */}
          {loading ? (
            <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm p-5 space-y-3">
              <Sk className="h-10 w-52" />
              <Sk className="h-4 w-40" />
              <div className="pt-1 space-y-4">
                <Sk className="h-[18px] w-2/3" />
                <Sk className="h-[18px] w-1/2" />
              </div>
            </div>
          ) : (
            <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">

              {/* Amount + Currency + Status */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[32px] font-bold tracking-tight text-foreground leading-none">
                    {txn.amount}
                  </span>
                  <span className="text-[13px] font-medium text-muted-foreground leading-none self-end mb-0.5">
                    {detail?.currency ?? "INR"}
                  </span>
                  <span className={cn(
                    "ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold shrink-0",
                    statusCfg.text, statusCfg.bg,
                  )}>
                    <span className={cn("h-[5px] w-[5px] rounded-full shrink-0", statusCfg.dot)} />
                    {detail?.settlementStatusLabel ?? statusCfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap mt-3">
                  <span className="text-[12px] text-muted-foreground leading-snug whitespace-nowrap">
                    {createdAtParts[0]}
                  </span>
                  {createdAtParts.length > 1 && (
                    <>
                      <VDivider />
                      <span className="text-[12px] text-muted-foreground leading-snug whitespace-nowrap">
                        {createdAtParts[1]}
                      </span>
                    </>
                  )}
                  <VDivider />
                  {detail?.cardType && detail.cardType !== "—" && detail.cardLast4 ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={detail.cardType.toLowerCase() === "visa" ? "/visa.png" : "/mastercard.png"}
                        alt={detail.cardType}
                        className="h-[10px] w-auto object-contain shrink-0"
                      />
                      <span className="text-[12px] text-muted-foreground leading-snug">
                        ···{detail.cardLast4}
                      </span>
                    </>
                  ) : txn.method === "Net Banking" ? (
                    <>
                      <Landmark className="h-[13px] w-[13px] text-muted-foreground shrink-0" strokeWidth={1.75} />
                      <span className="text-[12px] text-muted-foreground leading-snug">Net Banking</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="h-[13px] w-[13px] text-muted-foreground shrink-0" strokeWidth={1.75} />
                      <span className="text-[12px] text-muted-foreground leading-snug">{txn.method}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Charged to / Received from — inside card, separated by divider */}
              <div className="border-t border-border/50 px-5 py-3.5">
                <p className="text-[12px] text-muted-foreground">
                  {isMca ? "Received from" : "Charged to"}{" "}
                  <span className="font-semibold text-primary">{txn.name}</span>
                  {" "}
                  {detail?.countryFlag
                    ? <span className="text-[13px] leading-none">{detail.countryFlag}</span>
                    : <IndiaFlag />}
                </p>
              </div>
            </div>
          )}

          {/* §1 Settlement Details */}
          {txn.status !== "failed" && (
            <div>
              <SectionLabel>Settlement Details</SectionLabel>
              {loading ? <SkSection rows={2} /> : (
                <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">

                  {/* Row 1: Settlement Status | Settlement date */}
                  <PairedRow
                    left={{
                      label: "Settlement Status",
                      value: detail?.settlementStatus === "settled" ? (
                        <div className="flex items-center gap-1.5">
                          <Check className="h-[14px] w-[14px] text-emerald-600 shrink-0" strokeWidth={2.5} />
                          <p className="text-[13px] font-medium text-foreground leading-snug">{detail?.settlementStatusLabel ?? "Settled"}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-[14px] w-[14px] text-amber-600 shrink-0" strokeWidth={2} />
                          <p className="text-[13px] font-medium text-amber-600 leading-snug">{detail?.settlementStatusLabel ?? "Pending"}</p>
                        </div>
                      ),
                    }}
                    right={{
                      label: detail?.settlementStatus === "settled" ? "Settled on" : "Expected on",
                      value: detail?.settlementStatus === "settled"
                        ? (detail?.settlementDate && detail.settlementDate !== "—" ? detail.settlementDate : "—")
                        : (detail?.expectedSettlementDate ?? "—"),
                    }}
                  />

                  {/* Row 2: UTR Number | Credited to */}
                  <PairedRow
                    last
                    left={{
                      label: "UTR Number",
                      value: detail?.utrNumber ? (
                        <div className="flex items-center gap-0.5 min-w-0">
                          <button type="button"
                            className="text-[13px] font-medium text-primary leading-snug truncate">
                            {detail.utrNumber.slice(0, 4)}......{detail.utrNumber.slice(-4)}
                          </button>
                          <CopyBtn value={detail.utrNumber} />
                        </div>
                      ) : (
                        <p className="text-[13px] font-medium text-foreground leading-snug">—</p>
                      ),
                    }}
                    right={{
                      label: "Settled to",
                      value: detail?.creditedBank ? (
                        <div className="flex items-center gap-1.5">
                          <BankBadge name={detail.creditedBank} />
                          <p className="text-[13px] font-medium text-foreground leading-snug">···432</p>
                        </div>
                      ) : (
                        <p className="text-[13px] font-medium text-foreground leading-snug">—</p>
                      ),
                    }}
                  />

                </div>
              )}
            </div>
          )}

          {/* §2 Customer Details */}
          <div>
            <SectionLabel>Customer Details</SectionLabel>
            {loading ? <SkSection rows={4} /> : isMca ? (
              <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                <DetailRow label="Remitter Name" value={detail?.remitterName ?? "—"} />
                <DetailRow label="Country"       value={detail?.country ?? "—"} />
                <DetailRow label="Comments"      value={detail?.comments ?? "—"} last />
              </div>
            ) : (
              <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                <DetailRow label="Email ID"       value={detail?.email ?? "—"}  copy={detail?.email} />
                <DetailRow label="Phone Number"  value={detail?.phone ?? "—"}  copy={detail?.phone} />
                <DetailRow label="Address"        value={detail?.address ?? "—"} />
                <DetailRow label="Comments"       value={detail?.comments ?? "—"} last />
              </div>
            )}
          </div>

          {/* §3 Payment Details — not applicable to MCA remittances */}
          {txn.status !== "failed" && !isMca && (
            <div>
              <SectionLabel>Payment Details</SectionLabel>
              {loading ? <SkSection rows={2} /> : (
                <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">

                  {/* Paired row A: Merchant Txn ID | Payment Category */}
                  <PairedRow
                    left={{
                      label: "Merchant Txn ID",
                      value: (
                        <div className="flex items-center gap-0.5 min-w-0">
                          <p className="text-[12px] font-mono font-medium text-foreground leading-snug truncate">
                            {merchantIdShort}
                          </p>
                          {detail?.merchantTxnId && <CopyBtn value={detail.merchantTxnId} />}
                        </div>
                      ),
                    }}
                    right={{
                      label: "Payment Category",
                      value: detail?.paymentCategory ?? "—",
                    }}
                  />

                  {/* Paired row B: Card Type | Issuer */}
                  <PairedRow
                    last
                    left={{ label: "Card Type", value: detail?.cardType ?? "—" }}
                    right={{ label: "Issuer",    value: detail?.issuerName ?? "—" }}
                  />
                </div>
              )}
            </div>
          )}

          {/* §4 Linked Transaction — unchanged */}
          {!loading && detail?.linkedTransaction && (
            <div>
              <SectionLabel>Linked Transaction</SectionLabel>
              <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                <LinkedTxnRow
                  linked={detail.linkedTransaction}
                  onOpen={onOpenTransaction}
                />
              </div>
            </div>
          )}

          {/* §5 Status Notes — unchanged */}
          {!loading && detail?.statusNotes && (
            <div>
              <SectionLabel>Status Notes</SectionLabel>
              <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                <DetailRow label="Reason"     value={detail.statusNotes.reason} />
                <DetailRow label="Error code" value={detail.statusNotes.errorCode} copy={detail.statusNotes.errorCode} last />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
