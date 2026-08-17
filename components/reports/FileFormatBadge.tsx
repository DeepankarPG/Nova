import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { ReportFormat } from "@/lib/mock-data/reports";

const FORMAT_META: Record<ReportFormat, { label: string; fg: string; bg: string; border: string }> = {
  xlsx: { label: "XLSX", fg: "#1d6f42", bg: "#eaf7ee", border: "#bfe6cc" },
  csv: { label: "CSV", fg: "#0f7b6c", bg: "#e8f7f4", border: "#bfe8e0" },
  pdf: { label: "PDF", fg: "#c0362c", bg: "#fdeceb", border: "#f5c6c2" },
  txt: { label: "TXT", fg: "#525866", bg: "#eef0f3", border: "#d7dbe0" },
};

/** Small file-type badge (folded-corner sheet + format label) used on report cards/tiles. */
export function FileFormatBadge({
  format,
  className,
  style,
}: {
  format: ReportFormat;
  className?: string;
  style?: CSSProperties;
}) {
  const meta = FORMAT_META[format];

  return (
    <div
      className={cn("relative flex shrink-0 items-center justify-center", className)}
      style={style}
      title={meta.label}
      aria-label={`${meta.label} file`}
    >
      <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden>
        <path
          d="M7 2h13l7 7v19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
          fill={meta.bg}
          stroke={meta.border}
          strokeWidth="1"
        />
        <path d="M20 2v6a1 1 0 0 0 1 1h6" fill="none" stroke={meta.border} strokeWidth="1" />
        <rect x="6.5" y="19" width="19" height="8.5" rx="1.5" fill={meta.fg} />
        <text
          x="16"
          y="25.3"
          textAnchor="middle"
          fontSize="6.5"
          fontWeight="700"
          fontFamily="var(--font-geist-sans), system-ui, sans-serif"
          fill="#fff"
          letterSpacing="0.2"
        >
          {meta.label}
        </text>
      </svg>
    </div>
  );
}
