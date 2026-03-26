import { cn } from "@/lib/utils";
import { Check, X, RefreshCw, Clock, AlertCircle } from "lucide-react";

type StatusType = string;

type BadgeStyle = {
  label:      string;
  bg:         string;
  text:       string;
  border:     string;
  trailIcon?: "check" | "x" | "refresh" | "clock" | "alert";
};

/*
 * Color system:
 *   bg     — very light tint
 *   text   — dark enough for readability (~600–700 shade)
 *   border — mid-tint (~300 shade), visibly lighter than the text
 */
const config: Record<string, BadgeStyle> = {
  // ── Success — white bg, green-600 text, green-300 border ──
  success:                    { label: "Success",                     bg: "#f0fdf4", text: "#15803d", border: "#86efac", trailIcon: "check"   },
  sent_for_capture:           { label: "Sent for capture",            bg: "#f0fdf4", text: "#15803d", border: "#86efac", trailIcon: "check"   },
  settled:                    { label: "Settled",                     bg: "#f0fdf4", text: "#15803d", border: "#86efac", trailIcon: "check"   },
  paid:                       { label: "Paid",                        bg: "#f0fdf4", text: "#15803d", border: "#86efac", trailIcon: "check"   },
  active:                     { label: "Active",                      bg: "#f0fdf4", text: "#15803d", border: "#86efac", trailIcon: "check"   },
  completed:                  { label: "Completed",                   bg: "#f0fdf4", text: "#15803d", border: "#86efac", trailIcon: "check"   },
  won:                        { label: "Won",                         bg: "#f0fdf4", text: "#15803d", border: "#86efac", trailIcon: "check"   },
  issued:                     { label: "Issued",                      bg: "#ffffff", text: "#0047b0", border: "#93c5fd", trailIcon: "check"   },

  // ── Pending — amber-50 bg, amber-700 text, amber-300 border
  in_progress:                { label: "In progress",                 bg: "#fffbeb", text: "#b45309", border: "#fcd34d"                      },
  inprogress:                 { label: "In progress",                 bg: "#fffbeb", text: "#b45309", border: "#fcd34d"                      },
  authorised_pending:         { label: "Authorised pending",          bg: "#fffbeb", text: "#b45309", border: "#fcd34d"                      },
  authorised_pending_capture: { label: "Authorised pending capture",  bg: "#fffbeb", text: "#b45309", border: "#fcd34d"                      },
  pending:                    { label: "Pending",                     bg: "#fffbeb", text: "#b45309", border: "#fcd34d"                      },
  under_review:               { label: "Under review",                bg: "#fffbeb", text: "#b45309", border: "#fcd34d", trailIcon: "clock"  },
  processing:                 { label: "Processing",                  bg: "#fffbeb", text: "#b45309", border: "#fcd34d", trailIcon: "clock"  },

  // ── Refund — yellow-50 bg, amber-800 text, amber-300 border
  refunded:                   { label: "Refunded",                    bg: "#fefce8", text: "#92400e", border: "#fcd34d", trailIcon: "refresh" },
  refund_started:             { label: "Refund started",              bg: "#fefce8", text: "#92400e", border: "#fcd34d"                      },

  // ── Failed — rose-50 bg, red-600 text, red-300 border ─────
  failed:                     { label: "Failed",                      bg: "#fff1f2", text: "#dc2626", border: "#fca5a5", trailIcon: "x"      },
  system_declined:            { label: "System declined",             bg: "#fff1f2", text: "#dc2626", border: "#fca5a5", trailIcon: "x"      },
  issuer_decline:             { label: "Issuer decline",              bg: "#fff1f2", text: "#dc2626", border: "#fca5a5", trailIcon: "x"      },
  general_decline:            { label: "General decline",             bg: "#fff1f2", text: "#dc2626", border: "#fca5a5", trailIcon: "x"      },
  request_error:              { label: "Request error",               bg: "#fff1f2", text: "#dc2626", border: "#fca5a5", trailIcon: "x"      },
  lost:                       { label: "Lost",                        bg: "#fff1f2", text: "#dc2626", border: "#fca5a5", trailIcon: "x"      },
  overdue:                    { label: "Overdue",                     bg: "#fff1f2", text: "#dc2626", border: "#fca5a5", trailIcon: "x"      },
  inactive:                   { label: "Inactive",                    bg: "#fff1f2", text: "#dc2626", border: "#fca5a5", trailIcon: "x"      },

  // ── Neutral ───────────────────────────────────────────────
  open:                       { label: "Open",                        bg: "#fff7ed", text: "#c2410c", border: "#fdba74", trailIcon: "alert"  },
  draft:                      { label: "Draft",                       bg: "#f9fafb", text: "#6b7280", border: "#d1d5db"                      },

  // ── Inbound / collections (MCA) ───────────────────────────
  sent_for_review:            { label: "Sent for review",             bg: "#f9fafb", text: "#4b5563", border: "#e5e7eb", trailIcon: "clock"  },
  sent_for_settlement:        { label: "Sent for settlement",       bg: "#f9fafb", text: "#4b5563", border: "#e5e7eb"                      },
};

interface StatusBadgeProps {
  status: StatusType;
  size?:  "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const c: BadgeStyle = config[status] ?? {
    label:  status.replace(/_/g, " "),
    bg:     "#f9fafb",
    text:   "#6b7280",
    border: "#d1d5db",
  };

  /* icon dimensions passed directly to the SVG component */
  const iSize = size === "sm" ? 11 : 12;
  const iProps = { width: iSize, height: iSize, strokeWidth: 2.5, style: { flexShrink: 0 } } as const;

  const icon = c.trailIcon === "check"   ? <Check   {...iProps} />
             : c.trailIcon === "x"       ? <X       {...iProps} strokeWidth={3} />
             : c.trailIcon === "refresh" ? <RefreshCw { ...{ ...iProps, strokeWidth: 2 }} />
             : c.trailIcon === "clock"   ? <Clock   {...iProps} strokeWidth={2} />
             : c.trailIcon === "alert"   ? <AlertCircle {...iProps} strokeWidth={2} />
             : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border whitespace-nowrap",
        size === "sm" ? "text-[11px] px-2 py-[2px]" : "text-[13px] px-3 py-[5px]"
      )}
      style={{
        background:   c.bg,
        color:        c.text,
        borderColor:  c.border,
        borderRadius: 6,
      }}
    >
      {c.label}
      {icon}
    </span>
  );
}
