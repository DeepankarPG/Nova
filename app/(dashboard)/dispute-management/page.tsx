"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { disputes } from "@/lib/mock-data";
import {
  DisputeAdvancedFiltersRow,
  DisputePrimaryTabs,
  type DisputePrimaryTabKey,
} from "@/components/dispute-management/DisputeLayoutBlocks";
import {
  buildDisputeTableColumns,
  DisputeSelectAllHeader,
} from "@/components/dispute-management/dispute-columns";
import {
  DISPUTE_MANAGEMENT_LAYOUT_ID,
  DISPUTE_MANAGEMENT_LAYOUT_TRANSITION,
} from "@/components/dispute-management/dispute-view-transition";

export default function DisputeManagementPage() {
  const reduceMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<DisputePrimaryTabKey>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return disputes;
    return disputes.filter((d) => d.status === activeFilter);
  }, [activeFilter]);

  const rowIds = useMemo(() => filtered.map((r) => r.id), [filtered]);

  const onToggleAll = useCallback(
    (checked: boolean) => {
      setSelected((prev) => {
        const next = new Set(prev);
        rowIds.forEach((id) => (checked ? next.add(id) : next.delete(id)));
        return next;
      });
    },
    [rowIds]
  );

  const onToggleRow = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectHeader = useMemo(
    () => (
      <DisputeSelectAllHeader rowIds={rowIds} selected={selected} onToggleAll={onToggleAll} />
    ),
    [rowIds, selected, onToggleAll]
  );

  const columns = useMemo(
    () =>
      buildDisputeTableColumns({
        selectHeader,
        selected,
        onToggleRow,
      }),
    [selectHeader, selected, onToggleRow]
  );

  const layoutId = reduceMotion ? undefined : DISPUTE_MANAGEMENT_LAYOUT_ID;
  const layoutTransition = reduceMotion ? { duration: 0 } : DISPUTE_MANAGEMENT_LAYOUT_TRANSITION;

  return (
    <motion.div
      layoutId={layoutId}
      transition={layoutTransition}
      initial={false}
      className="mx-auto max-w-[1400px] space-y-6"
    >
      <PageHeader title="Disputes" />

      <DisputePrimaryTabs activeFilter={activeFilter} onChange={setActiveFilter} />

      <DisputeAdvancedFiltersRow />

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        skeletonRows={5}
        emptyTitle="No disputes"
        emptyDescription="You have no disputes matching the selected filter"
        rowKey={(row) => row.id}
        pageSize={25}
        density="comfortable"
        tableLayout="auto"
        headerStyle="minimal"
        footerSummary="count"
      />
    </motion.div>
  );
}
