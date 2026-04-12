"use client";

import type { ReactNode } from "react";
import { cn } from "./utils";
import { TableRowSkeleton } from "./skeleton";
import { EmptyState } from "./empty-state";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export type DataTableDensity = "default" | "comfortable" | "compact";
export type DataTableHeaderStyle = "surface" | "minimal";
export type DataTableFooterSummary = "range" | "count";

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
  header: ReactNode;
  /** Table column width, e.g. `48px`, `18%`, `minmax(12rem,1fr)` (fixed layout) */
  width?: string;
  minWidth?: number;
  maxWidth?: number;
  align?: "left" | "right" | "center";
  /** Extra classes on `<th>` / `<td>` (e.g. wider horizontal padding per column) */
  cellClassName?: string;
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
  /** Row / cell vertical rhythm and horizontal gutters */
  density?: DataTableDensity;
  /** `auto` lets columns breathe; `fixed` uses `colgroup` hints */
  tableLayout?: "auto" | "fixed";
  theadClassName?: string;
  headerStyle?: DataTableHeaderStyle;
  /** Footer: paginated range vs simple `n items` */
  footerSummary?: DataTableFooterSummary;
  /** Noun after the count when `footerSummary="count"` (default singular / plural `item` / `items`). */
  footerCountLabels?: { singular: string; plural: string };
  /** With `density="compact"`, use tighter cell gutters (`pl-1.5 pr-2.5` vs `px-3`). Footer keeps normal horizontal padding. */
  snug?: boolean;
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
  density = "default",
  tableLayout = "fixed",
  theadClassName,
  headerStyle = "surface",
  footerSummary = "range",
  footerCountLabels = { singular: "item", plural: "items" },
  snug = false,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);
  const paginated = data.slice((page - 1) * pageSize, page * pageSize);

  const comfortable = density === "comfortable";
  const compact = density === "compact";
  const compactCellPad = compact
    ? snug
      ? "pl-1.5 pr-2.5 py-2.5"
      : "px-3 py-2.5"
    : "px-4 py-3.5";
  const cellPad = comfortable ? "px-5 py-4" : compactCellPad;
  const headPad = comfortable ? "px-5 py-4" : compactCellPad;
  /** Footer is outside the grid; do not reuse snug cell `pl-0`-style gutters here. */
  const footerPad = comfortable
    ? "px-5 py-4"
    : compact
      ? "px-4 py-2.5"
      : "px-4 py-3.5";
  const headText = comfortable
    ? "text-[12px] font-medium text-muted-foreground tracking-normal"
    : compact
      ? "text-[11px] font-semibold text-muted-foreground"
      : "text-[11px] font-semibold text-foreground/75 dark:text-foreground/85";
  const rowCtaColWidth = compact ? 108 : 130;

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
        <table
          className={cn(tableLayout === "auto" && "min-w-[920px]")}
          style={{ tableLayout, width: "100%" }}
        >
          {tableLayout === "fixed" && (
            <colgroup>
              {columns.map((col) => (
                <col
                  key={col.key}
                  style={{
                    width: col.width ?? (col.minWidth != null ? `${col.minWidth}px` : undefined),
                    minWidth: col.minWidth,
                    maxWidth: col.maxWidth,
                  }}
                />
              ))}
              {rowCta ? <col style={{ width: rowCtaColWidth }} /> : null}
            </colgroup>
          )}

          <thead
            className={cn(
              headerStyle === "surface" && "bg-muted/35",
              headerStyle === "minimal" && "bg-transparent",
              theadClassName
            )}
          >
            <tr
              className={cn(
                "border-b",
                headerStyle === "surface" ? "border-border" : "border-border/70"
              )}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    headPad,
                    headText,
                    "whitespace-nowrap align-middle",
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left",
                    col.cellClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
              {rowCta ? <th className={cn(headPad, "w-[1%]")} aria-hidden /> : null}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRowSkeleton
                  key={i}
                  cols={columns.length + (rowCta ? 1 : 0)}
                  density={density}
                  snug={snug}
                />
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowCta ? 1 : 0)}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={rowKey(row)}
                  className={cn(
                    "group transition-colors duration-150 border-b border-border/60 last:border-b-0",
                    comfortable && "min-h-[56px]",
                    compact && "min-h-[44px]",
                    "hover:bg-muted/40 dark:hover:bg-muted/25",
                    rowCta &&
                      "hover:shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:hover:shadow-none"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        cellPad,
                        "align-middle",
                        comfortable
                          ? cn(
                              "text-[13px] leading-snug",
                              col.key !== "reason" && "whitespace-nowrap"
                            )
                          : compact
                            ? cn(
                                "text-[13px] leading-tight",
                                col.key !== "reason" && "whitespace-nowrap",
                                "overflow-hidden"
                              )
                            : "whitespace-nowrap overflow-hidden",
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "text-left",
                        col.cellClassName
                      )}
                    >
                      {col.render(row, i)}
                    </td>
                  ))}

                  {rowCta ? (
                    <td
                      className={cn(
                        cellPad,
                        "text-left align-middle whitespace-nowrap",
                        comfortable
                          ? "pl-2 pr-5"
                          : compact
                            ? snug
                              ? "pl-1.5 pr-2"
                              : "pl-1.5 pr-3"
                            : "pl-3 pr-4"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => rowCta.onClick?.(row)}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center font-medium text-foreground bg-card rounded-lg border border-border hover:border-muted-foreground/50 whitespace-nowrap shadow-sm",
                          compact
                            ? "px-2.5 py-1 text-[11px]"
                            : "px-3 py-1.5 text-[12px]"
                        )}
                      >
                        {rowCta.label}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && data.length > 0 && (
        <div
          className={cn(
            "flex items-center gap-4 flex-wrap border-t border-border",
            footerPad,
            footerSummary === "count" && totalPages <= 1
              ? "justify-start"
              : "justify-between"
          )}
        >
          {footerSummary === "count" ? (
            <span className="text-[12px] text-muted-foreground tabular-nums">
              <span className="font-medium text-foreground">{data.length}</span>{" "}
              {data.length === 1
                ? footerCountLabels.singular
                : footerCountLabels.plural}
            </span>
          ) : (
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
          )}

          {(footerSummary === "range" || footerSummary === "count") &&
            totalPages > 1 && (
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
