"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Copy, MoreHorizontal, MousePointerClick, Pencil, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatDate } from "@/lib/utils";
import { paymentButtonsSeed, type PaymentButtonSummary } from "@/lib/mock-data/payment-button-create";

function currencySymbol(currency: string) {
  return currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
}

const STATUS_TABS: { id: "all" | PaymentButtonSummary["status"]; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "paused", label: "Paused" },
  { id: "draft", label: "Draft" },
];

const STATUS_OPTIONS: { id: PaymentButtonSummary["status"]; label: string }[] = [
  { id: "live", label: "Live" },
  { id: "paused", label: "Paused" },
  { id: "draft", label: "Draft" },
];

type AmountRange = { min: string; max: string };

/** Dashed "+ Label" chip that becomes a filled chip with a clear (x) button once a value is set. */
function FilterChip({
  label,
  active,
  onClear,
  children,
}: {
  label: string;
  active: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors",
            active
              ? "border-primary/30 bg-primary/5 text-primary"
              : "border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
          )}
        >
          {!active && <Plus className="h-3 w-3" />}
          {label}
          {active && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="ml-0.5 rounded-full p-0.5 hover:bg-primary/10"
              aria-label={`Clear ${label} filter`}
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        {children}
      </PopoverContent>
    </Popover>
  );
}

export default function PaymentButtonsListPage() {
  const router = useRouter();
  const [buttons] = useState<PaymentButtonSummary[]>(paymentButtonsSeed);
  const [activeTab, setActiveTab] = useState<"all" | PaymentButtonSummary["status"]>("all");
  const [search, setSearch] = useState("");
  const [statusMulti, setStatusMulti] = useState<Set<PaymentButtonSummary["status"]>>(new Set());
  const [amountRange, setAmountRange] = useState<AmountRange>({ min: "", max: "" });

  const goToDetail = (row: PaymentButtonSummary) => router.push(`/payment-products/payment-button/${row.id}`);

  const toggleSetValue = <T,>(set: Set<T>, value: T, setter: (next: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const filteredButtons = useMemo(() => {
    return buttons.filter((row) => {
      if (activeTab !== "all" && row.status !== activeTab) return false;
      if (search && !row.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusMulti.size > 0 && !statusMulti.has(row.status)) return false;
      if (row.amountType === "fixed") {
        const amount = Number(row.fixedAmount || 0);
        if (amountRange.min && amount < Number(amountRange.min)) return false;
        if (amountRange.max && amount > Number(amountRange.max)) return false;
      } else if (amountRange.min || amountRange.max) {
        return false;
      }
      return true;
    });
  }, [buttons, activeTab, search, statusMulti, amountRange]);

  const statusActive = statusMulti.size > 0;
  const amountActive = !!amountRange.min || !!amountRange.max;

  const columns: Column<PaymentButtonSummary>[] = [
    {
      key: "title",
      header: "Button",
      width: "22%",
      cellClassName: "pl-5",
      render: (row) => (
        <button type="button" onClick={() => goToDetail(row)} className="flex w-full items-center gap-2.5 text-left">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5" />
          </div>
          <span className="truncate text-[13px] font-semibold text-foreground">{row.title}</span>
        </button>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: "12%",
      cellClassName: "pl-1",
      render: (row) => (
        <div onClick={() => goToDetail(row)} className="cursor-pointer tabular-nums">
          {row.amountType === "fixed" ? (
            <>
              {currencySymbol(row.currency)}
              {Number(row.fixedAmount || 0).toLocaleString("en-IN")}
            </>
          ) : (
            <span className="text-foreground/70">Customer decides</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "10%",
      render: (row) => (
        <div onClick={() => goToDetail(row)} className="cursor-pointer">
          <StatusBadge status={row.status} size="sm" />
        </div>
      ),
    },
    {
      key: "publicId",
      header: "Button ID",
      width: "18%",
      render: (row) => (
        <span className="group/id flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 truncate font-mono text-[12.5px] text-muted-foreground">{row.publicId}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(row.publicId).catch(() => {});
              toast.success("Button ID copied");
            }}
            aria-label="Copy button ID"
            className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/id:opacity-100"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </span>
      ),
    },
    {
      key: "successfulPayments",
      header: "Successful payments",
      width: "13%",
      render: (row) => (
        <div onClick={() => goToDetail(row)} className="cursor-pointer tabular-nums">
          {row.status === "draft" ? (
            <span className="text-muted-foreground">Not available</span>
          ) : (
            row.totalPayments.toLocaleString("en-IN")
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created on",
      width: "12%",
      render: (row) => (
        <div onClick={() => goToDetail(row)} className="cursor-pointer">
          {formatDate(row.createdAt)}
        </div>
      ),
    },
    {
      key: "copyCode",
      header: "",
      width: "11%",
      cellClassName: "pl-2 pr-1",
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard
              .writeText(
                `<form><script src="https://checkout.payglocal.in/v1/payment-button.js" data-payment_button_id="${row.publicId}" async></script></form>`
              )
              .catch(() => {});
            toast.success("Embed code copied");
          }}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground opacity-0 shadow-sm transition-opacity duration-150 hover:border-muted-foreground/50 group-hover:opacity-100"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy code
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "64px",
      cellClassName: "pl-4 pr-5",
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Button actions"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.message("Editing is coming soon")}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success(`"${row.title}" disabled`)}>
                <Ban className="h-3.5 w-3.5" />
                Disable
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        title="Payment Button"
        subtitle="Embeddable buttons that collect payments from any website"
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => router.push("/payment-products/payment-button/create")}
          >
            Create payment button
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-5 border-b border-border px-5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative py-3.5 text-[13.5px] font-medium transition-colors",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {activeTab === tab.id && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-primary" />}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 px-5 py-3.5">
          <div className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by button title"
              className="w-52 bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <FilterChip
            label={amountActive ? `${amountRange.min || "0"} - ${amountRange.max || "∞"}` : "Amount"}
            active={amountActive}
            onClear={() => setAmountRange({ min: "", max: "" })}
          >
            <p className="mb-2 text-[12px] font-semibold text-foreground">Amount range</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={amountRange.min}
                onChange={(e) => setAmountRange((r) => ({ ...r, min: e.target.value }))}
                className="h-9 text-[13px]"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={amountRange.max}
                onChange={(e) => setAmountRange((r) => ({ ...r, max: e.target.value }))}
                className="h-9 text-[13px]"
              />
            </div>
          </FilterChip>

          <FilterChip
            label={statusActive ? `Status (${statusMulti.size})` : "Status"}
            active={statusActive}
            onClear={() => setStatusMulti(new Set())}
          >
            <p className="mb-2 text-[12px] font-semibold text-foreground">Status</p>
            <div className="space-y-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-[13px] text-foreground">
                  <input
                    type="checkbox"
                    checked={statusMulti.has(opt.id)}
                    onChange={() => toggleSetValue(statusMulti, opt.id, setStatusMulti)}
                    className="rounded border-border"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </FilterChip>
        </div>

        <div className="px-5 pb-5">
          <DataTable
            columns={columns}
            data={filteredButtons}
            rowKey={(row) => row.id}
            density="compact"
            headerStyle="minimal"
            theadClassName="bg-muted"
            snug
            className="border-0 shadow-none rounded-none"
            emptyTitle="No payment buttons yet"
            emptyDescription="Create a payment button to start collecting payments from your website."
          />
        </div>
      </div>
    </div>
  );
}
