"use client";

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

      {/* scrollbar space always reserved; thumb invisible until hovered — prevents layout-shift flicker */}
      <div
        className="overflow-x-auto [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent [&:hover::-webkit-scrollbar-thumb]:bg-gray-300"
        style={{ scrollbarWidth: "thin", scrollbarColor: "transparent transparent" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.scrollbarColor = "#d1d5db transparent"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.scrollbarColor = "transparent transparent"; }}
      >
        <table style={{ tableLayout: "fixed", width: "100%" }}>
          <colgroup>
            {columns.map((col) => (
              <col key={col.key} style={{ width: col.minWidth ?? 120 }} />
            ))}
            <col style={{ width: 130 }} />
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

      {/* ── Footer / Pagination ───────────────────────────────── */}
      {!isLoading && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 gap-4 flex-wrap"
          style={{ borderTop: "1px solid #f0f0f0" }}>

          {/* Row count */}
          <span className="text-[12px] text-gray-400 tabular-nums">
            Showing{" "}
            <span className="text-gray-600 font-medium">
              {Math.min((page - 1) * pageSize + 1, data.length)}–{Math.min(page * pageSize, data.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-600 font-medium">{data.length.toLocaleString()}</span>{" "}
            {data.length !== 1 ? "results" : "result"}
          </span>

          {/* Page buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Number pills */}
              {getPageRange(page, totalPages).map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`}
                    className="w-7 h-7 flex items-center justify-center text-[12px] text-gray-400 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={cn(
                      "w-7 h-7 rounded-md text-[12px] font-medium transition-colors tabular-nums flex items-center justify-center",
                      page === p
                        ? "bg-[#0061E3] text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    )}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
