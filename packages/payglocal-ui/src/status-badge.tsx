import { cn } from "./utils";
import { Check, X, RefreshCw, Clock, AlertCircle, ArrowRight, Info } from "lucide-react";

type StatusType = string;

type BadgeVariant =
  | "success"
  | "info"
  | "warning"
  | "refund"
  | "danger"
  | "orange"
  | "muted";

export type StatusBadgeMeta = {
  label: string;
  variant: BadgeVariant;
  trailIcon?: "check" | "x" | "refresh" | "clock" | "alert" | "arrow-right" | "info";
};

/* Light: low-opacity hue-matched borders (readable but soft). Dark: stronger borders for contrast on dark surfaces. */
const VARIANT_CLASS: Record<BadgeVariant, string> = {
  success:
    "bg-emerald-500/10 text-emerald-800 border-emerald-600/10 dark:bg-emerald-500/35 dark:text-emerald-50 dark:border-emerald-400/70",
  info: "bg-blue-500/10 text-blue-800 border-blue-600/10 dark:bg-sky-500/30 dark:text-sky-50 dark:border-sky-400/65",
  warning:
    "bg-amber-500/10 text-amber-900 border-amber-600/10 dark:bg-amber-500/35 dark:text-amber-50 dark:border-amber-400/70",
  refund:
    "bg-yellow-500/10 text-yellow-900 border-yellow-600/10 dark:bg-violet-500/30 dark:text-violet-100 dark:border-violet-400/60",
  danger:
    "bg-red-500/10 text-red-800 border-red-600/10 dark:bg-red-500/35 dark:text-red-50 dark:border-red-400/70",
  orange:
    "bg-orange-500/10 text-orange-900 border-orange-600/10 dark:bg-orange-500/35 dark:text-orange-50 dark:border-orange-400/65",
  muted:
    "bg-muted text-muted-foreground border-border/40 dark:bg-zinc-800/90 dark:text-zinc-200 dark:border-zinc-500/45",
};

const config: Record<string, StatusBadgeMeta> = {
  success: { label: "Success", variant: "success", trailIcon: "check" },
  sent_for_capture: { label: "Sent for capture", variant: "success", trailIcon: "check" },
  settled: { label: "Settled", variant: "success", trailIcon: "check" },
  paid: { label: "Paid", variant: "success", trailIcon: "check" },
  active: { label: "Active", variant: "success", trailIcon: "check" },
  completed: { label: "Completed", variant: "success", trailIcon: "check" },
  won: { label: "Won", variant: "success", trailIcon: "check" },
  issued: { label: "Issued", variant: "info", trailIcon: "check" },

  in_progress: { label: "In progress", variant: "warning" },
  inprogress: { label: "In progress", variant: "warning" },
  authorised_pending: { label: "Authorised pending", variant: "warning" },
  authorised_pending_capture: { label: "Authorised pending capture", variant: "warning" },
  pending: { label: "Pending", variant: "warning" },
  under_review: { label: "Under review", variant: "warning", trailIcon: "clock" },
  evidence_submitted: { label: "Evidence submitted", variant: "info", trailIcon: "arrow-right" },
  deadline_missed: { label: "Deadline missed", variant: "muted", trailIcon: "info" },
  processing: { label: "Processing", variant: "warning", trailIcon: "clock" },

  refunded: { label: "Refunded", variant: "refund", trailIcon: "refresh" },
  refund_started: { label: "Refund started", variant: "refund" },

  failed: { label: "Failed", variant: "danger", trailIcon: "x" },
  system_declined: { label: "System declined", variant: "danger", trailIcon: "x" },
  issuer_decline: { label: "Issuer decline", variant: "danger", trailIcon: "x" },
  general_decline: { label: "General decline", variant: "danger", trailIcon: "x" },
  request_error: { label: "Request error", variant: "danger", trailIcon: "x" },
  lost: { label: "Lost", variant: "danger", trailIcon: "x" },
  overdue: { label: "Overdue", variant: "danger", trailIcon: "x" },
  inactive: { label: "Inactive", variant: "danger", trailIcon: "x" },

  open: { label: "Open", variant: "orange", trailIcon: "alert" },
  draft: { label: "Draft", variant: "muted" },

  sent_for_review: { label: "Sent for review", variant: "muted", trailIcon: "clock" },
  sent_for_settlement: { label: "Sent for settlement", variant: "muted" },

  /** AI Storefront & integrations */
  live: { label: "Live", variant: "success", trailIcon: "check" },
  paused: { label: "Paused", variant: "warning", trailIcon: "clock" },
  healthy: { label: "Healthy", variant: "success", trailIcon: "check" },
  degraded: { label: "Degraded", variant: "warning", trailIcon: "alert" },
  unknown: { label: "Unknown", variant: "muted", trailIcon: "info" },
};

interface StatusBadgeProps {
  status: StatusType;
  size?: "sm" | "md";
}

/** All built-in status keys (for docs and tests). */
export const STATUS_BADGE_KEYS = Object.freeze(Object.keys(config));

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const c: StatusBadgeMeta = config[status] ?? {
    label: status.replace(/_/g, " "),
    variant: "muted",
  };

  const iSize = size === "sm" ? 11 : 12;
  const iProps = { width: iSize, height: iSize, strokeWidth: 2.5, style: { flexShrink: 0 } } as const;

  const icon =
    c.trailIcon === "check" ? (
      <Check {...iProps} />
    ) : c.trailIcon === "x" ? (
      <X {...iProps} strokeWidth={3} />
    ) : c.trailIcon === "refresh" ? (
      <RefreshCw {...{ ...iProps, strokeWidth: 2 }} />
    ) : c.trailIcon === "clock" ? (
      <Clock {...iProps} strokeWidth={2} />
    ) : c.trailIcon === "alert" ? (
      <AlertCircle {...iProps} strokeWidth={2} />
    ) : c.trailIcon === "arrow-right" ? (
      <ArrowRight {...iProps} strokeWidth={2.5} />
    ) : c.trailIcon === "info" ? (
      <Info {...iProps} strokeWidth={2.5} />
    ) : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border whitespace-nowrap",
        VARIANT_CLASS[c.variant],
        size === "sm" ? "text-[11px] px-2 py-[2px]" : "text-[13px] px-3 py-[5px]"
      )}
      style={{ borderRadius: 6 }}
    >
      {c.label}
      {icon}
    </span>
  );
}
