"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { DownloadStatus, ReportDownload } from "@/lib/mock-data/reports";

const STATUS_META: Record<DownloadStatus, { label: string; className: string }> = {
  success: { label: "Ready", className: "bg-emerald-500/10 text-emerald-800 border-emerald-600/10 dark:bg-emerald-500/35 dark:text-emerald-50 dark:border-emerald-400/70" },
  pending: { label: "Processing", className: "bg-amber-500/10 text-amber-900 border-amber-600/10 dark:bg-amber-500/35 dark:text-amber-50 dark:border-amber-400/70" },
  failed: { label: "Failed", className: "bg-red-500/10 text-red-800 border-red-600/10 dark:bg-red-500/35 dark:text-red-50 dark:border-red-400/70" },
  no_data: { label: "No data", className: "bg-muted text-muted-foreground border-border/40" },
};

const FILTERS: { id: "all" | DownloadStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "success", label: "Ready" },
  { id: "pending", label: "Processing" },
  { id: "failed", label: "Failed" },
];

export function ReportsDownloadsTab({ downloads }: { downloads: ReportDownload[] }) {
  const [filter, setFilter] = useState<"all" | DownloadStatus>("all");

  const filtered = useMemo(
    () => (filter === "all" ? downloads : downloads.filter((d) => d.status === filter)),
    [downloads, filter]
  );

  const columns: Column<ReportDownload>[] = [
    {
      key: "name",
      header: "Report",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-foreground">{row.reportName}</p>
          <p className="truncate text-[11.5px] text-muted-foreground">{row.durationLabel}</p>
        </div>
      ),
    },
    {
      key: "format",
      header: "Format",
      width: "90px",
      render: (row) => <span className="text-[12.5px] font-medium uppercase text-muted-foreground">{row.format}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <span className="truncate text-[12.5px] text-muted-foreground">{row.email ?? "—"}</span>
      ),
    },
    {
      key: "generatedAt",
      header: "Generated on",
      width: "160px",
      render: (row) => (
        <span className="whitespace-nowrap text-[12.5px] text-muted-foreground">
          {formatDate(row.generatedAt, { year: "numeric", month: "short", day: "2-digit" })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      render: (row) => {
        const meta = STATUS_META[row.status];
        return (
          <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", meta.className)}>
            {meta.label}
          </span>
        );
      },
    },
    {
      key: "download",
      header: "",
      width: "56px",
      align: "right",
      render: (row) =>
        row.status === "success" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => toast.success("Download started", { description: `${row.reportName}.${row.format}` })}
            title="Download file"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              filter === f.id ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        pageSize={8}
        emptyTitle="No downloads yet"
        emptyDescription="Reports you generate will show up here with their status."
      />
    </div>
  );
}
