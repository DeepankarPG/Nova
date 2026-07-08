"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Column } from "@/components/ui/data-table";
import {
  cn,
  flagEmojiFromCountryCode,
  formatRespondByDateTime,
  formatShortCalendarDay,
  truncate,
} from "@/lib/utils";
import { disputes } from "@/lib/mock-data";

export type DisputeRow = (typeof disputes)[number];

function amountLocale(currency: string): string {
  const c = currency.toUpperCase();
  if (c === "USD") return "en-US";
  if (c === "GBP") return "en-GB";
  if (c === "EUR") return "en-IE";
  return "en-IN";
}

function DisputeAmountCell({ row }: { row: DisputeRow }) {
  const cur = row.currency.toUpperCase();
  const formatted = new Intl.NumberFormat(amountLocale(row.currency), {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(row.amount);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[13px] font-semibold tabular-nums tracking-tight text-foreground">
        {formatted}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {cur}
      </span>
    </div>
  );
}

function CardBrandMark({ brand }: { brand: NonNullable<DisputeRow["cardBrand"]> }) {
  const meta =
    brand === "visa"
      ? { label: "Visa", className: "bg-[#1434CB]/12 text-[#1434CB]" }
      : brand === "mastercard"
        ? { label: "MC", className: "bg-orange-500/15 text-orange-900 dark:text-orange-100" }
        : { label: "Amex", className: "bg-sky-600/12 text-sky-900 dark:text-sky-100" };
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-[2.25rem] shrink-0 items-center justify-center rounded px-1 text-[8px] font-bold uppercase leading-none tracking-wide",
        meta.className
      )}
    >
      {meta.label}
    </span>
  );
}

function SourceTypeCell({ row }: { row: DisputeRow }) {
  if (!row.cardBrand || !row.cardLast4) {
    return <span className="text-muted-foreground">—</span>;
  }
  const flag = row.countryCode ? flagEmojiFromCountryCode(row.countryCode) : "";
  return (
    <div className="flex max-w-[200px] items-center gap-2">
      <CardBrandMark brand={row.cardBrand} />
      <span className="truncate font-mono text-[13px] text-foreground tabular-nums">
        •••• {row.cardLast4}
      </span>
      {flag ? (
        <span className="text-base leading-none" title={row.countryCode}>
          {flag}
        </span>
      ) : null}
    </div>
  );
}

export function DisputeSelectAllHeader({
  rowIds,
  selected,
  onToggleAll,
}: {
  rowIds: string[];
  selected: Set<string>;
  onToggleAll: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const n = rowIds.filter((id) => selected.has(id)).length;
  const all = rowIds.length > 0 && n === rowIds.length;
  const some = n > 0 && !all;

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = some;
  }, [some]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      checked={all}
      onChange={(e) => onToggleAll(e.target.checked)}
      aria-label="Select all disputes in the current list"
    />
  );
}

/** Data columns only (no row selection) — e.g. quick modal preview. */
export const DISPUTE_TABLE_DATA_COLUMNS: Column<DisputeRow>[] = [
    {
      key: "amount",
      header: "Amount",
      width: "11%",
      minWidth: 120,
      render: (row) => <DisputeAmountCell row={row} />,
    },
    {
      key: "status",
      header: "Status",
      width: "18%",
      minWidth: 168,
      render: (row) => (
        <StatusBadge status={row.badgeStatus ?? row.status} size="sm" />
      ),
    },
    {
      key: "reason",
      header: "Reason",
      width: "22%",
      minWidth: 160,
      render: (row) => (
        <span className="block max-w-[320px] truncate text-[13px] text-foreground/90">{row.reason}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      width: "16%",
      minWidth: 140,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-foreground">{row.customerName}</p>
          <p className="truncate text-[12px] text-muted-foreground">{truncate(row.email, 28)}</p>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source type",
      width: "16%",
      minWidth: 168,
      render: (row) => <SourceTypeCell row={row} />,
    },
    {
      key: "createdAt",
      header: "Disputed on",
      width: "11%",
      minWidth: 104,
      render: (row) => (
        <span className="text-[13px] text-muted-foreground tabular-nums">
          {formatShortCalendarDay(row.createdAt)}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Respond by",
      width: "14%",
      minWidth: 120,
      render: (row) => {
        const due = new Date(row.dueDate);
        const now = new Date();
        const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isUrgent = daysLeft <= 3 && row.status === "open";
        return (
          <div
            className={cn(
              "text-[13px] tabular-nums",
              isUrgent ? "font-semibold text-red-600 dark:text-red-400" : "text-muted-foreground"
            )}
          >
            {formatRespondByDateTime(row.dueDate)}
          </div>
        );
      },
    },
    {
      key: "resolutionOwner",
      header: "Resolution",
      width: "12%",
      minWidth: 110,
      render: (row) => {
        const owner = row.resolutionOwner;
        if (!owner) return <span className="text-muted-foreground text-[13px]">—</span>;
        const config = {
          merchant: {
            label: "Action needed",
            className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-700/40",
          },
          customer: {
            label: "Awaiting customer",
            className: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-700/40",
          },
          bank: {
            label: "Under review",
            className: "bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700/40",
          },
        }[owner];
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap",
              config.className
            )}
            title={owner === "merchant" ? "You need to submit evidence or take action" : owner === "customer" ? "Waiting on the customer to respond" : "The bank is reviewing this dispute"}
          >
            {config.label}
          </span>
        );
      },
    },
];

export function buildDisputeTableColumns(opts: {
  selectHeader: ReactNode;
  selected: Set<string>;
  onToggleRow: (id: string) => void;
}): Column<DisputeRow>[] {
  const { selectHeader, selected, onToggleRow } = opts;

  return [
    {
      key: "select",
      header: selectHeader,
      width: "52px",
      minWidth: 52,
      cellClassName: "w-[52px]",
      render: (row) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          checked={selected.has(row.id)}
          onChange={() => onToggleRow(row.id)}
          aria-label={`Select dispute ${row.id}`}
        />
      ),
    },
    ...DISPUTE_TABLE_DATA_COLUMNS,
  ];
}
