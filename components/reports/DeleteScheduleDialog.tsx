"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ReportSchedule } from "@/lib/mock-data/reports";

export function DeleteScheduleDialog({
  schedule,
  onOpenChange,
  onConfirm,
}: {
  schedule: ReportSchedule | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (schedule: ReportSchedule) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!schedule) return;
    setIsDeleting(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsDeleting(false);
    onConfirm(schedule);
    onOpenChange(false);
  };

  return (
    <Dialog open={!!schedule} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "left-1/2 top-1/2 w-[min(100%-1.5rem,26rem)] max-w-none -translate-x-1/2 -translate-y-1/2",
          "flex flex-col gap-0 overflow-hidden rounded-2xl p-0"
        )}
      >
        {schedule && (
          <>
            <div className="flex items-start gap-3 px-5 pt-5 pb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-4.5 w-4.5 text-red-600" style={{ width: 18, height: 18 }} />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-[15px]">Delete this schedule?</DialogTitle>
                <DialogDescription className="mt-0.5 text-[12.5px]">
                  &ldquo;{schedule.reportName}&rdquo; will stop sending automatically. This can&apos;t be undone.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3.5">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" size="sm" isLoading={isDeleting} onClick={handleConfirm}>
                Delete schedule
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
