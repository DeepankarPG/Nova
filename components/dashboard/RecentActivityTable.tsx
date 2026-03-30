"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { CreditCard, Building2, ArrowRight } from "lucide-react";
import { cn, formatDate, truncate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableRowSkeleton } from "@/components/shared/ShimmerSkeleton";

type Transaction = {
  id: string; amount: number; currency: string; status: string;
  method: string; cardBrand?: string | null; cardLast4?: string | null;
  customerName: string; email: string; date: string;
};
type Settlement = {
  id: string; amount: number; currency: string; status: string;
  bankAccount: string; transactionCount: number; date: string;
};

/* ── Card brand mini-badge ─────────────────────────────────────────────── */
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
  return <CreditCard className="w-4 h-4 text-muted-foreground" />;
}

function PaymentMethod({ method, cardBrand, cardLast4 }: {
  method: string; cardBrand?: string | null; cardLast4?: string | null;
}) {
  if (method === "card") {
    return (
      <div className="flex items-center gap-1.5">
        <CardBrand brand={cardBrand} />
        <span className="text-[13px] text-muted-foreground font-mono">•••• {cardLast4 ?? "—"}</span>
      </div>
    );
  }
  if (method === "upi") return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center justify-center w-8 h-5 rounded text-[9px] font-black bg-muted text-[#5f259f] dark:text-violet-300">UPI</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5">
      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[13px] text-muted-foreground">Netbanking</span>
    </div>
  );
}

function fmtAmt(amount: number, currency: string) {
  const s = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : `${currency} `;
  return `${s}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

/* ── Column header ─────────────────────────────────────────────────────── */
const TH = ({ children, hideOnMobile }: { children: React.ReactNode; hideOnMobile?: boolean }) => (
  <th
    className={cn(
      "px-4 py-3 text-left text-[11px] font-semibold text-foreground/75 dark:text-foreground/85 whitespace-nowrap",
      hideOnMobile && "hidden md:table-cell"
    )}
  >
    {children}
  </th>
);

export function RecentActivityTable({ transactions, settlements, isLoading }: {
  transactions: Transaction[]; settlements: Settlement[]; isLoading?: boolean;
}) {
  const [tab, setTab] = useState<"transactions" | "settlements">("transactions");

  return (
    <div className="bg-card text-card-foreground rounded-xl overflow-hidden border border-border">

      {/* ── Card header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-0">
        <h3 className="text-[15px] font-semibold text-foreground">Recent Activity</h3>
        <Link href={tab === "transactions" ? "/transactions" : "/settlement-reports"}
          className="flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary/80 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center px-6 pt-4 border-b border-border">
        {(["transactions", "settlements"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("relative pb-3 px-1 mr-6 text-[13px] font-medium transition-colors capitalize",
              tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}>
            {t}
            {tab === t && (
              <motion.div layoutId="act-tab"
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-primary"
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Table ────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <AnimatePresence mode="wait">
          {tab === "transactions" ? (
            <motion.table key="tx" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              style={{ tableLayout: "fixed", width: "100%", minWidth: 800 }}>
              <colgroup>
                <col style={{ width: 120 }} />{/* Amount */}
                <col style={{ width: 140 }} />{/* Status */}
                <col style={{ width: 130 }} />{/* Method */}
                <col style={{ width: 145 }} />{/* Customer name */}
                <col style={{ width: 185 }} />{/* Email */}
                <col style={{ width: 150 }} />{/* Transaction ID */}
                <col style={{ width: 148 }} />{/* Date */}
                <col style={{ width: 160 }} />{/* CTA */}
              </colgroup>
              <thead>
                <tr className="bg-muted border-b border-border">
                  <TH>Amount</TH>
                  <TH>Status</TH>
                  <TH hideOnMobile>Payment method</TH>
                  <TH>Customer name</TH>
                  <TH hideOnMobile>Email</TH>
                  <TH hideOnMobile>Transaction ID</TH>
                  <TH hideOnMobile>Date and time</TH>
                  <th className="pr-4" />{/* spacer / CTA header */}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={9} />)
                ) : (
                  transactions.slice(0, 7).map((tx, i) => (
                    <tr key={tx.id}
                      className={cn(
                        "group transition-all duration-150 border-b border-border/70 last:border-b-0",
                        "hover:bg-primary/5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)] dark:hover:bg-primary/[0.14] dark:hover:shadow-none",
                        "hover:relative hover:z-10"
                      )}>
                      {/* Amount */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-foreground tabular-nums text-[13px]">{fmtAmt(tx.amount, tx.currency)}</span>
                        <span className="ml-1.5 text-[11px] text-muted-foreground font-medium">{tx.currency}</span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={tx.status} size="sm" /></td>
                      {/* Method */}
                      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                        <PaymentMethod method={tx.method} cardBrand={tx.cardBrand} cardLast4={tx.cardLast4} />
                      </td>
                      {/* Customer name */}
                      <td className="px-4 py-3 whitespace-nowrap overflow-hidden">
                        <span className="text-[13px] font-medium text-foreground">{tx.customerName}</span>
                      </td>
                      {/* Email */}
                      <td className="px-4 py-3 whitespace-nowrap overflow-hidden hidden md:table-cell">
                        <span className="text-[13px] text-muted-foreground">{tx.email}</span>
                      </td>
                      {/* Transaction ID */}
                      <td className="px-4 py-3 whitespace-nowrap overflow-hidden hidden md:table-cell">
                        <span className="text-[13px] font-mono text-primary/70 hover:text-primary transition-colors cursor-pointer">
                          {tx.id}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 whitespace-nowrap text-[13px] text-muted-foreground hidden md:table-cell">
                        {formatDate(tx.date)}
                      </td>
                      {/* Hover CTA */}
                      <td className="pl-3 pr-5 text-left align-middle">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center px-3 py-1.5 text-[12px] font-medium text-foreground bg-card rounded-lg border border-border hover:border-muted-foreground/50 whitespace-nowrap shadow-sm">
                          View details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </motion.table>
          ) : (
            <motion.table key="stl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              style={{ tableLayout: "fixed", width: "100%", minWidth: 700 }}>
              <colgroup>
                <col style={{ width: 170 }} />{/* Settlement ID */}
                <col style={{ width: 135 }} />{/* Amount */}
                <col style={{ width: 125 }} />{/* Status */}
                <col style={{ width: 155 }} />{/* Bank */}
                <col style={{ width: 110 }} />{/* Transactions */}
                <col style={{ width: 135 }} />{/* Date */}
                <col style={{ width: 140 }} />{/* CTA */}
              </colgroup>
              <thead>
                <tr className="bg-muted border-b border-border">
                  <TH>Settlement ID</TH>
                  <TH>Amount</TH>
                  <TH>Status</TH>
                  <TH>Bank</TH>
                  <TH>Transactions</TH>
                  <TH>Date</TH>
                  <th />{/* spacer */}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                ) : (
                  settlements.map((s, i) => (
                    <tr key={s.id}
                      className={cn(
                        "group transition-all duration-150 border-b border-border/70 last:border-b-0",
                        "hover:bg-primary/5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)] dark:hover:bg-primary/[0.14] dark:hover:shadow-none",
                        "hover:relative hover:z-10"
                      )}>
                      <td className="px-4 py-3 whitespace-nowrap overflow-hidden">
                        <span className="text-[13px] font-mono text-primary/70 hover:text-primary transition-colors cursor-pointer">
                          {truncate(s.id, 16)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-semibold text-foreground tabular-nums text-[13px]">
                        ₹{s.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={s.status} size="sm" /></td>
                      <td className="px-4 py-3 whitespace-nowrap text-[13px] text-muted-foreground">{s.bankAccount}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-[13px] text-muted-foreground">{s.transactionCount} txns</td>
                      <td className="px-4 py-3 whitespace-nowrap text-[13px] text-muted-foreground">
                        {formatDate(s.date, { year: "2-digit", month: "short", day: "2-digit" })}
                      </td>
                      {/* Hover CTA */}
                      <td className="pl-3 pr-5 text-left align-middle">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center px-3 py-1.5 text-[12px] font-medium text-foreground bg-card rounded-lg border border-border hover:border-muted-foreground/50 whitespace-nowrap shadow-sm">
                          View report
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </motion.table>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
