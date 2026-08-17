"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportFormat } from "@/lib/mock-data/reports";

const SHEET_COLUMN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function ExcelSheetPreview({
  columns,
  rows,
  fileLabel,
}: {
  columns: string[];
  rows: string[][];
  fileLabel: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-[11.5px] font-mono">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-20 w-16 border border-border bg-muted text-muted-foreground" />
              {columns.map((_, i) => (
                <th
                  key={i}
                  className="sticky top-0 z-10 whitespace-nowrap border border-border bg-muted px-3 py-1 text-center font-semibold text-muted-foreground"
                >
                  {SHEET_COLUMN_LETTERS[i] ?? `Z${i}`}
                </th>
              ))}
            </tr>
            <tr>
              <th className="sticky left-0 z-10 w-16 border border-border bg-muted px-2 py-1 text-center text-muted-foreground" />
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap border border-border bg-primary/10 px-3 py-1.5 text-left font-semibold text-foreground"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="sticky left-0 z-10 w-16 border border-border bg-muted px-2 py-1.5 text-center text-muted-foreground">
                  {i + 1}
                </td>
                {row.map((cell, j) => (
                  <td key={j} className="whitespace-nowrap border border-border px-3 py-1.5 text-foreground/85">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex shrink-0 items-center gap-1 border-t border-border bg-muted/50 px-2 py-1">
        <span className="flex items-center gap-1 rounded-t-md border border-b-0 border-border bg-card px-2.5 py-1 text-[10.5px] font-medium text-foreground">
          <FileSpreadsheet className="h-3 w-3 text-emerald-600" />
          {fileLabel}
        </span>
      </div>
    </div>
  );
}

function PdfDocumentPreview({
  columns,
  rows,
  reportName,
  durationLabel,
}: {
  columns: string[];
  rows: string[][];
  reportName: string;
  durationLabel?: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center overflow-auto bg-muted/60 p-4">
      <div className="w-full max-w-[46rem] shrink-0 rounded-sm bg-white p-6 text-black shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
        <div className="mb-4 flex items-center gap-2.5 border-b border-gray-300 pb-3.5">
          <FileText className="h-5 w-5 text-gray-500" />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-gray-900">{reportName}</p>
            {durationLabel && <p className="text-[11px] text-gray-500">{durationLabel}</p>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11.5px]">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap border-b-2 border-gray-800 px-2.5 py-1.5 text-left font-semibold text-gray-800"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : undefined}>
                  {row.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap border-b border-gray-200 px-2.5 py-1.5 text-gray-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 border-t border-gray-200 pt-2.5 text-center text-[10px] text-gray-400">Page 1 of 1</p>
      </div>
    </div>
  );
}

/** macOS-style window chrome wrapping a format-aware preview render. */
export function DeviceFramedPreview({
  format,
  columns,
  rows,
  reportName,
  durationLabel,
  className,
}: {
  format: ReportFormat;
  columns: string[];
  rows: string[][];
  reportName: string;
  durationLabel?: string;
  className?: string;
}) {
  const fileExt = format === "xlsx" ? "xlsx" : format;
  const fileLabel = `${reportName.replace(/\s+/g, "_").toLowerCase() || "report"}.${fileExt}`;

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card shadow-md", className)}>
      {/* Window title bar */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/70 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="mx-auto truncate text-[11px] font-medium text-muted-foreground">{fileLabel}</span>
      </div>
      <div className="h-64">
        {format === "pdf" ? (
          <PdfDocumentPreview columns={columns} rows={rows} reportName={reportName} durationLabel={durationLabel} />
        ) : (
          <ExcelSheetPreview columns={columns} rows={rows} fileLabel={fileLabel} />
        )}
      </div>
    </div>
  );
}
