"use client";

import { useState } from "react";
import { X, Download, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ── Types ──────────────────────────────────────────────────────────────── */
type Tab = "email" | "pdf";
type TagColor = "grey" | "amber" | "blue";
type Tag = { label: string; color: TagColor };

type LineItem = {
  description: string;
  tags: Tag[];
  unitPrice: string;
  qty: number;
  amount: string;
};

type InvDetail = {
  invoiceNumber: string;
  issueDate: string;
  issuedToEmail: string;
  dueDate: string | null;
  isOverdue: boolean;
  merchantName: string;
  billTo: { name: string; phone: string; email: string };
  lineItems: LineItem[];
  subtotal: string;
  tax: string;
  total: string;
  amountDue: string;
  merchantNote: string | null;
};

/* ── Mock data ───────────────────────────────────────────────────────────── */
const DETAIL_MAP: Record<string, InvDetail> = {
  "INV-001": {
    invoiceNumber: "INV-2026-0090",
    issueDate: "19 Feb 2026, 12:00 AM",
    issuedToEmail: "accounts@acmecorp.in",
    dueDate: "21 Feb 2026, 12:00 AM",
    isOverdue: false,
    merchantName: "Bhavya Artworks",
    billTo: { name: "Acme Corp", phone: "+91 70114 58408", email: "accounts@acmecorp.in" },
    lineItems: [
      {
        description: "Professional website design",
        tags: [{ label: "Design", color: "grey" }, { label: "HSN 998314", color: "amber" }, { label: "18% GST", color: "blue" }],
        unitPrice: "₹94,400.00",
        qty: 1,
        amount: "₹1,11,392.00",
      },
    ],
    subtotal: "₹94,400.00",
    tax: "₹16,992.00",
    total: "₹1,11,392.00",
    amountDue: "₹1,11,392.00",
    merchantNote: null,
  },
  "INV-002": {
    invoiceNumber: "INV-2026-0089",
    issueDate: "19 Feb 2026, 12:00 AM",
    issuedToEmail: "john.miller@gmail.com",
    dueDate: "28 Feb 2026, 12:00 AM",
    isOverdue: false,
    merchantName: "Bhavya Artworks",
    billTo: { name: "John Miller Antonio", phone: "+1 555 000 1234", email: "john.miller@gmail.com" },
    lineItems: [
      {
        description: "Video design freelance",
        tags: [{ label: "Design", color: "grey" }, { label: "HSN 998314", color: "amber" }, { label: "18% GST", color: "blue" }],
        unitPrice: "$1,003.00",
        qty: 1,
        amount: "$1,183.54",
      },
    ],
    subtotal: "$1,003.00",
    tax: "$180.54",
    total: "$1,183.54",
    amountDue: "$1,183.54",
    merchantNote: null,
  },
  "INV-003": {
    invoiceNumber: "INV-2026-0088",
    issueDate: "19 Feb 2026, 12:00 AM",
    issuedToEmail: "deepankar@payglocal.in",
    dueDate: "19 Feb 2026, 12:00 AM",
    isOverdue: true,
    merchantName: "Bhavya Artworks",
    billTo: { name: "Deepankar Raj", phone: "+91 70114 58408", email: "deepankar@payglocal.in" },
    lineItems: [
      {
        description: "Test invoice line item",
        tags: [{ label: "Services", color: "grey" }, { label: "HSN 998314", color: "amber" }],
        unitPrice: "₹1,00,003.00",
        qty: 1,
        amount: "₹1,00,003.00",
      },
    ],
    subtotal: "₹1,00,003.00",
    tax: "—",
    total: "₹1,00,003.00",
    amountDue: "₹1,00,003.00",
    merchantNote: null,
  },
  "INV-004": {
    invoiceNumber: "INV-2026-0087",
    issueDate: "19 Feb 2026, 12:00 AM",
    issuedToEmail: "john.miller@gmail.com",
    dueDate: null,
    isOverdue: false,
    merchantName: "Bhavya Artworks",
    billTo: { name: "John Miller Antonio", phone: "+1 555 000 1234", email: "john.miller@gmail.com" },
    lineItems: [
      {
        description: "Website design services",
        tags: [{ label: "Design", color: "grey" }, { label: "HSN 998314", color: "amber" }],
        unitPrice: "$103.00",
        qty: 1,
        amount: "$103.00",
      },
    ],
    subtotal: "$103.00",
    tax: "—",
    total: "$103.00",
    amountDue: "$103.00",
    merchantNote: null,
  },
};

/* ── Tag pill ────────────────────────────────────────────────────────────── */
function TagPill({ tag }: { tag: Tag }) {
  return (
    <span className={cn(
      "text-[9.5px] px-1.5 py-0.5 rounded-full font-medium",
      tag.color === "grey"  ? "bg-muted text-muted-foreground" :
      tag.color === "amber" ? "bg-amber-100 text-amber-700" :
                              "bg-blue-50 text-blue-600",
    )}>
      {tag.label}
    </span>
  );
}

/* ── Email Preview ───────────────────────────────────────────────────────── */
function EmailPreview({ d }: { d: InvDetail }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>

      {/* Blue header band */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)" }}
      >
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color: "rgba(191,219,254,0.9)" }}>
          Invoice
        </p>
        <p className="text-[15.5px] font-bold text-white leading-tight">
          Invoice from {d.merchantName}
        </p>
        <p className="text-[11px] mt-1" style={{ color: "rgba(191,219,254,0.85)" }}>
          Invoice: {d.invoiceNumber}
        </p>
      </div>

      {/* DETAILS section */}
      <div className="px-5 py-4 border-b border-border/30">
        <p className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-3">Details</p>

        <div className="flex items-center justify-between py-2 border-b border-border/20">
          <p className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wide">Date of Issue</p>
          <p className="text-[11px] text-foreground">{d.issueDate}</p>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-border/20">
          <p className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wide">Issued To</p>
          <p className="text-[11px] text-primary">{d.issuedToEmail}</p>
        </div>

        {d.dueDate && (
          <div
            className="flex items-center justify-between py-2 px-2.5 -mx-2.5 rounded-lg mt-1"
            style={{ background: "#fef3c7" }}
          >
            <p className="text-[10.5px] font-medium uppercase tracking-wide" style={{ color: "#92400e" }}>
              Due Date
            </p>
            <p className="text-[11px] font-semibold" style={{ color: "#92400e" }}>
              {d.dueDate}
            </p>
          </div>
        )}
      </div>

      {/* AMOUNT DUE section */}
      <div className="px-5 py-4 border-b border-border/30">
        <p className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-3">Amount Due</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[22px] font-bold text-foreground leading-none tabular-nums">{d.amountDue}</p>
          <button
            type="button"
            className="shrink-0 px-4 py-2 rounded-xl bg-primary text-white text-[12px] font-semibold active:opacity-80"
          >
            Pay this invoice
          </button>
        </div>
      </div>

      {/* LINE ITEMS section */}
      <div className="px-5 py-4 border-b border-border/30">
        <p className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-3">Line Items</p>

        {/* Column headers */}
        <div className="flex items-center gap-1 pb-2 border-b border-border/30">
          <p className="text-[8.5px] font-bold text-muted-foreground uppercase flex-1 min-w-0">Description</p>
          <p className="text-[8.5px] font-bold text-muted-foreground uppercase w-[26px] text-right shrink-0">Qty</p>
          <p className="text-[8.5px] font-bold text-muted-foreground uppercase w-[60px] text-right shrink-0">Unit Price</p>
          <p className="text-[8.5px] font-bold text-muted-foreground uppercase w-[60px] text-right shrink-0">Amount</p>
        </div>

        {d.lineItems.map((item, i) => (
          <div key={i} className="flex items-start gap-1 py-2.5 border-b border-border/15">
            <div className="flex-1 min-w-0">
              <p className="text-[11.5px] font-semibold text-foreground leading-snug">{item.description}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Qty {item.qty}</p>
            </div>
            <p className="text-[11px] text-foreground tabular-nums w-[26px] text-right shrink-0 mt-0.5">{item.qty}</p>
            <p className="text-[11px] text-foreground tabular-nums w-[60px] text-right shrink-0 mt-0.5">{item.unitPrice}</p>
            <p className="text-[11px] font-semibold text-foreground tabular-nums w-[60px] text-right shrink-0 mt-0.5">{item.amount}</p>
          </div>
        ))}

        {/* Totals */}
        <div className="pt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">Subtotal</p>
            <p className="text-[11px] text-foreground tabular-nums">{d.subtotal}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">Tax</p>
            <p className="text-[11px] text-foreground tabular-nums">{d.tax}</p>
          </div>
          <div className="border-t border-border/40 pt-1.5 flex items-center justify-between">
            <p className="text-[12px] font-bold text-foreground">Amount due</p>
            <p className="text-[12px] font-bold text-foreground tabular-nums">{d.amountDue}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-5">
        <p className="text-[13px] font-bold text-foreground mb-2">Thank you for your business! 💙</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
          This is an automated invoice from {d.merchantName}. Please do not reply to this email.
          For queries, contact us at the details below.
        </p>
        <div className="space-y-1">
          <p className="text-[11px] text-primary">support@payglocal.in</p>
          <p className="text-[11px] text-primary">+91 80 1234 5678</p>
        </div>
        <div className="mt-5 pt-4 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground">Powered by PayGlocal</p>
        </div>
      </div>

    </div>
  );
}

/* ── PDF Preview ─────────────────────────────────────────────────────────── */
function PdfPreview({ d }: { d: InvDetail }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>

      {/* Column headers */}
      <div className="flex items-center gap-1 px-5 py-3 border-b-2 border-foreground/70">
        <p className="text-[9px] font-bold text-foreground uppercase tracking-wide flex-1 min-w-0">Description</p>
        <p className="text-[9px] font-bold text-foreground uppercase tracking-wide w-[26px] text-right shrink-0">Qty</p>
        <p className="text-[9px] font-bold text-foreground uppercase tracking-wide w-[64px] text-right shrink-0">Unit Price</p>
        <p className="text-[9px] font-bold text-foreground uppercase tracking-wide w-[64px] text-right shrink-0">Amount</p>
      </div>

      {/* Line item rows */}
      {d.lineItems.map((item, i) => (
        <div
          key={i}
          className={cn("flex items-start gap-1 px-5 py-4", i > 0 && "border-t border-border/30")}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-bold text-foreground leading-snug">{item.description}</p>
            {item.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {item.tags.map(tag => <TagPill key={tag.label} tag={tag} />)}
              </div>
            )}
          </div>
          <p className="text-[12px] text-foreground tabular-nums w-[26px] text-right shrink-0 mt-0.5">{item.qty}</p>
          <p className="text-[12px] text-foreground tabular-nums w-[64px] text-right shrink-0 mt-0.5">{item.unitPrice}</p>
          <p className="text-[12px] font-semibold text-foreground tabular-nums w-[64px] text-right shrink-0 mt-0.5">{item.amount}</p>
        </div>
      ))}

      {/* Totals block -- right aligned */}
      <div className="border-t border-border/40 px-5 py-4">
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-6">
            <p className="text-[11px] text-muted-foreground">Subtotal</p>
            <p className="text-[11px] text-foreground tabular-nums w-[80px] text-right">{d.subtotal}</p>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-[11px] text-muted-foreground">Tax</p>
            <p className="text-[11px] text-foreground tabular-nums w-[80px] text-right">{d.tax}</p>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-[11px] text-muted-foreground">Total</p>
            <p className="text-[11px] text-foreground tabular-nums w-[80px] text-right">{d.total}</p>
          </div>
          <div className="w-[200px] h-px bg-border/40 my-1" />
          <div className="flex items-center gap-6">
            <p className="text-[12.5px] font-bold text-foreground">Amount due</p>
            <p className="text-[12.5px] font-bold text-foreground tabular-nums w-[80px] text-right">{d.amountDue}</p>
          </div>
        </div>
      </div>

      {/* Page footer */}
      <div className="border-t border-border/20 px-5 py-3 flex justify-end">
        <p className="text-[10px] text-muted-foreground">Page 1 of 1</p>
      </div>

    </div>
  );
}

/* ── Component ───────────────────────────────────────────────────────────── */
export function MobileInvoicePreview({
  invId,
  onClose,
  onBack: _onBack,
}: {
  invId: string;
  onClose: () => void;
  onBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("email");
  const d = DETAIL_MAP[invId];
  if (!d) return null;

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/60 bg-background shrink-0">
        <p className="text-[13px] font-normal text-muted-foreground leading-none">Invoice Preview</p>
        <button
          type="button"
          onClick={onClose}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-foreground shrink-0"
          aria-label="Close"
        >
          <X className="h-[17px] w-[17px]" strokeWidth={2.25} />
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center px-4 bg-background border-b border-border/60 shrink-0">
        {(["email", "pdf"] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            {tab === "email" ? "Email" : "Pdf"}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden p-4"
        style={{ scrollbarWidth: "none", background: "#f6f8fa" }}
      >
        {activeTab === "email" ? <EmailPreview d={d} /> : <PdfPreview d={d} />}
      </div>

      {/* Bottom bar */}
      <div
        className="shrink-0 border-t border-border/50 px-4 pt-3 bg-white flex items-center gap-3"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={() => toast.success("Preparing PDF...")}
          className="flex items-center justify-center gap-1.5 h-12 px-4 rounded-2xl border border-border text-foreground text-[13px] font-semibold active:bg-muted/30 transition-colors shrink-0"
        >
          <Download className="h-[14px] w-[14px]" strokeWidth={2} />
          Download PDF
        </button>
        <button
          type="button"
          onClick={() => toast.success("Sending...")}
          className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-2xl bg-primary text-white text-[13px] font-bold active:scale-[0.98] transition-all"
        >
          Send invoice
          <Send className="h-[13px] w-[13px]" strokeWidth={2} />
        </button>
      </div>

    </div>
  );
}
