"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  AlertTriangle, ArrowLeft, ArrowUpRight, Check, ChevronDown, ChevronRight, Copy, Download,
  FileText, History, Info, Plus, Search, Send, SlidersHorizontal,
  Trash2, Upload, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { disputes } from "@/lib/mock-data";
import type { DisputeMockRow } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const CURRENCY_SYM: Record<string, string> = { USD: "$", GBP: "£", INR: "₹", EUR: "€" };
const MERCHANT_MID = "MID ····4582";

function fmtRespondBy(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month}, ${hh}:${mm}`;
}

/** Matches the desktop dispute workflow's "20 Jan '26, 05:57 PM" date style. */
function fmtDateTime12(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = String(d.getFullYear()).slice(-2);
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} '${year}, ${String(h).padStart(2, "0")}:${mm} ${ampm}`;
}

function fmtAmount(amount: number, currency: string): string {
  const sym = CURRENCY_SYM[currency] ?? "";
  return `${sym}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function truncateId(id: string): string {
  if (id.length <= 10) return id;
  return `${id.slice(0, 4)}....${id.slice(-4)}`;
}

function cardSource(d: DisputeMockRow): string {
  const brand = d.cardBrand === "mastercard" ? "MC" : d.cardBrand?.toUpperCase() ?? "";
  return d.cardLast4 ? `${brand} •••• ${d.cardLast4}` : brand;
}

/* ── Primary tabs (mirrors the desktop Dispute management tab set) ───────── */
type PrimaryTab = "action_required" | "under_review" | "all" | "won" | "lost";

const PRIMARY_TABS: { id: PrimaryTab; label: string }[] = [
  { id: "action_required", label: "Action required" },
  { id: "under_review",    label: "Under review"     },
  { id: "all",             label: "All disputes"     },
  { id: "won",             label: "Won"              },
  { id: "lost",            label: "Lost"             },
];

const TAB_LABEL: Record<PrimaryTab, string> = {
  action_required: "Action required",
  under_review:    "Under review",
  all:              "All disputes",
  won:              "Won",
  lost:             "Lost",
};

function primaryTabOf(d: DisputeMockRow): Exclude<PrimaryTab, "all"> {
  const badge = d.badgeStatus ?? d.status;
  if (badge === "won") return "won";
  if (badge === "lost") return "lost";
  if (badge === "under_review" || badge === "evidence_submitted") return "under_review";
  return "action_required";
}

const ACTIONABLE_BADGES = new Set(["upload_documents", "insufficient_documents", "action_required"]);
function isActionable(d: DisputeMockRow): boolean {
  return ACTIONABLE_BADGES.has(d.badgeStatus ?? d.status);
}

/* ── Workflow stage — the single status line shown in the list row ───────── */
type WorkflowStage = "Chargeback" | "Representment" | "Pre-arbitration" | "Closed";

function workflowStageOf(d: DisputeMockRow): WorkflowStage {
  const badge = d.badgeStatus ?? d.status;
  if (badge === "won" || badge === "lost") return "Closed";
  if (d.stage === "pre_arbitration") return "Pre-arbitration";
  if (badge === "under_review" || badge === "evidence_submitted") return "Representment";
  return "Chargeback";
}

/** Days between raise and response deadline — pure function of two fixed dates, never live "now". */
function respondWindowDays(d: DisputeMockRow): number {
  const ms = new Date(d.dueDate).getTime() - new Date(d.createdAt).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

function urgencyLineOf(d: DisputeMockRow): string | undefined {
  const badge = d.badgeStatus ?? d.status;
  if (badge === "won" || badge === "lost") return undefined;
  if (badge === "deadline_missed") return "Deadline missed";
  if (badge === "under_review" || badge === "evidence_submitted") return "Awaiting issuer";
  const days = respondWindowDays(d);
  return `Respond in ${days} day${days === 1 ? "" : "s"}`;
}

function currentOwnerOf(d: DisputeMockRow): string {
  const stage = workflowStageOf(d);
  if (stage === "Closed") return "—";
  if (stage === "Representment") return "Issuing bank";
  return "You";
}

function networkLabelOf(d: DisputeMockRow): string {
  if (!d.cardBrand) return "—";
  return d.cardBrand.charAt(0).toUpperCase() + d.cardBrand.slice(1);
}

/* ── Amount color by badge status — red (urgent/lost), amber (needs action), blue (in review), green (won) ── */
const AMOUNT_STATUS_COLOR: Record<string, string> = {
  deadline_missed:        "text-red-600",
  insufficient_documents: "text-red-600",
  upload_documents:       "text-amber-600",
  action_required:        "text-amber-600",
  under_review:           "text-blue-600",
  evidence_submitted:     "text-blue-600",
  won:                    "text-emerald-600",
  lost:                   "text-red-600",
};
function amountColorOf(d: DisputeMockRow): string {
  return AMOUNT_STATUS_COLOR[d.badgeStatus ?? d.status] ?? "text-foreground";
}

/** Chronological history derived purely from existing fields — no live clock, no new mock data. */
function activityOf(d: DisputeMockRow): { label: string; at: string }[] {
  const badge = d.badgeStatus ?? d.status;
  const stage = workflowStageOf(d);
  const events: { label: string; at: string }[] = [
    { label: "Payment successful",        at: d.paymentDate },
    { label: "Dispute raised by customer", at: d.createdAt },
    { label: "Merchant notified",          at: d.createdAt },
  ];
  const createdMs = new Date(d.createdAt).getTime();
  const dueMs     = new Date(d.dueDate).getTime();
  const mid       = new Date(createdMs + (dueMs - createdMs) / 2).toISOString();

  if (stage === "Representment" || stage === "Pre-arbitration" || stage === "Closed") {
    events.push({ label: "Evidence submitted by merchant", at: mid });
    events.push({ label: "Issuer reviewing evidence",       at: d.dueDate });
  }
  if (stage === "Pre-arbitration") {
    events.push({ label: "Case escalated to pre-arbitration", at: d.dueDate });
  }
  if (stage === "Closed") {
    events.push({
      label: badge === "won" ? "Dispute resolved in your favour" : "Dispute resolved against you",
      at: d.dueDate,
    });
  }
  return events;
}

/* ── Reason metadata lookup — category / reason code / description / required docs ── */
type ReasonMeta = {
  category: string;
  reasonCode: string;
  shortDescription: string;
};

const REASON_META: Record<string, ReasonMeta> = {
  "Product not received": {
    category: "Non-receipt",
    reasonCode: "13.1",
    shortDescription: "The customer claims they never received the purchased item.",
  },
  "Duplicate charge": {
    category: "Processing error",
    reasonCode: "12.6.1",
    shortDescription: "The customer was charged more than once for the same purchase.",
  },
  "Other reason": {
    category: "Consumer dispute",
    reasonCode: "13.9",
    shortDescription: "The customer provided a reason that falls outside standard dispute categories.",
  },
  "Other Fraud - Card Absent": {
    category: "Fraud",
    reasonCode: "10.4",
    shortDescription: "The cardholder claims they did not authorize this card-not-present transaction.",
  },
  "Goods or Services Not Provided": {
    category: "Non-receipt",
    reasonCode: "13.3",
    shortDescription: "The customer claims the purchased goods or services were never delivered.",
  },
  "No Cardholder Authorization": {
    category: "Fraud",
    reasonCode: "10.4",
    shortDescription: "The cardholder claims they did not authorize this transaction.",
  },
  "Item Not Received": {
    category: "Non-receipt",
    reasonCode: "13.1",
    shortDescription: "The customer claims the item was never received.",
  },
  "Unauthorized transaction": {
    category: "Fraud",
    reasonCode: "10.4",
    shortDescription: "The cardholder claims this transaction was not authorized by them.",
  },
  "Fraudulent": {
    category: "Fraud",
    reasonCode: "10.4",
    shortDescription: "The transaction has been reported as fraudulent by the cardholder.",
  },
};

function reasonMetaOf(d: DisputeMockRow): ReasonMeta {
  return REASON_META[d.reason] ?? {
    category: "General",
    reasonCode: "—",
    shortDescription: d.reason,
  };
}

/* ── Evidence document tags — matches the desktop dispute workflow's fixed set ── */
const EVIDENCE_TAGS = [
  "Order details",
  "Copy of Online Authorization details",
  "Proof of Delivery (PoD) / Services Rendered",
  "Refund / Cancellation Policy",
  "Other Documents",
] as const;

type UploadedDoc = { id: string; name: string; tag: string };

const FILTER_CHIPS = [
  "Status",
  "Reason",
  "Amount",
  "Disputed date",
  "Evidence due by",
] as const;

/* ── CopyBtn ──────────────────────────────────────────────────────────────── */

function CopyBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).catch(() => {});
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground"
      aria-label="Copy"
    >
      {done
        ? <Check className="h-[13px] w-[13px] text-emerald-600" strokeWidth={2.5} />
        : <Copy  className="h-[13px] w-[13px]" strokeWidth={2} />}
    </button>
  );
}

/* ── CopyableValue — PairedRow value with an inline copy button ──────────── */
function CopyableValue({ value, display }: { value: string; display: string }) {
  return (
    <div className="flex items-center gap-0.5 min-w-0">
      <p className="text-[13px] font-medium text-foreground font-mono leading-snug truncate">{display}</p>
      <CopyBtn value={value} />
    </div>
  );
}

/* ── PairedRow ────────────────────────────────────────────────────────────── */

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

/* ── SectionHeader — matches the invoice-creation workflow's segmentation ── */
function SectionHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  rightContent,
  open,
  onToggle,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  rightContent?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        <Icon className={cn("h-[15px] w-[15px]", iconColor)} strokeWidth={2} />
      </div>
      <p className="flex-1 text-[15px] font-bold text-foreground">{title}</p>
      {rightContent && <div className="flex items-center gap-2 shrink-0">{rightContent}</div>}
      <button type="button" onClick={onToggle} className="shrink-0 active:opacity-60 transition-opacity">
        {open
          ? <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
          : <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={2} />}
      </button>
    </div>
  );
}

/* ── StickyFooter — matches the invoice workflow's fixed bottom action bar ── */
function StickyFooter({
  secondaryLabel,
  onSecondary,
  primaryLabel,
  primaryIcon: PrimaryIcon,
  onPrimary,
  primaryDisabled,
}: {
  secondaryLabel: string;
  onSecondary: () => void;
  primaryLabel: string;
  primaryIcon?: React.ElementType;
  onPrimary: () => void;
  primaryDisabled?: boolean;
}) {
  return (
    <div
      className="shrink-0 flex items-center gap-3 px-4 py-3 border-t border-border/60 bg-white"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={onSecondary}
        className="flex items-center gap-1.5 h-11 px-4 rounded-2xl border border-border text-[13px] font-medium text-foreground active:bg-muted/20 transition-colors shrink-0"
      >
        {secondaryLabel}
      </button>
      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        className={cn(
          "flex-1 flex items-center justify-center gap-1.5 h-11 rounded-2xl text-[13px] font-semibold transition-all",
          primaryDisabled ? "bg-muted text-muted-foreground" : "bg-primary text-white active:scale-[0.98]"
        )}
      >
        {PrimaryIcon && <PrimaryIcon className="h-[14px] w-[14px]" strokeWidth={2} />}
        {primaryLabel}
      </button>
    </div>
  );
}

/* ── Comments ─────────────────────────────────────────────────────────────── */
function CommentsSection({ onSent }: { onSent?: () => void } = {}) {
  const [text, setText] = useState("");
  return (
    <div className="px-4 pb-4 pt-1 space-y-3">
      <p className="text-[12px] text-muted-foreground leading-snug -mt-1">
        Leave a note for our team if you need help or clarification
      </p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Share details or questions about this dispute..."
        rows={3}
        className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
      />
      <button
        type="button"
        disabled={!text.trim()}
        onClick={() => { toast.success("Message sent"); setText(""); onSent?.(); }}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-opacity",
          text.trim() ? "bg-primary text-white active:opacity-80" : "bg-muted text-muted-foreground"
        )}
      >
        <Send className="h-3.5 w-3.5" strokeWidth={2} />
        Send message
      </button>
    </div>
  );
}

/* ── Take Action overlay — task-oriented: complete the dispute response ──── */
function TakeActionOverlay({
  dispute: d,
  docs,
  onAddDoc,
  onRemoveDoc,
  onClose,
  onViewDetails,
}: {
  dispute: DisputeMockRow;
  docs: UploadedDoc[];
  onAddDoc: (file: File, tag: string) => void;
  onRemoveDoc: (docId: string) => void;
  onClose: () => void;
  onViewDetails: () => void;
}) {
  const badge       = d.badgeStatus ?? d.status;
  const actionable  = isActionable(d);
  const isDeadline  = badge === "deadline_missed";
  const isReviewing = badge === "under_review" || badge === "evidence_submitted";
  const stage       = workflowStageOf(d);
  const urgency     = urgencyLineOf(d);
  const meta        = reasonMetaOf(d);

  const [summaryOpen, setSummaryOpen] = useState(true);
  const [docsOpen,    setDocsOpen]    = useState(true);
  const [activeTag,   setActiveTag]   = useState<string>(EVIDENCE_TAGS[0]);

  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onAddDoc(file, activeTag);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col h-full bg-[#f6f8fa] overflow-hidden">
      <div className="flex justify-center pt-2.5 pb-1 shrink-0">
        <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
      </div>

      {/* Header — amount, stage, time remaining */}
      <div className="flex items-start justify-between gap-3 px-4 pb-3 shrink-0">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground font-medium mb-1">Take action</p>
          <p className="text-[24px] font-bold text-foreground tabular-nums leading-tight">
            {fmtAmount(d.amount, d.currency)}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[12px] font-semibold text-foreground">{stage}</span>
            {urgency && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className={cn("text-[12px] font-medium", isDeadline ? "text-red-500" : "text-muted-foreground")}>
                  {urgency}
                </span>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 pb-6 space-y-3"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Case summary */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={Info} iconBg="bg-primary/10" iconColor="text-primary" title="Case summary"
            open={summaryOpen} onToggle={() => setSummaryOpen(p => !p)}
          />
          {summaryOpen && (
            <div className="px-4 pb-4 border-t border-border/20 pt-3 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] text-muted-foreground">Reason</p>
                <p className="text-[13px] font-medium text-foreground text-right">{d.reason}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] text-muted-foreground">Category</p>
                <p className="text-[13px] font-medium text-foreground">{meta.category}</p>
              </div>
              <p className="text-[12.5px] text-muted-foreground leading-snug pt-2 border-t border-border/20">
                {meta.shortDescription}
              </p>
            </div>
          )}
        </div>

        {/* Submit supporting evidence / status */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={Upload} iconBg="bg-amber-500/10" iconColor="text-amber-600" title="Submit supporting evidence"
            rightContent={isDeadline ? (
              <span className="text-[11px] font-semibold text-red-500 border border-red-200 bg-red-50 rounded-md px-2 py-0.5">
                Past due
              </span>
            ) : undefined}
            open={docsOpen} onToggle={() => setDocsOpen(p => !p)}
          />
          {docsOpen && (
            actionable ? (
              <div className="px-4 pb-4 border-t border-border/20 pt-3 space-y-3">
                <p className="text-[12px] text-muted-foreground leading-snug">
                  Submit all relevant documents to help strengthen your case
                </p>

                {/* Document type tags — tap to tag the next upload */}
                <div className="flex flex-wrap gap-2">
                  {EVIDENCE_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveTag(tag)}
                      className={cn(
                        "flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 rounded-lg border text-[11.5px] font-medium transition-colors",
                        activeTag === tag
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-dashed border-border text-muted-foreground"
                      )}
                    >
                      {tag}
                      <span className={cn(
                        "h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0",
                        activeTag === tag ? "bg-primary/15" : "bg-muted-foreground/15"
                      )}>
                        <Info className="h-2 w-2" strokeWidth={2.5} />
                      </span>
                    </button>
                  ))}
                </div>

                {docs.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-20 rounded-xl border border-dashed border-primary/40 flex flex-col items-center justify-center gap-1 active:opacity-70 transition-opacity"
                    style={{ background: "rgba(59,130,246,0.04)" }}
                  >
                    <Upload className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    <p className="text-[13px] text-primary font-medium">Upload documents</p>
                    <p className="text-[11px] text-muted-foreground">PDF, JPG, PNG</p>
                  </button>
                ) : (
                  <>
                    <p className="text-[12px] font-semibold text-foreground pt-1">Uploaded documents</p>
                    <div className="space-y-2">
                      {docs.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12.5px] font-medium text-foreground truncate">{doc.name}</p>
                            <span className="inline-block mt-1 text-[10.5px] font-medium text-muted-foreground border border-border rounded-md px-1.5 py-[1px]">
                              {doc.tag}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveDoc(doc.id)}
                            aria-label="Delete"
                            className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-red-500 active:bg-red-50 shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full flex items-center justify-center gap-1.5 h-11 rounded-xl border border-border text-primary text-[13px] font-semibold active:bg-muted/20 transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" strokeWidth={2} />
                      Upload additional documents
                    </button>
                  </>
                )}

                <p className="text-[11px] text-muted-foreground text-center pt-1">
                  Note: Try to upload as many documents as possible to win this dispute
                </p>
              </div>
            ) : (
              <div className="px-4 pb-4 border-t border-border/20 pt-3">
                {isDeadline ? (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-3 flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-[13px] font-medium text-red-700 leading-snug">
                      Deadline passed — no further action possible.
                    </p>
                  </div>
                ) : isReviewing ? (
                  <p className="text-[13px] text-muted-foreground">
                    Your evidence has been submitted and is under review by the issuing bank.
                  </p>
                ) : (
                  <p className="text-[13px] text-muted-foreground">
                    This dispute has been resolved{badge === "won" ? " in your favour." : "."}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </div>

      <StickyFooter
        secondaryLabel="View Details"
        onSecondary={onViewDetails}
        primaryLabel="Upload Documents"
        primaryIcon={Upload}
        primaryDisabled={!actionable}
        onPrimary={() => fileRef.current?.click()}
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

/* ── Case Details overlay — information-oriented: explain the dispute ────── */
function CaseDetailsOverlay({
  dispute: d,
  docs,
  onClose,
  onTakeAction,
}: {
  dispute: DisputeMockRow;
  docs: UploadedDoc[];
  onClose: () => void;
  onTakeAction: () => void;
}) {
  const badge   = d.badgeStatus ?? d.status;
  const stage   = workflowStageOf(d);
  const meta    = reasonMetaOf(d);
  const owner   = currentOwnerOf(d);
  const network = networkLabelOf(d);
  const respondBy = fmtRespondBy(d.dueDate);

  const [summaryOpen,   setSummaryOpen]   = useState(true);
  const [txnOpen,       setTxnOpen]       = useState(true);
  const [infoOpen,      setInfoOpen]      = useState(true);
  const [docsOpen,      setDocsOpen]      = useState(true);
  const [addCommentOpen, setAddCommentOpen] = useState(false);

  return (
    <div className="relative flex flex-col h-full bg-[#f6f8fa] overflow-hidden">
      <div className="flex justify-center pt-2.5 pb-1 shrink-0">
        <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
      </div>

      <div className="flex items-start justify-between gap-3 px-4 pb-3 shrink-0">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Dispute ID</p>
          <div className="flex items-center gap-1">
            <p className="text-[13px] font-semibold text-foreground font-mono truncate">{truncateId(d.id)}</p>
            <CopyBtn value={d.id} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 pb-6 space-y-3"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Summary */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={Info} iconBg="bg-primary/10" iconColor="text-primary" title="Summary"
            open={summaryOpen} onToggle={() => setSummaryOpen(p => !p)}
          />
          {summaryOpen && (
            <div className="px-4 pb-4 border-t border-border/20 pt-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[22px] font-bold text-foreground tabular-nums">{fmtAmount(d.amount, d.currency)}</p>
                <StatusBadge status={badge} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted-foreground">Stage</p>
                <p className="text-[13px] font-medium text-foreground">{stage}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] text-muted-foreground shrink-0">Reason</p>
                <p className="text-[13px] font-medium text-foreground text-right">{d.reason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Transaction */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={FileText} iconBg="bg-muted" iconColor="text-muted-foreground" title="Transaction"
            open={txnOpen} onToggle={() => setTxnOpen(p => !p)}
          />
          {txnOpen && (
            <>
              <PairedRow
                left={{ label: "Transaction ID", value: <CopyableValue value={d.transactionId} display={truncateId(d.transactionId)} /> }}
                right={{ label: "Payment ID", value: <CopyableValue value={d.paymentId} display={truncateId(d.paymentId)} /> }}
              />
              <PairedRow
                left={{ label: "ARN", value: <CopyableValue value={d.arn} display={d.arn} /> }}
                right={{ label: "MID", value: MERCHANT_MID }}
              />
              <PairedRow
                last
                left={{ label: "Currency", value: d.currency }}
                right={{ label: "Card", value: cardSource(d) }}
              />
              <div className="px-4 py-3.5 border-t border-border/50">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">Transaction date</p>
                <p className="text-[13px] font-medium text-foreground leading-snug">{fmtDateTime12(d.paymentDate)}</p>
              </div>
            </>
          )}
        </div>

        {/* Dispute information */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={AlertTriangle} iconBg="bg-amber-500/10" iconColor="text-amber-600" title="Dispute information"
            open={infoOpen} onToggle={() => setInfoOpen(p => !p)}
          />
          {infoOpen && (
            <>
              <PairedRow
                left={{ label: "Reason code", value: meta.reasonCode }}
                right={{ label: "Network", value: network }}
              />
              <PairedRow
                last
                left={{ label: "Dispute created", value: fmtDateTime12(d.createdAt) }}
                right={{ label: "Respond by", value: respondBy }}
              />
              <div className="px-4 py-3.5 border-t border-border/50">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">Current owner</p>
                <p className="text-[13px] font-medium text-foreground leading-snug">{owner}</p>
              </div>
            </>
          )}
        </div>

        {/* Documents */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={Upload} iconBg="bg-muted" iconColor="text-muted-foreground" title="Documents"
            rightContent={<span className="text-[11px] font-medium text-muted-foreground">{docs.length}</span>}
            open={docsOpen} onToggle={() => setDocsOpen(p => !p)}
          />
          {docsOpen && (
            <div className="px-4 pb-2 border-t border-border/20">
              {docs.length === 0 ? (
                <p className="text-[13px] text-muted-foreground py-3">No documents uploaded yet.</p>
              ) : docs.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-b-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{doc.tag}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <StickyFooter
        secondaryLabel="Add Comments"
        onSecondary={() => setAddCommentOpen(true)}
        primaryLabel="Take Action"
        primaryIcon={ArrowUpRight}
        onPrimary={onTakeAction}
      />

      {/* Add comment — stacked overlay on top of Case Details */}
      <AnimatePresence>
        {addCommentOpen && (
          <>
            <motion.div
              className="absolute inset-0 z-10"
              style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setAddCommentOpen(false)}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 z-11 flex flex-col overflow-hidden bg-[#f6f8fa]"
              style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="flex justify-center pt-2.5 pb-1 shrink-0">
                <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
              </div>
              <div className="flex items-center justify-between gap-3 px-4 pb-2 shrink-0">
                <p className="text-[16px] font-bold text-foreground">Add comment</p>
                <button
                  type="button"
                  onClick={() => setAddCommentOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              <CommentsSection onSent={() => setAddCommentOpen(false)} />
              <div style={{ height: "env(safe-area-inset-bottom)" }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Activity overlay — read-only chronological history ───────────────────── */
function ActivityOverlay({ dispute: d, onClose }: { dispute: DisputeMockRow; onClose: () => void }) {
  const events = activityOf(d);
  return (
    <div className="flex flex-col h-full bg-[#f6f8fa] overflow-hidden">
      <div className="flex justify-center pt-2.5 pb-1 shrink-0">
        <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 pb-3 shrink-0">
        <p className="text-[16px] font-bold text-foreground">Timeline</p>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 pb-8" style={{ scrollbarWidth: "none" }}>
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <div className="relative">
            <div className="absolute left-[11px] top-3 bottom-3 border-l border-dashed border-border" aria-hidden />
            <div className="space-y-5 relative">
              {events.map((ev, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground leading-snug">{ev.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{fmtDateTime12(ev.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Swipe-to-reveal row — 3 actions, same drag mechanics as MobileInvoices ── */
const DISPUTE_SWIPE_WIDTH = 225; // 3 actions × 75px each, matches MobileInvoices' SwipeCard

function DisputeSwipeRow({
  isOpen,
  onOpen,
  onClose,
  onTap,
  onTakeAction,
  onCaseDetails,
  onActivity,
  children,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onTap: () => void;
  onTakeAction: () => void;
  onCaseDetails: () => void;
  onActivity: () => void;
  children: React.ReactNode;
}) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const gestureDir = useRef<"h" | "v" | null>(null);
  const didMove = useRef(false);

  const baseX = isOpen ? -DISPUTE_SWIPE_WIDTH : 0;
  const translateX = isDragging
    ? Math.max(-DISPUTE_SWIPE_WIDTH, Math.min(0, baseX + dragX))
    : baseX;

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    startY.current = e.clientY;
    gestureDir.current = null;
    didMove.current = false;
    setDragX(0);
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (!gestureDir.current) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      didMove.current = true;
      gestureDir.current = Math.abs(dx) >= Math.abs(dy) * 2 ? "h" : "v";
      if (gestureDir.current === "v") { setIsDragging(false); return; }
    }
    if (gestureDir.current === "h") setDragX(dx);
  }
  function onPointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    if (!didMove.current) { setDragX(0); isOpen ? onClose() : onTap(); return; }
    const finalX = Math.max(-DISPUTE_SWIPE_WIDTH, Math.min(0, baseX + dragX));
    setDragX(0);
    if (isOpen) { finalX > -(DISPUTE_SWIPE_WIDTH * 0.5) ? onClose() : onOpen(); }
    else { finalX < -(DISPUTE_SWIPE_WIDTH * 0.3) ? onOpen() : onClose(); }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons — fixed behind the card, matches MobileInvoices' 3-button convention */}
      <div className="absolute right-0 top-0 bottom-0 flex" style={{ width: DISPUTE_SWIPE_WIDTH }}>
        <button type="button" onClick={onTakeAction}
          className="flex flex-col items-center justify-center flex-1 bg-primary"
        >
          <ArrowUpRight className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          <span className="text-[11px] font-medium text-white mt-1">Take Action</span>
        </button>
        <button type="button" onClick={onCaseDetails}
          className="flex flex-col items-center justify-center flex-1 bg-amber-500"
        >
          <Info className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          <span className="text-[11px] font-medium text-white mt-1">Case Details</span>
        </button>
        <button type="button" onClick={onActivity}
          className="flex flex-col items-center justify-center flex-1 bg-muted"
        >
          <History className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={2} />
          <span className="text-[11px] font-medium text-muted-foreground mt-1">Timeline</span>
        </button>
      </div>
      {/* Card content — slides left on swipe */}
      <div
        className="relative z-[1] bg-card"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
          touchAction: "pan-y",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Dispute row — Level 1 triage view: only what's needed to scan ────────── */
function DisputeRowContent({ d }: { d: DisputeMockRow }) {
  const stage    = workflowStageOf(d);
  const urgency  = urgencyLineOf(d);
  const urgent   = (d.badgeStatus ?? d.status) === "deadline_missed";
  const amtColor = amountColorOf(d);
  return (
    <div className="px-4 py-3.5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-foreground font-mono truncate">{truncateId(d.id)}</p>
        <div className="mt-1.5">
          {d.cardBrand === "visa" || d.cardBrand === "mastercard" ? (
            <div className="flex items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.cardBrand === "visa" ? "/visa.png" : "/mastercard.png"}
                alt={d.cardBrand}
                className="h-[10px] w-auto object-contain"
              />
              {d.cardLast4 && <p className="text-[12px] text-muted-foreground leading-snug">···{d.cardLast4}</p>}
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground leading-snug">
              {d.cardBrand ? d.cardBrand.toUpperCase() : "—"}{d.cardLast4 ? ` ···${d.cardLast4}` : ""}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn("text-[15px] font-bold tabular-nums", amtColor)}>
          {fmtAmount(d.amount, d.currency)}
        </p>
        <p className="text-[12.5px] text-muted-foreground mt-1">{stage}</p>
        {urgency && (
          <p className={cn("text-[11px] mt-1 font-medium", urgent ? "text-red-500" : "text-muted-foreground")}>
            {urgency}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── MobileDisputes ───────────────────────────────────────────────────────── */

export function MobileDisputes({
  open,
  onClose,
  contained = false,
}: {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
}) {
  const pos = contained ? "absolute" : "fixed";

  const [searchQuery,     setSearchQuery]     = useState("");
  const [activeTab,       setActiveTab]       = useState<PrimaryTab>("action_required");
  const [swipedId,        setSwipedId]        = useState<string | null>(null);

  const [takeActionFor,  setTakeActionFor]  = useState<DisputeMockRow | null>(null);
  const [caseDetailsFor, setCaseDetailsFor] = useState<DisputeMockRow | null>(null);
  const [activityFor,    setActivityFor]    = useState<DisputeMockRow | null>(null);
  const [uploadedDocs,   setUploadedDocs]   = useState<Record<string, UploadedDoc[]>>({});

  const chipsRef = useHorizontalScroll<HTMLDivElement>();
  const tabsRef  = useHorizontalScroll<HTMLDivElement>();

  const needsActionCount = disputes.filter(d => primaryTabOf(d) === "action_required").length;
  const wonCount          = disputes.filter(d => primaryTabOf(d) === "won").length;
  const lostCount         = disputes.filter(d => primaryTabOf(d) === "lost").length;
  const inReviewCount     = disputes.filter(d => primaryTabOf(d) === "under_review").length;

  type PieSlice = { key: string; label: string; value: number; color: string; tab: PrimaryTab };
  const overviewPieDataAll: PieSlice[] = [
    { key: "action_required", label: "Needs action", value: needsActionCount, color: "#f59e0b", tab: "action_required" },
    { key: "under_review",    label: "In review",     value: inReviewCount,    color: "#3b82f6", tab: "under_review"    },
    { key: "won",             label: "Won",           value: wonCount,         color: "#10b981", tab: "won"             },
    { key: "lost",            label: "Lost",          value: lostCount,        color: "#ef4444", tab: "lost"            },
  ];
  const overviewPieData = overviewPieDataAll.filter(e => e.value > 0);

  const tabFiltered = activeTab === "all" ? disputes : disputes.filter(d => primaryTabOf(d) === activeTab);
  const q = searchQuery.trim().toLowerCase();
  const filtered = tabFiltered.filter(d =>
    !q ||
    d.customerName.toLowerCase().includes(q) ||
    d.reason.toLowerCase().includes(q) ||
    d.id.toLowerCase().includes(q)
  );

  function openTakeAction(d: DisputeMockRow) {
    setCaseDetailsFor(null); setActivityFor(null); setSwipedId(null);
    setTakeActionFor(d);
  }
  function openCaseDetails(d: DisputeMockRow) {
    setTakeActionFor(null); setActivityFor(null); setSwipedId(null);
    setCaseDetailsFor(d);
  }
  function openActivity(d: DisputeMockRow) {
    setTakeActionFor(null); setCaseDetailsFor(null); setSwipedId(null);
    setActivityFor(d);
  }

  function addDoc(disputeId: string, file: File, tag: string) {
    const doc: UploadedDoc = { id: `${file.name}-${file.size}-${Date.now()}`, name: file.name, tag };
    setUploadedDocs(prev => ({ ...prev, [disputeId]: [...(prev[disputeId] ?? []), doc] }));
  }
  function removeDoc(disputeId: string, docId: string) {
    setUploadedDocs(prev => ({ ...prev, [disputeId]: (prev[disputeId] ?? []).filter(d => d.id !== docId) }));
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="disputes-screen"
          className={`${pos} inset-x-0 bottom-0 z-[80] flex flex-col bg-[#f6f8fa] overflow-hidden`}
          style={{ top: 44 }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* ── Screen header ── */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#f6f8fa] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full text-foreground active:bg-muted/60 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2} />
            </button>
            <h1 className="text-[18px] font-bold text-foreground">Disputes</h1>
          </div>

          {/* ── Scrollable content ── */}
          <div
            className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-6"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Dispute overview — composition donut (needs action / won / lost / in review) */}
            <div className="px-4 mt-3 mb-3">
              <p className="text-[14px] font-bold text-foreground leading-none mb-2.5">Dispute overview</p>
              <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-[108px] h-[108px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          cursor={false}
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const p = payload[0];
                            return (
                              <div className="rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-sm">
                                <p className="text-[11px] font-semibold text-foreground">{p.name}: {p.value as number}</p>
                              </div>
                            );
                          }}
                        />
                        <Pie
                          data={overviewPieData}
                          dataKey="value"
                          nameKey="label"
                          cx="50%" cy="50%"
                          innerRadius={34}
                          outerRadius={52}
                          paddingAngle={3}
                          startAngle={90}
                          endAngle={-270}
                        >
                          {overviewPieData.map(e => (
                            <Cell
                              key={e.key}
                              fill={e.color}
                              className="cursor-pointer outline-none"
                              onClick={() => setActiveTab(e.tab)}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-[20px] font-bold text-foreground leading-none tabular-nums">{disputes.length}</p>
                      <p className="text-[9px] font-medium text-muted-foreground mt-0.5">Total</p>
                    </div>
                  </div>
                  <ul className="flex-1 min-w-0 space-y-2">
                    {overviewPieData.map(e => (
                      <li key={e.key}>
                        <button
                          type="button"
                          onClick={() => setActiveTab(e.tab)}
                          className="w-full flex items-center justify-between gap-2 active:opacity-70 transition-opacity"
                        >
                          <span className="flex items-center gap-2 text-[12px] text-muted-foreground min-w-0">
                            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: e.color }} />
                            <span className="truncate">{e.label}</span>
                          </span>
                          <span className="text-[13px] font-bold text-foreground tabular-nums shrink-0">{e.value}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* All Disputes card */}
            <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm">

              {/* Card header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <p className="text-[15px] font-bold text-foreground">{TAB_LABEL[activeTab]}</p>
                <button
                  type="button"
                  onClick={() => toast.success("Exporting...")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download className="h-[14px] w-[14px]" strokeWidth={2} />
                  Export
                </button>
              </div>

              {/* Primary tabs */}
              <div
                ref={tabsRef}
                className="[&::-webkit-scrollbar]:hidden"
                style={{ overflowX: "scroll", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", cursor: "grab" } as React.CSSProperties}
              >
                <div className="flex gap-1 bg-muted/60 p-1 mx-4 mb-3 rounded-xl w-max">
                  {PRIMARY_TABS.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={cn(
                        "px-3.5 py-1.5 text-[12px] font-medium rounded-lg transition-colors whitespace-nowrap",
                        activeTab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search + filter icon */}
              <div className="flex items-center gap-2.5 px-4 pb-3">
                <div className="flex-1 flex items-center gap-2.5 bg-muted/50 rounded-xl px-3.5 py-2.5">
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by customer, reason, ID..."
                    className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery("")}>
                      <X className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Opening filters...")}
                  className="h-[38px] w-[38px] flex items-center justify-center rounded-xl bg-muted/50 text-muted-foreground shrink-0"
                >
                  <SlidersHorizontal className="h-[15px] w-[15px]" strokeWidth={2} />
                </button>
              </div>

              {/* Filter chips */}
              <div
                ref={chipsRef}
                className="[&::-webkit-scrollbar]:hidden"
                style={{ overflowX: "scroll", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", cursor: "grab" } as React.CSSProperties}
              >
                <div className="flex gap-2 px-4 pb-3 w-max">
                  {FILTER_CHIPS.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toast.success(`Filtering by ${label}...`)}
                      className="flex items-center gap-1 h-8 text-[12px] font-medium border border-dashed border-border bg-white text-muted-foreground rounded-xl px-3 whitespace-nowrap shrink-0 active:bg-muted/40 transition-colors"
                    >
                      <Plus className="h-[11px] w-[11px] text-muted-foreground/60 shrink-0" strokeWidth={2} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dispute rows — triage view, swipe reveals Take Action / Case Details / Activity */}
              <div className="divide-y divide-border/30">
                {filtered.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <p className="text-[14px] font-medium text-muted-foreground">No disputes</p>
                    <p className="text-[12px] text-muted-foreground mt-1">No disputes matching the selected filter</p>
                  </div>
                ) : filtered.map((d) => (
                  <DisputeSwipeRow
                    key={d.id}
                    isOpen={swipedId === d.id}
                    onOpen={() => setSwipedId(d.id)}
                    onClose={() => setSwipedId(cur => cur === d.id ? null : cur)}
                    onTap={() => openCaseDetails(d)}
                    onTakeAction={() => openTakeAction(d)}
                    onCaseDetails={() => openCaseDetails(d)}
                    onActivity={() => openActivity(d)}
                  >
                    <DisputeRowContent d={d} />
                  </DisputeSwipeRow>
                ))}
              </div>

              {/* Item count */}
              <p className="px-4 py-3 border-t border-border/40 text-[12px] text-muted-foreground">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""}
              </p>

            </div>
          </div>

          {/* ── Take Action overlay ── */}
          <AnimatePresence>
            {takeActionFor && (
              <>
                <motion.div
                  key="ta-backdrop"
                  className="absolute inset-0 z-[5]"
                  style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setTakeActionFor(null)}
                />
                <motion.div
                  key={`${takeActionFor.id}-ta`}
                  className="absolute inset-x-0 bottom-0 z-[6] flex flex-col overflow-hidden bg-[#f6f8fa]"
                  style={{ height: "94%", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                >
                  <TakeActionOverlay
                    dispute={takeActionFor}
                    docs={uploadedDocs[takeActionFor.id] ?? []}
                    onAddDoc={(file, tag) => addDoc(takeActionFor.id, file, tag)}
                    onRemoveDoc={(docId) => removeDoc(takeActionFor.id, docId)}
                    onClose={() => setTakeActionFor(null)}
                    onViewDetails={() => openCaseDetails(takeActionFor)}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Case Details overlay ── */}
          <AnimatePresence>
            {caseDetailsFor && (
              <>
                <motion.div
                  key="cd-backdrop"
                  className="absolute inset-0 z-[5]"
                  style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setCaseDetailsFor(null)}
                />
                <motion.div
                  key={`${caseDetailsFor.id}-cd`}
                  className="absolute inset-x-0 bottom-0 z-[6] flex flex-col overflow-hidden bg-[#f6f8fa]"
                  style={{ height: "94%", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                >
                  <CaseDetailsOverlay
                    dispute={caseDetailsFor}
                    docs={uploadedDocs[caseDetailsFor.id] ?? []}
                    onClose={() => setCaseDetailsFor(null)}
                    onTakeAction={() => {
                      const d = caseDetailsFor;
                      openTakeAction(d);
                    }}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Activity overlay ── */}
          <AnimatePresence>
            {activityFor && (
              <>
                <motion.div
                  key="act-backdrop"
                  className="absolute inset-0 z-[5]"
                  style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setActivityFor(null)}
                />
                <motion.div
                  key={`${activityFor.id}-act`}
                  className="absolute inset-x-0 bottom-0 z-[6] flex flex-col overflow-hidden bg-[#f6f8fa]"
                  style={{ height: "94%", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                >
                  <ActivityOverlay
                    dispute={activityFor}
                    onClose={() => setActivityFor(null)}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
