"use client";

import { useState } from "react";
import { CalendarClock, FileText, Pause, PencilLine, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatDate } from "@/lib/utils";
import { allReports, type ReportSchedule } from "@/lib/mock-data/reports";
import { ReportIcon } from "./report-icons";
import { DeleteScheduleDialog } from "./DeleteScheduleDialog";

function cadenceLabel(s: ReportSchedule) {
  if (s.frequency === "daily") return `Daily · ${s.time}`;
  if (s.frequency === "weekly") return `Weekly on ${s.dayOfWeek} · ${s.time}`;
  return `Monthly on day ${s.dayOfMonth} · ${s.time}`;
}

export function ReportsSchedulesTab({
  schedules,
  onCreateClick,
  onToggleStatus,
  onDelete,
  onEdit,
}: {
  schedules: ReportSchedule[];
  onCreateClick: () => void;
  onToggleStatus: (id: string) => void;
  onDelete: (schedule: ReportSchedule) => void;
  onEdit: (schedule: ReportSchedule) => void;
}) {
  const [pendingDelete, setPendingDelete] = useState<ReportSchedule | null>(null);

  if (schedules.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <EmptyState
          icon={CalendarClock}
          title="No schedules yet"
          description="Create a report schedule to receive reports automatically in your inbox."
          action={
            <Button type="button" variant="primary" size="sm" onClick={onCreateClick}>
              Create schedule
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {schedules.map((s) => {
          const matchedReport = allReports.find((r) => r.name === s.reportName);
          return (
            <div
              key={s.id}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 shadow-sm transition-all duration-150 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {matchedReport ? (
                  <ReportIcon report={matchedReport} className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13.5px] font-medium text-foreground">{s.reportName}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide",
                      s.status === "active"
                        ? "bg-emerald-500/10 text-emerald-800 border-emerald-600/10 dark:bg-emerald-500/35 dark:text-emerald-50 dark:border-emerald-400/70"
                        : "bg-muted text-muted-foreground border-border/40"
                    )}
                  >
                    {s.status === "active" ? "Active" : "Paused"}
                  </span>
                </div>
                <p className="truncate text-[12px] text-muted-foreground">
                  {cadenceLabel(s)} · {s.format.toUpperCase()} · {s.recipients.length} recipient{s.recipients.length > 1 ? "s" : ""} · Next run{" "}
                  {formatDate(s.nextRunAt, { month: "short", day: "2-digit", year: "numeric" })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={s.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  className="h-7 px-2.5 text-[12px]"
                  onClick={() => onToggleStatus(s.id)}
                >
                  {s.status === "active" ? "Pause" : "Resume"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground"
                  onClick={() => onEdit(s)}
                  title="Edit schedule"
                  aria-label="Edit schedule"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                  onClick={() => setPendingDelete(s)}
                  title="Delete schedule"
                  aria-label="Delete schedule"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <DeleteScheduleDialog
        schedule={pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={onDelete}
      />
    </>
  );
}
