"use client";

import { useState } from "react";
import { Package, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { renderPageDescription } from "@/lib/payment-page-description-renderer";
import type { PaymentPageProduct } from "@/lib/payment-page-form-types";
import { AddProductDialog } from "./AddProductDialog";
import { ProductThumbnail } from "./ProductThumbnail";

export function WhatYoureSellingSection({
  product,
  onChange,
  onRemove,
}: {
  product: PaymentPageProduct | null;
  onChange: (product: PaymentPageProduct) => void;
  onRemove: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSave = (p: Omit<PaymentPageProduct, "id"> & { id?: string }) => {
    onChange({ id: p.id ?? `prod_${Math.random().toString(36).slice(2, 9)}`, name: p.name, description: p.description, imageUrl: p.imageUrl });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-4 w-4" />
          </div>
          <h2 className="text-[15px] font-semibold text-foreground">What are you selling</h2>
        </div>
        {product && (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" />
            Change
          </button>
        )}
      </div>

      {product ? (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
          <ProductThumbnail imageUrl={product.imageUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-medium text-foreground">{product.name}</p>
            {product.description && (
              <div className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground">
                {renderPageDescription(product.description)}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Remove product"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-6 text-center">
          <p className="text-[12.5px] text-muted-foreground">Add what you&apos;re selling on this page.</p>
          <Button variant="secondary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setDialogOpen(true)}>
            Add a product
          </Button>
        </div>
      )}

      <AddProductDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} initialProduct={product} />
    </div>
  );
}
