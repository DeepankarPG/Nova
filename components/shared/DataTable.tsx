"use client";

import { cn } from "@/lib/utils";
import { TableRowSkeleton } from "./ShimmerSkeleton";
import { EmptyState } from "./EmptyState";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export type Column<T> = {
  key:       string;
  header:    string;
  width?:    string;
  minWidth?: number;
  maxWidth?: number;
  align?:    "left" | "right" | "center";
  render:    (row: T, index: number) => React.ReactNode;
};

interface DataTableProps<T> {
  columns:          Column<T>[];
  data:             T[];
  isLoading?:       boolean;
  skeletonRows?:    number;
  emptyTitle?:      string;
  emptyDescription?: string;
  pageSize?:        number;
  className?:       string;
  rowKey:           (row: T) => string;
  /** Optional hover CTA shown on the right of every row */
  rowCta?: {
    label:    string;
    onClick?: (row: T) => void;
  };
}

const HEADER_BG = "#f0f2f5";

export function DataTable<T>({
  columns, data, isLoading = false, skeletonRows = 6,
  emptyTitle = "No data yet", emptyDescription, pageSize = 10,
  className, rowKey, rowCta,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);
  const paginated  = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={cn("bg-white rounded-xl overflow-hidden", className)}
      style={{ border: "1px solid #e5e7eb" }}>

      <div className="overflow-x-auto">
        <table style={{ tableLayout: "fixed", width: "100%" }}>
          <colgroup>
            {columns.map((col) => (
              <col key={col.key} style={{ width: col.minWidth ?? 120 }} />
            ))}
            {/* spacer absorbs remaining width; holds the CTA when present */}
            <col style={{ width: "100%" }} />
          </colgroup>

          <thead>
            <tr style={{ background: HEADER_BG, borderBottom: "1px solid #e8eaed" }}>
              {columns.map((col) => (
                <th key={col.key}
                  className={cn(
                    "px-3.5 py-2.5 text-[11px] font-semibold text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis",
                    col.align === "right"  ? "text-right"
                    : col.align === "center" ? "text-center" : "text-left",
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
              <tr><td colSpan={columns.length + 1}>
                <EmptyState title={emptyTitle} description={emptyDescription} />
              </td></tr>
            ) : (
              paginated.map((row, i) => (
                <tr key={rowKey(row)}
                  className="group transition-all duration-150"
                  style={{ borderBottom: i < paginated.length - 1 ? "1px solid #f0f0f0" : "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f5f7ff";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)";
                    e.currentTarget.style.zIndex = "1";
                    e.currentTarget.style.position = "relative";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.zIndex = "auto";
                  }}
                >
                  {columns.map((col) => (
                    <td key={col.key}
                      className={cn(
                        "px-3.5 py-2.5 whitespace-nowrap overflow-hidden",
                        col.align === "right"  ? "text-right"
                        : col.align === "center" ? "text-center" : "text-left"
                      )}
                    >
                      {col.render(row, i)}
                    </td>
                  ))}

                  {/* Spacer cell — CTA sits immediately after the last data column */}
                  <td className="pl-3 pr-4 text-left align-middle whitespace-nowrap">
                    {rowCta && (
                      <button
                        onClick={() => rowCta.onClick?.(row)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center px-3 py-1.5 text-[12px] font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:text-gray-900 whitespace-nowrap"
                        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
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

      {/* ── Pagination ────────────────────────────────────────── */}
      {!isLoading && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5"
          style={{ borderTop: "1px solid #f0f0f0" }}>
          <span className="text-xs text-gray-400">
            {data.length.toLocaleString()} result{data.length !== 1 ? "s" : ""}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-gray-500 px-1.5 tabular-nums">{page}/{totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
