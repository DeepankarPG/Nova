"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Clock, ChevronRight, Wallet, Landmark, CreditCard, FileText } from "lucide-react";
import { toast } from "sonner";

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

/* MCA settlement lifecycle stepper — a transaction either still needs an
 * invoice (Document Pending, "current" step shows the upload dropzone) or
 * has already cleared that step and is progressing toward settlement. */
type TimelineStepState = "done" | "current" | "upcoming";

type TimelineStep = {
  id:          string;
  label:       string;
  state:       TimelineStepState;
  dateLabel?:  string;
  subLabel?:   string;
  showUpload?: boolean;
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
  remitterName?:          string;
  settlementStatusLabel?: string;
  mcaTimeline?:           TimelineStep[];
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

/* ── Settlement timeline builders ─────────────────────────────────────
 * Workflow 1 — needs invoice: Fund Received (done) → Invoice Uploaded
 * (current, shows the upload dropzone) → every later milestone upcoming.
 * Workflow 2 — invoice not required: Fund Received through Sent for
 * Settlement are already done, only FX/Settlement/FIRC remain. */
function docPendingTimeline(fundReceivedAt: string, amount: string, invoiceDueAt: string): TimelineStep[] {
  return [
    { id: "fund-received",       label: "Fund Received",             state: "done",     dateLabel: fundReceivedAt, subLabel: amount },
    { id: "invoice-uploaded",    label: "Invoice Uploaded",          state: "current",  dateLabel: invoiceDueAt, showUpload: true },
    { id: "invoice-approved",    label: "Invoice Approved",          state: "upcoming", dateLabel: "Expected 14 Aug" },
    { id: "compliance-accepted", label: "Compliance Accepted",       state: "upcoming", dateLabel: "Expected 14 Aug" },
    { id: "fund-received-pg",    label: "Fund Received at PG House", state: "upcoming", dateLabel: "Expected 14 Aug" },
    { id: "sent-for-settlement", label: "Sent for Settlement",       state: "upcoming", dateLabel: "Expected 14 Aug" },
    { id: "fx-booked",           label: "FX Booked",                 state: "upcoming", dateLabel: "Expected 17 Aug" },
    { id: "settled",             label: "Settled",                   state: "upcoming", dateLabel: "Expected 17 Aug" },
    { id: "firc-received",       label: "FIRC Received",             state: "upcoming" },
  ];
}

function sentForSettlementTimeline(doneAt: string, amount: string): TimelineStep[] {
  return [
    { id: "fund-received",       label: "Fund Received",             state: "done", dateLabel: doneAt, subLabel: amount },
    { id: "compliance-accepted", label: "Compliance Accepted",       state: "done", dateLabel: doneAt },
    { id: "fund-received-pg",    label: "Fund Received at PG House", state: "done", dateLabel: doneAt },
    { id: "sent-for-settlement", label: "Sent for Settlement",       state: "done", dateLabel: doneAt },
    { id: "fx-booked",           label: "FX Booked",                 state: "upcoming", dateLabel: "Expected 17 Aug" },
    { id: "settled",             label: "Settled",                   state: "upcoming", dateLabel: "Expected 17 Aug" },
    { id: "firc-received",       label: "FIRC Received",             state: "upcoming" },
  ];
}

/* ── MCA mock detail data ─────────────────────────────────────────────
 * Rows mtx1–mtx4 need an invoice (Document Pending); mtx5–mtx6 have
 * already cleared that step (Sent For Settlement) — mirrors the two rows
 * of MCA_TABLE_TXNS in MobileTransactions.tsx. */
const MCA_TXN_DETAIL_MAP: Record<string, TxnDetail> = {
  mtx1: {
    transactionId: "mca_o-1a3b5c7d9e1f3g5h7i9j",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "document-pending", settlementStatusLabel: "Document Pending",
    settlementDate: "—", expectedSettlementDate: "—",
    utrNumber: null, comments: "—",
    currency: "GBP", createdAt: "13 Aug 2026 · 04:32 PM",
    remitterName: "Test Debtor Name",
    mcaTimeline: docPendingTimeline("13 Aug · 04:39 PM", "£30,000", "14 Aug · 05:07 AM"),
  },
  mtx2: {
    transactionId: "mca_o-2b4c6d8e0f2g4h6i8j0k",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "document-pending", settlementStatusLabel: "Document Pending",
    settlementDate: "—", expectedSettlementDate: "—",
    utrNumber: null, comments: "—",
    currency: "GBP", createdAt: "13 Aug 2026 · 04:29 PM",
    remitterName: "Test Debtor Name",
    mcaTimeline: docPendingTimeline("13 Aug · 04:36 PM", "£12", "14 Aug · 05:03 AM"),
  },
  mtx3: {
    transactionId: "mca_o-3c5d7e9f1g3h5i7j9k1l",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "document-pending", settlementStatusLabel: "Document Pending",
    settlementDate: "—", expectedSettlementDate: "—",
    utrNumber: null, comments: "—",
    currency: "GBP", createdAt: "13 Aug 2026 · 04:26 PM",
    remitterName: "Test Debtor Name",
    mcaTimeline: docPendingTimeline("13 Aug · 04:33 PM", "£26", "14 Aug · 05:01 AM"),
  },
  mtx4: {
    transactionId: "mca_o-4d6e8f0g2h4i6j8k0l2m",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "document-pending", settlementStatusLabel: "Document Pending",
    settlementDate: "—", expectedSettlementDate: "—",
    utrNumber: null, comments: "—",
    currency: "EUR", createdAt: "13 Aug 2026 · 04:26 PM",
    remitterName: "Test Debtor Name",
    mcaTimeline: docPendingTimeline("13 Aug · 04:33 PM", "€10", "14 Aug · 05:01 AM"),
  },
  mtx5: {
    transactionId: "mca_o-5e7f9g1h3i5j7k9l1m3n",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "sent-for-settlement", settlementStatusLabel: "Sent For Settlement",
    settlementDate: "—", expectedSettlementDate: "17 Aug 2026",
    utrNumber: null, comments: "—",
    currency: "GBP", createdAt: "12 Aug 2026 · 03:27 PM",
    remitterName: "AMAZON",
    mcaTimeline: sentForSettlementTimeline("12 Aug · 03:27 PM", "£45,000"),
  },
  mtx6: {
    transactionId: "mca_o-6f8g0h2i4j6k8l0m2n4o",
    email: "—", phone: "—", address: "—",
    merchantTxnId: "—", cardType: "—", cardLast4: null,
    paymentCategory: "—", issuerName: "—",
    settlementStatus: "sent-for-settlement", settlementStatusLabel: "Sent For Settlement",
    settlementDate: "—", expectedSettlementDate: "17 Aug 2026",
    utrNumber: null, comments: "—",
    currency: "GBP", createdAt: "12 Aug 2026 · 03:24 PM",
    remitterName: "AMAZON",
    mcaTimeline: sentForSettlementTimeline("12 Aug · 03:24 PM", "£30,000"),
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


/* ── Settlement timeline — vertical stepper with dashed connector ───── */
function TimelineStepIcon({ state }: { state: TimelineStepState }) {
  if (state === "done") {
    return (
      <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
      </div>
    );
  }
  if (state === "current") {
    return (
      <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
        <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
      </div>
    );
  }
  return <div className="h-6 w-6 rounded-full border-2 border-border bg-card shrink-0" />;
}

function InvoiceUploadDropzone({ onTap }: { onTap: () => void }) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="mt-3 w-full flex flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-primary/50 bg-primary/[0.03] active:bg-primary/[0.07] transition-colors"
      style={{ height: 140 }}
    >
      <FileText className="h-6 w-6 text-primary/70" strokeWidth={1.5} />
      <p className="text-[13.5px] font-semibold text-primary">Tap to upload files</p>
      <p className="text-[11px] text-muted-foreground">Accepted: .pdf under 10MB</p>
    </button>
  );
}

function SettlementTimeline({ steps, onUploadTap }: { steps: TimelineStep[]; onUploadTap: () => void }) {
  if (steps.length === 0) return null;
  return (
    <div className="relative">
      <div className="absolute left-[11px] top-3 bottom-3 border-l border-dashed border-border" aria-hidden />
      <div className="space-y-5 relative">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start gap-3">
            <TimelineStepIcon state={step.state} />
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className={cn(
                  "text-[13px] leading-snug",
                  step.state === "upcoming" ? "font-medium text-muted-foreground" : "font-semibold text-foreground"
                )}>
                  {step.label}
                </p>
                {step.dateLabel && (
                  <span className={cn(
                    "text-[11px] shrink-0 whitespace-nowrap",
                    step.state === "current" ? "font-semibold text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                  )}>
                    {step.dateLabel}
                  </span>
                )}
              </div>
              {step.subLabel && (
                <p className="text-[12px] text-muted-foreground mt-0.5">{step.subLabel}</p>
              )}
              {step.showUpload && <InvoiceUploadDropzone onTap={onUploadTap} />}
            </div>
          </div>
        ))}
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

  /* MCA statuses (Document Pending / Sent For Settlement) use their own
   * amber/green coloring rather than the PG success/failed/pending map. */
  const displayStatusCfg = isMca
    ? (detail?.settlementStatus === "document-pending"
      ? { text: "text-amber-700 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/40",   dot: "bg-amber-500"   }
      : { text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", dot: "bg-emerald-500" })
    : statusCfg;

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
                    displayStatusCfg.text, displayStatusCfg.bg,
                  )}>
                    <span className={cn("h-[5px] w-[5px] rounded-full shrink-0", displayStatusCfg.dot)} />
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
                  {isMca ? (
                    <CreditCard className="h-[13px] w-[13px] text-muted-foreground shrink-0" strokeWidth={1.75} />
                  ) : detail?.cardType && detail.cardType !== "—" && detail.cardLast4 ? (
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

              {/* Charged to — inside card, separated by divider */}
              <div className="border-t border-border/50 px-5 py-3.5">
                <p className="text-[12px] text-muted-foreground">
                  Charged to{" "}
                  <span className="font-semibold text-primary">{txn.name}</span>
                  {!isMca && (<>{" "}<IndiaFlag /></>)}
                </p>
              </div>
            </div>
          )}

          {/* §1a Settlement Timeline — MCA only */}
          {isMca && (
            <div>
              <SectionLabel>Settlement Timeline</SectionLabel>
              {loading ? <SkSection rows={3} /> : (
                <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm p-4">
                  <SettlementTimeline
                    steps={detail?.mcaTimeline ?? []}
                    onUploadTap={() => toast("Invoice upload is coming soon")}
                  />
                </div>
              )}
            </div>
          )}

          {/* §1 Settlement Details — PG only */}
          {txn.status !== "failed" && !isMca && (
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

          {/* §2 Customer Details — PG only */}
          {!isMca && (
            <div>
              <SectionLabel>Customer Details</SectionLabel>
              {loading ? <SkSection rows={4} /> : (
                <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                  <DetailRow label="Email ID"       value={detail?.email ?? "—"}  copy={detail?.email} />
                  <DetailRow label="Phone Number"  value={detail?.phone ?? "—"}  copy={detail?.phone} />
                  <DetailRow label="Address"        value={detail?.address ?? "—"} />
                  <DetailRow label="Comments"       value={detail?.comments ?? "—"} last />
                </div>
              )}
            </div>
          )}

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
