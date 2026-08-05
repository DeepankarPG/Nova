"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis } from "recharts";
import {
  ArrowLeft, Check, ChevronDown, ChevronRight, ChevronUp, ChevronsUp, Copy, Download,
  FileText, History, Info, Plus, Scissors, Search, Send, ShieldCheck,
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

/* ── Merchant status — the list row's right-column chip; communicates what the
   merchant needs to do (or the current state), separate from the dispute stage
   shown inline in the left column. ────────────────────────────────────────── */
type MerchantStatus = "Action Required" | "Upload Documents" | "Needs Response" | "Under Review" | "Won" | "Lost" | "Closed";

/** Maps the single derived lifecycle phase (see computePhase) to the merchant
 *  status vocabulary — the ONE source of truth shared by the list row's chip
 *  and the workspace's own section rendering, so the two can never disagree. */
function merchantStatusOfPhase(phase: DisputePhase): MerchantStatus {
  switch (phase) {
    case "chargeback": return "Action Required";
    case "chargeback_uploading":
    case "chargeback_docs_uploaded": return "Upload Documents";
    case "evidence_submitted":
    case "under_review": return "Under Review";
    case "pre_arbitration": return "Needs Response";
    case "prearb_uploading":
    case "prearb_docs_uploaded": return "Upload Documents";
    case "arbitration": return "Under Review";
    case "won": return "Won";
    case "lost": return "Lost";
    case "closed": return "Closed";
  }
}

function merchantStatusOf(
  d: DisputeMockRow,
  decision: MerchantDecision,
  docsLen: number,
  submitted: boolean,
  secondDecision: SecondDecision,
  secondSubmitted: boolean,
): MerchantStatus {
  return merchantStatusOfPhase(computePhase(d, decision, docsLen, submitted, secondDecision, secondSubmitted));
}

const MERCHANT_STATUS_STYLE: Record<MerchantStatus, string> = {
  "Action Required": "bg-orange-50 text-orange-700",
  "Upload Documents": "bg-blue-50 text-blue-700",
  "Needs Response":   "bg-amber-50 text-amber-700",
  "Under Review":     "bg-slate-100 text-slate-600",
  Won:                "bg-emerald-50 text-emerald-700",
  Lost:               "bg-red-50 text-red-700",
  Closed:             "bg-muted text-muted-foreground",
};
function MerchantStatusChip({ status }: { status: MerchantStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap",
      MERCHANT_STATUS_STYLE[status]
    )}>
      {status}
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
    bannerBody: "The issuing bank has rejected your previous evidence. You have one final opportunity to either accept liability or re-contest this dispute.",
  };
  switch (phase) {
    case "chargeback":
      return { statusLabel: "Action Required", stageLabel: "Chargeback", ...chargebackBanner, showEvidenceUpload: false };
    case "chargeback_uploading":
    case "chargeback_docs_uploaded":
      return { statusLabel: "Upload Documents", stageLabel: "Chargeback", ...chargebackBanner, showEvidenceUpload: true };
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
      return { statusLabel: "Upload Documents", stageLabel: "Pre-Arbitration", ...preArbBanner, showEvidenceUpload: true };
    case "arbitration":
      return {
        statusLabel: "Under Review", stageLabel: "Arbitration",
        bannerTitle: "Arbitration",
        bannerBody: "The case has been escalated to Arbitration. The card network will review the evidence and make a final decision. No further submissions may be allowed depending on network rules.",
        showEvidenceUpload: false,
      };
    case "won":
      return {
        statusLabel: "Won", stageLabel: "Closed",
        bannerTitle: "Won",
        bannerBody: "You've won this dispute. The disputed amount has been returned to your account.",
        showEvidenceUpload: false,
      };
    case "lost":
      return {
        statusLabel: "Lost", stageLabel: "Closed",
        bannerTitle: "Lost",
        bannerBody: "You lost this dispute. The disputed amount has been returned to the customer and settled from your account.",
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
const PROGRESS_STEP_DESCRIPTIONS: Record<string, string> = {
  "Merchant Response": "Upload supporting documents before the response deadline.",
  "Evidence Submitted": "Your supporting evidence has been received and queued for review.",
  "PayGlocal Review": "PayGlocal will review your evidence and prepare a representation for submission to the issuing bank.",
  "Bank Review": "The issuing bank may take up to approximately 60 business days to review the submitted evidence and issue a decision.",
  "Pre-Arbitration": "The issuing bank rejected the initial evidence. Review the case and choose whether to accept liability or re-contest.",
  "Arbitration": "The card network will independently review the case and issue a final, binding decision.",
  "Final Decision": "If the decision is in your favour, the dispute will close successfully. Otherwise, depending on the card network's process, the case may proceed to Pre-Arbitration.",
};

function progressStepsFor(
  d: DisputeMockRow,
  phase: DisputePhase
): { label: string; state: "done" | "current" | "future"; description?: string }[] {
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

  return steps.map((label, i) => {
    const state = i < idx ? "done" : i === idx ? "current" : "future";
    return {
      label,
      state,
      description: state === "done" ? undefined : PROGRESS_STEP_DESCRIPTIONS[label],
    };
  });
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

type UploadedDoc = { id: string; name: string; tag: string; size: number };

function fmtFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

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

/* ── Dispute insight carousel — recovered-amount trend + reason breakdown ──
   Headline figures are derived from the real dispute rows (won-status sum,
   reason counts); the trend line is illustrative month-over-month shape
   scaled to end at the real recovered total, matching how other stat cards
   in this app already use static comparison deltas. ─────────────────────── */
function fmtCompactINR(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(abs / 1e7 >= 10 ? 0 : 1)}Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(abs / 1e5 >= 10 ? 0 : 1)}L`;
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(abs / 1e3 >= 10 ? 0 : 1)}K`;
  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}

type RecoveryTrendPoint = { label: string; amount: number };

const RECOVERY_TREND_SHAPE: { label: string; weight: number }[] = [
  { label: "Jan", weight: 0.52 },
  { label: "Feb", weight: 0.68 },
  { label: "Mar", weight: 0.84 },
  { label: "Apr", weight: 1.00 },
];

function recoveryTrendOf(recoveredTotal: number): RecoveryTrendPoint[] {
  return RECOVERY_TREND_SHAPE.map(({ label, weight }) => ({
    label,
    amount: Math.round(recoveredTotal * weight),
  }));
}

type ReasonBreakdownEntry = { reason: string; count: number; percent: number };

function reasonBreakdownOf(rows: DisputeMockRow[]): ReasonBreakdownEntry[] {
  const total = rows.length;
  const counts = new Map<string, number>();
  rows.forEach(d => counts.set(d.reason, (counts.get(d.reason) ?? 0) + 1));
  return Array.from(counts.entries())
    .map(([reason, count]) => ({ reason, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

/* ── Card 1 — Amount Recovered / recovery trend ────────────────────────── */
function RecoveryInsightCard({
  recoveredTotal,
  trend,
}: {
  recoveredTotal: number;
  trend: RecoveryTrendPoint[];
}) {
  const hasRecovered = recoveredTotal > 0;
  const last = trend[trend.length - 1]?.amount ?? 0;
  const prev = trend[trend.length - 2]?.amount ?? 0;
  const deltaPct = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
  const isUp = deltaPct >= 0;

  return (
    <div
      className="shrink-0 snap-start rounded-2xl border border-border bg-card shadow-sm p-4"
      style={{ width: "75%" }}
    >
      <p className="text-[13px] font-bold text-foreground">Amount Recovered</p>

      {hasRecovered ? (
        <>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-[26px] font-bold text-emerald-600 tabular-nums leading-none">
              {fmtCompactINR(recoveredTotal)}
            </p>
            <span className="text-[12px] font-medium text-muted-foreground">Recovered</span>
          </div>

          <div className="mt-3 h-[68px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 6, bottom: 0, left: 6 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={2.25}
                  dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-1.5 flex items-center gap-1">
            <span className={cn("text-[12px] font-bold", isUp ? "text-emerald-600" : "text-red-600")}>
              {isUp ? "↑" : "↓"} {Math.abs(deltaPct)}%
            </span>
            <span className="text-[11px] text-muted-foreground">vs previous month</span>
          </div>
        </>
      ) : (
        <div className="mt-4 py-5 text-center">
          <p className="text-[13px] font-semibold text-foreground">No recovered disputes yet</p>
          <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">
            Successful dispute resolutions will appear here
          </p>
        </div>
      )}

      <TrustFooter recoveredTotal={recoveredTotal} />
    </div>
  );
}

/* ── Shared trust-building footer — identical message across insight cards ── */
function TrustFooter({ recoveredTotal }: { recoveredTotal: number }) {
  const hasRecovered = recoveredTotal > 0;
  return (
    <div className="mt-4 pt-3 border-t border-border/50">
      <p className="text-[11.5px] text-muted-foreground leading-snug">
        {hasRecovered ? (
          <>
            <span className="text-primary font-semibold">PayGlocal</span>
            {` helped recover ${fmtCompactINR(recoveredTotal)} in disputed payments this month`}
          </>
        ) : (
          <>
            <span className="text-primary font-semibold">PayGlocal</span>
            {" helps you recover disputed payments through guided evidence submission"}
          </>
        )}
      </p>
    </div>
  );
}

/* ── Card 2 — Dispute reason breakdown ─────────────────────────────────── */
function ReasonBreakdownCard({ breakdown, recoveredTotal }: { breakdown: ReasonBreakdownEntry[]; recoveredTotal: number }) {
  const hasData = breakdown.length > 0;

  return (
    <div
      className="shrink-0 snap-start rounded-2xl border border-border bg-card shadow-sm p-4"
      style={{ width: "75%" }}
    >
      <p className="text-[13px] font-bold text-foreground">Dispute reasons</p>

      {hasData ? (
        <div className="mt-3 space-y-3">
          {breakdown.map(entry => (
            <div key={entry.reason}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-[12px] font-medium text-foreground truncate">{entry.reason}</p>
                <p className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                  {entry.count} dispute{entry.count !== 1 ? "s" : ""} · {entry.percent}%
                </p>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${entry.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 py-5 text-center">
          <p className="text-[13px] font-semibold text-foreground">No dispute patterns available yet</p>
        </div>
      )}

      <TrustFooter recoveredTotal={recoveredTotal} />
    </div>
  );
}

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
  title,
  rightContent,
  open,
  onToggle,
}: {
  title: string;
  rightContent?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
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

/* ── Selectable action card — plain tap-to-choose row used for nested sub-options ── */
function SelectableActionCard({
  label,
  description,
  onClick,
}: {
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl border border-border p-3.5 text-left active:bg-muted/20 transition-colors"
    >
      <div className="h-5 w-5 rounded-full border-2 border-border shrink-0" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-foreground">{label}</p>
        <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" strokeWidth={2} />
    </button>
  );
}

/* ── Confirm step — lightweight in-place confirmation before executing a decision ── */
function ConfirmStep({
  body,
  onBack,
  onConfirm,
  confirmDisabled,
}: {
  body: string;
  onBack: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
}) {
  return (
    <div>
      <p className="text-[12.5px] text-foreground leading-snug mb-4">{body}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-11 px-5 rounded-xl border border-border text-[13.5px] font-semibold text-foreground active:bg-muted/20 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirmDisabled}
          className={cn(
            "flex-1 h-11 rounded-xl text-[13.5px] font-semibold transition-opacity",
            confirmDisabled ? "bg-muted text-muted-foreground" : "bg-primary text-white active:opacity-90"
          )}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

/* ── Expandable action card — accordion row: tapping it reveals its own
   confirmation or sub-options in place, while the other option stays visible
   below (collapsed) so the merchant can still switch their mind. ────────── */
function ExpandableActionCard({
  label,
  description,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  description: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border overflow-hidden transition-colors", expanded ? "border-primary" : "border-border")}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3.5 text-left active:bg-muted/20 transition-colors"
      >
        <div className={cn(
          "h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center",
          expanded ? "border-primary" : "border-border"
        )}>
          {expanded && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold text-foreground">{label}</p>
          <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground/50 shrink-0 transition-transform", expanded && "rotate-180")}
          strokeWidth={2}
        />
      </button>
      {expanded && (
        <div className="px-3.5 pb-3.5 pt-3 border-t border-border/60">
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Take Action — the single dynamic section driving the merchant's decision
   flow. Header renames to "Under Review" once evidence is submitted; content
   evolves through select → confirm → recorded/informational, all inline,
   never navigating away or opening another overlay. ─────────────────────── */
type ExpandedCard = "accept" | "contest" | "acceptLiability" | "recontest";
type AcceptStep = "choose" | "full" | "partial";

const DECISION_PHASES: DisputePhase[] = ["chargeback", "pre_arbitration"];
const UPLOADING_PHASES: DisputePhase[] = [
  "chargeback_uploading", "chargeback_docs_uploaded",
  "prearb_uploading", "prearb_docs_uploaded",
];
const WAITING_PHASES: DisputePhase[] = ["evidence_submitted", "under_review", "arbitration"];

function TakeActionSection({
  phase,
  meta,
  currency,
  respondDate,
  respondTime,
  onSetDecision,
  onSetSecondDecision,
  onContestConfirmed,
  onRecontestConfirmed,
}: {
  phase: DisputePhase;
  meta: PhaseMeta;
  currency: string;
  respondDate: string;
  respondTime: string;
  onSetDecision: (decision: MerchantDecision) => void;
  onSetSecondDecision: (decision: SecondDecision) => void;
  onContestConfirmed: () => void;
  onRecontestConfirmed: () => void;
}) {
  const [expanded, setExpanded] = useState<ExpandedCard | null>(null);
  const [acceptStep, setAcceptStep] = useState<AcceptStep>("choose");
  const [acceptPartialAmount, setAcceptPartialAmount] = useState("");

  function toggle(card: ExpandedCard) {
    setExpanded(prev => (prev === card ? null : card));
    setAcceptStep("choose");
    setAcceptPartialAmount("");
  }

  const canConfirmAcceptPartial = !!acceptPartialAmount && Number(acceptPartialAmount) > 0;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <p className="flex-1 text-[15px] font-bold text-foreground">Take Action</p>
      </div>

      <div className="border-t border-border/20 px-4 pb-4 pt-3.5">
        {phase === "chargeback" && (
          <>
            <p className="text-[12.5px] text-muted-foreground leading-snug mb-3.5">
              A customer has disputed this payment. Review the dispute and choose whether you want to accept or contest the dispute.
            </p>
            <div className="space-y-2.5">
              <ExpandableActionCard
                label="Accept Dispute"
                description="The dispute will be closed and the amount returned to the customer"
                expanded={expanded === "accept"}
                onToggle={() => toggle("accept")}
              >
                {acceptStep === "choose" && (
                  <div className="space-y-2.5">
                    <SelectableActionCard
                      label="Accept Full"
                      description="The full amount will be returned to the customer and the case will be closed"
                      onClick={() => setAcceptStep("full")}
                    />
                    <SelectableActionCard
                      label="Accept Partial"
                      description="Return part of the amount and keep the case open for the remaining balance"
                      onClick={() => setAcceptStep("partial")}
                    />
                  </div>
                )}

                {acceptStep === "full" && (
                  <div>
                    <p className="text-[12.5px] text-foreground leading-snug mb-4">
                      You are accepting this dispute. The full amount will be returned to the customer and the case will be closed.
                    </p>
                    <button
                      type="button"
                      onClick={() => { onSetDecision("accepted"); toast.success("Dispute accepted"); }}
                      className="w-full h-11 rounded-xl bg-primary text-white text-[13.5px] font-semibold active:opacity-90 transition-opacity"
                    >
                      Confirm
                    </button>
                  </div>
                )}

                {acceptStep === "partial" && (
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Amount</label>
                    <div className="relative mb-3">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-medium text-muted-foreground">
                        {CURRENCY_SYM[currency] ?? currency}
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={acceptPartialAmount}
                        onChange={e => setAcceptPartialAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-11 rounded-xl border border-border pl-8 pr-3.5 text-[14px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <p className="text-[11.5px] text-muted-foreground leading-snug mb-4">
                      The accepted amount will be returned to the customer. The case will be closed for this portion of the dispute.
                    </p>
                    <button
                      type="button"
                      disabled={!canConfirmAcceptPartial}
                      onClick={() => { onSetDecision("accepted"); toast.success("Partial acceptance recorded"); }}
                      className={cn(
                        "w-full h-11 rounded-xl text-[13.5px] font-semibold transition-opacity",
                        canConfirmAcceptPartial ? "bg-primary text-white active:opacity-90" : "bg-muted text-muted-foreground"
                      )}
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </ExpandableActionCard>

              <ExpandableActionCard
                label="Contest Dispute"
                description="Submit supporting evidence to contest this dispute"
                expanded={expanded === "contest"}
                onToggle={() => toggle("contest")}
              >
                <div>
                  <p className="text-[12.5px] text-foreground leading-snug mb-4">
                    {`You are about to contest this dispute. Supporting evidence must be submitted before ${respondDate} · ${respondTime}.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => { onSetDecision("contesting"); onContestConfirmed(); }}
                    className="w-full h-11 rounded-xl bg-primary text-white text-[13.5px] font-semibold active:opacity-90 transition-opacity"
                  >
                    Confirm
                  </button>
                </div>
              </ExpandableActionCard>
            </div>
          </>
        )}

        {phase === "pre_arbitration" && (
          <>
            <p className="text-[12.5px] text-muted-foreground leading-snug mb-3.5">{meta.bannerBody}</p>
            <div className="space-y-2.5">
              <ExpandableActionCard
                label="Accept Liability"
                description="The case will be closed and the amount settled against you"
                expanded={expanded === "acceptLiability"}
                onToggle={() => toggle("acceptLiability")}
              >
                <ConfirmStep
                  body="You are accepting liability for this dispute. The case will be closed and the amount will be settled against you."
                  onBack={() => setExpanded(null)}
                  onConfirm={() => { onSetSecondDecision("accepted_liability"); toast.success("Liability accepted"); }}
                />
              </ExpandableActionCard>

              <ExpandableActionCard
                label="Re-Contest Case"
                description="Submit additional evidence for one final review"
                expanded={expanded === "recontest"}
                onToggle={() => toggle("recontest")}
              >
                <ConfirmStep
                  body={`You are about to re-contest this case. Additional evidence must be submitted before ${respondDate} · ${respondTime}.`}
                  onBack={() => setExpanded(null)}
                  onConfirm={() => { onSetSecondDecision("recontesting"); onRecontestConfirmed(); }}
                />
              </ExpandableActionCard>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

/* ── Submit Supporting Evidence — the only section shown while the merchant's
   sole remaining task is uploading documents (post-decision, pre-review). ── */
function SubmitEvidenceSection({
  phase,
  docs,
  activeTag,
  onTagSelect,
  onUploadClick,
  onRemoveDoc,
}: {
  phase: DisputePhase;
  docs: UploadedDoc[];
  activeTag: string;
  onTagSelect: (tag: string) => void;
  onUploadClick: () => void;
  onRemoveDoc: (docId: string) => void;
}) {
  const body = (phase === "prearb_uploading" || phase === "prearb_docs_uploaded")
    ? "The bank rejected your previous evidence. Upload additional supporting documents before the deadline."
    : "You've chosen to contest this dispute. Upload the required supporting documents before the response deadline.";

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <p className="flex-1 text-[15px] font-bold text-foreground">Submit Supporting Evidence</p>
      </div>
      <div className="border-t border-border/20 px-4 pb-4 pt-3.5">
        <p className="text-[12.5px] text-muted-foreground leading-snug mb-3.5">{body}</p>
        <SupportingEvidenceSection
          docs={docs}
          activeTag={activeTag}
          onTagSelect={onTagSelect}
          onUploadClick={onUploadClick}
          onRemoveDoc={onRemoveDoc}
        />
      </div>
    </div>
  );
}

/* ── Under Review — informational-only card shown once every required
   action is complete and the case is waiting on external review. ────────── */
function UnderReviewSection({
  phase,
  meta,
  docs,
  open,
  onToggle,
}: {
  phase: DisputePhase;
  meta: PhaseMeta;
  docs: UploadedDoc[];
  open: boolean;
  onToggle: () => void;
}) {
  const body =
    phase === "evidence_submitted"
      ? "Your dispute evidence has been submitted successfully. PayGlocal is reviewing the submitted documents before forwarding them to the issuing bank."
      : phase === "under_review"
      ? "We're reviewing your dispute evidence. No further action is required from you right now."
      : meta.bannerBody;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <SectionHeader title="Under Review" open={open} onToggle={onToggle} />
      {open && (
        <div className="border-t border-border/20 px-4 pb-4 pt-3.5">
          <p className="text-[12.5px] text-muted-foreground leading-snug mb-4">{body}</p>

          {docs.length > 0 && (
            <div className="rounded-xl bg-muted/50 p-3.5">
              <p className="text-[12.5px] font-semibold text-foreground mb-2.5">Submitted Documents</p>
              <div className="space-y-2">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 rounded-lg bg-card border border-border/50 px-3 py-2.5">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-foreground truncate">{doc.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{fmtFileSize(doc.size)}</p>
                      <span className="inline-block mt-1 text-[10.5px] font-medium text-muted-foreground border border-border rounded-md px-1.5 py-[1px]">
                        {doc.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Dispute Outcome — replaces Under Review once a final decision is in.
   Won keeps the submitted documents visible for reference; Lost points the
   merchant to support instead, per the resolved-in-customer's-favour flow. ── */
function DisputeOutcomeSection({
  phase,
  meta,
  docs,
  open,
  onToggle,
}: {
  phase: "won" | "lost";
  meta: PhaseMeta;
  docs: UploadedDoc[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <SectionHeader title={phase === "won" ? "Won" : "Lost"} open={open} onToggle={onToggle} />
      {open && (
        <div className="border-t border-border/20 px-4 pb-4 pt-3.5">
          <p className="text-[12.5px] text-muted-foreground leading-snug mb-4">{meta.bannerBody}</p>

          {phase === "won" && docs.length > 0 && (
            <div className="rounded-xl bg-muted/50 p-3.5">
              <p className="text-[12.5px] font-semibold text-foreground mb-2.5">Submitted Documents</p>
              <div className="space-y-2">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 rounded-lg bg-card border border-border/50 px-3 py-2.5">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-foreground truncate">{doc.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{fmtFileSize(doc.size)}</p>
                      <span className="inline-block mt-1 text-[10.5px] font-medium text-muted-foreground border border-border rounded-md px-1.5 py-[1px]">
                        {doc.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === "lost" && (
            <div className="rounded-xl bg-muted/50 p-3.5">
              <p className="text-[12.5px] font-semibold text-foreground mb-1">Need help?</p>
              <p className="text-[12px] text-muted-foreground leading-snug">
                Contact PayGlocal support if you have questions about this outcome.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Dispute progress tracker — the guided lifecycle stepper ──────────────── */
function DisputeProgressTracker({
  steps,
  raisedOn,
  closedOn,
}: {
  steps: { label: string; state: "done" | "current" | "future"; description?: string }[];
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
                {step.description && (
                  <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug max-w-[280px]">
                    {step.description}
                  </p>
                )}
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
  const daysToRespond = Math.max(0, Math.round(
    (new Date(d.dueDate).getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const steps         = progressStepsFor(d, phase);

  const [progressOpen, setProgressOpen] = useState(true);
  const [evidenceOpen, setEvidenceOpen] = useState(true);
  const [txnOpen,      setTxnOpen]      = useState(true);
  const [notesOpen,    setNotesOpen]    = useState(true);
  const [activeTag,    setActiveTag]    = useState<string>(EVIDENCE_TAGS[0]);

  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onAddDoc(file, activeTag);
    e.target.value = "";
  }

  const [interstitial, setInterstitial] = useState<InterstitialKind | null>(null);

  return (
    <div className="relative flex flex-col h-full bg-[#f6f8fa] overflow-hidden">
      <div className="flex justify-center pt-2.5 pb-1 shrink-0">
        <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
      </div>

      {/* Header — fixed, stays visible while the body scrolls beneath it */}
      <div className="flex items-start justify-between gap-3 px-4 pb-3 shrink-0">
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

      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-8"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="px-4 pt-1 space-y-3">
        {/* 1. Case Details — same visual language as Transaction Details */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-4 pb-4 pt-4">
            <div className="flex items-start justify-between gap-3">
              <p className={cn("text-[24px] font-bold tabular-nums leading-tight", amtColor)}>
                {fmtAmount(d.amount, d.currency)}
              </p>
              <PhaseStageChip label={meta.stageLabel} />
            </div>
            <p className="text-[12.5px] font-semibold text-muted-foreground mt-1">{meta.statusLabel}</p>
          </div>

          <PairedRow
            left={{ label: "Reason", value: d.reason }}
            right={{ label: "Raised on", value: raisedOn }}
          />
          <PairedRow
            left={{ label: "Customer", value: d.customerName }}
            right={{ label: "Email", value: d.email }}
          />
          <PairedRow
            last
            left={{ label: "Payment method", value: cardSource(d) }}
            right={{ label: "Reason code", value: reasonMeta.reasonCode }}
          />

          {showDeadline && (
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between gap-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-[11px] font-semibold text-red-600">Respond by</p>
                <p className="text-[12px] font-semibold text-red-700 whitespace-nowrap">
                  {respondDate} · {respondTime} · {daysToRespond}d left
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3. Take Action, Submit Supporting Evidence, Under Review, or Won/Lost —
             exactly one of these renders, driven entirely by the same phase that
             determines the list row's merchant status chip. Never more than one. */}
        {DECISION_PHASES.includes(phase) && (
          <TakeActionSection
            key={phase}
            phase={phase}
            meta={meta}
            currency={d.currency}
            respondDate={respondDate}
            respondTime={respondTime}
            onSetDecision={onSetDecision}
            onSetSecondDecision={onSetSecondDecision}
            onContestConfirmed={() => setInterstitial("contesting")}
            onRecontestConfirmed={() => setInterstitial("recontesting")}
          />
        )}

        {UPLOADING_PHASES.includes(phase) && (
          <SubmitEvidenceSection
            phase={phase}
            docs={docs}
            activeTag={activeTag}
            onTagSelect={setActiveTag}
            onUploadClick={() => fileRef.current?.click()}
            onRemoveDoc={onRemoveDoc}
          />
        )}

        {WAITING_PHASES.includes(phase) && (
          <UnderReviewSection
            phase={phase}
            meta={meta}
            docs={docs}
            open={evidenceOpen}
            onToggle={() => setEvidenceOpen(p => !p)}
          />
        )}

        {(phase === "won" || phase === "lost") && (
          <DisputeOutcomeSection
            phase={phase}
            meta={meta}
            docs={docs}
            open={evidenceOpen}
            onToggle={() => setEvidenceOpen(p => !p)}
          />
        )}

        {/* 4. Dispute Progress — always visible; communicates current stage + what's next */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            title="Dispute Progress"
            open={progressOpen} onToggle={() => setProgressOpen(p => !p)}
          />
          {progressOpen && (
            <div className="border-t border-border/20 px-4 pb-4 pt-4">
              <DisputeProgressTracker steps={steps} raisedOn={raisedOn} closedOn={closedOn} />
            </div>
          )}
        </div>

        {/* 7. Internal Notes */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            title="Internal Notes"
            open={notesOpen} onToggle={() => setNotesOpen(p => !p)}
          />
          {notesOpen && <CommentsSection />}
        </div>

        {/* 8. Transaction Details — always last, below Dispute Progress and every other card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            title="Transaction Details"
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
        </div>
      </div>

      {/* 9. Contextual bottom CTA */}
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

      {/* Confirmation shown after Contest / Submit / Re-Contest — stays until the merchant dismisses it */}
      {interstitial && (
        <div className="absolute inset-0 z-20 bg-[#f6f8fa] flex flex-col items-center justify-center px-10 text-center">
          <button
            type="button"
            onClick={() => setInterstitial(null)}
            className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
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

/* ── How It Works — static educational bottom sheet, no dispute-specific data ── */
const DISPUTE_LEVELS = [
  {
    icon: Info,
    iconColor: "text-blue-600",
    iconBorder: "border-blue-200",
    title: "Dispute (Initial Stage)",
    bullets: ["First review by the customer's bank", "Lowest risk and lowest fees"],
  },
  {
    icon: ChevronUp,
    iconColor: "text-amber-600",
    iconBorder: "border-amber-200",
    title: "Pre-Arbitration",
    bullets: ["If bank or customer disagrees with the initial outcome", "Higher risk, additional fees may apply"],
  },
  {
    icon: ChevronsUp,
    iconColor: "text-red-600",
    iconBorder: "border-red-200",
    title: "Arbitration (Final Stage)",
    bullets: [
      "Final decision made by customer's bank",
      "Highest risk, involves highest fees",
      "Outcome is final, no escalations beyond this stage",
    ],
  },
] as const;

const DISPUTE_RESOLUTIONS = [
  { icon: ShieldCheck, title: "Contest the dispute", body: "Submit documents to prove the claim is valid" },
  { icon: Check,       title: "Accept the dispute",  body: "Refund the full amount and close the case" },
  { icon: Scissors,    title: "Accept partially",     body: "Refund part of the amount and contest the remaining balance" },
] as const;

function HowItWorksSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex justify-center pt-2.5 pb-1 shrink-0">
        <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 pb-3 shrink-0">
        <p className="text-[18px] font-bold text-foreground">How it works</p>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 pb-6" style={{ scrollbarWidth: "none" }}>
        <div className="space-y-1">
          <p className="text-[15px] font-bold text-foreground">What is a Dispute?</p>
          <p className="text-[13px] text-muted-foreground leading-snug">
            A dispute happens when a customer contacts their bank to question or reverse a card payment. The bank reviews the case and asks for a response from the merchant before making a decision.
          </p>
        </div>

        <div className="my-4 border-t border-border" />

        <div className="space-y-1">
          <p className="text-[15px] font-bold text-foreground">Why do disputes happen?</p>
          <p className="text-[13px] text-muted-foreground leading-snug mb-1.5">Disputes are usually raised when:</p>
          <ul className="space-y-1">
            {[
              "Customer doesn't recognize the transaction",
              "Product or service wasn't delivered as expected",
              "Charge was marked as fraudulent",
              "A refund was expected but not received",
            ].map(item => (
              <li key={item} className="text-[13px] text-muted-foreground leading-snug flex gap-1.5">
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="my-4 border-t border-border" />

        <div>
          <p className="text-[15px] font-bold text-foreground">Levels of a Dispute?</p>
          <p className="text-[13px] text-muted-foreground leading-snug mt-1 mb-3">
            A dispute can move through multiple review stages. Each stage increases risk, fees, and urgency.
          </p>
          <div className="space-y-3">
            {DISPUTE_LEVELS.map(level => {
              const Icon = level.icon;
              return (
                <div key={level.title} className="flex items-start gap-3">
                  <div className={cn("h-8 w-8 rounded-lg border flex items-center justify-center shrink-0", level.iconBorder)}>
                    <Icon className={cn("h-4 w-4", level.iconColor)} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-foreground">{level.title}</p>
                    <ul className="mt-0.5 space-y-0.5">
                      {level.bullets.map(b => (
                        <li key={b} className="text-[12.5px] text-muted-foreground leading-snug flex gap-1.5">
                          <span className="shrink-0">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="my-4 border-t border-border" />

        <div>
          <p className="text-[15px] font-bold text-foreground">How can you resolve a dispute?</p>
          <p className="text-[13px] text-muted-foreground leading-snug mt-1 mb-3">You have three options:</p>
          <div className="space-y-3">
            {DISPUTE_RESOLUTIONS.map(res => {
              const Icon = res.icon;
              return (
                <div key={res.title} className="flex items-start gap-3">
                  <Icon className="h-[18px] w-[18px] text-foreground shrink-0 mt-0.5" strokeWidth={1.75} />
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-foreground">{res.title}</p>
                    <p className="text-[12.5px] text-muted-foreground leading-snug mt-0.5">{res.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-600 shrink-0" strokeWidth={2} />
            <p className="text-[13.5px] font-bold text-blue-700">Important things to know</p>
          </div>
          <ul className="space-y-1">
            {[
              "Disputes have strict response deadlines",
              "Fees may apply as the dispute escalates",
              "A dispute may move through multiple stages",
              "Decisions at the arbitration stage are final",
            ].map(item => (
              <li key={item} className="text-[12.5px] text-blue-700/90 leading-snug flex gap-1.5">
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-[12.5px] text-blue-700/90 leading-snug mt-2">
            <span className="font-semibold">Tip:</span> If you&apos;re unsure or don&apos;t have strong supporting documents, accepting the dispute may be the safer option.
          </p>
        </div>
      </div>

      <div className="shrink-0 px-4 py-3 border-t border-border/60 bg-white" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-2xl bg-primary text-white text-[14px] font-semibold active:scale-[0.98] transition-all"
        >
          Got it
        </button>
      </div>
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
        <p className="text-[16px] font-bold text-foreground">Recent Activity</p>
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
          <span className="text-[11px] font-medium text-muted-foreground mt-1">Recent Activity</span>
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
function DisputeRowContent({
  d,
  decision,
  docsLen,
  submitted,
  secondDecision,
  secondSubmitted,
}: {
  d: DisputeMockRow;
  decision: MerchantDecision;
  docsLen: number;
  submitted: boolean;
  secondDecision: SecondDecision;
  secondSubmitted: boolean;
}) {
  const stage      = workflowStageOf(d);
  const status     = merchantStatusOf(d, decision, docsLen, submitted, secondDecision, secondSubmitted);
  const { date, time } = fmtRowDate(d.createdAt);

  return (
    <div className="px-4 py-3.5 flex items-start justify-between gap-3">
      {/* Left — amount (primary), card details | dispute stage, reason */}
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold tabular-nums leading-tight text-foreground">
          {fmtAmount(d.amount, d.currency)}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 min-w-0">
          {d.cardBrand === "visa" || d.cardBrand === "mastercard" ? (
            <div className="flex items-center gap-1 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.cardBrand === "visa" ? "/visa.png" : "/mastercard.png"}
                alt={d.cardBrand}
                className="h-[10px] w-auto object-contain"
              />
              {d.cardLast4 && <p className="text-[12px] text-muted-foreground leading-snug whitespace-nowrap">···{d.cardLast4}</p>}
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground leading-snug shrink-0 whitespace-nowrap">
              {d.cardBrand ? d.cardBrand.toUpperCase() : "—"}{d.cardLast4 ? ` ···${d.cardLast4}` : ""}
            </p>
          )}
          <span className="h-3 w-px bg-border shrink-0" aria-hidden />
          <p className="text-[12px] text-muted-foreground leading-snug truncate min-w-0">{stage}</p>
        </div>
        <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug line-clamp-2">
          {d.reason}
        </p>
      </div>

      {/* Right — merchant status chip, raised-on date/time */}
      <div className="shrink-0 flex flex-col items-end gap-1.5 pl-1">
        <MerchantStatusChip status={status} />
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
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const [workspaceFor,        setWorkspaceFor]        = useState<DisputeMockRow | null>(null);
  const [timelineFor,         setTimelineFor]         = useState<DisputeMockRow | null>(null);
  const [uploadedDocs,        setUploadedDocs]        = useState<Record<string, UploadedDoc[]>>({});
  const [merchantDecisions,   setMerchantDecisions]   = useState<Record<string, MerchantDecision>>({});
  const [submittedForReview,  setSubmittedForReview]  = useState<Record<string, boolean>>({});
  const [secondDecisions,     setSecondDecisions]     = useState<Record<string, SecondDecision>>({});
  const [secondSubmittedMap,  setSecondSubmittedMap]  = useState<Record<string, boolean>>({});

  const chipsRef    = useHorizontalScroll<HTMLDivElement>();
  const tabsRef     = useHorizontalScroll<HTMLDivElement>();
  const insightsRef = useHorizontalScroll<HTMLDivElement>();

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

  const recoveredTotal = disputes
    .filter(d => (d.badgeStatus ?? d.status) === "won")
    .reduce((sum, d) => sum + d.amount, 0);
  const recoveryTrend = recoveryTrendOf(recoveredTotal);
  const reasonBreakdown = reasonBreakdownOf(disputes);

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
    const doc: UploadedDoc = { id: `${file.name}-${file.size}-${Date.now()}`, name: file.name, tag, size: file.size };
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
            <h1 className="flex-1 text-[18px] font-bold text-foreground">Disputes</h1>
            <button
              type="button"
              onClick={() => setHowItWorksOpen(true)}
              className="text-[13px] font-semibold text-primary active:opacity-70 transition-opacity shrink-0"
            >
              How it works
            </button>
          </div>

          {/* ── Scrollable content ── */}
          <div
            className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-6"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Dispute overview — composition donut + recovery/reason insight carousel.
               First card ~75% width, following cards peek from the right to hint at
               more scrollable content; no pagination dots by design. */}
            <div className="mt-3 mb-3">
              <div className="flex items-center justify-between gap-3 mb-2.5 px-4">
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

              <div
                ref={insightsRef}
                className="flex gap-3 px-4 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollPaddingLeft: 16 }}
              >
                <div
                  className="shrink-0 snap-start rounded-2xl border border-border bg-card shadow-sm px-4 py-4"
                  style={{ width: "75%" }}
                >
                  <div className="flex flex-col items-center">
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
                    <ul className="w-full mt-3.5 space-y-2">
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

                <RecoveryInsightCard recoveredTotal={recoveredTotal} trend={recoveryTrend} />
                <ReasonBreakdownCard breakdown={reasonBreakdown} recoveredTotal={recoveredTotal} />
                {/* Additional insight cards can be appended here — same shrink-0 snap-start w-[75%] card shape */}
              </div>
            </div>

            {/* All Disputes card */}
            <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm">

              {/* Card header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <p className="text-[15px] font-bold text-foreground">{TAB_LABEL[activeTab]}</p>
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

              {/* Search */}
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
                    <DisputeRowContent
                      d={d}
                      decision={merchantDecisions[d.id] ?? "undecided"}
                      docsLen={(uploadedDocs[d.id] ?? []).length}
                      submitted={submittedForReview[d.id] ?? false}
                      secondDecision={secondDecisions[d.id] ?? "undecided"}
                      secondSubmitted={secondSubmittedMap[d.id] ?? false}
                    />
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

          {/* ── How It Works — static educational bottom sheet ── */}
          <AnimatePresence>
            {howItWorksOpen && (
              <>
                <motion.div
                  key="hiw-backdrop"
                  className="absolute inset-0 z-[5]"
                  style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setHowItWorksOpen(false)}
                />
                <motion.div
                  key="hiw-sheet"
                  className="absolute inset-x-0 bottom-0 z-[6] flex flex-col overflow-hidden bg-white"
                  style={{ height: "88%", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                >
                  <HowItWorksSheet onClose={() => setHowItWorksOpen(false)} />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
