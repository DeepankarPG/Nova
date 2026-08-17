"use client";

import { useMemo, useState } from "react";
import { Copy, History, Package, Pencil, Plus, RefreshCw, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SkuTypeBadge } from "@/components/sku-management/SkuTypeBadge";
import { skuItemsSeed, type SkuItem } from "@/lib/mock-data/sku-management";
import { currencyFlagIso2 } from "@/lib/mock-data/invoice-create";

function priceSymbol(currency: string) {
  return currency === "USD" || currency === "NZD" || currency === "AUD" || currency === "CAD"
    ? "$"
    : currency === "EUR"
      ? "€"
      : currency === "GBP"
        ? "£"
        : "₹";
}

function CurrencyFlag({ currency }: { currency: string }) {
  const iso2 = currencyFlagIso2[currency];
  return (
    <span className="flex items-center gap-1.5">
      {iso2 && (
        <img
          src={`https://flagcdn.com/w40/${iso2}.png`}
          alt=""
          className="h-3.5 w-5 shrink-0 rounded-sm object-cover"
        />
      )}
      {currency}
    </span>
  );
}

function PriceCell({ amount, currency }: { amount: number | null; currency: string }) {
  if (amount === null) {
    return <span className="text-muted-foreground">-</span>;
  }
  return (
    <span className="flex items-baseline gap-1">
      <span className="font-semibold text-foreground">
        {priceSymbol(currency)}
        {amount.toLocaleString("en-IN")}
      </span>
      <span className="text-[11px] text-muted-foreground">{currency}</span>
    </span>
  );
}

export default function SkuManagementPage() {
  const [items] = useState<SkuItem[]>(skuItemsSeed);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, query]);

  const columns: Column<SkuItem>[] = [
    {
      key: "name",
      header: "Name",
      width: "20%",
      render: (row) => (
        <span className="flex items-center gap-2.5">
          {row.imageUrl ? (
            <img src={row.imageUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="h-4 w-4" />
            </div>
          )}
          <span className="truncate font-medium text-foreground">{row.name}</span>
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: "9%",
      render: (row) => <SkuTypeBadge type={row.type} />,
    },
    {
      key: "hsnSac",
      header: "HSN/SAC",
      width: "10%",
      render: (row) => <span className="text-muted-foreground">{row.hsnSac}</span>,
    },
    {
      key: "unitPrice",
      header: "Unit price",
      width: "13%",
      render: (row) => <PriceCell amount={row.unitPrice} currency={row.currency} />,
    },
    {
      key: "costPrice",
      header: "Cost price",
      width: "13%",
      render: (row) => <PriceCell amount={row.costPrice} currency={row.currency} />,
    },
    {
      key: "currency",
      header: "Currency",
      width: "10%",
      render: (row) => <CurrencyFlag currency={row.currency} />,
    },
    {
      key: "description",
      header: "Description",
      width: "17%",
      render: (row) => (
        <span className="truncate text-muted-foreground">{row.description || "-"}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "8%",
      cellClassName: "pl-4 pr-5",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            aria-label="Edit"
            onClick={() => toast.message("Editing is coming soon")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Duplicate"
            onClick={() => toast.success(`"${row.name}" duplicated`)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Delete"
            onClick={() => toast.success(`"${row.name}" deleted`)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        className="mb-4"
        title={
          <span className="flex items-center gap-2">
            SKU management
            <button
              type="button"
              aria-label="Refresh"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </span>
        }
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Name"
                className="w-56 pl-9"
              />
            </div>
            <Button variant="outline" size="sm" leftIcon={<History className="h-3.5 w-3.5" />}>
              Import from history
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Upload className="h-3.5 w-3.5" />}>
              Import from file
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Add item
            </Button>
          </>
        }
      />

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="p-5">
          <DataTable
            columns={columns}
            data={filtered}
            rowKey={(row) => row.id}
            density="compact"
            headerStyle="minimal"
            pageSize={10}
            footerSummary="count"
            footerCountLabels={{ singular: "result", plural: "results" }}
            emptyTitle="No items yet"
            emptyDescription="Add an item to start building your catalog."
          />
        </div>
      </div>
    </div>
  );
}
