"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Download,
  Search,
  CreditCard,
  Smartphone,
  Building2,
  X,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Receipt,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ViewPortal } from "@/components/layout/ViewPortal";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { Shimmer } from "@/components/ui/skeleton";
import { cn, formatTableDateTime } from "@/lib/utils";
import { allTransactions } from "@/lib/mock-data";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-context";

type Transaction = typeof allTransactions[number];

/* ─── Extended detail fields (simulates data from a detail API call) ─── */
type TxnDetail = {
  phone: string;
  address: string;
  merchantTxnId: string;
  paymentCategory: string;
  issuerName: string;
  settlementStatus: string;
  settlementDate: string;
  utrNumber: string | null;
};

const TXN_DETAIL_MAP: Record<string, TxnDetail> = {
  "gl_o-9d...sj0l7X2": {
    phone: "+91 98765 43210",
    address: "42, Koramangala 4th Block, Bengaluru, Karnataka 560034",
    merchantTxnId: "ORD-2026-8847",
    paymentCategory: "E-commerce",
    issuerName: "HDFC Bank",
    settlementStatus: "Pending",
    settlementDate: "13 Mar 2026",
    utrNumber: null,
  },
  "gl_o-8c...pk3m9Y4": {
    phone: "+1 (312) 555-0182",
    address: "1200 N Lake Shore Dr, Chicago, IL 60610, USA",
    merchantTxnId: "ORD-2026-7734",
    paymentCategory: "Subscription",
    issuerName: "Chase Bank",
    settlementStatus: "Pending",
    settlementDate: "13 Mar 2026",
    utrNumber: null,
  },
  "gl_o-7b...qr2n8Z3": {
    phone: "+91 91234 56789",
    address: "10, Residency Road, Pune, Maharashtra 411001",
    merchantTxnId: "ORD-2026-6621",
    paymentCategory: "E-commerce",
    issuerName: "Axis Bank (UPI)",
    settlementStatus: "Pending",
    settlementDate: "13 Mar 2026",
    utrNumber: null,
  },
  "gl_o-6a...wt4p6A1": {
    phone: "+353 87 245 6789",
    address: "22 St Stephen's Green, Dublin 2, D02 A638, Ireland",
    merchantTxnId: "ORD-2026-5509",
    paymentCategory: "E-commerce",
    issuerName: "AIB Bank",
    settlementStatus: "Not settled",
    settlementDate: "—",
    utrNumber: null,
  },
  "gl_o-5f...mn5q7B8": {
    phone: "+91 99887 76654",
    address: "14, Connaught Place, New Delhi 110001",
    merchantTxnId: "ORD-2026-4418",
    paymentCategory: "B2B Payment",
    issuerName: "SBI (Netbanking)",
    settlementStatus: "Pending",
    settlementDate: "13 Mar 2026",
    utrNumber: null,
  },
  "gl_o-4e...lk8r5C6": {
    phone: "+91 93456 12378",
    address: "88, Bandra West, Mumbai, Maharashtra 400050",
    merchantTxnId: "ORD-2026-3305",
    paymentCategory: "E-commerce",
    issuerName: "ICICI Bank",
    settlementStatus: "Pending",
    settlementDate: "12 Mar 2026",
    utrNumber: null,
  },
  "gl_o-3d...ji9s4D5": {
    phone: "+44 7911 234567",
    address: "15 King's Parade, Cambridge CB2 1SJ, United Kingdom",
    merchantTxnId: "ORD-2026-2194",
    paymentCategory: "E-commerce",
    issuerName: "Barclays Bank",
    settlementStatus: "Refunded",
    settlementDate: "11 Mar 2026",
    utrNumber: "UTR2603110098",
  },
  "gl_o-2c...gh0t3E4": {
    phone: "+91 98100 22334",
    address: "204, Sector 62, Noida, Uttar Pradesh 201301",
    merchantTxnId: "ORD-2026-1083",
    paymentCategory: "B2B Payment",
    issuerName: "Kotak Mahindra Bank",
    settlementStatus: "Pending",
    settlementDate: "12 Mar 2026",
    utrNumber: null,
  },
  "gl_o-1b...fe1u2F3": {
    phone: "+971 50 344 5567",
    address: "Office 1204, Emaar Square, Downtown Dubai, UAE",
    merchantTxnId: "ORD-2026-0972",
    paymentCategory: "Cross-border",
    issuerName: "Emirates NBD",
    settlementStatus: "Pending",
    settlementDate: "12 Mar 2026",
    utrNumber: null,
  },
  "gl_o-0a...cd2v1G2": {
    phone: "+91 96555 77889",
    address: "Plot 12, Gachibowli, Hyderabad, Telangana 500032",
    merchantTxnId: "ORD-2026-0861",
    paymentCategory: "E-commerce",
    issuerName: "Paytm Payments Bank (UPI)",
    settlementStatus: "Processing",
    settlementDate: "11 Mar 2026",
    utrNumber: null,
  },
  "gl_o-9z...bc3w0H1": {
    phone: "+65 9123 4567",
    address: "1 HarbourFront Avenue, Keppel Bay Tower, Singapore 098632",
    merchantTxnId: "ORD-2026-9750",
    paymentCategory: "Cross-border",
    issuerName: "DBS Bank (JCB)",
    settlementStatus: "Not settled",
    settlementDate: "—",
    utrNumber: null,
  },
  "gl_o-8y...ab4x9I0": {
    phone: "+91 97234 88990",
    address: "77, MG Road, Bengaluru, Karnataka 560001",
    merchantTxnId: "ORD-2026-8639",
    paymentCategory: "B2B Payment",
    issuerName: "Canara Bank (Netbanking)",
    settlementStatus: "Pending",
    settlementDate: "10 Mar 2026",
    utrNumber: null,
  },
};

/* ─── Breakpoint detection ───────────────────────────────────────── */
function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = (e: MediaQueryListEvent) => setDesktop(e.matches);
    setDesktop(mql.matches);
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return desktop;
}

/* ─── Filters and table helpers ──────────────────────────────────── */
const statusOptions = [
  "All",
  "sent_for_capture",
  "in_progress",
  "failed",
  "refunded",
] as const;

function statusFilterLabel(s: string) {
  if (s === "All") return "All";
  if (s === "sent_for_capture") return "Sent for capture";
  if (s === "in_progress") return "In progress";
  if (s === "refunded") return "Refunded";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
const methodOptions = ["All", "card", "upi", "netbanking"];

const methodIcons: Record<string, React.ReactNode> = {
  card:       <CreditCard  className="w-3.5 h-3.5 text-muted-foreground" />,
  upi:        <Smartphone  className="w-3.5 h-3.5 text-muted-foreground" />,
  netbanking: <Building2   className="w-3.5 h-3.5 text-muted-foreground" />,
};

const CURRENCY_GLYPH: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  SGD: "S$",
};

function fmtAmountNumber(amount: number) {
  return amount.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

const AMOUNT_CODE_COL = "w-10 shrink-0";

function AmountColumnHeader() {
  return (
    <div className="flex w-full min-w-0 items-baseline gap-2">
      <div className="min-w-0 flex-1 text-right">
        <span className="inline-block whitespace-nowrap text-[11px] font-semibold tabular-nums text-muted-foreground">
          Amount
        </span>
      </div>
      <span className={cn(AMOUNT_CODE_COL)} aria-hidden />
    </div>
  );
}

function AmountCell({ amount, currency }: { amount: number; currency: string }) {
  const glyph = CURRENCY_GLYPH[currency] ?? "";
  const num = fmtAmountNumber(amount);
  return (
    <div className="flex w-full min-w-0 items-baseline gap-2">
      <div className="min-w-0 flex-1 text-right">
        <span className="inline-block whitespace-nowrap text-[13px] font-semibold tabular-nums text-foreground">
          {glyph}{num}
        </span>
      </div>
      <span className={cn(AMOUNT_CODE_COL, "text-left text-[11px] font-normal tabular-nums text-muted-foreground")}>
        {currency}
      </span>
    </div>
  );
}

function CardBrand({ brand }: { brand: string | null | undefined }) {
  if (brand === "visa") return (
    <span className="inline-flex items-center justify-center w-8 h-5 rounded overflow-hidden bg-card border border-border">
      <Image src="/visa.png" alt="Visa" width={26} height={12} style={{ objectFit: "contain" }} />
    </span>
  );
  if (brand === "mastercard") return (
    <span className="inline-flex items-center justify-center w-8 h-5 rounded overflow-hidden bg-card border border-border">
      <Image src="/mastercard.png" alt="Mastercard" width={28} height={18} style={{ objectFit: "contain" }} />
    </span>
  );
  if (brand === "jcb") return (
    <span className="inline-flex items-center justify-center w-8 h-5 rounded overflow-hidden bg-card border border-border">
      <Image src="/jcb.png" alt="JCB" width={28} height={18} style={{ objectFit: "contain" }} />
    </span>
  );
  return <span className="inline-flex items-center justify-center w-8 h-5 rounded text-[9px] font-bold text-muted-foreground bg-muted">CARD</span>;
}

function TransactionIdCell({ id }: { id: string }) {
  return (
    <div className="group/id flex min-w-0 max-w-full items-center gap-1.5">
      <span className="min-w-0 flex-1 truncate text-[13px] font-mono text-muted-foreground" title={id}>
        {id}
      </span>
      <button
        type="button"
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          "text-muted-foreground opacity-0 transition-opacity",
          "hover:bg-muted hover:text-foreground",
          "group-hover/id:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label="Copy transaction ID"
        title="Copy"
        onClick={() => {
          void navigator.clipboard.writeText(id).then(
            () => toast.success("Copied"),
            () => toast.error("Could not copy")
          );
        }}
      >
        <Copy className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

function PaymentMethod({ row }: { row: Transaction }) {
  if (row.method === "card") return (
    <div className="flex items-center gap-1">
      <CardBrand brand={row.cardBrand} />
      <span className="text-[13px] text-muted-foreground font-mono">
        … {row.cardLast4 ?? "—"}
      </span>
    </div>
  );
  if (row.method === "upi") return (
    <span className="inline-flex items-center justify-center w-8 h-5 rounded text-[9px] font-black bg-muted text-[#5f259f] dark:text-violet-300">UPI</span>
  );
  return (
    <div className="flex items-center gap-1">
      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[13px] text-muted-foreground">Netbanking</span>
    </div>
  );
}

/* ─── Panel: payment method display ─────────────────────────────── */
function PanelPaymentMethod({ txn }: { txn: Transaction }) {
  if (txn.method === "card") {
    return (
      <div className="flex items-center gap-1.5">
        <CardBrand brand={txn.cardBrand} />
        <span className="text-[13px] font-semibold font-mono text-gray-800">
          •••• {txn.cardLast4}
        </span>
      </div>
    );
  }
  if (txn.method === "upi") {
    return (
      <span className="inline-flex items-center justify-center w-8 h-5 rounded text-[9px] font-black bg-[#f3e8ff] text-[#5f259f]">
        UPI
      </span>
    );
  }
  return <span className="text-[13px] font-semibold text-gray-800">Netbanking</span>;
}

/* ─── Transaction detail side panel ─────────────────────────────── */
function TransactionDetailDrawer({
  txn,
  onClose,
}: {
  txn: Transaction;
  onClose: () => void;
}) {
  const [detail, setDetail]   = useState<TxnDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError]   = useState(false);
  const [copied, setCopied]       = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setDetail(null);
    const t = setTimeout(() => {
      const d = TXN_DETAIL_MAP[txn.id];
      if (d) {
        setDetail(d);
      } else {
        setHasError(true);
      }
      setIsLoading(false);
    }, 480);
    return () => clearTimeout(t);
  }, [txn.id, retryCount]);

  const copyId = () => {
    navigator.clipboard.writeText(txn.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Transaction ID copied");
  };

  const glyph = CURRENCY_GLYPH[txn.currency] ?? "";
  const formattedAmount = txn.amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <ViewPortal>
      <>
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 z-50 min-h-[100dvh] w-full"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          className="fixed inset-y-0 right-0 z-50 min-h-[100dvh] h-full w-full sm:max-w-[520px] bg-white flex flex-col"
          style={{ borderLeft: "1px solid #e5e7eb", boxShadow: "-16px 0 60px rgba(0,0,0,0.16)" }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-6 pt-5 pb-4"
            style={{ borderBottom: "1px solid #f0f0f0" }}
          >
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <X style={{ width: 17, height: 17 }} />
            </button>
            <div className="flex items-center gap-1.5 ml-auto min-w-0 overflow-hidden">
              <span className="text-[12px] text-gray-400 flex-shrink-0">Transaction ID</span>
              <span
                className="font-mono font-bold text-gray-800 text-[12px] truncate max-w-[130px]"
                title={txn.id}
              >
                {txn.id}
              </span>
              <button
                onClick={copyId}
                className="flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors"
                title="Copy transaction ID"
              >
                {copied
                  ? <Check style={{ width: 13, height: 13, color: "#16a34a" }} />
                  : <Copy style={{ width: 13, height: 13, color: "#9ca3af" }} />
                }
              </button>
            </div>
          </div>

          {/* Hero: amount + status */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #f0f0f0" }}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-baseline gap-1.5">
                <span className="text-[20px] font-semibold text-gray-400 leading-none">
                  {txn.currency}
                </span>
                <span className="text-[32px] font-bold text-gray-900 tabular-nums leading-none">
                  {glyph}{formattedAmount}
                </span>
              </span>
              <StatusBadge status={txn.status} size="sm" />
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {isLoading ? (
              /* Skeleton */
              <>
                {[5, 3, 3].map((fieldCount, si) => (
                  <div
                    key={si}
                    className="rounded-xl p-5 space-y-4"
                    style={{ border: "1px solid #e5e7eb" }}
                  >
                    <Shimmer className="h-5 w-40" rounded="md" />
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {Array.from({ length: fieldCount }, (_, i) => (
                        <div key={i} className="space-y-1.5">
                          <Shimmer className="h-3 w-16" rounded="sm" />
                          <Shimmer className="h-4 w-28" rounded="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : hasError ? (
              /* Error state */
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-gray-800">
                    Failed to load details
                  </p>
                  <p className="text-[13px] text-gray-400 mt-1">
                    Could not fetch transaction data. Please try again.
                  </p>
                </div>
                <button
                  onClick={() => setRetryCount((n) => n + 1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-[#0061E3] border border-[#0061E3]/30 hover:bg-blue-50 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            ) : detail ? (
              /* Content */
              <>
                {/* Transaction details */}
                <div className="rounded-xl p-5" style={{ border: "1px solid #e5e7eb" }}>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-4">
                    Transaction details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {[
                      { label: "Created at",        value: formatTableDateTime(txn.date) },
                      { label: "Merchant txn ID",   value: detail.merchantTxnId },
                      { label: "Payment category",  value: detail.paymentCategory },
                      { label: "Issuer",            value: detail.issuerName },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[11px] text-gray-400 font-medium mb-1">{label}</p>
                        <p className="text-[13px] font-semibold text-gray-800">{value}</p>
                      </div>
                    ))}
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium mb-1.5">
                        Payment method
                      </p>
                      <PanelPaymentMethod txn={txn} />
                    </div>
                  </div>
                </div>

                {/* Customer details */}
                <div className="rounded-xl p-5" style={{ border: "1px solid #e5e7eb" }}>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-5">
                    Customer details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {[
                      { label: "Customer name", value: txn.customerName },
                      { label: "Email ID",      value: txn.email        },
                      { label: "Phone number",  value: detail.phone     },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[12px] text-gray-400 mb-1">{label}</p>
                        <p className="text-[13px] font-bold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 16, paddingTop: 14 }}>
                    <p className="text-[12px] text-gray-400 mb-1.5">Billing address</p>
                    <p className="text-[13px] text-gray-700 leading-[1.6]">{detail.address}</p>
                  </div>
                </div>

                {/* Settlement details */}
                <div className="rounded-xl p-5" style={{ border: "1px solid #e5e7eb" }}>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-4">
                    Settlement details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {[
                      { label: "Status",           value: detail.settlementStatus },
                      { label: "Settlement date",  value: detail.settlementDate   },
                      { label: "UTR number",       value: detail.utrNumber ?? "—" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[11px] text-gray-400 font-medium mb-1">{label}</p>
                        <p className="text-[13px] font-semibold text-gray-800">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-4" style={{ borderTop: "1px solid #f0f0f0" }}>
            <button
              onClick={onClose}
              className="w-full h-10 rounded-xl text-[13px] font-medium text-[#0061E3] border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      </>
    </ViewPortal>
  );
}

/* ─── Table column definitions ────────────────────────────────────── */
const columns: Column<Transaction>[] = [
  {
    key: "amount",
    header: <AmountColumnHeader />,
    align: "right",
    width: "200px",
    minWidth: 184,
    render: (row) => <AmountCell amount={row.amount} currency={row.currency} />,
  },
  {
    key: "status",
    header: "Status",
    width: "176px",
    render: (row) => <StatusBadge status={row.status} size="sm" />,
  },
  {
    key: "method",
    header: "Payment method",
    width: "138px",
    render: (row) => <PaymentMethod row={row} />,
  },
  {
    key: "customer",
    header: "Customer name",
    width: "148px",
    maxWidth: 180,
    cellClassName: "max-w-0",
    render: (row) => (
      <span
        className="block min-w-0 max-w-full truncate text-[13px] font-medium text-foreground"
        title={row.customerName}
      >
        {row.customerName}
      </span>
    ),
  },
  {
    key: "email",
    header: "Email",
    width: "196px",
    maxWidth: 240,
    cellClassName: "max-w-0",
    render: (row) => (
      <span
        className="block min-w-0 max-w-full truncate text-[13px] font-normal text-muted-foreground"
        title={row.email}
      >
        {row.email}
      </span>
    ),
  },
  {
    key: "id",
    header: "Transaction ID",
    width: "192px",
    maxWidth: 220,
    cellClassName: "max-w-0",
    render: (row) => <TransactionIdCell id={row.id} />,
  },
  {
    key: "date",
    header: "Date and time",
    width: "152px",
    render: (row) => (
      <span className="whitespace-nowrap text-[13px] font-normal text-muted-foreground">
        {formatTableDateTime(row.date)}
      </span>
    ),
  },
];

/* ─── Page ────────────────────────────────────────────────────────── */
export default function TransactionsPage() {
  const [isLoading,    setIsLoading]    = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [isExporting,  setIsExporting]  = useState(false);
  const [selectedTxn,  setSelectedTxn]  = useState<Transaction | null>(null);

  const isDesktop = useIsDesktop();
  const { selectedMid } = useWorkspace();

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const scopeSubtitle = `${selectedMid.name} · MID ····${selectedMid.maskedId}`;

  const filtered = useMemo(() => allTransactions.filter((tx) => {
    const matchSearch  = !search || tx.customerName.toLowerCase().includes(search.toLowerCase()) || tx.email.toLowerCase().includes(search.toLowerCase()) || tx.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus  = statusFilter === "All" || tx.status === statusFilter;
    const matchMethod  = methodFilter === "All" || tx.method === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  }), [search, statusFilter, methodFilter]);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsExporting(false);
    toast.success("Export complete", { description: "transactions.csv has been downloaded" });
  };

  const hasActive = statusFilter !== "All" || methodFilter !== "All" || search;

  return (
    <>
      <div className="w-full max-w-[1400px] space-y-4">
        <PageHeader
          title="Transactions"
          subtitle={scopeSubtitle}
          actions={
            <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}
              isLoading={isExporting} onClick={handleExport}>
              Export CSV
            </Button>
          }
        />

        {/* Summary strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard
            title="Total Volume"
            value={847250}
            currency="INR"
            change={8.4}
            changeLabel="vs last month"
            icon={BarChart2}
            iconPreset="brand"
            index={0}
            sparkline={[62,71,59,80,74,88,76,91,85,95,89,100]}
            tooltip="Gross value of all payment transactions processed in the current period, before refunds and fees."
          />
          <StatCard
            title="Success Rate"
            value={94.2}
            suffix="%"
            subtitle="last 30 days"
            change={1.2}
            changeLabel="vs last month"
            icon={CheckCircle2}
            iconPreset="green"
            index={1}
            sparkline={[78,82,80,85,83,88,86,90,89,92,91,94]}
            tooltip="Percentage of initiated transactions that were successfully captured. Higher is better; industry average is ~91%."
          />
          <StatCard
            title="Avg. Ticket Size"
            value={2475}
            currency="INR"
            change={-3.1}
            changeLabel="vs last month"
            icon={Receipt}
            iconPreset="amber"
            index={2}
            sparkline={[88,82,85,79,83,76,80,74,77,72,75,70]}
            tooltip="Mean transaction value calculated as total volume divided by number of successful payments in the period."
          />
          <StatCard
            title="Failed"
            value={2}
            subtitle="needs attention"
            change={-50}
            changeLabel="vs last month"
            icon={AlertCircle}
            iconPreset="red"
            index={3}
            sparkline={[8,6,9,5,7,4,6,3,5,3,4,2]}
            tooltip="Transactions declined or errored during processing. Review failed payments to identify drop-off patterns."
          />
        </div>

        {/* Filter bar */}
        <div className="bg-card text-card-foreground rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap border border-border">

          {/* Search */}
          <div className="relative min-w-[160px] max-w-xs flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search customer, email, ID…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground/50 focus:ring-2 focus:ring-ring/20 transition-all"
            />
          </div>

          <div className="hidden sm:block h-4 w-px bg-border" />

          {/* Status pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {statusOptions.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                  statusFilter === s
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}>
                {statusFilterLabel(s)}
              </button>
            ))}
          </div>

          <div className="hidden sm:block h-4 w-px bg-border" />

          {/* Method pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {methodOptions.map((m) => (
              <button key={m} onClick={() => setMethodFilter(m)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                  methodFilter === m
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}>
                {m !== "All" && methodIcons[m]}
                {m === "All" ? "All Methods" : m === "netbanking" ? "Net Banking" : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {hasActive && (
            <button onClick={() => { setSearch(""); setStatusFilter("All"); setMethodFilter("All"); }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground ml-auto transition-colors">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {hasActive && !isLoading && (
          <p className="text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of {allTransactions.length}
          </p>
        )}

        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          skeletonRows={8}
          emptyTitle="No transactions found"
          emptyDescription="Try adjusting your filters"
          rowKey={(row) => row.id}
          pageSize={10}
          density="compact"
          snug
          footerSummary="count"
          footerCountLabels={{ singular: "result", plural: "results" }}
          rowCta={
            isDesktop
              ? { label: "View details", onClick: (row) => setSelectedTxn(row) }
              : undefined
          }
        />
      </div>

      {/* Transaction detail panel — desktop only, rendered via portal */}
      <AnimatePresence>
        {selectedTxn && (
          <TransactionDetailDrawer
            key={selectedTxn.id}
            txn={selectedTxn}
            onClose={() => setSelectedTxn(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
