"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Copy, Check, MoreHorizontal, Search, Download,
  Eye, Send, FileText, ChevronDown, X,
  Building2, CreditCard, Trash2, RefreshCw, ImageIcon,
  PenLine, Mail, Link2, MessageSquare, AlertCircle, Users,
  Receipt, User, GripVertical, Pencil, Tag,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/Button";
import { DatePicker } from "@/components/shared/DatePicker";
import { invoiceLinks } from "@/lib/mock-data";
import { toast } from "sonner";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type InvoiceLink = typeof invoiceLinks[number];

interface Recipient {
  id:     string;
  name:   string;
  email:  string;
  role:   "primary" | "cc";
  avatar: string;
}

interface LineItem {
  id:          string;
  name:        string;
  description: string;
  qty:         number;
  rate:        number;
  tax:         number;
  taxLabel?:   string;
  hsn?:       string;
  discount?:   string;
  discountType?: "percent" | "flat";
  itemType?:  "amount" | "quantity" | "hours";
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/** SSR-safe date formatter — produces identical output on server and client */
function fmtDateSafe(dateStr: string): string {
  const d = new Date(dateStr);
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const day   = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS[d.getUTCMonth()];
  const year  = String(d.getUTCFullYear()).slice(2);
  const hh    = d.getUTCHours();
  const mm    = String(d.getUTCMinutes()).padStart(2, "0");
  const ampm  = hh >= 12 ? "PM" : "AM";
  const h12   = String(hh % 12 || 12).padStart(2, "0");
  return `${day} ${month} '${year}, ${h12}:${mm} ${ampm}`;
}

function fmtTimeSafe(d: Date): string {
  const hh   = d.getUTCHours();
  const mm   = String(d.getUTCMinutes()).padStart(2, "0");
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12  = String(hh % 12 || 12).padStart(2, "0");
  return `${h12}:${mm} ${ampm}`;
}

const fmtAmt = (n: number, currency: string) => {
  const s = currency === "USD" ? "$" : "₹";
  return `${s}${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS: [string, string][] = [
  ["#e0f2fe","#0369a1"], ["#fce7f3","#9d174d"],
  ["#d1fae5","#065f46"], ["#ede9fe","#5b21b6"],
  ["#fef3c7","#92400e"], ["#fee2e2","#991b1b"],
];
function avatarColor(name: string): [string, string] {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function Avatar({ name, size = 7 }: { name: string; size?: number }) {
  const [bg, text] = avatarColor(name);
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0`}
      style={{ background: bg, color: text }}>
      {initials(name)}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none",
        checked ? "bg-[#0061E3]" : "bg-gray-200"
      )}
    >
      <span className={cn(
        "inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow-sm transition-transform duration-200",
        checked ? "translate-x-4" : "translate-x-0.5"
      )} />
    </button>
  );
}

function OptionalBadge() {
  return (
    <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md"
      style={{ background: "#f0f2f5", color: "#6b7280" }}>
      Optional
    </span>
  );
}

const RECENT_CUSTOMERS: Recipient[] = [
  { id: "rc1", name: "Priya Mehta",   email: "priya@startupxyz.in", role: "primary", avatar: "" },
  { id: "rc2", name: "Rohan Shah",    email: "rohan@venture.co",    role: "primary", avatar: "" },
  { id: "rc3", name: "Deepankar Kumar", email: "deepankar@acmecorp.in", role: "primary", avatar: "" },
];

const TAX_OPTIONS = ["None", "5% GST", "12% GST", "18% GST", "28% GST"];

const BILLER_PROFILE = {
  biller: { name: "Bhavya Artworks", address: "Street 123, Chikkanhalli,\nBengaluru 560035", gstin: "29AABCU9603R1ZX" },
  bank:   { holder: "Bhavya Artworks", accountNo: "GB14TCCL…509064", bank: "Currency Cloud", routing: "TCCLGB3L" },
};

/** Payflow monthly template — prefilled for demo */
const PAYFLOW_TEMPLATE = {
  template: "Payflow design — monthly",
  dueDate: (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  })(),
  recurring: true,
  frequency: "Monthly",
  recurringStart: new Date().toISOString().split("T")[0],
  recipients: [
    { id: "pf_r1", name: "Acme Corp", email: "accounts@acmecorp.in", role: "primary", avatar: "" },
  ] as Recipient[],
  lineItems: [
    { id: "pf_li1", name: "Monthly platform fee", description: "SaaS subscription", qty: 1, rate: 25000, tax: 18, taxLabel: "18% GST", hsn: "998314", itemType: "quantity" as const },
    { id: "pf_li2", name: "API usage", description: "Extra API calls", qty: 1500, rate: 2, tax: 18, taxLabel: "18% GST", hsn: "998314", itemType: "quantity" as const },
    { id: "pf_li3", name: "Support retainer", description: "Dedicated support", qty: 1, rate: 15000, tax: 18, taxLabel: "18% GST", hsn: "998316", itemType: "quantity" as const },
  ],
  notes: "Thank you for your business. Payment is due within 30 days of invoice date.",
  terms: "Late payments attract 1.5% monthly interest. All amounts in INR.",
  gst: true,
  logoEnabled: true,
  sigEnabled: true,
  logoUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='36' viewBox='0 0 140 36'%3E%3Crect width='140' height='36' fill='%230061E3' rx='6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='system-ui' font-size='14' font-weight='bold'%3EPayGlocal%3C/text%3E%3C/svg%3E",
  sigUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='40' viewBox='0 0 120 40'%3E%3Cpath d='M10 28 Q30 12 50 22 T90 18' stroke='%23111' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3Ctext x='60' y='35' fill='%236b7280' font-size='9' font-family='system-ui'%3ESignature%3C/text%3E%3C/svg%3E",
};

/* ═══════════════════════════════════════════════════════════════════════════
   LIST VIEW
═══════════════════════════════════════════════════════════════════════════ */
function ListView({ onNew }: { onNew: () => void }) {
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");
  const [copied, setCopied]       = useState<string | null>(null);
  const [menu, setMenu]           = useState<string | null>(null);

  const statuses = ["all", "active", "paid", "overdue", "draft"];

  const filtered = invoiceLinks.filter(row => {
    const matchFilter = filter === "all" || row.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || row.customer.toLowerCase().includes(q)
      || row.invoiceNumber.toLowerCase().includes(q)
      || row.email.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  function copyLink(link: string, id: string) {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Link copied");
  }

  const statusCount = (s: string) =>
    s === "all" ? invoiceLinks.length : invoiceLinks.filter(r => r.status === s).length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Invoice Links</h1>
          <p className="text-sm text-gray-400 mt-0.5">{invoiceLinks.length} invoices created</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={onNew}>
            New Invoice
          </Button>
        </div>
      </div>

      {/* Filter + search bar */}
      <div className="bg-white rounded-xl px-4 py-2.5 flex items-center gap-3 flex-wrap"
        style={{ border: "1px solid #e5e7eb" }}>
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer, invoice ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-600 placeholder:text-gray-400 focus:outline-none transition-all"
            onFocus={e => { e.currentTarget.style.borderColor = "#6b7280"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(75,85,99,0.10)"; }}
            onBlur={e  => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
        <div className="hidden sm:block h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-1 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                filter === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              )}>
              {s === "all" ? `All (${statusCount("all")})` : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden overflow-x-auto" style={{ border: "1px solid #e5e7eb" }}>
        <table style={{ tableLayout: "fixed", width: "100%", minWidth: 860 }}>
          <colgroup>
            <col style={{ width: 130 }} />
            <col style={{ width: 115 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: 195 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 195 }} />
            <col style={{ width: 145 }} />
            <col style={{ width: 60 }} />
          </colgroup>
          <thead>
            <tr style={{ background: "#f0f2f5", borderBottom: "1px solid #e8eaed" }}>
              {["Amount","Status","Customer","Customer details","Invoice ID","Payment link","Created at",""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="py-16 text-center text-sm text-gray-400">No invoices match your filters</td></tr>
            ) : (
              filtered.map((row, i) => (
                <InvoiceRow
                  key={row.id}
                  row={row}
                  isLast={i === filtered.length - 1}
                  copied={copied}
                  menu={menu}
                  onCopy={copyLink}
                  onMenu={id => setMenu(menu === id ? null : id)}
                />
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-5 py-3 flex items-center justify-between"
          style={{ borderTop: "1px solid #f0f0f0", background: "#fafafa" }}>
          <span className="text-[12px] text-gray-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}

function InvoiceRow({ row, isLast, copied, menu, onCopy, onMenu }: {
  row: InvoiceLink;
  isLast: boolean;
  copied: string | null;
  menu: string | null;
  onCopy: (link: string, id: string) => void;
  onMenu: (id: string) => void;
}) {
  const [hoverLink, setHoverLink] = useState(false);
  const isCopied = copied === row.id;

  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onMenu("");
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onMenu]);

  const shortLink = row.paymentLink.replace("https://", "").slice(0, 22) + "…";

  const isOverdue = row.status === "overdue";
  const dueDate = new Date(row.dueDate);
  const now = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const expiryLabel = isOverdue
    ? "Overdue"
    : daysUntilDue === 0
    ? "Due today"
    : daysUntilDue > 0 && daysUntilDue <= 3
    ? `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`
    : null;

  return (
    <tr
      style={{ borderBottom: isLast ? "none" : "1px solid #f0f0f0" }}
      onMouseEnter={e => { e.currentTarget.style.background = "#f5f7ff"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      className="group transition-colors duration-100"
    >
      {/* Amount */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="font-semibold text-gray-900 tabular-nums text-[13px]">
          {fmtAmt(row.amount, row.currency)}
        </span>
        <span className="ml-1.5 text-[11px] text-gray-400 font-medium">{row.currency}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <StatusBadge status={row.status} size="sm" />
      </td>

      {/* Customer */}
      <td className="px-4 py-3.5 whitespace-nowrap overflow-hidden">
        <span className="text-[13px] font-medium text-gray-800 block truncate">{row.customer}</span>
      </td>

      {/* Customer details */}
      <td className="px-4 py-3.5 whitespace-nowrap overflow-hidden">
        <p className="text-[12px] text-gray-700">{row.phone}</p>
        <p className="text-[11px] text-gray-400">{row.email}</p>
      </td>

      {/* Invoice ID */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="text-[12px] font-mono text-[#0061E3]/80">{row.invoiceNumber}</span>
      </td>

      {/* Payment link — copy on hover */}
      <td className="px-4 py-3.5 whitespace-nowrap"
        onMouseEnter={() => setHoverLink(true)}
        onMouseLeave={() => setHoverLink(false)}>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-gray-500 font-mono truncate max-w-[130px]">{shortLink}</span>
          <AnimatePresence>
            {hoverLink && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
                onClick={() => onCopy(row.paymentLink, row.id)}
                className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors"
                title="Copy link"
              >
                {isCopied
                  ? <Check className="w-3.5 h-3.5 text-green-500" />
                  : <Copy className="w-3.5 h-3.5 text-gray-400" />
                }
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </td>

      {/* Created at */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <p className="text-[12px] text-gray-600">
          {fmtDateSafe(row.createdAt)}
        </p>
        {expiryLabel && (
          <p className={cn("text-[11px] font-medium mt-0.5",
            isOverdue || expiryLabel === "Due today" ? "text-red-500" : "text-amber-500")}>
            {expiryLabel}
          </p>
        )}
      </td>

      {/* Three-dot menu */}
      <td className="px-3 py-3.5">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => onMenu(row.id)}
            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {menu === row.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl py-1 shadow-lg"
                style={{ border: "1px solid #e5e7eb" }}
              >
                {[
                  { icon: Copy,     label: "Copy link",    action: () => { onCopy(row.paymentLink, row.id); onMenu(""); } },
                  { icon: Send,     label: "Send",         action: () => toast.info("Send invoice coming soon") },
                  { icon: Download, label: "Download PDF", action: () => toast.info("Download coming soon") },
                  { icon: Trash2,   label: "Deactivate",   action: () => toast.error("Deactivated"), danger: true },
                ].map(item => (
                  <button key={item.label}
                    onClick={item.action}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors",
                      item.danger ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
                    )}>
                    <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </tr>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CREATE INVOICE VIEW
═══════════════════════════════════════════════════════════════════════════ */
let nextInvoiceNum = 91;

function CreateInvoiceView({ onBack }: { onBack: () => void }) {
  /* ── Form state ── */
  const [invoiceNumber]                = useState(`INV-2026-00${nextInvoiceNum++}`);
  const [issueDate, setIssueDate]      = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate]          = useState(PAYFLOW_TEMPLATE.dueDate);
  const [recurring, setRecurring]      = useState(PAYFLOW_TEMPLATE.recurring);
  const [frequency, setFrequency]      = useState(PAYFLOW_TEMPLATE.frequency);
  const [recurringStart, setRecurringStart] = useState(PAYFLOW_TEMPLATE.recurringStart);
  const [template, setTemplate]        = useState(PAYFLOW_TEMPLATE.template);
  const [recipients, setRecipients]    = useState<Recipient[]>(PAYFLOW_TEMPLATE.recipients);
  const [lineItems, setLineItems]      = useState<LineItem[]>(PAYFLOW_TEMPLATE.lineItems);
  const [notes, setNotes]              = useState(PAYFLOW_TEMPLATE.notes);
  const [terms, setTerms]              = useState(PAYFLOW_TEMPLATE.terms);
  const [notesOpen, setNotesOpen]      = useState(false);
  const [currency, setCurrency]        = useState("INR");

  /* ── Settings ── */
  const [gst, setGst]                     = useState(PAYFLOW_TEMPLATE.gst);
  const [partialPay, setPartialPay]        = useState(false);
  const [reminder, setReminder]           = useState(false);
  const [lateFee, setLateFee]             = useState(false);
  const [logoEnabled, setLogoEnabled]      = useState(PAYFLOW_TEMPLATE.logoEnabled);
  const [sigEnabled, setSigEnabled]        = useState(PAYFLOW_TEMPLATE.sigEnabled);
  const [logoUrl, setLogoUrl]              = useState<string | null>(PAYFLOW_TEMPLATE.logoUrl);
  const [sigUrl, setSigUrl]                = useState<string | null>(PAYFLOW_TEMPLATE.sigUrl);

  /* ── Discount ── */
  const [discountOpen, setDiscountOpen]    = useState(false);
  const [discountType, setDiscountType]    = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue]  = useState("");

  /* ── Drag-to-reorder ── */
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && f.size <= 10 * 1024 * 1024 && /\.(png|jpg|jpeg)$/i.test(f.name)) {
      const url = URL.createObjectURL(f);
      setLogoUrl(url);
    } else if (f) toast.error("Use .png or .jpg, max 10MB");
    e.target.value = "";
  }
  function handleSigUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && f.size <= 10 * 1024 * 1024 && /\.(png|jpg|jpeg)$/i.test(f.name)) {
      const url = URL.createObjectURL(f);
      setSigUrl(url);
    } else if (f) toast.error("Use .png or .jpg, max 10MB");
    e.target.value = "";
  }

  /* ── Modals ── */
  const [addRecipient, setAddRecipient]    = useState(false);
  const [addLineItem, setAddLineItem]      = useState(false);
  const [previewOpen, setPreviewOpen]      = useState(false);
  const [sendOpen, setSendOpen]            = useState(false);

  /* ── Auto-save indicator ── */
  const [savedAt, setSavedAt]             = useState<string | null>(null);
  useEffect(() => {
    const t = setInterval(() => {
      setSavedAt(fmtTimeSafe(new Date()));
    }, 20000);
    return () => clearInterval(t);
  }, []);

  /* ── Computed totals ── */
  const subtotal    = lineItems.reduce((s, i) => s + i.qty * i.rate, 0);
  const discountAmt = discountValue
    ? discountType === "percent"
      ? subtotal * (parseFloat(discountValue) / 100)
      : parseFloat(discountValue)
    : 0;
  const gstAmt   = gst ? lineItems.reduce((s, i) => s + i.qty * i.rate * (i.tax / 100), 0) : 0;
  const total    = subtotal - (discountAmt || 0) + gstAmt;

  const sym = currency === "USD" ? "$" : "₹";
  const fmt = (n: number) => `${sym}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  function handleSendClick() {
    if (recipients.length === 0) {
      toast.error("Add at least one recipient before sending");
      return;
    }
    setSendOpen(true);
  }

  function handleTemplateChange(next: string) {
    setTemplate(next);
    if (next === "Blank invoice") {
      setDueDate("");
      setRecurring(false);
      setFrequency("Monthly");
      setRecurringStart("");
      setRecipients([]);
      setLineItems([]);
      setNotes("");
      setTerms("");
      setGst(false);
      setLogoEnabled(false);
      setSigEnabled(false);
      setLogoUrl(null);
      setSigUrl(null);
      setDiscountOpen(false);
      setDiscountValue("");
    } else if (next === "Payflow design — monthly") {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split("T")[0]);
      setRecurring(PAYFLOW_TEMPLATE.recurring);
      setFrequency(PAYFLOW_TEMPLATE.frequency);
      setRecurringStart(new Date().toISOString().split("T")[0]);
      setRecipients(PAYFLOW_TEMPLATE.recipients.map(r => ({ ...r, id: `r_${Date.now()}` })));
      setLineItems(PAYFLOW_TEMPLATE.lineItems.map((i, idx) => ({ ...i, id: `li_${Date.now()}_${idx}` })));
      setNotes(PAYFLOW_TEMPLATE.notes);
      setTerms(PAYFLOW_TEMPLATE.terms);
      setGst(PAYFLOW_TEMPLATE.gst);
      setLogoEnabled(PAYFLOW_TEMPLATE.logoEnabled);
      setSigEnabled(PAYFLOW_TEMPLATE.sigEnabled);
      setLogoUrl(PAYFLOW_TEMPLATE.logoUrl);
      setSigUrl(PAYFLOW_TEMPLATE.sigUrl);
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Sub-header — always visible, no sticky needed (parent is fixed-height) ── */}
      <div className="flex-shrink-0 bg-white flex items-center justify-between px-5 py-3 gap-4 flex-wrap"
        style={{ borderBottom: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
          <span className="text-[18px] font-bold text-gray-900 truncate">Create a new invoice</span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 flex-shrink-0">Draft</span>
          <span className="flex items-center gap-1.5 text-[12px] text-gray-400 hidden sm:flex">
            <RefreshCw className="w-3.5 h-3.5" />
            {savedAt ? `Auto-saved ${savedAt}` : "Auto-save…"}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            onClick={handleSendClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ background: "#0061E3" }}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Finalize &amp; send</span>
          </button>
        </div>
      </div>

      {/* ── Body: two independent scroll panels ── */}
      {/* overflow-hidden clamps the flex row so each child's overflow-y-auto actually triggers */}
      <div className="flex flex-1 min-h-0 overflow-hidden" style={{ background: "#f6f8fa" }}>

        {/* Left: form — scrolls on its own */}
        <div className="flex-1 overflow-y-auto min-w-0 px-4 md:px-8 py-5 space-y-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

          {/* Template row */}
          <div className="bg-white rounded-xl px-5 py-4 flex items-center gap-4"
            style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex-shrink-0">Template</span>
            <div className="relative flex-1 max-w-[260px]">
              <select
                value={template}
                onChange={e => handleTemplateChange(e.target.value)}
                className="w-full appearance-none pr-8 pl-3 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 cursor-pointer"
              >
                {["Blank invoice","Payflow design — monthly","Consulting standard"].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors">
              <Plus className="w-3 h-3" />
              Save as template
            </button>
          </div>

          {/* Invoice details */}
          <FormCard icon={FileText} title="Invoice details" iconColor="text-blue-500" iconBg="bg-blue-50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <FormLabel>Invoice number</FormLabel>
                <input readOnly value={invoiceNumber}
                  className="w-full h-10 px-3.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none" />
              </div>
              <div>
                <FormLabel>Issue date</FormLabel>
                <DatePicker value={issueDate} onChange={setIssueDate} placeholder="Select issue date" />
              </div>
              <div>
                <FormLabel>Due date</FormLabel>
                <DatePicker value={dueDate} onChange={setDueDate} placeholder="Select due date" min={issueDate} />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Toggle checked={recurring} onChange={setRecurring} />
              <span className="text-[13px] text-gray-600">Make this a recurring invoice</span>
            </div>

            <AnimatePresence>
              {recurring && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <FormLabel>Frequency</FormLabel>
                      <div className="relative">
                        <select value={frequency} onChange={e => setFrequency(e.target.value)}
                          className="w-full appearance-none h-10 pl-3.5 pr-8 text-[13px] bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-gray-400">
                          {["Weekly","Monthly","Quarterly","Annually"].map(f => <option key={f}>{f}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <FormLabel>Recurring start date</FormLabel>
                      <DatePicker value={recurringStart} onChange={setRecurringStart} placeholder="Select start date" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </FormCard>

          {/* Bill to */}
          <FormCard icon={Users} title="Bill to" iconColor="text-[#2563EB]" iconBg="bg-blue-50"
            action={recipients.length > 0 ? { label: "+ Add recipient", onClick: () => setAddRecipient(true) } : undefined}
            badge={recipients.length > 0 ? `${recipients.length} recipient${recipients.length > 1 ? "s" : ""}` : undefined}
          >
            {recipients.length === 0 ? (
              <button
                onClick={() => setAddRecipient(true)}
                className="w-full h-12 border-2 border-dashed rounded-xl flex items-center gap-3 px-4 text-[13px] font-medium transition-all"
                style={{ borderColor: "#d1d5db", color: "#374151" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#0061E3";
                  e.currentTarget.style.color = "#0061E3";
                  e.currentTarget.style.background = "#f0f6ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.color = "#374151";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: "#2563EB" }}>
                  <Plus className="w-3 h-3" style={{ color: "#2563EB" }} />
                </div>
                Search or add customer…
              </button>
            ) : (
              <div className="space-y-2">
                {recipients.map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <Avatar name={r.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-800 truncate">{r.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{r.email}</p>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md flex-shrink-0"
                      style={r.role === "primary"
                        ? { background: "#eff4ff", color: "#0047b0" }
                        : { background: "#f3f4f6", color: "#6b7280" }}>
                      {r.role === "primary" ? "Primary" : "CC"}
                    </span>
                    <button onClick={() => setRecipients(prev => prev.filter(x => x.id !== r.id))}
                      className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button onClick={() => setAddRecipient(true)}
                  className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
                  + Add another recipient
                </button>
              </div>
            )}
          </FormCard>

          {/* Line items */}
          <FormCard icon={Receipt} title="Line items" iconColor="text-green-600" iconBg="bg-green-50"
            action={{ label: "Currency", isSelect: true, currency, onCurrencyChange: setCurrency }}>

            {lineItems.length > 0 && (
              <div className="mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid #e8eaed" }}>
                <div className="pl-3 pr-2 py-2.5" style={{ background: "#f0f2f5", borderBottom: "1px solid #e8eaed" }}>
                {/* Dynamic header: Hours if any item uses hours, else Qty */}
                {(() => {
                  const hasHours = lineItems.some(i => i.itemType === "hours");
                  const qtyHeader = hasHours ? "Hours" : "Qty";
                  return (
                <div className="grid items-center gap-x-3"
                  style={{ gridTemplateColumns: "24px 1fr 72px 120px 88px 48px" }}>
                  <span />
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Description</span>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">{qtyHeader}</span>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Rate ({sym})</span>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Total</span>
                  <span />
                </div>
                  );
                })()}
                </div>

                {/* Rows */}
                <div>
                  {lineItems.map((item, idx) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => { dragItem.current = idx; }}
                      onDragEnter={() => { dragOver.current = idx; }}
                      onDragEnd={() => {
                        if (dragItem.current === null || dragOver.current === null) return;
                        const reordered = [...lineItems];
                        const [moved] = reordered.splice(dragItem.current, 1);
                        reordered.splice(dragOver.current, 0, moved);
                        dragItem.current = null;
                        dragOver.current = null;
                        setLineItems(reordered);
                      }}
                      onDragOver={e => e.preventDefault()}
                      className="grid items-center pl-3 pr-2 py-2.5 gap-x-3 group transition-colors hover:bg-[#f5f7ff] cursor-grab active:cursor-grabbing"
                      style={{
                        gridTemplateColumns: "24px 1fr 72px 120px 88px 48px",
                        borderBottom: idx < lineItems.length - 1 ? "1px solid #f0f0f0" : "none",
                      }}
                    >
                      {/* Drag handle */}
                      <GripVertical className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0" />

                      {/* Description + tags (description, HSN, tax) at bottom */}
                      <div className="min-w-0 pr-2">
                        <p className="text-[13px] font-medium text-gray-800 truncate">{item.name}</p>
                        {(item.description || item.hsn || (item.taxLabel && item.taxLabel !== "None") || (item.tax > 0 && !item.taxLabel) || item.discount) && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {item.description && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 truncate max-w-[140px]">
                                {item.description}
                              </span>
                            )}
                            {item.hsn && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                                HSN {item.hsn}
                              </span>
                            )}
                            {((item.taxLabel && item.taxLabel !== "None") || (item.tax > 0 && !item.taxLabel)) && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                                {item.taxLabel || `${item.tax}%`}
                              </span>
                            )}
                            {item.discount && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                                {item.discountType === "flat" ? `${sym}${item.discount} off` : `${item.discount}% off`}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Qty / Hours */}
                      <input type="number" min="1" value={item.qty}
                        onChange={e => setLineItems(prev => prev.map(x => x.id === item.id ? { ...x, qty: Number(e.target.value) } : x))}
                        className="h-7 px-2 text-[13px] text-center bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 w-full" />

                      {/* Rate — no spinners */}
                      <div className="min-w-0">
                        <input type="text" inputMode="decimal" value={item.rate}
                          onChange={e => setLineItems(prev => prev.map(x => x.id === item.id ? { ...x, rate: Number(e.target.value) || 0 } : x))}
                          className="h-7 px-2 text-[13px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      </div>

                      {/* Total */}
                      <span className="text-[13px] font-semibold text-gray-800 tabular-nums text-right">
                        {fmt(item.qty * item.rate)}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setAddLineItem(true)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setLineItems(prev => prev.filter(x => x.id !== item.id))}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add line item — inside container, aligned with Description column */}
                <div className="grid items-center pl-3 pr-2 py-2.5 gap-x-3" style={{ borderTop: "1px solid #f0f0f0", gridTemplateColumns: "24px 1fr 72px 120px 88px 48px" }}>
                  <span />
                  <button onClick={() => setAddLineItem(true)}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-[#0061E3] hover:text-[#0049ad] transition-colors text-left">
                    <Plus className="w-3.5 h-3.5" />
                    Add line item
                  </button>
                  <span /><span /><span /><span />
                </div>

                {/* Totals — inside same container for perfect alignment */}
                <div className="pl-3 pr-2 pt-4 pb-4 space-y-2" style={{ borderTop: "1px solid #f0f0f0", background: "#fafafa" }}>
                <div className="grid items-center gap-x-3 text-[13px] text-gray-500" style={{ gridTemplateColumns: "24px 1fr 72px 120px 88px 48px" }}>
                  <span />
                  <span>Subtotal</span>
                  <span />
                  <span />
                  <span className="tabular-nums text-right">{fmt(subtotal)}</span>
                  <span />
                </div>

                {/* Discount row */}
                {discountOpen ? (
                  <div className="grid items-center gap-x-3" style={{ gridTemplateColumns: "24px 1fr 72px 120px 88px 48px" }}>
                    <span />
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-[13px] text-gray-500">Discount</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <div className="flex rounded-lg overflow-hidden border border-gray-200">
                        {(["percent", "fixed"] as const).map(t => (
                          <button key={t} onClick={() => setDiscountType(t)}
                            className={cn(
                              "px-2.5 py-1 text-[11px] font-medium transition-colors",
                              discountType === t ? "text-white" : "text-gray-500 bg-white hover:bg-gray-50"
                            )}
                            style={discountType === t ? { background: "#0061E3" } : {}}>
                            {t === "percent" ? "%" : sym}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text" inputMode="decimal"
                        value={discountValue}
                        onChange={e => setDiscountValue(e.target.value)}
                        placeholder="0"
                        className="w-20 h-7 px-2 text-[13px] text-right bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      />
                      <button onClick={() => { setDiscountOpen(false); setDiscountValue(""); }}
                        className="text-gray-300 hover:text-gray-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[13px] text-gray-500 tabular-nums text-right">
                      {discountAmt > 0 ? `–${fmt(discountAmt)}` : "—"}
                    </span>
                    <span />
                  </div>
                ) : (
                  <div className="grid items-center gap-x-4" style={{ gridTemplateColumns: "24px 1fr 1fr" }}>
                    <span />
                    <button onClick={() => setDiscountOpen(true)}
                      className="flex items-center gap-1 text-[12px] text-[#0061E3] hover:text-[#0049ad] transition-colors text-left">
                      <Tag className="w-3 h-3" />
                      Add discount
                    </button>
                    <span />
                  </div>
                )}

                {gst && gstAmt > 0 && (
                  <div className="grid items-center gap-x-3 text-[13px] text-gray-500" style={{ gridTemplateColumns: "24px 1fr 72px 120px 88px 48px" }}>
                    <span />
                    <span>Tax</span>
                    <span />
                    <span />
                    <span className="tabular-nums text-right">{fmt(gstAmt)}</span>
                    <span />
                  </div>
                )}

                <div className="grid items-center gap-x-3 pt-2 text-[15px] font-bold text-gray-900" style={{ borderTop: "1px solid #e5e7eb", gridTemplateColumns: "24px 1fr 72px 120px 88px 48px" }}>
                  <span />
                  <span>Total</span>
                  <span />
                  <span />
                  <span className="tabular-nums text-right">{fmt(total)}</span>
                  <span />
                </div>
                </div>
              </div>
            )}

            {/* Add line item — when no items yet */}
            {lineItems.length === 0 && (
              <button onClick={() => setAddLineItem(true)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#0061E3] hover:text-[#0049ad] transition-colors mt-1 mb-4">
                <Plus className="w-3.5 h-3.5" />
                Add line item
              </button>
            )}
          </FormCard>

          {/* Business & bank */}
          <BusinessBankCard />

          {/* Customer notes & terms */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <button
              onClick={() => setNotesOpen(o => !o)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <PenLine className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <span className="text-[14px] font-semibold text-gray-800 flex-1">Customer notes &amp; terms</span>
              <span className="text-[11px] text-gray-400 mr-2">Optional</span>
              <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", notesOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {notesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
                    style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
                    <div>
                      <FormLabel>Customer notes</FormLabel>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="Thank you for choosing PayGlocal. Payment due within 30 days."
                        rows={3}
                        className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 resize-none transition-colors" />
                    </div>
                    <div>
                      <FormLabel>Terms &amp; conditions</FormLabel>
                      <textarea value={terms} onChange={e => setTerms(e.target.value)}
                        placeholder="Late payments attract 1.5% monthly interest."
                        rows={3}
                        className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 resize-none transition-colors" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6" />
        </div>

        {/* Right: sticky sidebar — hugs content, scrolls when needed */}
        <div className="hidden lg:flex flex-col w-[272px] xl:w-[292px] flex-shrink-0 min-h-0 overflow-y-auto border-l border-gray-100 bg-white px-4 py-4 gap-3 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
          style={{ scrollbarColor: "#e5e7eb transparent", alignSelf: "stretch" }}>

          {/* Live preview mini */}
          <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            <div className="px-3.5 py-2.5 flex items-center justify-between" style={{ background: "#0061E3" }}>
              <span className="text-[13px] font-bold text-white">PayGlocal</span>
              <span className="text-[10px] text-white/60 font-mono">{invoiceNumber}</span>
            </div>
            <div className="px-3.5 pt-3 pb-2 space-y-1">
              {total > 0 ? (
                <>
                  <p className="text-[21px] font-black text-gray-900 tabular-nums leading-tight">{fmt(total)}</p>
                  {lineItems.map(item => (
                    <div key={item.id} className="flex justify-between items-baseline">
                      <span className="text-[11px] text-gray-500 truncate max-w-[130px]">{item.name}</span>
                      <span className="text-[11px] font-medium text-gray-700 tabular-nums flex-shrink-0">{fmt(item.qty * item.rate)}</span>
                    </div>
                  ))}
                  {gst && gstAmt > 0 && (
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] text-gray-400">GST 18%</span>
                      <span className="text-[11px] text-gray-500 tabular-nums">{fmt(gstAmt)}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-2 space-y-1">
                  <div className="w-8 h-1 rounded-full bg-gray-200 mb-2" />
                  <p className="text-[12px] text-gray-400">{dueDate ? `Due ${formatDate(dueDate + "T00:00:00", { day: "2-digit", month: "short", year: "2-digit" })}` : "Due date not set"}</p>
                  <p className="text-[12px] text-gray-400">{recipients.length > 0 ? `To ${recipients[0].name}` : "No recipient added"}</p>
                  <p className="text-[11px] text-gray-300 italic">Add items to see preview</p>
                </div>
              )}
              {recipients.length > 0 && total > 0 && (
                <p className="text-[12px] text-gray-500 pt-0.5">To {recipients[0].name}</p>
              )}
            </div>
            <div className="px-3.5 pb-3 pt-2">
              <button onClick={() => setPreviewOpen(true)}
                className="w-full h-8 rounded-lg text-[12px] font-semibold text-white flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                style={{ background: "#0061E3" }}>
                View full preview
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            <p className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest"
              style={{ borderBottom: "1px solid #f0f0f0" }}>Actions</p>

            {/* Finalize & send — primary CTA */}
            <button onClick={handleSendClick}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50/40 transition-colors"
              style={{ borderBottom: "1px solid #f5f5f5" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#0061E3" }}>
                <Send className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-semibold text-gray-900">Finalize &amp; send</p>
                <p className="text-[11px] text-gray-400 truncate">
                  {recipients.length > 0 ? `Email to ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}` : "Add recipient first"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-300 -rotate-90 flex-shrink-0" />
            </button>

            {[
              { icon: FileText,   label: "Save as draft",     sub: "Come back later",          action: () => { toast.success("Saved as draft"); onBack(); } },
              { icon: CreditCard, label: "Save as template",  sub: "Reuse for future invoices", action: () => toast.success("Saved as template") },
              { icon: Download,   label: "Download PDF",      sub: "Export invoice as PDF",     action: () => toast.info("Download coming soon") },
            ].map(item => (
              <button key={item.label} onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                style={{ borderBottom: "1px solid #f5f5f5" }}>
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-gray-500" />
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-medium text-gray-800">{item.label}</p>
                  <p className="text-[11px] text-gray-400">{item.sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Settings */}
          <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest"
              style={{ borderBottom: "1px solid #f0f0f0" }}>Settings</p>
            <div>
              {[
                { label: "Logo",      sub: "Show your brand on invoice",  val: logoEnabled, set: setLogoEnabled, Icon: ImageIcon },
                { label: "Signature", sub: "Authorised signatory image",  val: sigEnabled,  set: setSigEnabled, Icon: PenLine },
              ].map((s, idx, arr) => (
                <div key={s.label} style={{ borderBottom: idx < arr.length - 1 || s.val ? "1px solid #f5f5f5" : "none" }}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800">{s.label}</p>
                      <p className="text-[11px] text-gray-500">{s.sub}</p>
                    </div>
                    <Toggle checked={s.val} onChange={s.set} />
                  </div>
                  <AnimatePresence>
                    {s.val && (s.label === "Logo" || s.label === "Signature") && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        {((s.label === "Logo" ? logoUrl : sigUrl) ?? null) ? (
                          <div className="group/preview relative mx-4 mb-3 w-[calc(100%-2rem)] h-20 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-200">
                            <img
                              src={(s.label === "Logo" ? logoUrl : sigUrl) as string}
                              alt={s.label}
                              className="max-h-full max-w-full object-contain pointer-events-none"
                            />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); s.label === "Logo" ? setLogoUrl(null) : setSigUrl(null); }}
                              className="absolute bottom-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-600 opacity-0 group-hover/preview:opacity-100 transition-opacity shadow-sm border border-gray-200"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <input
                              ref={s.label === "Logo" ? logoInputRef : sigInputRef}
                              type="file"
                              accept=".png,.jpg,.jpeg"
                              className="hidden"
                              onChange={s.label === "Logo" ? handleLogoUpload : handleSigUpload}
                            />
                            <button
                              type="button"
                              onClick={() => (s.label === "Logo" ? logoInputRef : sigInputRef).current?.click()}
                              className="mx-4 mb-3 w-[calc(100%-2rem)] h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group"
                              style={{ borderColor: "#d1d5db", background: "#fafafa" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "#0061E3";
                                e.currentTarget.style.background = "#f0f6ff";
                                e.currentTarget.style.color = "#0061E3";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "#d1d5db";
                                e.currentTarget.style.background = "#fafafa";
                                e.currentTarget.style.color = "";
                              }}
                            >
                              <s.Icon className="w-5 h-5 text-gray-400 group-hover:text-[#0061E3] transition-colors" />
                              <span className="text-[13px] font-medium text-gray-600 group-hover:text-[#0061E3] transition-colors">
                                Click to upload {s.label.toLowerCase()}
                              </span>
                              <span className="text-[11px] text-gray-400">.png, .jpg — max 10MB</span>
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Recipient Modal ── */}
      <AnimatePresence>
        {addRecipient && (
          <AddRecipientModal
            onAdd={(r) => { setRecipients(prev => [...prev, r]); setAddRecipient(false); }}
            onClose={() => setAddRecipient(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Add Line Item Modal ── */}
      <AnimatePresence>
        {addLineItem && (
          <AddLineItemModal
            currency={currency}
            onAdd={(item) => { setLineItems(prev => [...prev, item]); setAddLineItem(false); }}
            onAddAnother={(item) => setLineItems(prev => [...prev, item])}
            onClose={() => setAddLineItem(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Preview Modal ── */}
      <AnimatePresence>
        {previewOpen && (
          <PreviewModal
            invoiceNumber={invoiceNumber}
            issueDate={issueDate}
            total={total}
            dueDate={dueDate}
            recipient={recipients[0]}
            lineItems={lineItems}
            gstAmt={gstAmt}
            sym={sym}
            fmt={fmt}
            currency={currency}
            logoUrl={logoEnabled ? logoUrl : null}
            sigUrl={sigEnabled ? sigUrl : null}
            biller={BILLER_PROFILE.biller}
            onClose={() => setPreviewOpen(false)}
            onSend={() => { setPreviewOpen(false); handleSendClick(); }}
          />
        )}
      </AnimatePresence>

      {/* ── Send Invoice Modal ── */}
      <AnimatePresence>
        {sendOpen && (
          <SendModal
            invoiceNumber={invoiceNumber}
            recipients={recipients}
            onClose={() => setSendOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Business & bank card ─────────────────────────────────────────────── */
function BusinessBankCard() {
  const { biller, bank } = BILLER_PROFILE;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Biller details card */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ background: "#f8f9fa", borderBottom: "1px solid #eee" }}>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[12px] font-semibold text-gray-600">Biller details</span>
          </div>
          <button className="text-[12px] font-medium text-[#0061E3] hover:text-[#0049ad] transition-colors">Edit</button>
        </div>
        <div className="px-4 py-4">
          <dl className="space-y-2.5">
            {[
              { label: "Name",    value: biller.name },
              { label: "Address", value: biller.address },
              { label: "GSTIN",   value: biller.gstin },
            ].map(row => (
              <div key={row.label} className="flex gap-3">
                <dt className="text-[12px] text-gray-400 w-16 flex-shrink-0">{row.label}</dt>
                <dd className="text-[13px] font-semibold text-gray-900 whitespace-pre-line">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Bank account card */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ background: "#f8f9fa", borderBottom: "1px solid #eee" }}>
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[12px] font-semibold text-gray-600">Bank account</span>
          </div>
          <button className="text-[12px] font-medium text-[#0061E3] hover:text-[#0049ad] transition-colors">Change</button>
        </div>
        <div className="px-4 py-4">
          <dl className="space-y-2.5">
            {[
              { label: "Account holder", value: bank.holder },
              { label: "Account no.",    value: bank.accountNo },
              { label: "Bank",           value: bank.bank },
              { label: "Routing",        value: bank.routing },
            ].map(row => (
              <div key={row.label} className="flex gap-3">
                <dt className="text-[12px] text-gray-400 w-24 flex-shrink-0">{row.label}</dt>
                <dd className="text-[13px] font-semibold text-gray-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

/* ─── Small shared form components ─────────────────────────────────────── */
function FormLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-medium text-gray-500 mb-1.5">{children}</p>;
}

function FormCard({ icon: Icon, title, iconColor, iconBg, children, action, badge }: {
  icon: React.ElementType;
  title: string;
  iconColor: string;
  iconBg: string;
  children: React.ReactNode;
  action?: { label: string; onClick?: () => void; isSelect?: boolean; currency?: string; onCurrencyChange?: (c: string) => void };
  badge?: string;
}) {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #f5f5f5" }}>
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon className={cn("w-3.5 h-3.5", iconColor)} />
        </div>
        <span className="text-[14px] font-semibold text-gray-800 flex-1">{title}</span>
        {badge && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{badge}</span>
        )}
        {action && !action.isSelect && (
          <button onClick={action.onClick}
            className="text-[12px] font-medium text-[#0061E3] hover:text-[#0049ad] transition-colors">
            {action.label}
          </button>
        )}
        {action?.isSelect && (
          <div className="relative">
            <select value={action.currency} onChange={e => action.onCurrencyChange?.(e.target.value)}
              className="appearance-none pl-2 pr-6 py-1 text-[12px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 cursor-pointer">
              {["INR","USD","EUR","GBP"].map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

/* ─── Add Recipient Modal ───────────────────────────────────────────────── */
function AddRecipientModal({ onAdd, onClose }: {
  onAdd: (r: Recipient) => void;
  onClose: () => void;
}) {
  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole]   = useState<"primary" | "cc">("primary");
  const [notify, setNotify] = useState<Set<string>>(new Set(["email"]));

  const recentFiltered = RECENT_CUSTOMERS.filter(c =>
    !name || c.name.toLowerCase().includes(name.toLowerCase()) || c.email.toLowerCase().includes(email.toLowerCase())
  );

  function pickRecent(c: Recipient) {
    setName(c.name); setEmail(c.email);
  }

  function toggleNotify(ch: string) {
    setNotify(prev => {
      const next = new Set(prev);
      next.has(ch) ? next.delete(ch) : next.add(ch);
      return next;
    });
  }

  function submit() {
    onAdd({
      id:     `r_${Date.now()}`,
      name:   name || "Unknown",
      email:  email || `${(name || "customer").toLowerCase().replace(/\s+/g, ".")}@example.com`,
      role,
      avatar: "",
    });
  }

  const valid = name.trim() || email.trim();

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalBox title="Add recipient" onClose={onClose} maxW={500}>
        <div className="px-6 py-5 space-y-4">

          {/* Customer details — matches payment link creation style */}
          <div className="space-y-2.5">
            <p className="text-[13px] font-semibold text-gray-800">
              Customer details <span className="text-red-500">*</span>
            </p>
            <input
              autoFocus
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-10 px-3.5 text-[13px] bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
              onFocus={(e) => { e.currentTarget.style.borderColor = "#6b7280"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(75,85,99,0.10)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center h-10 rounded-xl border border-gray-200 bg-white overflow-hidden transition-all focus-within:border-gray-400 focus-within:shadow-[0_0_0_2px_rgba(75,85,99,0.10)]">
                <div className="flex items-center gap-1.5 pl-3 pr-2 border-r border-gray-100 bg-gray-50/60 flex-shrink-0 h-full">
                  <span className="text-base leading-none">🇮🇳</span>
                  <span className="text-[13px] font-semibold text-gray-700">+91</span>
                  <ChevronDown style={{ width: 11, height: 11, color: "#d1d5db" }} />
                </div>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="flex-1 h-full px-2.5 text-[13px] text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-none"
                />
              </div>
              <input
                type="email"
                placeholder="Email Id"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-10 px-3.5 text-[13px] bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
                onFocus={(e) => { e.currentTarget.style.borderColor = "#6b7280"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(75,85,99,0.10)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Recent customers — always visible */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#f5f5f7" }}>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-4 pt-3 pb-2">Recent</p>
            <div className="px-3 pb-3 space-y-1.5">
              {recentFiltered.slice(0, 3).map(c => (
                <button key={c.id} onClick={() => pickRecent(c)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white hover:bg-gray-50 transition-colors text-left"
                  style={{ border: "1px solid #ebebeb" }}>
                  <Avatar name={c.name} size={9} />
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-gray-900 leading-tight">{c.name}</p>
                    <p className="text-[12px] text-gray-400 truncate">{c.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notify via */}
          <div>
            <p className="text-[14px] font-semibold text-gray-900 mb-2">Notify customer via</p>
            <div className="flex items-center gap-2 flex-wrap">
              {(["SMS", "Email", "WhatsApp"] as const).map(ch => {
                const active = notify.has(ch.toLowerCase());
                return (
                  <button key={ch} onClick={() => toggleNotify(ch.toLowerCase())}
                  className={cn(
                    "flex items-center gap-1.5 px-4 h-9 rounded-full text-[13px] font-medium border transition-all",
                    active
                      ? "text-white border-transparent"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  )}
                  style={active ? { background: "#0061E3" } : {}}>
                    {active ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role */}
          <div>
            <p className="text-[14px] font-semibold text-gray-900 mb-2">Role</p>
            <div className="flex items-center gap-2">
              {(["primary", "cc"] as const).map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 h-9 rounded-full text-[13px] font-medium border transition-all",
                    role === r
                      ? "text-white border-transparent"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  )}
                  style={role === r ? { background: "#0061E3" } : {}}>
                  {role === r && <Check className="w-3 h-3" />}
                  {r === "primary" ? "Primary recipient" : "CC (copy)"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 grid grid-cols-2 gap-3" style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
          <button onClick={onClose}
            className="h-12 rounded-2xl text-[14px] font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={!valid}
            className="h-12 rounded-2xl text-[14px] font-semibold text-white transition-opacity disabled:opacity-40 hover:opacity-90"
            style={{ background: "#0061E3" }}>
            Add recipient
          </button>
        </div>
      </ModalBox>
    </ModalBackdrop>
  );
}

/* ─── Add Line Item Modal ───────────────────────────────────────────────── */
function AddLineItemModal({ currency, onAdd, onAddAnother, onClose }: {
  currency: string;
  onAdd: (item: LineItem) => void;
  onAddAnother: (item: LineItem) => void;
  onClose: () => void;
}) {
  const sym = currency === "USD" ? "$" : "₹";
  const [itemType, setItemType] = useState<"amount" | "quantity" | "hours">("quantity");
  const [name, setName]     = useState("");
  const [rate, setRate]     = useState("");
  const [qty, setQty]       = useState("1");
  const [hours, setHours]   = useState("");
  const [tax, setTax]       = useState("None");
  const [hsn, setHsn]       = useState("");
  const [desc, setDesc]     = useState("");
  const [showTax, setShowTax] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");

  function buildItem(): LineItem {
    const useTax = showTax ? tax : "None";
    const useDesc = showDesc ? desc : "";
    const useDiscount = showDiscount ? discount.trim() : undefined;
    const useDiscountType = showDiscount ? discountType : undefined;
    const taxPct = parseInt(useTax) || 0;
    const resolvedQty = itemType === "hours" ? (Number(hours) || 1) : itemType === "amount" ? 1 : (Number(qty) || 1);
    return {
      id:          `li_${Date.now()}`,
      name,
      description: useDesc,
      qty:         resolvedQty,
      rate:        Number(rate) || 0,
      tax:         taxPct,
      taxLabel:    useTax,
      hsn:         hsn.trim() || undefined,
      discount:    useDiscount || undefined,
      discountType: useDiscountType,
      itemType,
    };
  }

  const valid = name.trim() && Number(rate) >= 0;

  const TYPE_OPTIONS: { id: "amount" | "quantity" | "hours"; label: string }[] = [
    { id: "amount",   label: "Amount only" },
    { id: "quantity", label: "Quantity"    },
    { id: "hours",    label: "Hours"       },
  ];

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalBox title="Add line item" onClose={onClose} maxW={500}>
        <div className="px-6 py-5 space-y-5">

          {/* Type selector */}
          <div className="flex items-center gap-5">
            {TYPE_OPTIONS.map(opt => (
              <label key={opt.id} className="flex items-center gap-2 cursor-pointer select-none">
                <span
                  onClick={() => setItemType(opt.id)}
                  className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    borderColor: itemType === opt.id ? "#111" : "#d1d5db",
                    background: "transparent",
                  }}
                >
                  {itemType === opt.id && (
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#111" }} />
                  )}
                </span>
                <span
                  onClick={() => setItemType(opt.id)}
                  className="text-[13.5px] font-medium text-gray-700"
                >
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Item name */}
          <div>
            <p className="text-[14px] font-semibold text-gray-900 mb-2">
              Item name <span className="text-red-500">*</span>
            </p>
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Logo design, Consulting fee…"
              className="w-full h-12 px-4 text-[14px] bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
          </div>

          {/* Rate + dynamic second field */}
          <div className={cn("grid gap-3", itemType === "amount" ? "grid-cols-1" : "grid-cols-2")}>
            <div>
              <p className="text-[14px] font-semibold text-gray-900 mb-2">
                Rate <span className="text-red-500">*</span>
              </p>
              <div className="flex h-12 items-center border border-gray-200 rounded-2xl overflow-hidden bg-white focus-within:border-gray-400 transition-colors">
                <span className="pl-4 pr-2 text-[14px] text-gray-400 flex-shrink-0">{sym}</span>
                <input type="text" inputMode="decimal" value={rate} onChange={e => setRate(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 min-w-0 h-full pr-4 text-[14px] bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none" />
              </div>
            </div>
            {itemType === "quantity" && (
              <div>
                <p className="text-[14px] font-semibold text-gray-900 mb-2">Quantity</p>
                <input type="text" inputMode="numeric" value={qty} onChange={e => setQty(e.target.value)}
                  className="w-full h-12 px-4 text-[14px] bg-white border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:border-gray-400 transition-colors" />
              </div>
            )}
            {itemType === "hours" && (
              <div>
                <p className="text-[14px] font-semibold text-gray-900 mb-2">Hours worked</p>
                <input type="text" inputMode="decimal" value={hours} onChange={e => setHours(e.target.value)}
                  placeholder="e.g. 4.5"
                  className="w-full h-12 px-4 text-[14px] bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
              </div>
            )}
          </div>

          {/* SAC/HSN */}
          <div>
            <p className="text-[14px] font-semibold text-gray-900 mb-2">
              SAC/HSN{" "}
              <span className="text-[12px] font-normal text-gray-400">(optional)</span>
            </p>
            <input value={hsn} onChange={e => setHsn(e.target.value)}
              placeholder="e.g. 998314, 998316"
              className="w-full h-12 px-4 text-[14px] bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
          </div>

          {/* Discount, Tax & Description — reduced spacing */}
          <div className="space-y-1">
          {/* Discount — toggle to show (above Tax and Description) */}
          <div style={{ borderBottom: showDiscount ? "1px solid #f5f5f5" : "none" }}>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-gray-800">Add discount</p>
                <OptionalBadge />
              </div>
              <Toggle checked={showDiscount} onChange={setShowDiscount} />
            </div>
            <AnimatePresence>
              {showDiscount && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="pb-2">
                    <div className="flex items-center h-10 rounded-2xl border border-gray-200 bg-white overflow-hidden focus-within:border-gray-400 transition-colors">
                      <div className="relative flex items-center gap-1 pl-3 pr-3 border-r border-gray-100 flex-shrink-0 h-full bg-gray-50/60">
                        <select
                          value={discountType}
                          onChange={(e) => setDiscountType(e.target.value as "percent" | "flat")}
                          className="appearance-none text-[13px] font-semibold text-gray-700 bg-transparent focus:outline-none cursor-pointer pr-5 h-full"
                        >
                          <option value="percent">%</option>
                          <option value="flat">Flat</option>
                        </select>
                        <ChevronDown className="absolute right-2 pointer-events-none w-3 h-3 text-gray-300" />
                      </div>
                      <input type="text" inputMode="decimal" value={discount} onChange={e => setDiscount(e.target.value)}
                        placeholder={discountType === "percent" ? "e.g. 10" : "e.g. 500"}
                        className="flex-1 h-full px-4 text-[14px] bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none" />
                      <span className="pr-4 text-[13px] text-gray-500 flex-shrink-0">{discountType === "percent" ? "% off" : sym}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tax — toggle to show */}
          <div style={{ borderBottom: showTax ? "1px solid #f5f5f5" : "none" }}>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-gray-800">Add tax</p>
                <OptionalBadge />
              </div>
              <Toggle checked={showTax} onChange={setShowTax} />
            </div>
            <AnimatePresence>
              {showTax && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {TAX_OPTIONS.map(t => (
                        <button key={t} type="button" onClick={() => setTax(t)}
                          className={cn(
                            "px-4 h-9 rounded-full text-[13px] font-medium border transition-all",
                            tax === t
                              ? "text-white border-transparent"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                          )}
                          style={tax === t ? { background: "#0061E3" } : {}}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Description — toggle to show */}
          <div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-gray-800">Add description</p>
                <OptionalBadge />
              </div>
              <Toggle checked={showDesc} onChange={setShowDesc} />
            </div>
            <AnimatePresence>
              {showDesc && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="pb-0">
                    <textarea value={desc} onChange={e => setDesc(e.target.value)}
                      placeholder="Shown on invoice under item name"
                      rows={2}
                      className="w-full px-4 py-3 text-[14px] bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 resize-none transition-colors" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-2.5" style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
          <button onClick={() => { if (valid) onAdd(buildItem()); }}
            disabled={!valid}
            className="w-full h-12 rounded-2xl text-[14px] font-semibold text-white transition-opacity disabled:opacity-40 hover:opacity-90"
            style={{ background: "#0061E3" }}>
            Add item
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onClose}
              className="h-10 rounded-xl text-[13px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { if (valid) { onAddAnother(buildItem()); setName(""); setRate(""); setQty("1"); setHours(""); setHsn(""); setDesc(""); setDiscount(""); setDiscountType("percent"); setShowTax(false); setShowDesc(false); setShowDiscount(false); } }}
              disabled={!valid}
              className="h-10 rounded-xl text-[13px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40">
              Save &amp; add another
            </button>
          </div>
        </div>
      </ModalBox>
    </ModalBackdrop>
  );
}

/* ─── Preview Modal ─────────────────────────────────────────────────────── */
function PreviewModal({ invoiceNumber, issueDate, total, dueDate, recipient, lineItems, gstAmt, sym, fmt, currency, logoUrl, sigUrl, biller, onClose, onSend }: {
  invoiceNumber: string; issueDate: string; total: number; dueDate: string; recipient?: Recipient;
  lineItems: LineItem[]; gstAmt: number; sym: string; fmt: (n: number) => string; currency: string;
  logoUrl: string | null; sigUrl: string | null;
  biller: { name: string; address: string; gstin: string };
  onClose: () => void; onSend: () => void;
}) {
  const [tab, setTab] = useState<"email" | "pdf" | "hosted">("email");
  const tabs = ["email","pdf","hosted"] as const;
  const subtotal = lineItems.reduce((s, i) => s + i.qty * i.rate, 0);
  const hasHours = lineItems.some(i => i.itemType === "hours");
  const qtyHeader = hasHours ? "Hours" : "Qty";

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalBox title="Invoice preview" onClose={onClose} maxW={640} maxH="min(92vh, 780px)">
        {/* Tabs */}
        <div className="flex items-center px-5 gap-1" style={{ borderBottom: "1px solid #f0f0f0" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                "relative pb-3 px-1 mr-4 text-[13px] font-medium transition-colors capitalize",
                tab === t ? "text-[#0061E3]" : "text-gray-400 hover:text-gray-600"
              )}>
              {t === "hosted" ? "Hosted page" : t.charAt(0).toUpperCase() + t.slice(1)}
              {tab === t && (
                <motion.div layoutId="preview-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ background: "#0061E3" }} />
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Email / Hosted preview */}
          {(tab === "email" || tab === "hosted") && (
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
              <div className="px-5 py-3.5 flex items-center justify-between"
                style={{ background: "#0061E3" }}>
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
                  ) : (
                    <span className="text-[15px] font-bold text-white">PayGlocal</span>
                  )}
                  <p className="text-[11px] text-white/60">Invoice from {biller.name}</p>
                </div>
                <span className="text-[12px] text-white/70 font-mono">{invoiceNumber}</span>
              </div>
              <div className="bg-white px-5 py-5">
                <p className="text-[26px] font-black text-gray-900 tabular-nums">{total > 0 ? fmt(total) : `${sym}0.00`}</p>
                <p className="text-[13px] text-gray-400 mt-1">
                  {dueDate ? `Due ${formatDate(dueDate + "T00:00:00", { day: "2-digit", month: "short", year: "numeric" })}` : "Due date not set"}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">TO</p>
                    <p className="text-[13px] font-bold text-gray-800 mt-0.5">{recipient?.name ?? "—"}</p>
                    <p className="text-[12px] text-gray-400">{recipient?.email ?? "No recipient"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">FROM</p>
                    <p className="text-[13px] font-bold text-gray-800 mt-0.5">{biller.name}</p>
                    <p className="text-[12px] text-gray-400 whitespace-pre-line">{biller.address}</p>
                  </div>
                </div>
                {lineItems.length > 0 && (
                  <div className="mt-5 space-y-2" style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
                    {lineItems.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <p className="text-[13px] font-medium text-gray-800">{item.name}</p>
                          <p className="text-[11px] text-gray-400">{qtyHeader} {item.qty} × {fmt(item.rate)}</p>
                        </div>
                        <span className="text-[13px] font-medium text-gray-800 tabular-nums">{fmt(item.qty * item.rate)}</span>
                      </div>
                    ))}
                    {gstAmt > 0 && (
                      <div className="flex justify-between text-[13px] text-gray-500 pt-1">
                        <span>GST 18%</span><span>{fmt(gstAmt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2" style={{ borderTop: "1px solid #e5e7eb" }}>
                      <span className="text-[15px] font-black text-gray-900">Total</span>
                      <span className="text-[15px] font-black text-gray-900 tabular-nums">{fmt(total)}</span>
                    </div>
                  </div>
                )}
                <button className="mt-5 w-full h-11 rounded-xl text-[14px] font-bold text-white"
                  style={{ background: "#0061E3" }}>
                  Pay this invoice
                </button>
              </div>
            </div>
          )}

          {/* PDF preview — document-style layout, compact to fit modal */}
          {tab === "pdf" && (
            <div className="max-h-[min(58vh,480px)] overflow-y-auto rounded-xl" style={{ border: "1px solid #e5e7eb" }}>
              <div className="rounded-xl overflow-hidden bg-white font-mono" style={{ fontFamily: "ui-monospace, monospace" }}>
              {/* Header: logo left, INVOICE right */}
              <div className="flex items-start justify-between px-4 pt-3 pb-2">
                <div>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-7 max-w-[100px] object-contain" />
                  ) : (
                    <span className="text-[13px] font-bold text-gray-900">PayGlocal</span>
                  )}
                </div>
                <span className="text-[17px] font-bold text-gray-900 tracking-tight">INVOICE</span>
              </div>
              {/* Meta row */}
              <div className="flex justify-between px-4 pb-2 text-[10px] text-gray-600">
                <div>
                  <p>Invoice no.: {invoiceNumber}</p>
                  <p>Invoice date: {issueDate ? formatDate(issueDate + "T00:00:00", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}</p>
                  <p>Due date: {dueDate ? formatDate(dueDate + "T00:00:00", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}</p>
                </div>
                <div className="text-right">
                  <p>{BILLER_PROFILE.bank.bank}</p>
                  <p>{BILLER_PROFILE.bank.accountNo}</p>
                </div>
              </div>
              {/* SELLER / RECIPIENT */}
              <div className="grid grid-cols-2 gap-4 px-4 py-2.5" style={{ borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
                <div>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">SELLER</p>
                  <p className="text-[11px] font-semibold text-gray-900">{biller.name}</p>
                  <p className="text-[10px] text-gray-600">GSTIN: {biller.gstin}</p>
                  <p className="text-[10px] text-gray-600 whitespace-pre-line">{biller.address}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">RECIPIENT</p>
                  <p className="text-[11px] font-semibold text-gray-900">{recipient?.name ?? "—"}</p>
                  <p className="text-[10px] text-gray-600">{recipient?.email ?? "No recipient"}</p>
                </div>
              </div>
              {/* Line items table */}
              {lineItems.length > 0 && (
                <div className="px-4 py-2.5">
                  <div className="grid text-[10px] font-semibold text-gray-500 uppercase tracking-wider pb-1.5" style={{ gridTemplateColumns: "1fr 48px 64px 64px" }}>
                    <span>Item</span>
                    <span className="text-center">{qtyHeader}</span>
                    <span className="text-right">Rate</span>
                    <span className="text-right">Amount</span>
                  </div>
                  {lineItems.map((item, i) => (
                    <div key={item.id} className="grid py-1.5 text-[11px]" style={{ gridTemplateColumns: "1fr 48px 64px 64px", borderTop: "1px solid #f0f0f0" }}>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {(item.description || item.hsn || item.taxLabel || item.discount) && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {item.description && <span className="text-[9px] text-gray-400">{item.description}</span>}
                            {item.hsn && <span className="text-[9px] text-gray-500">HSN {item.hsn}</span>}
                            {item.taxLabel && item.taxLabel !== "None" && <span className="text-[9px] text-gray-500">{item.taxLabel}</span>}
                            {item.discount && <span className="text-[9px] text-emerald-600">{item.discountType === "flat" ? `${sym}${item.discount} off` : `${item.discount}% off`}</span>}
                          </div>
                        )}
                      </div>
                      <span className="text-center text-gray-700">{item.qty}</span>
                      <span className="text-right text-gray-700">{fmt(item.rate)}</span>
                      <span className="text-right font-semibold text-gray-900">{fmt(item.qty * item.rate)}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Totals */}
              <div className="px-4 py-2.5 flex justify-end">
                <div className="w-36 space-y-0.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="tabular-nums">{fmt(subtotal)}</span>
                  </div>
                  {gstAmt > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax 18%</span>
                      <span className="tabular-nums">{fmt(gstAmt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 font-bold" style={{ borderTop: "1px solid #e5e7eb" }}>
                    <span>TOTAL</span>
                    <span className="tabular-nums">{fmt(total)}</span>
                  </div>
                </div>
              </div>
              {/* Footer: contact + signature */}
              <div className="flex items-end justify-between px-4 py-3" style={{ borderTop: "1px solid #e5e7eb", background: "#fafafa" }}>
                <div className="text-[10px] text-gray-600">
                  <p>deepankar@payglocal.in</p>
                  <p>+91-9876543210</p>
                  <p>payglocal.in</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 mb-0.5">Thanks for being with us!</p>
                  {sigUrl ? (
                    <img src={sigUrl} alt="Signature" className="h-9 max-w-[80px] object-contain ml-auto" />
                  ) : (
                    <p className="text-[11px] font-semibold text-gray-800">Issuer Jack McQueen</p>
                  )}
                </div>
              </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <button onClick={onClose}
              className="flex-1 h-10 rounded-xl text-[13px] font-medium text-gray-600 border border-gray-200 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button onClick={onSend}
              className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
              style={{ background: "#0061E3" }}>
              Send invoice →
            </button>
          </div>
        </div>
      </ModalBox>
    </ModalBackdrop>
  );
}

/* ─── Send Invoice Modal ────────────────────────────────────────────────── */
function SendModal({ invoiceNumber, recipients, onClose }: {
  invoiceNumber: string; recipients: Recipient[]; onClose: () => void;
}) {
  const [channels, setChannels] = useState({ email: true, whatsapp: false, link: false });
  const [note, setNote]         = useState("");
  const [sending, setSending]   = useState(false);

  function toggle(k: keyof typeof channels) {
    setChannels(prev => ({ ...prev, [k]: !prev[k] }));
  }

  async function handleSend() {
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    onClose();
    toast.success("Invoice sent!", { description: `${invoiceNumber} sent to ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}` });
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalBox title="Send invoice" onClose={onClose} maxW={520}>
        <div className="px-6 py-5 space-y-5">
          {/* Info banner — matches payment link style */}
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl" style={{ background: "#f0f6ff", border: "1px solid #c7d9fb" }}>
            <AlertCircle className="w-4 h-4 text-[#0061E3] flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-gray-700">
              Finalize &amp; send <strong className="font-mono text-[#0061E3]">{invoiceNumber}</strong> to recipients.
            </p>
          </div>

          {/* Sending to */}
          <div>
            <p className="text-[13px] font-semibold text-gray-800 mb-2">Sending to</p>
            <div className="space-y-2">
              {recipients.map(r => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#f8f9fa", border: "1px solid #e5e7eb" }}>
                  <Avatar name={r.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-800 truncate">{r.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{r.email}</p>
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg flex-shrink-0"
                    style={r.role === "primary"
                      ? { background: "#eff4ff", color: "#0061E3", border: "1px solid #c7d9fb" }
                      : { background: "#f3f4f6", color: "#6b7280" }}>
                    {r.role === "primary" ? "Primary" : "CC"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Send via */}
          <div>
            <p className="text-[13px] font-semibold text-gray-800 mb-2">Send via</p>
            <div className="space-y-2">
              {([
                { key: "email",    icon: Mail,           label: "Email",        sub: "Hosted invoice with payment link" },
                { key: "whatsapp", icon: MessageSquare,  label: "WhatsApp",     sub: "Send payment link via WhatsApp"   },
                { key: "link",     icon: Link2,          label: "Copy link only", sub: "Share manually via any channel" },
              ] as const).map(item => (
                <label key={item.key}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all",
                    channels[item.key] ? "border-[#0061E3] bg-[#f0f6ff]" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  )}>
                  <input type="checkbox" checked={channels[item.key]} onChange={() => toggle(item.key)}
                    className="w-4 h-4 accent-[#0061E3]" />
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                    channels[item.key] ? "bg-[#0061E3]" : "bg-gray-100"
                  )}>
                    <item.icon className={cn("w-4 h-4", channels[item.key] ? "text-white" : "text-gray-500")} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">{item.label}</p>
                    <p className="text-[12px] text-gray-500">{item.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <p className="text-[13px] font-semibold text-gray-800 mb-2">Note <span className="text-gray-400 font-normal">(optional)</span></p>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Hi, please find your invoice attached…"
              rows={3}
              className="w-full px-4 py-3 text-[13px] bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:shadow-[0_0_0_2px_rgba(75,85,99,0.10)] resize-none transition-colors" />
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center justify-end gap-2" style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
          <button onClick={onClose}
            className="px-4 py-2.5 text-[13px] font-semibold text-[#0061E3] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSend} disabled={sending}
            className="px-5 py-2 text-[13px] font-semibold text-white rounded-xl flex items-center gap-1.5 transition-opacity disabled:opacity-60 hover:opacity-90"
            style={{ background: "#0061E3" }}>
            {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send now
          </button>
        </div>
      </ModalBox>
    </ModalBackdrop>
  );
}

/* ─── Modal primitives ──────────────────────────────────────────────────── */
function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 14 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="w-full"
        style={{ maxWidth: "100%" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalBox({ title, onClose, children, maxW, maxH }: {
  title: string; onClose: () => void; children: React.ReactNode; maxW?: number; maxH?: string;
}) {
  const useScroll = !!maxH;
  return (
    <div className={cn("bg-white rounded-2xl overflow-hidden mx-auto", useScroll && "flex flex-col")}
      style={{
        maxWidth: maxW ?? 480,
        maxHeight: maxH ?? undefined,
        border: "1px solid #e5e7eb",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      }}>
      <div className={cn(useScroll && "flex-shrink-0", "flex items-center justify-between px-6 py-4")} style={{ borderBottom: "1px solid #f0f0f0" }}>
        <h3 className="text-[18px] font-bold text-gray-900">{title}</h3>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X style={{ width: 18, height: 18 }} />
        </button>
      </div>
      {useScroll ? (
        <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT PAGE — toggles between list and create views
═══════════════════════════════════════════════════════════════════════════ */
function InvoiceLinksInner() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<"list" | "create">(() =>
    searchParams.get("create") === "1" ? "create" : "list"
  );

  useEffect(() => {
    if (searchParams.get("create") === "1") setView("create");
  }, [searchParams]);

  return (
    <AnimatePresence mode="wait">
      {view === "list" ? (
        <motion.div key="list"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}>
          <ListView onNew={() => setView("create")} />
        </motion.div>
      ) : (
        <motion.div key="create"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="-m-4 md:-m-6"
          style={{ height: "calc(100vh - 57px)" }}>
          <CreateInvoiceView onBack={() => setView("list")} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function InvoiceLinksPage() {
  return (
    <Suspense>
      <InvoiceLinksInner />
    </Suspense>
  );
}
