"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  allReports,
  reportFormats,
  type ReportDefinition,
  type ReportFormat,
  type ReportSchedule,
  type ScheduleFrequency,
} from "@/lib/mock-data/reports";
import { ReportIcon } from "./report-icons";
import { DeleteScheduleDialog } from "./DeleteScheduleDialog";

const FREQUENCIES: { id: ScheduleFrequency; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function ScheduleReportPanel({
  open,
  onOpenChange,
  report,
  editingSchedule,
  onScheduled,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Set when creating a new schedule from a report card. */
  report: ReportDefinition | null;
  /** Set when editing an existing schedule from the Schedules tab. Takes precedence over `report`. */
  editingSchedule?: ReportSchedule | null;
  onScheduled?: (reportName: string) => void;
  onSaved?: (id: string, updates: Partial<ReportSchedule>) => void;
  onDeleted?: (schedule: ReportSchedule) => void;
}) {
  const isEditing = !!editingSchedule;
  const targetReport = editingSchedule
    ? (allReports.find((r) => r.name === editingSchedule.reportName) ?? null)
    : report;

  const [frequency, setFrequency] = useState<ScheduleFrequency>("weekly");
  const [time, setTime] = useState("09:00");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [format, setFormat] = useState<ReportFormat>("csv");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const prevOpen = useRef(false);

  useEffect(() => {
    if (open && !prevOpen.current) {
      if (editingSchedule) {
        setFrequency(editingSchedule.frequency);
        setTime(editingSchedule.time);
        setDayOfWeek(editingSchedule.dayOfWeek ?? "Monday");
        setDayOfMonth(editingSchedule.dayOfMonth ?? 1);
        setFormat(editingSchedule.format);
        setRecipients(editingSchedule.recipients);
      } else {
        setFrequency("weekly");
        setTime("09:00");
        setDayOfWeek("Monday");
        setDayOfMonth(1);
        setFormat("csv");
        setRecipients([]);
      }
      setRecipientInput("");
      setConfirmDeleteOpen(false);
    }
    prevOpen.current = open;
  }, [open, editingSchedule]);

  const addRecipient = () => {
    const value = recipientInput.trim();
    if (!value || !value.includes("@")) return;
    if (recipients.includes(value)) return;
    setRecipients((prev) => [...prev, value]);
    setRecipientInput("");
  };

  const removeRecipient = (email: string) => setRecipients((prev) => prev.filter((r) => r !== email));

  const cadenceLabel = useMemo(() => {
    if (frequency === "daily") return `Every day at ${time}`;
    if (frequency === "weekly") return `Every ${dayOfWeek} at ${time}`;
    return `Day ${dayOfMonth} of every month at ${time}`;
  }, [frequency, time, dayOfWeek, dayOfMonth]);

  const canSubmit = !!targetReport && recipients.length > 0;

  const handleSubmit = async () => {
    if (!targetReport) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    onOpenChange(false);

    if (isEditing && editingSchedule) {
      toast.success("Schedule updated", {
        description: `${editingSchedule.reportName} · ${cadenceLabel} · ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}`,
      });
      onSaved?.(editingSchedule.id, {
        frequency,
        time,
        dayOfWeek: frequency === "weekly" ? dayOfWeek : undefined,
        dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
        format,
        recipients,
      });
      return;
    }

    toast.success("Schedule created", {
      description: `${targetReport.name} · ${cadenceLabel} · ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}`,
    });
    onScheduled?.(targetReport.name);
  };

  if (!targetReport) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "left-1/2 top-1/2 w-[min(100%-1.5rem,30rem)] max-w-none -translate-x-1/2 -translate-y-1/2",
            "flex flex-col gap-0 overflow-hidden rounded-2xl p-0"
          )}
        >
          <div className="flex items-start gap-3 px-5 pt-5 pb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ReportIcon report={targetReport} className="text-primary" style={{ width: 18, height: 18 }} />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-[15px]">
                {isEditing ? "Edit schedule" : `Schedule "${targetReport.name}"`}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[12.5px]">
                {isEditing
                  ? `"${targetReport.name}" — delivered automatically to your inbox.`
                  : "Delivered automatically to your inbox — pause or edit anytime from Schedules."}
              </DialogDescription>
            </div>
          </div>

          <div className="space-y-4 px-5 pb-1">
            {/* Frequency chips */}
            <div>
              <p className="mb-2 text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">Frequency</p>
              <div className="flex gap-1.5">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFrequency(f.id)}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                      frequency === f.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {frequency === "weekly" && (
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-foreground">Day</label>
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map((d) => (
                        <SelectItem key={d} value={d} className="text-[13px]">
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {frequency === "monthly" && (
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-foreground">Day of month</label>
                  <Select value={String(dayOfMonth)} onValueChange={(v) => setDayOfMonth(Number(v))}>
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={String(d)} className="text-[13px]">
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className={frequency === "daily" ? "col-span-2" : ""}>
                <label className="mb-1 block text-[12px] font-medium text-foreground">Time</label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-9 text-[13px]" />
              </div>
              {frequency !== "daily" && (
                <div className={frequency === "weekly" || frequency === "monthly" ? "" : "col-span-2"} />
              )}
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-foreground">Format</label>
              <Select value={format} onValueChange={(v) => setFormat(v as ReportFormat)}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportFormats.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="text-[13px]">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-foreground">
                Recipients <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1.5">
                <Input
                  type="email"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRecipient();
                    }
                  }}
                  placeholder="you@company.com"
                  className="h-9 flex-1 text-[13px]"
                />
                <Button type="button" variant="outline" size="sm" onClick={addRecipient} className="px-2.5">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {recipients.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {recipients.map((email) => (
                    <span
                      key={email}
                      className="flex items-center gap-1 rounded-full border border-border bg-muted/50 py-1 pl-2.5 pr-1.5 text-[12px] text-foreground"
                    >
                      {email}
                      <button type="button" onClick={() => removeRecipient(email)} className="rounded-full p-0.5 hover:bg-muted">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete schedule
              </button>
            )}
          </div>

          <div className="mt-4 flex shrink-0 items-center justify-between gap-2 border-t border-border bg-muted/30 px-5 py-3.5">
            <span className="text-[11.5px] text-muted-foreground">{cadenceLabel}</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" disabled={!canSubmit} isLoading={isSubmitting} onClick={handleSubmit}>
                {isEditing ? "Save changes" : "Create schedule"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isEditing && editingSchedule && (
        <DeleteScheduleDialog
          schedule={confirmDeleteOpen ? editingSchedule : null}
          onOpenChange={(o) => !o && setConfirmDeleteOpen(false)}
          onConfirm={(s) => {
            onOpenChange(false);
            onDeleted?.(s);
          }}
        />
      )}
    </>
  );
}
