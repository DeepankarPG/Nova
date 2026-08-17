"use client";

import { CalendarClock, Download, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReportDefinition } from "@/lib/mock-data/reports";
import { FileFormatBadge } from "./FileFormatBadge";

export function ReportRow({
  report,
  onDownload,
  onSchedule,
  isFavorite = false,
  onToggleFavorite,
  className,
}: {
  report: ReportDefinition;
  onDownload: (report: ReportDefinition) => void;
  onSchedule: (report: ReportDefinition) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (report: ReportDefinition) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 shadow-sm transition-all duration-150",
        "hover:border-primary/30 hover:shadow-md",
        className
      )}
    >
      <FileFormatBadge format={report.defaultFormat} className="h-8 w-8" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[13.5px] font-medium text-foreground">{report.name}</p>
          {report.kind === "custom" && (
            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-primary">
              <Plus className="h-2.5 w-2.5" /> Custom
            </span>
          )}
        </div>
        <p className="truncate text-[12px] text-muted-foreground">{report.description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(report)}
            title={isFavorite ? "Remove from favourites" : "Add to favourites"}
            aria-pressed={isFavorite}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-opacity",
              isFavorite
                ? "text-amber-500 opacity-100"
                : "text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100"
            )}
          >
            <Star className="h-3.5 w-3.5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
        <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[12px]"
            onClick={() => onSchedule(report)}
            title="Schedule this report"
          >
            <CalendarClock className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-3.5 w-3.5" />}
            className="h-7 px-2.5 text-[12px]"
            onClick={() => onDownload(report)}
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
