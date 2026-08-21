"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Mail } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  durationPresets,
  previewForReport,
  reportFormats,
  type ReportDefinition,
  type ReportFormat,
} from "@/lib/mock-data/reports";
import { ReportIcon } from "./report-icons";
import { DeviceFramedPreview } from "./DeviceFramedPreview";

const QUICK_DURATIONS = durationPresets.filter((d) => d.id !== "custom");

export function DownloadReportPanel({
  open,
  onOpenChange,
  report,
  onDownloaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportDefinition | null;
  onDownloaded?: (reportName: string) => void;
}) {
  const [duration, setDuration] = useState<string>("last_7_days");
  const [customRange, setCustomRange] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [format, setFormat] = useState<ReportFormat>("csv");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [emailOn, setEmailOn] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const prevOpen = useRef(false);

  useEffect(() => {
    if (open && !prevOpen.current) {
      setDuration("last_7_days");
      setCustomRange(false);
      setFromDate("");
      setToDate("");
      setFormat("csv");
      setAdvancedOpen(false);
      setEmailOn(false);
      setEmail("");
    }
    prevOpen.current = open;
  }, [open]);

  const preview = useMemo(() => (report ? previewForReport(report) : null), [report]);

  const durationLabel = customRange
    ? fromDate && toDate
      ? `${fromDate} → ${toDate}`
      : "Custom range"
    : QUICK_DURATIONS.find((d) => d.id === duration)?.label ?? "Last 7 days";

  const canSubmit = !!report && (!customRange || (!!fromDate && !!toDate)) && (!emailOn || !!email);

  const handleSubmit = async () => {
    if (!report) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    onOpenChange(false);
    toast.success("Report is generating", {
      description: `${report.name} · ${durationLabel} · ${format.toUpperCase()}${emailOn ? ` · emailing ${email}` : ""}`,
    });
    onDownloaded?.(report.name);
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "left-1/2 top-1/2 w-[min(100%-1.5rem,34rem)] max-w-none -translate-x-1/2 -translate-y-1/2",
          "flex flex-col gap-0 overflow-hidden rounded-2xl p-0"
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <ReportIcon report={report} className="text-primary" style={{ width: 18, height: 18 }} />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-[15px]">{report.name}</DialogTitle>
            <DialogDescription className="mt-0.5 line-clamp-2 text-[12.5px]">{report.description}</DialogDescription>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="mx-5 mb-4">
            <DeviceFramedPreview
              format={format}
              columns={preview.columns}
              rows={preview.rows}
              reportName={report.name}
              durationLabel={durationLabel}
            />
            <p className="px-1 pt-1.5 text-[10.5px] text-muted-foreground">
              Preview · actual export reflects your selected range
            </p>
          </div>
        )}

        {/* Quick duration chips */}
        <div className="px-5 pb-1">
          <p className="mb-2 text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">Duration</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_DURATIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setDuration(d.id);
                  setCustomRange(false);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  !customRange && duration === d.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {d.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCustomRange(true)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                customRange
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Custom range
            </button>
          </div>

          {customRange && (
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 text-[13px]" />
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 text-[13px]" />
            </div>
          )}
        </div>

        {/* Advanced disclosure */}
        <div className="px-5 pt-3">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="flex w-full items-center justify-between py-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground"
          >
            <span>Advanced options</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", advancedOpen && "rotate-180")} />
          </button>

          {advancedOpen && (
            <div className="space-y-3 pb-1 pt-1.5">
              <div className="flex items-center gap-2.5">
                <span className="w-16 shrink-0 text-[12.5px] text-muted-foreground">Format</span>
                <Select value={format} onValueChange={(v) => setFormat(v as ReportFormat)}>
                  <SelectTrigger className="h-9 flex-1 text-[13px]">
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

              <div className="rounded-lg border border-border bg-card px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-foreground">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Share via email
                  </div>
                  <Switch checked={emailOn} onCheckedChange={setEmailOn} aria-label="Toggle email delivery" />
                </div>
                {emailOn && (
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-2 h-9 text-[13px]"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 flex shrink-0 items-center justify-between gap-2 border-t border-border bg-muted/30 px-5 py-3.5">
          <span className="text-[11.5px] text-muted-foreground">
            {durationLabel} · {format.toUpperCase()}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" size="sm" disabled={!canSubmit} isLoading={isSubmitting} onClick={handleSubmit}>
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
