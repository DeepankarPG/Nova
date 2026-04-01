"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TableRowSkeleton } from "./ShimmerSkeleton";
import { EmptyState } from "./EmptyState";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

/** Builds the visible page numbers including ellipsis markers */
function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  const lo = Math.max(2, current - 1);
  const hi = Math.min(total - 1, current + 1);
  for (let p = lo; p <= hi; p++) pages.push(p);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

export type Column<T> = {
  key: string;
  header: string;
  width?: string;
  minWidth?: number;
  maxWidth?: number;
  align?: "left" | "right" | "center";
  render: (row: T, index: number) => ReactNode;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  className?: string;
  rowKey: (row: T) => string;
  /** Optional hover CTA shown on the right of every row */
  rowCta?: {
    label: string;
    onClick?: (row: T) => void;
  };
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 6,
  emptyTitle = "No data yet",
  emptyDescription,
  pageSize = 10,
  className,
  rowKey,
  rowCta,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);
  const paginated = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-xl overflow-hidden border border-border",
        className
      )}
    >
      {/* scrollbar space always reserved; thumb subtle on hover */}
      <div
        className={cn(
          "overflow-x-auto",
          "[&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent",
          "hover:[&::-webkit-scrollbar-thumb]:bg-border dark:hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/35"
        )}
        style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
      >
        <table style={{ tableLayout: "fixed", width: "100%" }}>
          <colgroup>
            {columns.map((col) => (
              <col key={col.key} style={{ width: col.minWidth ?? 120 }} />
            ))}
            <col style={{ width: 130 }} />
          </colgroup>

          <thead>
            <tr className="bg-muted border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-3.5 py-2.5 text-[11px] font-semibold text-foreground/75 dark:text-foreground/85 whitespace-nowrap overflow-hidden text-ellipsis",
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left"
                  )}
                >
                  {col.header}
                </th>
              ))}
              <th />
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRowSkeleton key={i} cols={columns.length + 1} />
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={rowKey(row)}
                  className={cn(
                    "group transition-all duration-150 border-b border-border/70 last:border-b-0",
                    "hover:bg-primary/5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)] dark:hover:bg-primary/10 dark:hover:shadow-none",
                    "hover:relative hover:z-10"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-3.5 py-2.5 whitespace-nowrap overflow-hidden",
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "text-left"
                      )}
                    >
                      {col.render(row, i)}
                    </td>
                  ))}

                  <td className="pl-3 pr-4 text-left align-middle whitespace-nowrap">
                    {rowCta && (
                      <button
                        onClick={() => rowCta.onClick?.(row)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center px-3 py-1.5 text-[12px] font-medium text-foreground bg-card rounded-lg border border-border hover:border-muted-foreground/50 whitespace-nowrap shadow-sm"
                      >
                        {rowCta.label}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 gap-4 flex-wrap border-t border-border">
          <span className="text-[12px] text-muted-foreground tabular-nums">
            Showing{" "}
            <span className="text-foreground font-medium">
              {Math.min((page - 1) * pageSize + 1, data.length)}–
              {Math.min(page * pageSize, data.length)}
            </span>{" "}
            of{" "}
            <span className="text-foreground font-medium">
              {data.length.toLocaleString()}
            </span>{" "}
            {data.length !== 1 ? "results" : "result"}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {getPageRange(page, totalPages).map((p, idx) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-7 h-7 flex items-center justify-center text-[12px] text-muted-foreground select-none"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={cn(
                      "w-7 h-7 rounded-md text-[12px] font-medium transition-colors tabular-nums flex items-center justify-center",
                      page === p
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
