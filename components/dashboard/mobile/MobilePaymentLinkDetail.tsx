"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Link2Off, Wallet, Landmark, FileText } from "lucide-react";
import { deactivateLinkId } from "@/components/dashboard/mobile/MobilePaymentLinks";
import { cn } from "@/lib/utils";
import type { RecentTxnItem } from "@/components/dashboard/mobile/MobileTransactionDetail";

/* ── Types ────────────────────────────────────────────────────────── */
type PLStatus  = "active" | "paid" | "expired" | "deactivated";
type PlTxnStatus = "sent_for_capture" | "failed";

type PlTxn = {
  gid: string;
  status: PlTxnStatus;
  cardNetwork?: "visa" | "mastercard";
  cardLast4?: string;
  date: string;
};

type PLDetail = {
  plId: string;
  url: string;
  paymentFor: string;
  amount: number;
  currency: string;
  status: PLStatus;
  createdAt: string;
  expiresAt: string | null;
  notifyAt: string;
  customerName: string;
  phone: string;
  email: string;
  billingAddress: string;
  transactions: PlTxn[];
};

/* ── Detail data map ──────────────────────────────────────────────── */
const PL_DETAIL_MAP: Record<string, PLDetail> = {
  "PL-001": {
    plId: "pl_29ab32b1",
    url: "https://api.uat.payglocal.in/gl/.../payments/pl_29ab32b1",
    paymentFor: "Professional website design",
    amount: 13.00,
    currency: "USD",
    status: "active",
    createdAt: "19 Feb '26, 02:00 PM",
    expiresAt: "21 Feb '26, 02:00 PM",
    notifyAt: "SMS, Email",
    customerName: "Deepankar Raj",
    phone: "+91 7011458408",
    email: "deepankar@payglocal.in",
    billingAddress: "Building Number: 100, T. Nagar, 33, Ranganathan Street, Tamil Nadu, Chennai, 600017",
    transactions: [],
  },
  "PL-002": {
    plId: "pl_38cd44f2",
    url: "https://api.uat.payglocal.in/gl/.../payments/pl_38cd44f2",
    paymentFor: "Video design freelance",
    amount: 1003.00,
    currency: "USD",
    status: "paid",
    createdAt: "19 Feb '26, 02:00 PM",
    expiresAt: "28 Feb '26, 03:59 AM",
    notifyAt: "SMS, Email",
    customerName: "John Miller Antonio",
    phone: "+91 7011458408",
    email: "john.miller@example.com",
    billingAddress: "42, Lotus Heights, Bandra West, Mumbai 400050, Maharashtra",
    transactions: [
      { gid: "gl_o-8fa9b1c2d3e4f5g6h7i8j0ZX2", status: "sent_for_capture", cardNetwork: "visa", cardLast4: "4242", date: "27 Feb '26, 02:15 PM" },
      { gid: "gl_o-8fa9b1c2d3e4f5g6h7i8j0ZX2", status: "failed",            cardNetwork: "visa", cardLast4: "4242", date: "27 Feb '26, 01:48 PM" },
    ],
  },
  "PL-003": {
    plId: "pl_47ef55a3",
    url: "https://api.uat.payglocal.in/gl/.../payments/pl_47ef55a3",
    paymentFor: "Test description",
    amount: 100003.00,
    currency: "USD",
    status: "active",
    createdAt: "19 Feb '26, 02:00 PM",
    expiresAt: "19 Feb '26, 02:00 PM",
    notifyAt: "Email",
    customerName: "Deepankar Raj",
    phone: "+91 7011458408",
    email: "deepankar@payglocal.in",
    billingAddress: "Building Number: 100, T. Nagar, 33, Ranganathan Street, Tamil Nadu, Chennai, 600017",
    transactions: [],
  },
  "PL-004": {
    plId: "pl_56gh66b4",
    url: "https://api.uat.payglocal.in/gl/.../payments/pl_56gh66b4",
    paymentFor: "Website design services",
    amount: 103.00,
    currency: "USD",
    status: "deactivated",
    createdAt: "19 Feb '26, 02:00 PM",
    expiresAt: null,
    notifyAt: "SMS",
    customerName: "John Miller Antonio",
    phone: "+91 7011458408",
    email: "john.miller@example.com",
    billingAddress: "Shop 12, Sarojini Nagar Market, New Delhi 110023",
    transactions: [],
  },
};

/* ── Status config ────────────────────────────────────────────────── */
const STATUS_CFG: Record<PLStatus, {
  label: string;
  dot: string;
  text: string;
  bg: string;
  border: string;
  showCheck: boolean;
}> = {
  active:      { label: "Active",      dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50",    border: "",               showCheck: false },
  paid:        { label: "Paid",        dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50",    border: "",               showCheck: true  },
  expired:     { label: "Expired",     dot: "bg-muted-foreground/50", text: "text-muted-foreground", bg: "bg-muted", border: "",          showCheck: false },
  deactivated: { label: "Deactivated", dot: "bg-muted-foreground/50", text: "text-muted-foreground", bg: "bg-transparent", border: "border border-border", showCheck: false },
};

/* ── Helpers ──────────────────────────────────────────────────────── */
function fmtAmount(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function truncateMiddle(str: string, maxLen = 44): string {
  if (str.length <= maxLen) return str;
  const keep = Math.floor((maxLen - 3) / 2);
  return `${str.slice(0, keep)}...${str.slice(-keep)}`;
}

/* ── Shared sub-components (matching MobileTransactionDetail style) ── */
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
  label: string;
  value: React.ReactNode;
  copy?: string;
  last?: boolean;
}) {
  return (
    <div className={cn("px-4 py-3.5", !last && "border-b border-border/50")}>
      <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">{label}</p>
      <div className="flex items-center gap-1 min-w-0">
        <div className="min-w-0 flex-1">
          {typeof value === "string"
            ? <p className="text-[13px] font-medium text-foreground leading-snug">{value}</p>
            : value}
        </div>
        {copy && <CopyBtn value={copy} />}
      </div>
    </div>
  );
}

function PairedRow({
  left,
  right,
  last,
}: {
  left:  { label: string; value: React.ReactNode };
  right: { label: string; value: React.ReactNode };
  last?: boolean;
}) {
  return (
    <div className={cn("flex items-start", !last && "border-b border-border/50")}>
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

function StatusBadge({ status }: { status: PLStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold",
      cfg.text, cfg.bg, cfg.border,
    )}>
      <span className={cn("h-[5px] w-[5px] rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
      {cfg.showCheck && <Check className="h-[9px] w-[9px]" strokeWidth={2.5} />}
    </span>
  );
}

/* ── Transaction-level status config ─────────────────────────────── */
const TXN_STATUS_CFG: Record<PlTxnStatus, {
  label: string;
  text: string;
  bg: string;
  showCheck: boolean;
}> = {
  sent_for_capture: { label: "Sent for capture", text: "text-emerald-700", bg: "bg-emerald-50", showCheck: true  },
  failed:           { label: "Failed",            text: "text-red-700",     bg: "bg-red-50",    showCheck: false },
};

function TxnStatusBadge({ status }: { status: PlTxnStatus }) {
  const cfg = TXN_STATUS_CFG[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold leading-tight",
      cfg.text, cfg.bg,
    )}>
      {cfg.label}
      {cfg.showCheck && <Check className="h-[8px] w-[8px] shrink-0" strokeWidth={2.5} />}
    </span>
  );
}

/* ── Transactions section ─────────────────────────────────────────── */
function TransactionsSection({
  txns,
  customerName,
  onOpenTransaction,
}: {
  txns: PlTxn[];
  customerName: string;
  onOpenTransaction?: (txn: RecentTxnItem) => void;
}) {
  const isEmpty = txns.length === 0;

  function gidShort(gid: string) {
    return gid.length > 12 ? `${gid.slice(0, 8)}...${gid.slice(-4)}` : gid;
  }

  function openTxn(t: PlTxn) {
    onOpenTransaction?.({
      id: t.gid,
      name: customerName,
      amount: "—",
      method: t.cardNetwork ? "Card" : "UPI",
      status: t.status === "sent_for_capture" ? "success" : "failed",
      time: t.date,
    });
  }

  return (
    <div>
      <SectionLabel>Transactions</SectionLabel>
      <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center px-6 py-10 gap-3">
            <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[13px] font-semibold text-muted-foreground">No transactions yet</p>
              <p className="text-[11.5px] text-muted-foreground/70 leading-snug max-w-[220px] mx-auto">
                Transactions will appear here once the customer makes a payment.
              </p>
            </div>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            <div style={{ minWidth: 370 }}>

              {/* Header row */}
              <div className="flex items-center px-3 py-2 border-b border-border/60 bg-muted/30">
                <p className="text-[9.5px] font-semibold text-muted-foreground uppercase tracking-wide w-[27%]">Transaction Id</p>
                <p className="text-[9.5px] font-semibold text-muted-foreground uppercase tracking-wide w-[30%]">Status</p>
                <p className="text-[9.5px] font-semibold text-muted-foreground uppercase tracking-wide w-[20%]">Source</p>
                <p className="text-[9.5px] font-semibold text-muted-foreground uppercase tracking-wide w-[23%]">Date & time</p>
              </div>

              {/* Data rows */}
              <div className="divide-y divide-border/50">
                {txns.map((t, i) => (
                  <div key={i} className="flex items-center px-3 py-2.5">

                    {/* Col 1 — GID */}
                    <div className="w-[27%] pr-1">
                      <button
                        type="button"
                        onClick={() => openTxn(t)}
                        className="text-[10px] font-mono font-medium text-primary leading-tight text-left active:opacity-60 transition-opacity"
                      >
                        {gidShort(t.gid)}
                      </button>
                    </div>

                    {/* Col 2 — Status */}
                    <div className="w-[30%] pr-1">
                      <TxnStatusBadge status={t.status} />
                    </div>

                    {/* Col 3 — Payment source */}
                    <div className="w-[20%] pr-1 flex items-center gap-1">
                      {t.cardNetwork ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={t.cardNetwork === "visa" ? "/visa.png" : "/mastercard.png"}
                            alt={t.cardNetwork}
                            className="h-[10px] w-auto object-contain shrink-0"
                          />
                          <span className="text-[10px] text-muted-foreground leading-tight">
                            ···· {t.cardLast4}
                          </span>
                        </>
                      ) : (
                        <>
                          <Wallet className="h-[10px] w-[10px] text-muted-foreground shrink-0" strokeWidth={1.75} />
                          <span className="text-[10px] text-muted-foreground leading-tight">UPI</span>
                        </>
                      )}
                    </div>

                    {/* Col 4 — Date */}
                    <div className="w-[23%]">
                      <p className="text-[10px] text-muted-foreground leading-snug">{t.date}</p>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────── */
export function MobilePaymentLinkDetail({
  linkId,
  onClose,
  onOpenTransaction,
}: {
  linkId: string;
  onClose: () => void;
  onOpenTransaction?: (txn: RecentTxnItem) => void;
}) {
  const [showDisableSheet, setShowDisableSheet] = useState(false);

  const detail = PL_DETAIL_MAP[linkId];
  if (!detail) return null;

  const plIdShort = detail.plId.length > 12
    ? `${detail.plId.slice(0, 8)}...${detail.plId.slice(-4)}`
    : detail.plId;

  function copyUrl() {
    navigator.clipboard.writeText(detail.url).catch(() => {});
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

      {/* Drag handle */}
      <div className="flex justify-center pt-2.5 pb-0.5 shrink-0">
        <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/60 bg-background shrink-0">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">
            Payment Link ID
          </p>
          <div className="inline-flex items-center gap-0.5 bg-muted-foreground/[0.12] rounded-full px-3 h-8">
            <span className="text-[12px] font-mono font-medium text-foreground leading-none">
              {plIdShort}
            </span>
            <CopyBtn value={detail.plId} />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {detail.status !== "deactivated" && (
            <button
              type="button"
              onClick={() => setShowDisableSheet(true)}
              className="flex items-center gap-1.5 px-2 h-9 rounded-full text-red-600 active:opacity-60 transition-opacity"
            >
              <Link2Off className="h-[14px] w-[14px]" strokeWidth={2} />
              <span className="text-[13px] font-semibold">Disable</span>
            </button>
          )}
          <button type="button" onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-foreground"
            aria-label="Close">
            <X className="h-[17px] w-[17px]" strokeWidth={2.25} />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col gap-5 pt-5 pb-6">

          {/* Summary */}
          <div className="px-4 space-y-3">
            <p className="text-[13px] text-muted-foreground leading-snug">
              Payment link for{" "}
              <span className="font-bold text-foreground">{detail.paymentFor}</span>
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[32px] font-bold tracking-tight text-foreground leading-none">
                {fmtAmount(detail.amount)}
              </span>
              <span className="text-[13px] font-medium text-muted-foreground leading-none">
                {detail.currency}
              </span>
              <StatusBadge status={detail.status} />
            </div>
          </div>

          {/* URL pill */}
          <div className="px-4">
            <button
              type="button"
              onClick={() => window.open(detail.url, "_blank")}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl active:opacity-70 transition-opacity"
              style={{ background: "rgba(59,130,246,0.07)" }}
            >
              <span className="flex-1 text-[12px] text-primary font-medium leading-snug text-left break-all">
                {truncateMiddle(detail.url)}
              </span>
              <span
                role="button"
                aria-label="Copy URL"
                onClick={e => { e.stopPropagation(); copyUrl(); }}
                className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg text-primary"
              >
                <Copy className="h-[13px] w-[13px]" strokeWidth={2} />
              </span>
            </button>
          </div>

          {/* LINK DETAILS */}
          <div>
            <SectionLabel>Link Details</SectionLabel>
            <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <PairedRow
                left={{  label: "Created at", value: detail.createdAt }}
                right={{ label: "Expires at",  value: detail.expiresAt ?? "—" }}
              />
              <PairedRow
                last
                left={{  label: "Notify at", value: detail.notifyAt }}
                right={{ label: "Status",    value: <StatusBadge status={detail.status} /> }}
              />
            </div>
          </div>

          {/* CUSTOMER DETAILS */}
          <div>
            <SectionLabel>Customer Details</SectionLabel>
            <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <PairedRow
                left={{  label: "Customer name", value: <p className="text-[13px] font-semibold text-foreground leading-snug">{detail.customerName}</p> }}
                right={{ label: "Phone number",  value: (
                  <div className="flex items-start gap-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground leading-snug truncate flex-1 min-w-0">{detail.phone}</p>
                    <CopyBtn value={detail.phone} />
                  </div>
                )}}
              />
              <DetailRow
                label="Email ID"
                value={detail.email}
                copy={detail.email}
              />
              <DetailRow
                last
                label="Billing address"
                value={<p className="text-[13px] font-medium text-foreground leading-snug">{detail.billingAddress}</p>}
              />
            </div>
          </div>

          {/* TRANSACTIONS */}
          <TransactionsSection
            txns={detail.transactions}
            customerName={detail.customerName}
            onOpenTransaction={onOpenTransaction}
          />

        </div>
      </div>

      {/* Footer CTAs */}
      <div className="shrink-0 border-t border-border/50 px-4 pt-3.5 pb-4 space-y-2 bg-background">
        <button
          type="button"
          onClick={copyUrl}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-white text-[15px] font-bold active:scale-[0.98] transition-all"
        >
          <Copy className="h-[15px] w-[15px]" strokeWidth={2} />
          Copy payment link
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 text-[15px] font-semibold text-primary active:opacity-60 transition-opacity"
        >
          Close
        </button>
      </div>

    </div>

    {/* Confirmation bottom sheet */}
    <AnimatePresence>
      {showDisableSheet && (
        <>
          <motion.div
            className="absolute inset-0 z-[10] rounded-t-3xl"
            style={{ background: "rgba(0,0,0,0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setShowDisableSheet(false)}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-[20] bg-background rounded-t-3xl"
            style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
            </div>
            <div className="px-5 pt-3 pb-6">
              <div className="mb-4">
                <h3 className="text-[16px] font-bold text-foreground mb-2">Disable payment link?</h3>
                <p className="text-[13.5px] text-muted-foreground leading-relaxed">
                  This will immediately deactivate the link. The customer will no longer be able to make a payment using this link. This action cannot be undone.
                </p>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    deactivateLinkId(linkId);
                    setShowDisableSheet(false);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center py-3.5 rounded-2xl bg-red-600 text-white text-[15px] font-bold active:scale-[0.98] transition-all"
                >
                  Disable link
                </button>
                <button
                  type="button"
                  onClick={() => setShowDisableSheet(false)}
                  className="w-full py-3 text-[15px] font-semibold text-primary active:opacity-60 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    </div>
  );
}
