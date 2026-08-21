"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { taxOptions } from "@/lib/mock-data/invoice-create";
import type { InvoiceLineItemDraft, ItemType } from "@/lib/invoice-form-types";

const TYPE_OPTIONS: { id: ItemType; label: string }[] = [
  { id: "amount", label: "Amount only" },
  { id: "quantity", label: "Quantity" },
  { id: "hours", label: "Hours" },
];

function currencySymbol(currency: string) {
  return currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
}

export function AddLineItemDialog({
  open,
  onOpenChange,
  currency,
  onAdd,
  editingItem,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onAdd: (item: Omit<InvoiceLineItemDraft, "id">) => void;
  editingItem?: InvoiceLineItemDraft | null;
}) {
  const sym = currencySymbol(currency);

  const [itemType, setItemType] = useState<ItemType>(editingItem?.itemType ?? "quantity");
  const [name, setName] = useState(editingItem?.name ?? "");
  const [rate, setRate] = useState(editingItem ? String(editingItem.unitPrice) : "");
  const [qty, setQty] = useState(editingItem ? String(editingItem.quantity) : "1");
  const [hsn, setHsn] = useState(editingItem?.hsn ?? "");
  const [desc, setDesc] = useState(editingItem?.description ?? "");
  const [showDesc, setShowDesc] = useState(!!editingItem?.description);
  const [showTax, setShowTax] = useState(!!editingItem && editingItem.taxLabel !== "None");
  const [tax, setTax] = useState(editingItem?.taxLabel ?? "None");
  const [showDiscount, setShowDiscount] = useState(!!editingItem?.discountValue);
  const [discount, setDiscount] = useState(editingItem?.discountValue ?? "");
  const [discountType, setDiscountType] = useState<"percent" | "flat">(editingItem?.discountType ?? "percent");

  const reset = () => {
    setItemType("quantity");
    setName("");
    setRate("");
    setQty("1");
    setHsn("");
    setDesc("");
    setShowDesc(false);
    setShowTax(false);
    setTax("None");
    setShowDiscount(false);
    setDiscount("");
    setDiscountType("percent");
  };

  const valid = name.trim().length > 0 && Number(rate) >= 0;

  const buildItem = (): Omit<InvoiceLineItemDraft, "id"> => ({
    name: name.trim(),
    description: showDesc ? desc.trim() : "",
    itemType,
    quantity: itemType === "hours" ? Number(qty) || 1 : Number(qty) || 1,
    unitPrice: Number(rate) || 0,
    hsn: hsn.trim(),
    taxLabel: showTax ? tax : "None",
    discountValue: showDiscount ? discount.trim() : "",
    discountType,
  });

  const handleAdd = () => {
    if (!valid) return;
    onAdd(buildItem());
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogTitle>{editingItem ? "Edit line item" : "Add line item"}</DialogTitle>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-5">
            {TYPE_OPTIONS.map((opt) => (
              <label key={opt.id} className="flex cursor-pointer select-none items-center gap-2">
                <span
                  onClick={() => setItemType(opt.id)}
                  className={cn(
                    "flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    itemType === opt.id ? "border-foreground" : "border-border"
                  )}
                >
                  {itemType === opt.id && <span className="h-2.5 w-2.5 rounded-full bg-foreground" />}
                </span>
                <span onClick={() => setItemType(opt.id)} className="text-[13.5px] font-medium text-foreground">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          <div>
            <p className="mb-2 text-[13.5px] font-semibold text-foreground">
              Item name <span className="text-destructive">*</span>
            </p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Logo design, Consulting fee..."
              className="h-11 w-full rounded-xl border border-border bg-card px-3.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className={cn("grid gap-3", itemType === "amount" ? "grid-cols-1" : "grid-cols-2")}>
            <div>
              <p className="mb-2 text-[13.5px] font-semibold text-foreground">
                Rate <span className="text-destructive">*</span>
              </p>
              <div className="flex h-11 items-center overflow-hidden rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring/30">
                <span className="flex-shrink-0 pl-3.5 pr-1.5 text-[14px] text-muted-foreground">{sym}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="0.00"
                  className="h-full min-w-0 flex-1 bg-transparent pr-3.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>
            {itemType === "quantity" && (
              <div>
                <p className="mb-2 text-[13.5px] font-semibold text-foreground">Quantity</p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-card px-3.5 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            )}
            {itemType === "hours" && (
              <div>
                <p className="mb-2 text-[13.5px] font-semibold text-foreground">Hours worked</p>
                <input
                  type="text"
                  inputMode="decimal"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="e.g. 4.5"
                  className="h-11 w-full rounded-xl border border-border bg-card px-3.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-[13.5px] font-semibold text-foreground">
              SAC/HSN <span className="text-[12px] font-normal text-muted-foreground">(optional)</span>
            </p>
            <input
              value={hsn}
              onChange={(e) => setHsn(e.target.value)}
              placeholder="e.g. 998314, 998316"
              className="h-11 w-full rounded-xl border border-border bg-card px-3.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="space-y-1">
            <div className={cn(showDiscount && "border-b border-border")}>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-foreground">Add discount</p>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    Optional
                  </span>
                </div>
                <Switch checked={showDiscount} onCheckedChange={setShowDiscount} aria-label="Toggle discount" />
              </div>
              {showDiscount && (
                <div className="pb-3">
                  <div className="flex h-10 items-center overflow-hidden rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring/30">
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as "percent" | "flat")}
                      className="h-full flex-shrink-0 border-r border-border bg-muted/40 px-3 text-[13px] font-semibold text-foreground focus:outline-none"
                    >
                      <option value="percent">%</option>
                      <option value="flat">Flat</option>
                    </select>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder={discountType === "percent" ? "e.g. 10" : "e.g. 500"}
                      className="h-full flex-1 bg-transparent px-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <span className="flex-shrink-0 pr-3.5 text-[13px] text-muted-foreground">
                      {discountType === "percent" ? "% off" : sym}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className={cn(showTax && "border-b border-border")}>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-foreground">Add tax</p>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    Optional
                  </span>
                </div>
                <Switch checked={showTax} onCheckedChange={setShowTax} aria-label="Toggle tax" />
              </div>
              {showTax && (
                <div className="flex flex-wrap items-center gap-2 pb-3">
                  {taxOptions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTax(t)}
                      className={cn(
                        "h-9 rounded-full border px-4 text-[13px] font-medium transition-colors",
                        tax === t
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/50"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-foreground">Add description</p>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    Optional
                  </span>
                </div>
                <Switch checked={showDesc} onCheckedChange={setShowDesc} aria-label="Toggle description" />
              </div>
              {showDesc && (
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Shown on invoice under item name"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-card px-3.5 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2.5 border-t border-border pt-4">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!valid}
            className="h-11 w-full rounded-xl bg-primary text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
          >
            {editingItem ? "Save changes" : "Add item"}
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            className="h-10 w-full rounded-xl border border-border bg-card text-[13px] font-medium text-foreground hover:bg-muted/50"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
