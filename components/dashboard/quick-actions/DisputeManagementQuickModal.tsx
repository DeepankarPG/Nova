"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Maximize2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { disputes } from "@/lib/mock-data";
import {
  DisputeActionBanner,
  DisputePrimaryTabs,
  DisputeStatsGrid,
} from "@/components/dispute-management/DisputeLayoutBlocks";
import { DISPUTE_TABLE_DATA_COLUMNS, type DisputeRow } from "@/components/dispute-management/dispute-columns";
import {
  DISPUTE_MANAGEMENT_LAYOUT_ID,
  DISPUTE_MANAGEMENT_LAYOUT_TRANSITION,
} from "@/components/dispute-management/dispute-view-transition";
import { cn } from "@/lib/utils";

const PREVIEW_ROW_CAP = 5;

export function DisputeManagementQuickModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (open) router.prefetch("/dispute-management");
  }, [open, router]);

  const stats = {
    open: disputes.filter((d) => d.status === "open").length,
    under_review: disputes.filter((d) => d.status === "under_review").length,
    won: disputes.filter((d) => d.status === "won").length,
    total: disputes.length,
  };
  const merchantActionCount = disputes.filter((d) => d.resolutionOwner === "merchant").length;

  const previewRows = disputes.slice(0, PREVIEW_ROW_CAP);

  const layoutId = reduceMotion ? undefined : DISPUTE_MANAGEMENT_LAYOUT_ID;
  const layoutTransition = reduceMotion ? { duration: 0 } : DISPUTE_MANAGEMENT_LAYOUT_TRANSITION;

  const goToFullPage = () => {
    router.push("/dispute-management");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        overlayClassName="data-[state=open]:duration-100 data-[state=closed]:duration-100"
        className={cn(
          "left-1/2 top-1/2 max-h-[min(92dvh,880px)] max-w-none -translate-x-1/2 -translate-y-1/2 gap-0 overflow-hidden p-0",
          "w-[calc(100%-1.5rem)] max-w-[min(100%,56rem)] !overflow-hidden",
          "flex flex-col",
          "transition-[opacity,transform] duration-100 ease-out",
          "data-[state=open]:duration-100 data-[state=closed]:duration-100"
        )}
      >
        <DialogTitle className="sr-only">Dispute management preview</DialogTitle>

        <motion.div
          layoutId={layoutId}
          transition={layoutTransition}
          initial={false}
          className="flex min-h-0 flex-1 flex-col space-y-5 overflow-y-auto px-5 pb-4 pt-5 sm:px-6 sm:pt-6"
        >
          <PageHeader title="Disputes" subtitle="Preview — open full page for filters and bulk actions" />

          <DisputeStatsGrid stats={stats} isLoading={false} />

          <DisputeActionBanner stats={stats} merchantActionCount={merchantActionCount} />

          <DisputePrimaryTabs activeFilter="all" readOnly />

          <DataTable<DisputeRow>
            columns={DISPUTE_TABLE_DATA_COLUMNS}
            data={previewRows}
            isLoading={false}
            pageSize={PREVIEW_ROW_CAP}
            emptyTitle="No disputes"
            emptyDescription="No disputes to show"
            rowKey={(row) => row.id}
            density="comfortable"
            tableLayout="auto"
            headerStyle="minimal"
            footerSummary="count"
          />

          <p className="text-center text-[12px] text-muted-foreground sm:text-left">
            Preview of {previewRows.length} of {stats.total} disputes. Open the full page for the
            complete table, filters, and actions.
          </p>
        </motion.div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
          <Button
            type="button"
            variant="outline"
            size="md"
            rightIcon={<Maximize2 className="h-4 w-4" strokeWidth={2} aria-hidden />}
            onClick={goToFullPage}
          >
            Open full page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
