"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  ArrowLeft, Check, ChevronDown, ChevronRight, Copy, Download,
  FileText, History, Info, Plus, Search, Send, SlidersHorizontal,
  Trash2, Upload, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { disputes } from "@/lib/mock-data";
import type { DisputeMockRow } from "@/lib/mock-data";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const CURRENCY_SYM: Record<string, string> = { USD: "$", GBP: "£", INR: "₹", EUR: "€" };
const MERCHANT_MID = "MID ····4582";

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

/* ── Workflow stage — the single status line shown in the list row (unchanged) ── */
type WorkflowStage = "Chargeback" | "Representment" | "Pre-arbitration" | "Closed";

function workflowStageOf(d: DisputeMockRow): WorkflowStage {
  const badge = d.badgeStatus ?? d.status;
  if (badge === "won" || badge === "lost") return "Closed";
  if (d.stage === "pre_arbitration") return "Pre-arbitration";
  if (badge === "under_review" || badge === "evidence_submitted") return "Representment";
  return "Chargeback";
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

/* ── Stage chip — compact pill for the list row's right column (unchanged) ── */
const STAGE_CHIP_STYLE: Record<WorkflowStage, string> = {
  Chargeback:        "bg-amber-50 text-amber-700",
  Representment:     "bg-blue-50 text-blue-700",
  "Pre-arbitration":  "bg-orange-50 text-orange-700",
  Closed:            "bg-muted text-muted-foreground",
};
function StageChip({ stage }: { stage: WorkflowStage }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap",
      STAGE_CHIP_STYLE[stage]
    )}>
      {stage}
    </span>
  );
}

/** Raised-on date split into date/time lines for the list row's right column. */
function fmtRowDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = d.getFullYear();
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return { date: `${day} ${month} ${year}`, time: `${String(h).padStart(2, "0")}:${mm} ${ampm}` };
}

/* ── Merchant decisions — session-local interaction state, never mutates real data ── */
type MerchantDecision = "undecided" | "contesting" | "accepted";
type SecondDecision   = "undecided" | "recontesting" | "accepted_liability";

/* ── Dispute phase — the single derived phase driving the guided workspace ───
   Combines the real dispute badge/stage with session-local merchant
   interaction (accept/contest, uploads, submissions at each of the two
   decision points) — never mutates the underlying dispute record. ────────── */
type DisputePhase =
  | "chargeback"
  | "chargeback_uploading"
  | "chargeback_docs_uploaded"
  | "evidence_submitted"
  | "under_review"
  | "pre_arbitration"
  | "prearb_uploading"
  | "prearb_docs_uploaded"
  | "arbitration"
  | "won"
  | "lost"
  | "closed";

function computePhase(
  d: DisputeMockRow,
  decision: MerchantDecision,
  docsLen: number,
  submitted: boolean,
  secondDecision: SecondDecision,
  secondSubmitted: boolean,
): DisputePhase {
  const badge = d.badgeStatus ?? d.status;
  if (badge === "won") return "won";
  if (badge === "lost") return "lost";
  if (badge === "deadline_missed") return "closed";

  if (d.stage === "pre_arbitration") {
    if (secondSubmitted) return "arbitration";
    if (secondDecision === "accepted_liability") return "closed";
    if (secondDecision === "recontesting") return docsLen > 0 ? "prearb_docs_uploaded" : "prearb_uploading";
    return "pre_arbitration";
  }

  if (badge === "under_review") return "under_review";
  if (badge === "evidence_submitted") return "evidence_submitted";
  if (decision === "accepted") return "closed";
  if (submitted) return "evidence_submitted";
  if (decision === "contesting") return docsLen > 0 ? "chargeback_docs_uploaded" : "chargeback_uploading";
  return "chargeback";
}

type PhaseMeta = {
  statusLabel: string;
  stageLabel: string;
  bannerTitle: string;
  bannerBody: string;
  showEvidenceUpload: boolean;
};

function phaseMetaOf(phase: DisputePhase, d: DisputeMockRow): PhaseMeta {
  const chargebackBanner = {
    bannerTitle: "Chargeback",
    bannerBody: "A customer has disputed this payment. Review the dispute and choose whether to accept it or contest it.",
  };
  const preArbBanner = {
    bannerTitle: "Pre-Arbitration",
    bannerBody: "The issuing bank has rejected your initial evidence. You have one final opportunity to submit additional evidence before the dispute proceeds to Arbitration.",
  };
  switch (phase) {
    case "chargeback":
      return { statusLabel: "Needs Response", stageLabel: "Chargeback", ...chargebackBanner, showEvidenceUpload: false };
    case "chargeback_uploading":
    case "chargeback_docs_uploaded":
      return { statusLabel: "Needs Response", stageLabel: "Chargeback", ...chargebackBanner, showEvidenceUpload: true };
    case "evidence_submitted":
      return {
        statusLabel: "Under Review", stageLabel: "Chargeback",
        bannerTitle: "Evidence Submitted",
        bannerBody: "Your supporting evidence has been submitted successfully. PayGlocal is reviewing the documents before forwarding them to the issuing bank.",
        showEvidenceUpload: false,
      };
    case "under_review":
      return {
        statusLabel: "Under Review", stageLabel: "Chargeback",
        bannerTitle: "Under Review",
        bannerBody: "Your evidence has been submitted to the bank. No action is required from you at this time. We'll notify you when the bank responds.",
        showEvidenceUpload: false,
      };
    case "pre_arbitration":
      return { statusLabel: "Needs Response", stageLabel: "Pre-Arbitration", ...preArbBanner, showEvidenceUpload: false };
    case "prearb_uploading":
    case "prearb_docs_uploaded":
      return { statusLabel: "Needs Response", stageLabel: "Pre-Arbitration", ...preArbBanner, showEvidenceUpload: true };
    case "arbitration":
      return {
        statusLabel: "In Arbitration", stageLabel: "Arbitration",
        bannerTitle: "Arbitration",
        bannerBody: "The case has been escalated to Arbitration. The card network will review the evidence and make a final decision. No further submissions may be allowed depending on network rules.",
        showEvidenceUpload: false,
      };
    case "won":
      return {
        statusLabel: "Won", stageLabel: "Closed",
        bannerTitle: "Won",
        bannerBody: "Congratulations. The dispute has been resolved in your favour.",
        showEvidenceUpload: false,
      };
    case "lost":
      return {
        statusLabel: "Lost", stageLabel: "Closed",
        bannerTitle: "Lost",
        bannerBody: "The dispute has been resolved in the customer's favour. The disputed amount will be debited according to settlement rules.",
        showEvidenceUpload: false,
      };
    case "closed":
      return {
        statusLabel: (d.badgeStatus ?? d.status) === "deadline_missed" ? "Deadline Missed" : "Accepted",
        stageLabel: "Closed",
        bannerTitle: "Closed",
        bannerBody: "This dispute has been completed. No further actions are available.",
        showEvidenceUpload: false,
      };
  }
}

/* ── Dispute progress — dynamic lifecycle tracker; optional stages only
   appear for disputes actually on the pre-arbitration/arbitration track ──── */
function progressStepsFor(d: DisputeMockRow, phase: DisputePhase): { label: string; state: "done" | "current" | "future" }[] {
  const onPreArbTrack = d.stage === "pre_arbitration" || phase === "arbitration";
  const steps = ["Chargeback", "Merchant Response", "Evidence Submitted", "PayGlocal Review", "Bank Review"];
  if (onPreArbTrack) steps.push("Pre-Arbitration", "Merchant Response");
  if (phase === "arbitration") steps.push("Arbitration");
  steps.push("Final Decision", "Closed");

  let idx: number;
  switch (phase) {
    case "chargeback": idx = 0; break;
    case "chargeback_uploading":
    case "chargeback_docs_uploaded": idx = 1; break;
    case "evidence_submitted": idx = 3; break;
    case "under_review": idx = 4; break;
    case "pre_arbitration": idx = 5; break;
    case "prearb_uploading":
    case "prearb_docs_uploaded": idx = 6; break;
    case "arbitration": idx = steps.indexOf("Arbitration"); break;
    default: idx = steps.length - 1; // won / lost / closed
  }

  return steps.map((label, i) => ({
    label,
    state: i < idx ? "done" : i === idx ? "current" : "future",
  }));
}

/** Chronological audit log derived purely from existing fields and the derived
 *  phase — no live clock, no new mock data. */
function activityOf(d: DisputeMockRow, phase: DisputePhase): { label: string; at: string; actor: string }[] {
  const events: { label: string; at: string; actor: string }[] = [
    { label: "Dispute created",   at: d.createdAt, actor: "System" },
    { label: "Merchant notified", at: d.createdAt, actor: "System" },
  ];
  const createdMs = new Date(d.createdAt).getTime();
  const dueMs     = new Date(d.dueDate).getTime();
  const mid       = new Date(createdMs + (dueMs - createdMs) / 2).toISOString();

  const respondedPhases: DisputePhase[] = [
    "chargeback_uploading", "chargeback_docs_uploaded", "evidence_submitted", "under_review",
    "pre_arbitration", "prearb_uploading", "prearb_docs_uploaded", "arbitration", "won", "lost",
  ];
  if (respondedPhases.includes(phase)) events.push({ label: "Merchant responded", at: d.createdAt, actor: "Merchant" });

  const evidencePhases: DisputePhase[] = [
    "evidence_submitted", "under_review", "pre_arbitration", "prearb_uploading", "prearb_docs_uploaded", "arbitration", "won", "lost",
  ];
  if (evidencePhases.includes(phase)) {
    events.push({ label: "Evidence uploaded", at: mid, actor: "Merchant" });
    events.push({ label: "PayGlocal review completed", at: mid, actor: "PayGlocal" });
  }

  const bankPhases: DisputePhase[] = ["under_review", "pre_arbitration", "prearb_uploading", "prearb_docs_uploaded", "arbitration", "won", "lost"];
  if (bankPhases.includes(phase)) events.push({ label: "Sent to bank", at: d.dueDate, actor: "PayGlocal" });

  if (d.stage === "pre_arbitration") {
    events.push({ label: "Bank responded", at: d.dueDate, actor: "Bank" });
    events.push({ label: "Pre-arbitration initiated", at: d.dueDate, actor: "Bank" });
  }

  if (phase === "arbitration") {
    events.push({ label: "Additional evidence submitted", at: d.dueDate, actor: "Merchant" });
    events.push({ label: "Arbitration started", at: d.dueDate, actor: "System" });
  }

  if (phase === "won" || phase === "lost") {
    events.push({
      label: phase === "won" ? "Final decision received — resolved in your favour" : "Final decision received — resolved against you",
      at: d.dueDate,
      actor: "Bank",
    });
  }
  return events;
}

/* ── Reason metadata lookup — category / reason code / description ───────── */
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

/* ── Overview time-filter periods (same pattern as MobileTransactions) ───── */
type OverviewPeriod = "1D" | "1W" | "1M" | "3M" | "YTD";

const OVERVIEW_PERIODS: { id: OverviewPeriod; label: string }[] = [
  { id: "1D",  label: "Today"        },
  { id: "1W",  label: "1 Week"       },
  { id: "1M",  label: "1 Month"      },
  { id: "3M",  label: "3 Months"     },
  { id: "YTD", label: "Year to date" },
];

const OVERVIEW_PERIOD_LABELS: Record<OverviewPeriod, string> = {
  "1D":  "Dispute overview",
  "1W":  "Dispute overview",
  "1M":  "Dispute overview",
  "3M":  "Dispute overview",
  "YTD": "Dispute overview",
};

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

/* ── InfoFooter — non-actionable, informational-only footer ──────────────── */
function InfoFooter({ message }: { message: string }) {
  return (
    <div
      className="shrink-0 px-4 py-3.5 border-t border-border/60 bg-white"
      style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom))" }}
    >
      <p className="text-[12.5px] text-muted-foreground leading-snug text-center">{message}</p>
    </div>
  );
}

/* ── SingleCTAFooter — one full-width action (Evidence Submitted / Arbitration) ── */
function SingleCTAFooter({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div
      className="shrink-0 px-4 py-3 border-t border-border/60 bg-white"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-center h-11 rounded-2xl bg-primary text-white text-[13px] font-semibold active:scale-[0.98] transition-all"
      >
        {label}
      </button>
    </div>
  );
}

/* ── Comments (Internal Notes) ────────────────────────────────────────────── */
function CommentsSection() {
  const [text, setText] = useState("");
  return (
    <div className="px-4 pb-4 pt-1 space-y-3">
      <p className="text-[12px] text-muted-foreground leading-snug -mt-1">
        These notes are only visible to your team, never shared with the bank or cardholder.
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
        onClick={() => { toast.success("Note added"); setText(""); }}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-opacity",
          text.trim() ? "bg-primary text-white active:opacity-80" : "bg-muted text-muted-foreground"
        )}
      >
        <Send className="h-3.5 w-3.5" strokeWidth={2} />
        Add note
      </button>
    </div>
  );
}

/* ── Phase stage chip — used by the workspace's sticky header / case summary ── */
const PHASE_STAGE_CHIP_STYLE: Record<string, string> = {
  Chargeback:        "bg-amber-50 text-amber-700",
  "Pre-Arbitration": "bg-orange-50 text-orange-700",
  Arbitration:       "bg-purple-50 text-purple-700",
  Closed:            "bg-muted text-muted-foreground",
};
function PhaseStageChip({ label }: { label: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap",
      PHASE_STAGE_CHIP_STYLE[label] ?? "bg-muted text-muted-foreground"
    )}>
      {label}
    </span>
  );
}

/* ── Contextual Information Banner — explains the current stage in plain language ── */
function ContextualBanner({ phase, title, body }: { phase: DisputePhase; title: string; body: string }) {
  const tone: "success" | "danger" | "warning" | "info" =
    phase === "won" ? "success" :
    phase === "lost" ? "danger" :
    (phase === "pre_arbitration" || phase === "prearb_uploading" || phase === "prearb_docs_uploaded" || phase === "arbitration") ? "warning" :
    "info";
  const card: Record<typeof tone, string> = {
    success: "bg-emerald-50 border-emerald-200",
    danger:  "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    info:    "bg-blue-50 border-blue-200",
  };
  const titleColor: Record<typeof tone, string> = {
    success: "text-emerald-700", danger: "text-red-700", warning: "text-amber-700", info: "text-blue-700",
  };
  const bodyColor: Record<typeof tone, string> = {
    success: "text-emerald-700/90", danger: "text-red-700/90", warning: "text-amber-700/90", info: "text-blue-700/90",
  };
  return (
    <div className={cn("rounded-2xl border px-4 py-3.5", card[tone])}>
      <p className={cn("text-[13px] font-bold mb-1", titleColor[tone])}>{title}</p>
      <p className={cn("text-[12.5px] leading-snug", bodyColor[tone])}>{body}</p>
    </div>
  );
}

/* ── Dispute progress tracker — the guided lifecycle stepper ──────────────── */
function DisputeProgressTracker({
  steps,
  raisedOn,
  closedOn,
}: {
  steps: { label: string; state: "done" | "current" | "future" }[];
  raisedOn: string;
  closedOn?: string;
}) {
  return (
    <div className="relative">
      <div className="absolute left-[11px] top-3 bottom-3 border-l border-dashed border-border" aria-hidden />
      <div className="space-y-5 relative">
        {steps.map((step, i) => {
          const date = i === 0 ? raisedOn : (step.label === "Closed" && step.state === "done" ? closedOn : undefined);
          return (
            <div key={`${step.label}-${i}`} className="flex items-start gap-3">
              <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2",
                step.state === "future" ? "bg-card border-border" : "bg-primary border-primary"
              )}>
                {step.state === "done" && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </div>
              <div className="pt-0.5">
                <p className={cn(
                  "text-[13px] leading-snug",
                  step.state === "current" ? "font-bold text-primary"
                    : step.state === "done" ? "font-semibold text-foreground"
                    : "font-medium text-muted-foreground"
                )}>
                  {step.label}
                </p>
                {date && <p className="text-[11px] text-muted-foreground mt-0.5">{date}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Supporting evidence — required-document tags + upload, embedded section ── */
function SupportingEvidenceSection({
  docs,
  activeTag,
  onTagSelect,
  onUploadClick,
  onRemoveDoc,
}: {
  docs: UploadedDoc[];
  activeTag: string;
  onTagSelect: (tag: string) => void;
  onUploadClick: () => void;
  onRemoveDoc: (docId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[12px] text-muted-foreground leading-snug">
        Submit all relevant documents to help strengthen your case
      </p>

      {/* Document type tags — tap to tag the next upload */}
      <div className="flex flex-wrap gap-2">
        {EVIDENCE_TAGS.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagSelect(tag)}
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
          onClick={onUploadClick}
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
            onClick={onUploadClick}
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
  );
}

/* ── Interstitial confirmation content — brief auto-dismissing screens ────── */
type InterstitialKind = "contesting" | "submitted" | "recontesting" | "second_submitted";

const INTERSTITIAL_CONTENT: Record<InterstitialKind, { title: string; body: string; tone: "amber" | "primary" }> = {
  contesting: {
    title: "Dispute is being contested",
    body: "Supporting documents are required and will need to be uploaded to strengthen your case.",
    tone: "amber",
  },
  submitted: {
    title: "Documents received",
    body: "Your documents are currently under review. We'll notify you with any further updates.",
    tone: "primary",
  },
  recontesting: {
    title: "Case is being re-contested",
    body: "Additional supporting documents are required for this second and final review.",
    tone: "amber",
  },
  second_submitted: {
    title: "Additional evidence received",
    body: "Your additional evidence has been submitted. The case will now proceed to Arbitration if required.",
    tone: "primary",
  },
};

/* ── Dispute Workspace — the ONE unified, state-driven destination ───────── */
function DisputeWorkspace({
  dispute: d,
  decision,
  docs,
  submitted,
  secondDecision,
  secondSubmitted,
  onSetDecision,
  onSetSecondDecision,
  onAddDoc,
  onRemoveDoc,
  onSubmitEvidence,
  onSubmitSecondEvidence,
  onClose,
}: {
  dispute: DisputeMockRow;
  decision: MerchantDecision;
  docs: UploadedDoc[];
  submitted: boolean;
  secondDecision: SecondDecision;
  secondSubmitted: boolean;
  onSetDecision: (decision: MerchantDecision) => void;
  onSetSecondDecision: (decision: SecondDecision) => void;
  onAddDoc: (file: File, tag: string) => void;
  onRemoveDoc: (docId: string) => void;
  onSubmitEvidence: () => void;
  onSubmitSecondEvidence: () => void;
  onClose: () => void;
}) {
  const phase       = computePhase(d, decision, docs.length, submitted, secondDecision, secondSubmitted);
  const meta        = phaseMetaOf(phase, d);
  const reasonMeta  = reasonMetaOf(d);
  const amtColor    = amountColorOf(d);
  const raisedOn    = fmtDateTime12(d.createdAt);
  const closedOn    = (phase === "won" || phase === "lost") ? fmtDateTime12(d.dueDate) : undefined;
  const { date: respondDate, time: respondTime } = fmtRowDate(d.dueDate);
  const showDeadline = meta.statusLabel === "Needs Response";
  const steps         = progressStepsFor(d, phase);
  const events         = activityOf(d, phase);

  const [progressOpen, setProgressOpen] = useState(true);
  const [evidenceOpen, setEvidenceOpen] = useState(true);
  const [txnOpen,      setTxnOpen]      = useState(true);
  const [notesOpen,    setNotesOpen]    = useState(true);
  const [activityOpen, setActivityOpen] = useState(false);
  const [activeTag,    setActiveTag]    = useState<string>(EVIDENCE_TAGS[0]);

  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onAddDoc(file, activeTag);
    e.target.value = "";
  }

  const [interstitial, setInterstitial] = useState<InterstitialKind | null>(null);
  useEffect(() => {
    if (!interstitial) return;
    const t = setTimeout(() => setInterstitial(null), 1700);
    return () => clearTimeout(t);
  }, [interstitial]);

  return (
    <div className="relative flex flex-col h-full bg-[#f6f8fa] overflow-hidden">
      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-8"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 pb-3">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Dispute Workspace</p>
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

        <div className="px-4 pt-1 space-y-3">
        {/* 1. Status header */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <p className={cn("text-[24px] font-bold tabular-nums leading-tight", amtColor)}>
              {fmtAmount(d.amount, d.currency)}
            </p>
            <PhaseStageChip label={meta.stageLabel} />
          </div>
          <p className="text-[12.5px] font-semibold text-muted-foreground mt-1">{meta.statusLabel}</p>
          <div className="flex items-center justify-between gap-3 mt-2.5 pt-2.5 border-t border-border/30">
            <p className="text-[11px] text-muted-foreground shrink-0">Reason</p>
            <p className="text-[12px] font-medium text-foreground text-right">{d.reason}</p>
          </div>
          {showDeadline && (
            <div className="flex items-center justify-between gap-3 mt-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
              <p className="text-[11px] font-semibold text-red-600">Respond by</p>
              <p className="text-[12px] font-semibold text-red-700 whitespace-nowrap">{respondDate} · {respondTime}</p>
            </div>
          )}
        </div>

        {/* 3. Dispute Progress */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={ChevronRight} iconBg="bg-blue-500/10" iconColor="text-blue-600" title="Dispute Progress"
            open={progressOpen} onToggle={() => setProgressOpen(p => !p)}
          />
          {progressOpen && (
            <div className="px-4 pb-4 border-t border-border/20 pt-4">
              <DisputeProgressTracker steps={steps} raisedOn={raisedOn} closedOn={closedOn} />
            </div>
          )}
        </div>

        {/* 4. Contextual Information Banner */}
        <ContextualBanner phase={phase} title={meta.bannerTitle} body={meta.bannerBody} />

        {/* 5. Supporting Evidence — only while evidence can still be submitted */}
        {meta.showEvidenceUpload && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <SectionHeader
              icon={Upload} iconBg="bg-amber-500/10" iconColor="text-amber-600" title="Supporting Evidence"
              rightContent={
                <span className="text-[11px] font-medium text-muted-foreground">
                  {docs.length}/{EVIDENCE_TAGS.length}
                </span>
              }
              open={evidenceOpen} onToggle={() => setEvidenceOpen(p => !p)}
            />
            {evidenceOpen && (
              <div className="px-4 pb-4 border-t border-border/20 pt-3">
                <SupportingEvidenceSection
                  docs={docs}
                  activeTag={activeTag}
                  onTagSelect={setActiveTag}
                  onUploadClick={() => fileRef.current?.click()}
                  onRemoveDoc={onRemoveDoc}
                />
              </div>
            )}
          </div>
        )}

        {/* 6. Transaction Details */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={FileText} iconBg="bg-muted" iconColor="text-muted-foreground" title="Transaction Details"
            open={txnOpen} onToggle={() => setTxnOpen(p => !p)}
          />
          {txnOpen && (
            <>
              <PairedRow
                left={{ label: "Payment ID", value: <CopyableValue value={d.paymentId} display={truncateId(d.paymentId)} /> }}
                right={{ label: "Transaction ID", value: <CopyableValue value={d.transactionId} display={truncateId(d.transactionId)} /> }}
              />
              <PairedRow
                left={{ label: "Merchant ID", value: MERCHANT_MID }}
                right={{ label: "ARN", value: <CopyableValue value={d.arn} display={d.arn} /> }}
              />
              <PairedRow
                left={{ label: "Currency", value: d.currency }}
                right={{ label: "Card", value: cardSource(d) }}
              />
              <PairedRow
                last
                left={{ label: "Network", value: networkLabelOf(d) }}
                right={{ label: "Reason code", value: reasonMeta.reasonCode }}
              />
              <div className="px-4 py-3.5 border-t border-border/50">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">Transaction Date</p>
                <p className="text-[13px] font-medium text-foreground leading-snug">{fmtDateTime12(d.paymentDate)}</p>
              </div>
            </>
          )}
        </div>

        {/* 7. Internal Notes */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={FileText} iconBg="bg-muted" iconColor="text-muted-foreground" title="Internal Notes"
            open={notesOpen} onToggle={() => setNotesOpen(p => !p)}
          />
          {notesOpen && <CommentsSection />}
        </div>

        {/* 8. Activity History */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={History} iconBg="bg-muted" iconColor="text-muted-foreground" title="Activity History"
            open={activityOpen} onToggle={() => setActivityOpen(p => !p)}
          />
          {activityOpen && (
            <div className="px-4 pb-4 border-t border-border/20 pt-4">
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
                        <p className="text-[11px] text-muted-foreground mt-0.5">{fmtDateTime12(ev.at)} · {ev.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* 9. Contextual bottom CTA */}
      {phase === "chargeback" && (
        <StickyFooter
          secondaryLabel="Accept Dispute"
          onSecondary={() => { onSetDecision("accepted"); toast.success("Dispute accepted"); }}
          primaryLabel="Contest Dispute"
          onPrimary={() => { onSetDecision("contesting"); setInterstitial("contesting"); }}
        />
      )}
      {(phase === "chargeback_uploading" || phase === "chargeback_docs_uploaded") && (
        <StickyFooter
          secondaryLabel="Save Draft"
          onSecondary={() => toast.success("Draft saved")}
          primaryLabel="Submit details"
          primaryIcon={Send}
          primaryDisabled={docs.length === 0}
          onPrimary={() => { onSubmitEvidence(); setInterstitial("submitted"); }}
        />
      )}
      {phase === "evidence_submitted" && (
        <SingleCTAFooter label="Close" onClick={onClose} />
      )}
      {phase === "under_review" && (
        <InfoFooter message="Your evidence has been submitted. We'll notify you once the bank responds." />
      )}
      {phase === "pre_arbitration" && (
        <StickyFooter
          secondaryLabel="Accept Liability"
          onSecondary={() => { onSetSecondDecision("accepted_liability"); toast.success("Liability accepted"); }}
          primaryLabel="Re-Contest Case"
          onPrimary={() => { onSetSecondDecision("recontesting"); setInterstitial("recontesting"); }}
        />
      )}
      {(phase === "prearb_uploading" || phase === "prearb_docs_uploaded") && (
        <StickyFooter
          secondaryLabel="Save Draft"
          onSecondary={() => toast.success("Draft saved")}
          primaryLabel="Submit details"
          primaryIcon={Send}
          primaryDisabled={docs.length === 0}
          onPrimary={() => { onSubmitSecondEvidence(); setInterstitial("second_submitted"); }}
        />
      )}
      {phase === "arbitration" && (
        <SingleCTAFooter label="Close" onClick={onClose} />
      )}
      {(phase === "won" || phase === "lost" || phase === "closed") && (
        <StickyFooter
          secondaryLabel="Close"
          onSecondary={onClose}
          primaryLabel="Download Report"
          primaryIcon={Download}
          onPrimary={() => toast.success("Downloading report...")}
        />
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Brief auto-dismissing confirmation shown after Contest / Submit / Re-Contest */}
      {interstitial && (
        <div className="absolute inset-0 z-20 bg-[#f6f8fa] flex flex-col items-center justify-center px-10 text-center">
          <div className={cn(
            "h-14 w-14 rounded-full flex items-center justify-center mb-4",
            INTERSTITIAL_CONTENT[interstitial].tone === "amber" ? "bg-amber-500/10" : "bg-primary/10"
          )}>
            {INTERSTITIAL_CONTENT[interstitial].tone === "amber"
              ? <Upload className="h-7 w-7 text-amber-600" strokeWidth={2} />
              : <Check className="h-7 w-7 text-primary" strokeWidth={2.5} />}
          </div>
          <p className="text-[16px] font-bold text-foreground mb-1.5">{INTERSTITIAL_CONTENT[interstitial].title}</p>
          <p className="text-[13px] text-muted-foreground leading-snug">{INTERSTITIAL_CONTENT[interstitial].body}</p>
        </div>
      )}
    </div>
  );
}

/* ── Timeline overlay — standalone, quick-access read-only history ────────── */
function TimelineOverlay({
  dispute: d,
  decision,
  docs,
  submitted,
  secondDecision,
  secondSubmitted,
  onClose,
}: {
  dispute: DisputeMockRow;
  decision: MerchantDecision;
  docs: UploadedDoc[];
  submitted: boolean;
  secondDecision: SecondDecision;
  secondSubmitted: boolean;
  onClose: () => void;
}) {
  const phase = computePhase(d, decision, docs.length, submitted, secondDecision, secondSubmitted);
  const events = activityOf(d, phase);
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
                    <p className="text-[11px] text-muted-foreground mt-0.5">{fmtDateTime12(ev.at)} · {ev.actor}</p>
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

/* ── Swipe-to-reveal row — View details (workspace) / Timeline ───────────── */
const DISPUTE_SWIPE_WIDTH = 168; // 2 actions × 84px each

function DisputeSwipeRow({
  isOpen,
  onOpen,
  onClose,
  onTap,
  onOpenWorkspace,
  onOpenTimeline,
  children,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onTap: () => void;
  onOpenWorkspace: () => void;
  onOpenTimeline: () => void;
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
      {/* Action buttons — fixed behind the card */}
      <div className="absolute right-0 top-0 bottom-0 flex" style={{ width: DISPUTE_SWIPE_WIDTH }}>
        <button type="button" onClick={onOpenWorkspace}
          className="flex flex-col items-center justify-center flex-1 bg-primary"
        >
          <ChevronRight className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          <span className="text-[11px] font-medium text-white mt-1">View details</span>
        </button>
        <button type="button" onClick={onOpenTimeline}
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
  const stage      = workflowStageOf(d);
  const amtColor   = amountColorOf(d);
  const { date, time } = fmtRowDate(d.createdAt);

  return (
    <div className="px-4 py-3.5 flex items-start justify-between gap-3">
      {/* Left — amount (primary), card, reason */}
      <div className="min-w-0 flex-1">
        <p className={cn("text-[19px] font-bold tabular-nums leading-tight", amtColor)}>
          {fmtAmount(d.amount, d.currency)}
        </p>
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
        <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug line-clamp-2">
          {d.reason}
        </p>
      </div>

      {/* Right — stage chip, raised-on date/time */}
      <div className="shrink-0 flex flex-col items-end gap-1.5 pl-1">
        <StageChip stage={stage} />
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground leading-snug">{date}</p>
          <p className="text-[11px] text-muted-foreground leading-snug">{time}</p>
        </div>
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
  const [overviewPeriod,  setOverviewPeriod]  = useState<OverviewPeriod>("1D");
  const [overviewDropdownOpen, setOverviewDropdownOpen] = useState(false);

  const [workspaceFor,        setWorkspaceFor]        = useState<DisputeMockRow | null>(null);
  const [timelineFor,         setTimelineFor]         = useState<DisputeMockRow | null>(null);
  const [uploadedDocs,        setUploadedDocs]        = useState<Record<string, UploadedDoc[]>>({});
  const [merchantDecisions,   setMerchantDecisions]   = useState<Record<string, MerchantDecision>>({});
  const [submittedForReview,  setSubmittedForReview]  = useState<Record<string, boolean>>({});
  const [secondDecisions,     setSecondDecisions]     = useState<Record<string, SecondDecision>>({});
  const [secondSubmittedMap,  setSecondSubmittedMap]  = useState<Record<string, boolean>>({});

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

  function openWorkspace(d: DisputeMockRow) {
    setSwipedId(null);
    setTimelineFor(null);
    setWorkspaceFor(d);
  }
  function openTimeline(d: DisputeMockRow) {
    setSwipedId(null);
    setWorkspaceFor(null);
    setTimelineFor(d);
  }

  function addDoc(disputeId: string, file: File, tag: string) {
    const doc: UploadedDoc = { id: `${file.name}-${file.size}-${Date.now()}`, name: file.name, tag };
    setUploadedDocs(prev => ({ ...prev, [disputeId]: [...(prev[disputeId] ?? []), doc] }));
  }
  function removeDoc(disputeId: string, docId: string) {
    setUploadedDocs(prev => ({ ...prev, [disputeId]: (prev[disputeId] ?? []).filter(d => d.id !== docId) }));
  }
  function setDecision(disputeId: string, decision: MerchantDecision) {
    setMerchantDecisions(prev => ({ ...prev, [disputeId]: decision }));
  }
  function submitEvidence(disputeId: string) {
    setSubmittedForReview(prev => ({ ...prev, [disputeId]: true }));
  }
  function setSecondDecision(disputeId: string, decision: SecondDecision) {
    setSecondDecisions(prev => ({ ...prev, [disputeId]: decision }));
  }
  function submitSecondEvidence(disputeId: string) {
    setSecondSubmittedMap(prev => ({ ...prev, [disputeId]: true }));
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
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <p className="text-[14px] font-bold text-foreground leading-none">
                  {OVERVIEW_PERIOD_LABELS[overviewPeriod]}
                </p>
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setOverviewDropdownOpen(prev => !prev)}
                    className="flex items-center gap-1.5 px-3 h-[34px] rounded-xl border border-border bg-white text-[12.5px] font-medium text-foreground active:bg-muted/40 transition-colors"
                  >
                    {OVERVIEW_PERIODS.find(p => p.id === overviewPeriod)?.label}
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-150", overviewDropdownOpen && "rotate-180")}
                      strokeWidth={2}
                    />
                  </button>
                  {overviewDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-[19]" onClick={() => setOverviewDropdownOpen(false)} />
                      <div
                        className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl border border-border overflow-hidden min-w-[130px] z-[20]"
                        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
                      >
                        {OVERVIEW_PERIODS.map(p => {
                          const active = p.id === overviewPeriod;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => { setOverviewPeriod(p.id); setOverviewDropdownOpen(false); }}
                              className={cn(
                                "w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors",
                                active ? "bg-muted/40" : "active:bg-muted/30"
                              )}
                            >
                              <span className={cn("text-[13px]", active ? "font-semibold text-foreground" : "text-muted-foreground")}>
                                {p.label}
                              </span>
                              {active && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-3" strokeWidth={2.5} />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-[108px] h-[108px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
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

              {/* Dispute rows — triage view, swipe (or tap) opens the unified Dispute Workspace */}
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
                    onTap={() => openWorkspace(d)}
                    onOpenWorkspace={() => openWorkspace(d)}
                    onOpenTimeline={() => openTimeline(d)}
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

          {/* ── Dispute Workspace overlay — the one unified destination ── */}
          <AnimatePresence>
            {workspaceFor && (
              <>
                <motion.div
                  key="ws-backdrop"
                  className="absolute inset-0 z-[5]"
                  style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setWorkspaceFor(null)}
                />
                <motion.div
                  key={`${workspaceFor.id}-ws`}
                  className="absolute inset-x-0 bottom-0 z-[6] flex flex-col overflow-hidden bg-[#f6f8fa]"
                  style={{ height: "94%", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                >
                  <DisputeWorkspace
                    dispute={workspaceFor}
                    decision={merchantDecisions[workspaceFor.id] ?? "undecided"}
                    docs={uploadedDocs[workspaceFor.id] ?? []}
                    submitted={submittedForReview[workspaceFor.id] ?? false}
                    secondDecision={secondDecisions[workspaceFor.id] ?? "undecided"}
                    secondSubmitted={secondSubmittedMap[workspaceFor.id] ?? false}
                    onSetDecision={(decision) => setDecision(workspaceFor.id, decision)}
                    onSetSecondDecision={(decision) => setSecondDecision(workspaceFor.id, decision)}
                    onAddDoc={(file, tag) => addDoc(workspaceFor.id, file, tag)}
                    onRemoveDoc={(docId) => removeDoc(workspaceFor.id, docId)}
                    onSubmitEvidence={() => submitEvidence(workspaceFor.id)}
                    onSubmitSecondEvidence={() => submitSecondEvidence(workspaceFor.id)}
                    onClose={() => setWorkspaceFor(null)}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Timeline overlay — standalone quick-access history ── */}
          <AnimatePresence>
            {timelineFor && (
              <>
                <motion.div
                  key="tl-backdrop"
                  className="absolute inset-0 z-[5]"
                  style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setTimelineFor(null)}
                />
                <motion.div
                  key={`${timelineFor.id}-tl`}
                  className="absolute inset-x-0 bottom-0 z-[6] flex flex-col overflow-hidden bg-[#f6f8fa]"
                  style={{ height: "94%", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                >
                  <TimelineOverlay
                    dispute={timelineFor}
                    decision={merchantDecisions[timelineFor.id] ?? "undecided"}
                    docs={uploadedDocs[timelineFor.id] ?? []}
                    submitted={submittedForReview[timelineFor.id] ?? false}
                    secondDecision={secondDecisions[timelineFor.id] ?? "undecided"}
                    secondSubmitted={secondSubmittedMap[timelineFor.id] ?? false}
                    onClose={() => setTimelineFor(null)}
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
