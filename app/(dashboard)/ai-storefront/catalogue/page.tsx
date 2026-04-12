"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ProductFormDialog, type ProductFormValues } from "@/components/ai-storefront/ProductFormDialog";
import {
  createAiStorefrontProduct,
  deleteAiStorefrontProduct,
  fetchAiStorefrontProducts,
  patchAiStorefrontProduct,
} from "@/lib/ai-storefront/client";
import type { StorefrontProduct } from "@/lib/ai-storefront/types";
import { toast } from "sonner";

function formatInr(paise: number, currency: string): string {
  if (currency !== "INR") {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(paise / 100);
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default function AiStorefrontCataloguePage() {
  const [rows, setRows] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StorefrontProduct | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await fetchAiStorefrontProducts();
      setRows(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (row: StorefrontProduct) => {
    setEditing(row);
    setDialogOpen(true);
  };

  const onSubmitForm = async (values: ProductFormValues) => {
    setSubmitting(true);
    try {
      if (editing) {
        const u = await patchAiStorefrontProduct(editing.id, values);
        setRows((prev) => prev.map((r) => (r.id === u.id ? u : r)));
        toast.success("Product updated");
      } else {
        const c = await createAiStorefrontProduct(values);
        setRows((prev) => [...prev, c]);
        toast.success("Product created");
      }
      setDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (row: StorefrontProduct) => {
    if (!globalThis.confirm(`Delete ${row.name}?`)) return;
    try {
      await deleteAiStorefrontProduct(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      toast.success("Product removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const columns: Column<StorefrontProduct>[] = useMemo(
    () => [
      {
        key: "image",
        header: "",
        width: "64px",
        cellClassName: "align-middle",
        render: (r) => (
          <div className="flex justify-center py-0.5">
            {r.imageUrl ? (
              <div className="relative aspect-square h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={r.imageUrl}
                  alt={r.name}
                  fill
                  className="object-cover"
                  sizes="44px"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="flex aspect-square size-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/60 text-muted-foreground"
                aria-hidden
              >
                <ImageOff className="size-4" strokeWidth={1.75} />
              </div>
            )}
          </div>
        ),
      },
      {
        key: "sku",
        header: "SKU",
        render: (r) => <span className="font-mono text-[13px]">{r.sku}</span>,
      },
      {
        key: "name",
        header: "Product",
        render: (r) => (
          <div>
            <div className="font-medium text-foreground">{r.name}</div>
            <div className="line-clamp-1 text-xs text-muted-foreground">{r.description}</div>
          </div>
        ),
      },
      {
        key: "price",
        header: "Price",
        align: "right",
        render: (r) => (
          <span className="tabular-nums">{formatInr(r.priceInPaise, r.currency)}</span>
        ),
      },
      {
        key: "inventory",
        header: "Inventory",
        render: (r) => <span className="text-sm text-muted-foreground">{r.inventoryLabel}</span>,
      },
      {
        key: "actions",
        header: "",
        width: "120px",
        align: "right",
        render: (r) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => openEdit(r)}
              aria-label={`Edit ${r.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-destructive hover:text-destructive"
              onClick={() => void onDelete(r)}
              aria-label={`Delete ${r.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Catalogue"
        subtitle="Products and pricing exposed to AI assistants via your storefront tools."
        actions={
          <Button size="sm" onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Add product
          </Button>
        }
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive">
          {error}
          <Button variant="ghost" size="sm" className="ml-2 h-8" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <DataTable<StorefrontProduct>
          columns={columns}
          data={rows}
          isLoading={loading}
          rowKey={(r) => r.id}
          emptyTitle="No products yet"
          emptyDescription="Add a product or connect an inventory feed from the Inventory page."
          pageSize={10}
        />
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={onSubmitForm}
        submitting={submitting}
      />
    </div>
  );
}
