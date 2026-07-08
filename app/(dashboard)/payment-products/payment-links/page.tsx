"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Download, Search, RefreshCw, Copy, X, Check, Link2,
  ChevronDown, Calendar, ExternalLink, MoreHorizontal,
  Facebook, Send, AlertCircle, CheckCircle2, Clock, Ban,
} from "lucide-react";
import { ViewPortal } from "@/components/layout/ViewPortal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import type { LinkStatus, PaymentLink } from "@/components/payment-links/types";
import {
  CreatePaymentLinkModal,
  PaymentLinkSuccessModal,
} from "@/components/payment-links/CreatePaymentLinkModal";

/* ─── Mock data ──────────────────────────────────────────────────────────── */
const MOCK_LINKS: PaymentLink[] = [
  {
    id: "pl_29ab32b1",
    amount: 13,
    currency: "USD",
    status: "active",
    customer: "Deepankar Raj",
    phone: "+91 7011458408",
    email: "deepankar@payglocal.in",
    description: "Professional website design",
    createdAt: "19 Feb '26, 02:00 PM",
    expiresAt: "21 Feb '26, 02:00 PM",
    notifyVia: ["SMS", "Email"],
    transactions: [],
    shortUrl: "https://pay.gl/29ab32b1",
  },
  {
    id: "pl_38cd41c2",
    amount: 1003,
    currency: "USD",
    status: "paid",
    customer: "John Miller Antonio",
    phone: "+91 7011458408",
    email: "john.miller@example.com",
    description: "Video design freelance",
    createdAt: "19 Feb '26, 02:00 PM",
    expiresAt: "28 Feb '26, 03:59 AM",
    notifyVia: ["SMS", "Email", "WhatsApp"],
    transactions: [
      { id: "gl_o-8fa9...j0ZX2", status: "in_progress", cardLast4: "4242", date: "27 Feb '26, 02:00 PM" },
      { id: "gl_o-8fa9...j0ZX2", status: "failed", cardLast4: "4242", date: "27 Feb '26, 01:32 PM" },
    ],
  },
  {
    id: "pl_47ef52d3",
    amount: 100003,
    currency: "USD",
    status: "active",
    customer: "Deepankar Raj",
    phone: "+91 7011458408",
    email: "deepankar@payglocal.in",
    description: "Test description",
    createdAt: "19 Feb '26, 02:00 PM",
    expiresAt: "19 Feb '26, 02:00 PM",
    notifyVia: ["Email"],
    transactions: [],
  },
  {
    id: "pl_56gh63e4",
    amount: 103,
    currency: "USD",
    status: "deactivated",
    customer: "John Miller Antonio",
    phone: "+91 7011458408",
    email: "john.miller@example.com",
    description: "Website design services",
    createdAt: "19 Feb '26, 02:00 PM",
    expiresAt: null,
    notifyVia: ["WhatsApp"],
    transactions: [],
  },
];

/* ─── Status badge ───────────────────────────────────────────────────────── */
const STATUS_STYLES: Record<LinkStatus, { bg: string; text: string; border: string; label: string }> = {
  active: { bg: "#f0fdf4", text: "#15803d", border: "#86efac", label: "Active" },
  paid: { bg: "#f0fdf4", text: "#15803d", border: "#86efac", label: "Paid ✓" },
  expired: { bg: "#fff1f2", text: "#be123c", border: "#fca5a5", label: "Expired" },
  deactivated: { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb", label: "Deactivated" },
};

function StatusPill({ status }: { status: LinkStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

/* ─── Detail drawer ──────────────────────────────────────────────────────── */
const TX_STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  in_progress: { bg: "#eff6ff", text: "#1d4ed8", border: "#93c5fd" },
  failed:      { bg: "#fff1f2", text: "#be123c", border: "#fca5a5" },
  success:     { bg: "#f0fdf4", text: "#15803d", border: "#86efac" },
};

function DetailDrawer({ link, onClose }: { link: PaymentLink; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const fakeUrl = `https://api.uat.payglocal.in/gl/.../payments/${link.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(fakeUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  const isExpired     = link.status === "expired";
  const isDeactivated = link.status === "deactivated";
  const isInactive    = isExpired || isDeactivated;

  return (
    <ViewPortal>
    <>
      {/* Overlay — fades in independently */}
      <motion.div
        className="fixed inset-0 z-50 min-h-[100dvh] w-full"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={onClose}
      />

      {/* Drawer — slides in from right with spring */}
      <motion.div
        className="fixed inset-y-0 right-0 z-50 min-h-[100dvh] h-full w-full sm:max-w-[520px] bg-white flex flex-col"
        style={{ borderLeft: "1px solid #e5e7eb", boxShadow: "-16px 0 60px rgba(0,0,0,0.16)" }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top bar: X left | Payment link Id + copy right | ··· far right ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0">
            <X style={{ width: 17, height: 17 }} />
          </button>

          {/* ID group pushed to the right */}
          <div className="flex items-center gap-3 ml-auto mr-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-gray-400">Payment link Id</span>
              <span className="font-mono font-bold text-gray-800 text-[13px]">{link.id}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(link.id).catch(() => {}); toast.success("ID copied"); }}
                className="p-1 rounded hover:bg-gray-100 transition-colors">
                <Copy style={{ width: 13, height: 13, color: "#9ca3af" }} />
              </button>
            </div>
          </div>

          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0">
            <MoreHorizontal style={{ width: 17, height: 17 }} />
          </button>
        </div>

        {/* ── Hero section ── */}
        <div className="px-6 py-5" style={{ borderBottom: "1px solid #f0f0f0" }}>
          <p className="text-[13px] text-gray-400 mb-2">
            Payment link for <span className="font-semibold text-gray-700">{link.description}</span>
          </p>
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-baseline gap-2">
              <span className="text-[20px] font-semibold text-gray-400 leading-none">{link.currency}</span>
              <span className="text-[32px] font-bold text-gray-900 tabular-nums leading-none">
                {link.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </span>
            <StatusPill status={link.status} />
          </div>
          {/* URL pill */}
          <div className={cn("flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl",
            isInactive ? "bg-gray-50" : "bg-[#f0f6ff]")}
            style={{ border: `1px solid ${isInactive ? "#e5e7eb" : "#c7d9fb"}` }}>
            <span className={cn("flex-1 text-[12px] font-mono truncate",
              isInactive ? "text-gray-400 line-through" : "text-[#0061E3]")}>
              {fakeUrl}
            </span>
            {!isInactive && (
              <button onClick={copyLink}
                className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center hover:bg-[#dceafe] transition-colors">
                <Copy style={{ width: 13, height: 13, color: "#0061E3" }} />
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Link details */}
          <div className="rounded-xl p-5" style={{ border: "1px solid #e5e7eb" }}>
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Link details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {[
                { label: "Created at", value: link.createdAt },
                { label: "Expires at", value: link.expiresAt ?? "No expiry" },
                { label: "Notify at",  value: link.notifyVia.join(", ") },
                { label: "Status",     value: null, statusVal: link.status },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[11px] text-gray-400 font-medium mb-1">{item.label}</p>
                  {item.statusVal
                    ? <StatusPill status={item.statusVal as LinkStatus} />
                    : <p className="text-[13px] font-semibold text-gray-800">{item.value}</p>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Customer details — matching reference exactly */}
          <div className="rounded-xl p-5" style={{ border: "1px solid #e5e7eb" }}>
            <h3 className="text-[15px] font-bold text-gray-900 mb-5">Customer details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-0">
              {[
                { label: "Customer name", value: link.customer },
                { label: "Phone number",  value: link.phone    },
                { label: "Email Id",      value: link.email    },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[12px] text-gray-400 mb-1">{item.label}</p>
                  <p className="text-[13px] font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #f0f0f0", marginTop: "16px", paddingTop: "14px" }}>
              <p className="text-[12px] text-gray-400 mb-1.5">Billing address</p>
              <p className="text-[13px] text-gray-700 leading-[1.6]">
                Building Number: 100, T. Nagar, 33, Ranganathan Street,<br />Tamil Nadu, Chennai, 600017
              </p>
            </div>
          </div>

          {/* Transactions */}
          <div className="rounded-xl p-5" style={{ border: "1px solid #e5e7eb" }}>
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Transactions</h3>
            {link.transactions.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-3">
                <div className="relative w-16 h-14 mb-1">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-8 rounded-lg rotate-[-8deg]"
                    style={{ background: "#e8eaed", border: "1px solid #d1d5db" }} />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-8 rounded-lg rotate-[4deg]"
                    style={{ background: "#f0f2f5", border: "1px solid #e5e7eb" }} />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-10 rounded-lg bg-white flex flex-col justify-center items-center gap-1"
                    style={{ border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                    <div className="w-6 h-1 rounded-full bg-gray-200" />
                    <div className="w-4 h-1 rounded-full bg-gray-100" />
                  </div>
                </div>
                <p className="text-[14px] font-medium text-gray-500">No transactions yet</p>
                <p className="text-[12px] text-gray-400 text-center max-w-[200px]">
                  Transactions will appear here once the customer makes a payment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full" style={{ tableLayout: "fixed", minWidth: 380 }}>
                <colgroup>
                  <col style={{ width: "32%" }} />{/* Transaction Id */}
                  <col style={{ width: "28%" }} />{/* Status */}
                  <col style={{ width: "22%" }} />{/* Payment source */}
                  <col style={{ width: "18%" }} />{/* Date */}
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    {["Transaction Id", "Status", "Payment source", "Date and time"].map((h) => (
                      <th key={h} className="pb-3 text-left text-[11px] font-semibold text-gray-400 whitespace-nowrap pr-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {link.transactions.map((tx, i) => {
                    const s = TX_STATUS_STYLE[tx.status] ?? TX_STATUS_STYLE.success;
                    return (
                      <tr key={i} style={{ borderBottom: i < link.transactions.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                        <td className="py-3.5 pr-2 whitespace-nowrap overflow-hidden">
                          <span className="text-[12px] font-mono text-[#0061E3] overflow-hidden text-ellipsis block">{tx.id}</span>
                        </td>
                        <td className="py-3.5 pr-2 whitespace-nowrap">
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1"
                            style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                            {tx.status === "in_progress" ? "Sent for capture ✓" : tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3.5 pr-2 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-8 h-5 rounded overflow-hidden bg-white" style={{ border: "1px solid #e5e7eb" }}>
                              <Image src="/visa.png" alt="Visa" width={26} height={12} style={{ objectFit: "contain" }} />
                            </span>
                            <span className="text-[12px] font-mono text-gray-600">•••• {tx.cardLast4}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-[12px] text-gray-500 whitespace-nowrap">{tx.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer CTAs ── */}
        <div className="px-6 py-4 space-y-2.5" style={{ borderTop: "1px solid #f0f0f0" }}>
          <button onClick={copyLink}
            className={cn("w-full h-11 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-opacity",
              isInactive ? "opacity-40 cursor-not-allowed" : "hover:opacity-90"
            )}
            style={{ background: isInactive ? "#6b7280" : "#0061E3" }}
            disabled={isInactive}>
            {copied
              ? <><Check style={{ width: 15, height: 15 }} /> Copied!</>
              : <><Copy style={{ width: 15, height: 15 }} /> Copy payment link</>}
          </button>
          <button onClick={onClose}
            className="w-full h-10 rounded-xl text-[13px] font-medium text-[#0061E3] border border-gray-200 hover:bg-gray-50 transition-all">
            Close
          </button>
        </div>
      </motion.div>
    </>
    </ViewPortal>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
import { Suspense } from "react";

function PaymentLinksInner() {
  const searchParams = useSearchParams();
  const [links,          setLinks]          = useState<PaymentLink[]>(MOCK_LINKS);
  const [showCreate,     setShowCreate]     = useState(false);

  useEffect(() => {
    if (searchParams.get("create") === "1") setShowCreate(true);
  }, [searchParams]);
  const [successLink,    setSuccessLink]    = useState<PaymentLink | null>(null);
  const [detailLink,     setDetailLink]     = useState<PaymentLink | null>(null);
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState<"all" | LinkStatus>("all");

  const filtered = links.filter((l) => {
    const matchS = statusFilter === "all" || l.status === statusFilter;
    const matchQ = !search ||
      l.customer.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase());
    return matchS && matchQ;
  });

  const handleCreated = (link: PaymentLink) => {
    setLinks((prev) => [link, ...prev]);
    setShowCreate(false);
    setSuccessLink(link);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-gray-900 tracking-tight">Payment Links</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">{links.length} links created</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[13px] font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-all">
            <RefreshCw style={{ width: 13, height: 13 }} />
            Refresh
          </button>
          <button className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[13px] font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-all">
            <Download style={{ width: 13, height: 13 }} />
            Report
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#0061E3" }}>
            <Plus style={{ width: 14, height: 14 }} />
            Create payment link
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap"
        style={{ border: "1px solid #e5e7eb" }}>
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, email, ID…"
            className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-gray-50 border border-gray-200 rounded-lg text-gray-600 placeholder:text-gray-400 focus:outline-none transition-all"
            onFocus={(e) => { e.currentTarget.style.borderColor = "#6b7280"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(75,85,99,0.10)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
        {/* Status filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "active", "paid", "expired", "deactivated"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all capitalize",
                statusFilter === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
              )}>
              {s === "all" ? "All" : STATUS_STYLES[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div
        className="bg-white rounded-xl overflow-hidden overflow-x-auto [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent [&:hover::-webkit-scrollbar-thumb]:bg-gray-300"
        style={{ border: "1px solid #e5e7eb", scrollbarWidth: "thin", scrollbarColor: "transparent transparent" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.scrollbarColor = "#d1d5db transparent"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.scrollbarColor = "transparent transparent"; }}
      >
        <table style={{ tableLayout: "fixed", width: "100%", minWidth: 880 }}>
          <colgroup>
            <col style={{ width: 140 }} />{/* Amount */}
            <col style={{ width: 115 }} />{/* Status */}
            <col style={{ width: 155 }} />{/* Customer */}
            <col style={{ width: 200 }} />{/* Customer details */}
            <col style={{ width: 170 }} />{/* Payment link */}
            <col style={{ width: 190 }} />{/* Payment for */}
            <col style={{ width: 180 }} />{/* Created at */}
          </colgroup>
          <thead>
            <tr style={{ background: "#f0f2f5", borderBottom: "1px solid #e8eaed" }}>
              {["Amount", "Status", "Customer", "Customer details", "Payment link", "Payment for", "Created at"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 whitespace-nowrap">
                  {h === "Amount" ? (
                    <div className="flex items-center gap-1.5">
                      <span className="flex-1 text-right">{h}</span>
                      <span className="w-7" />
                    </div>
                  ) : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="py-16 flex flex-col items-center gap-2">
                  <Link2 style={{ width: 28, height: 28, color: "#d1d5db" }} />
                  <p className="text-[13px] text-gray-400">No payment links found</p>
                </div>
              </td></tr>
            ) : filtered.map((link, i) => (
              <tr key={link.id}
                className="group transition-all duration-150"
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f0f0f0" : "none" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f5f7ff";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)";
                  e.currentTarget.style.position = "relative";
                  e.currentTarget.style.zIndex = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.zIndex = "auto";
                }}
              >
                {/* Amount */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-baseline gap-1.5">
                    <span className="flex-1 text-[13px] font-semibold text-gray-900 tabular-nums text-right">
                      {link.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="w-7 text-[11px] text-gray-400 font-medium">{link.currency}</span>
                  </div>
                </td>
                {/* Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusPill status={link.status} />
                </td>
                {/* Customer */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-[13px] font-medium text-gray-800">{link.customer}</span>
                </td>
                {/* Customer details */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-[13px] font-medium text-gray-700">{link.phone}</p>
                  <p className="text-[12px] text-gray-500">{link.email}</p>
                </td>
                {/* Payment link — short URL */}
                <td className="px-4 py-3 max-w-0 w-[170px]">
                  {(() => {
                    const shortUrl = link.shortUrl ?? `https://pay.gl/${link.id.slice(3, 11)}`;
                    const display = shortUrl.replace("https://", "");
                    return (
                      <div className="group/link flex items-center gap-1.5 w-full overflow-hidden">
                        <span
                          className="text-[12px] font-bold font-mono text-[#0061E3] truncate"
                          title={shortUrl}
                        >
                          {display}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(shortUrl).catch(() => {});
                            toast.success("Short link copied!");
                          }}
                          className="flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity w-6 h-6 rounded-md flex items-center justify-center bg-[#eff4ff] hover:bg-[#dceafe] border border-[#c7d9fb]"
                          title="Copy short link"
                        >
                          <Copy style={{ width: 11, height: 11, color: "#0061E3" }} />
                        </button>
                      </div>
                    );
                  })()}
                </td>
                {/* Payment for */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-[13px] text-gray-700 truncate max-w-[170px]">{link.description}</p>
                  {link.expiresAt && (
                    <p className="text-[11px] mt-0.5 whitespace-nowrap" style={{
                      color: link.status === "expired" ? "#be123c" : "#f59e0b"
                    }}>
                      {link.status === "expired" ? "Expired today" : `Expiring ${link.expiresAt}`}
                    </p>
                  )}
                </td>
                {/* Created at — View details overlays on hover */}
                <td className="px-4 py-3 whitespace-nowrap relative" style={{ overflow: "hidden" }}>
                  <span className="text-[13px] text-gray-700">{link.createdAt}</span>
                  <div
                    className="absolute inset-y-0 right-0 flex items-center pr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto"
                    style={{ background: "linear-gradient(to right, transparent, #f5f7ff 28%)", paddingLeft: 40 }}
                  >
                    <button
                      onClick={() => setDetailLink(link)}
                      className="inline-flex items-center px-3 py-1.5 text-[12px] font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:text-gray-900 whitespace-nowrap"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
                    >
                      View details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: "1px solid #f0f0f0" }}>
          <span className="text-[12px] text-gray-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-1.5">
            <ExternalLink style={{ width: 12, height: 12, color: "#9ca3af" }} />
            <span className="text-[12px] text-gray-400">Page 1 of 1</span>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showCreate && (
          <CreatePaymentLinkModal key="create" onClose={() => setShowCreate(false)} onCreate={handleCreated} />
        )}
        {successLink && (
          <PaymentLinkSuccessModal key="success" link={successLink} onClose={() => setSuccessLink(null)} />
        )}
        {detailLink  && <DetailDrawer key="detail" link={detailLink} onClose={() => setDetailLink(null)} />}
      </AnimatePresence>
    </div>
  );
}

export default function PaymentLinksPage() {
  return (
    <Suspense>
      <PaymentLinksInner />
    </Suspense>
  );
}
