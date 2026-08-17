"use client";

import { useRef, useState } from "react";
import { GripVertical, Package, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import {
  invoiceLineDiscountTotal,
  invoiceLineTaxTotal,
  invoiceOverallDiscount,
  invoiceSubtotal,
  invoiceTotal,
  lineItemQuantityLabel,
  lineItemTotal,
  type InvoiceLineItemDraft,
} from "@/lib/invoice-form-types";
import { AddLineItemDialog } from "./AddLineItemDialog";
import { CurrencyChip } from "./CurrencyChip";

function currencySymbol(currency: string) {
  return currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
}

function formatAmount(currency: string, amount: number) {
  const sym = currencySymbol(currency);
  return `${sym}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function LineItemsSection({
  lineItems,
  onAdd,
  onEdit,
  onRemove,
  onReorder,
  onQuantityChange,
  onRateChange,
  currency,
  onCurrencyChange,
  discountValue,
  onDiscountValueChange,
  discountType,
  onDiscountTypeChange,
}: {
  lineItems: InvoiceLineItemDraft[];
  onAdd: (item: Omit<InvoiceLineItemDraft, "id">) => void;
  onEdit: (id: string, item: Omit<InvoiceLineItemDraft, "id">) => void;
  onRemove: (id: string) => void;
  onReorder: (nextOrder: InvoiceLineItemDraft[]) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onRateChange: (id: string, unitPrice: number) => void;
  currency: string;
  onCurrencyChange: (v: string) => void;
  discountValue: string;
  onDiscountValueChange: (v: string) => void;
  discountType: "percent" | "flat";
  onDiscountTypeChange: (v: "percent" | "flat") => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [discountOpen, setDiscountOpen] = useState(discountValue.length > 0);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const editingItem = editingId ? lineItems.find((i) => i.id === editingId) ?? null : null;
  const hasHours = lineItems.some((i) => i.itemType === "hours");
  const qtyHeader = hasHours ? "Hours" : "Qty";

  const subtotal = invoiceSubtotal(lineItems);
  const lineDiscounts = invoiceLineDiscountTotal(lineItems);
  const overallDiscount = invoiceOverallDiscount(lineItems, discountValue, discountType);
  const lineTax = invoiceLineTaxTotal(lineItems);
  const total = invoiceTotal(lineItems, discountValue, discountType);

  const openAdd = () => {
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setDialogOpen(true);
  };

  const handleDialogAdd = (item: Omit<InvoiceLineItemDraft, "id">) => {
    if (editingId) onEdit(editingId, item);
    else onAdd(item);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-4 w-4" />
          </div>
          <h2 className="text-[15px] font-semibold text-foreground">What you sold</h2>
        </div>
        <CurrencyChip value={currency} onChange={onCurrencyChange} />
      </div>

      {lineItems.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <div
            className="grid items-center gap-x-3 border-b border-border bg-muted/40 py-2 pl-3 pr-2"
            style={{ gridTemplateColumns: "20px 1fr 64px 108px 84px 56px" }}
          >
            <span />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </span>
            <span className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {qtyHeader}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Rate ({currencySymbol(currency)})
            </span>
            <span className="text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Total
            </span>
            <span />
          </div>

          <div>
            {lineItems.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => {
                  dragItem.current = idx;
                }}
                onDragEnter={() => {
                  dragOver.current = idx;
                }}
                onDragEnd={() => {
                  if (dragItem.current === null || dragOver.current === null) return;
                  const reordered = [...lineItems];
                  const [moved] = reordered.splice(dragItem.current, 1);
                  reordered.splice(dragOver.current, 0, moved!);
                  dragItem.current = null;
                  dragOver.current = null;
                  onReorder(reordered);
                }}
                onDragOver={(e) => e.preventDefault()}
                className="group grid cursor-grab items-center gap-x-3 py-2.5 pl-3 pr-2 transition-colors hover:bg-muted/30 active:cursor-grabbing"
                style={{
                  gridTemplateColumns: "20px 1fr 64px 108px 84px 56px",
                  borderBottom: idx < lineItems.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground" />

                <div className="min-w-0 pr-2">
                  <p className="truncate text-[13px] font-medium text-foreground">{item.name || "Untitled item"}</p>
                  {(item.description || item.hsn || item.taxLabel !== "None" || item.discountValue) && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {item.description && (
                        <span className="max-w-[140px] truncate rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                      {item.hsn && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                          HSN {item.hsn}
                        </span>
                      )}
                      {item.taxLabel !== "None" && (
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                          {item.taxLabel}
                        </span>
                      )}
                      {item.discountValue && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          {item.discountType === "flat"
                            ? `${currencySymbol(currency)}${item.discountValue} off`
                            : `${item.discountValue}% off`}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <input
                  type="number"
                  min={1}
                  disabled={item.itemType === "amount"}
                  value={lineItemQuantityLabel(item)}
                  onChange={(e) => onQuantityChange(item.id, Math.max(1, Number(e.target.value) || 1))}
                  className="h-7 w-full rounded-md border border-border bg-card px-2 text-center text-[13px] focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40"
                />

                <input
                  type="text"
                  inputMode="decimal"
                  value={item.unitPrice}
                  onChange={(e) => onRateChange(item.id, Math.max(0, Number(e.target.value) || 0))}
                  className="h-7 w-full rounded-md border border-border bg-card px-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />

                <span className="text-right text-[13px] font-semibold tabular-nums text-foreground">
                  {formatAmount(currency, lineItemTotal(item))}
                </span>

                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(item.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
                    aria-label="Edit line item"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    disabled={lineItems.length <= 1}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0"
                    aria-label="Remove line item"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            className="grid items-center gap-x-3 border-t border-border py-2.5 pl-3 pr-2"
            style={{ gridTemplateColumns: "20px 1fr 64px 108px 84px 56px" }}
          >
            <span />
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-1.5 text-left text-[13px] font-medium text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add line item
            </button>
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="space-y-2 border-t border-border bg-muted/20 px-3 py-4">
            <div className="flex items-center justify-between text-[13px] text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatAmount(currency, subtotal)}</span>
            </div>

            {lineDiscounts > 0 && (
              <div className="flex items-center justify-between text-[13px] text-muted-foreground">
                <span>Line item discounts</span>
                <span className="tabular-nums">-{formatAmount(currency, lineDiscounts)}</span>
              </div>
            )}

            {discountOpen ? (
              <div className="flex items-center justify-between gap-2 text-[13px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Discount</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex overflow-hidden rounded-lg border border-border">
                    {(["percent", "flat"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onDiscountTypeChange(t)}
                        className={
                          discountType === t
                            ? "bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground"
                            : "bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted/50"
                        }
                      >
                        {t === "percent" ? "%" : currencySymbol(currency)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={discountValue}
                    onChange={(e) => onDiscountValueChange(e.target.value)}
                    placeholder="0"
                    className="h-7 w-20 rounded-lg border border-border bg-card px-2 text-right text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountOpen(false);
                      onDiscountValueChange("");
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Remove invoice-level discount"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="tabular-nums text-muted-foreground">
                  {overallDiscount > 0 ? `-${formatAmount(currency, overallDiscount)}` : "-"}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDiscountOpen(true)}
                className="flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
              >
                <Tag className="h-3 w-3" />
                Add discount
              </button>
            )}

            {lineTax > 0 && (
              <div className="flex items-center justify-between text-[13px] text-muted-foreground">
                <span>Tax</span>
                <span className="tabular-nums">{formatAmount(currency, lineTax)}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-2 text-[15px] font-semibold text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatAmount(currency, total)}</span>
            </div>
          </div>
        </div>
      )}

      {lineItems.length === 0 && (
        <button
          type="button"
          onClick={openAdd}
          className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Add line item
        </button>
      )}

      <AddLineItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currency={currency}
        onAdd={handleDialogAdd}
        editingItem={editingItem}
      />
    </div>
  );
}
