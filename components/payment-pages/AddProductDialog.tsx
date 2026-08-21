"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ImagePlus, Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImageCropFields } from "./ImageCropFields";
import { PageDescriptionEditor } from "./PageDescriptionEditor";
import { ProductThumbnail } from "./ProductThumbnail";
import { recentProducts } from "@/lib/mock-data/payment-page-create";
import type { PaymentPageProduct } from "@/lib/payment-page-form-types";

type Draft = {
  name: string;
  description: string;
  imageUrl: string | null;
};

export function AddProductDialog({
  open,
  onOpenChange,
  onSave,
  initialProduct,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Omit<PaymentPageProduct, "id"> & { id?: string }) => void;
  initialProduct?: PaymentPageProduct | null;
}) {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(
    initialProduct ? { name: initialProduct.name, description: initialProduct.description, imageUrl: initialProduct.imageUrl } : null
  );
  const [draftId, setDraftId] = useState<string | undefined>(initialProduct?.id);
  const [cropping, setCropping] = useState(false);

  const reset = () => {
    setQuery("");
    setDraft(initialProduct ? { name: initialProduct.name, description: initialProduct.description, imageUrl: initialProduct.imageUrl } : null);
    setDraftId(initialProduct?.id);
    setCropping(false);
  };

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return recentProducts.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  const selectExisting = (p: PaymentPageProduct) => {
    setDraft({ name: p.name, description: p.description, imageUrl: p.imageUrl });
    setDraftId(p.id);
  };

  const selectNew = () => {
    setDraft({ name: query.trim(), description: "", imageUrl: null });
    setDraftId(undefined);
  };

  const valid = !!draft && draft.name.trim().length > 0;

  const handleSave = () => {
    if (!draft || !valid) return;
    onSave({ id: draftId, name: draft.name.trim(), description: draft.description, imageUrl: draft.imageUrl });
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
        <DialogTitle>{cropping ? "Add a cover image" : draft ? "Product details" : "Add a product"}</DialogTitle>

        {cropping ? (
          <ImageCropFields
            aspectRatio={16 / 9}
            onCancel={() => setCropping(false)}
            onUpload={(file) => {
              setDraft((d) => (d ? { ...d, imageUrl: URL.createObjectURL(file) } : d));
              setCropping(false);
            }}
          />
        ) : !draft ? (
          <div className="mt-4 space-y-1.5">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3.5 focus-within:ring-2 focus-within:ring-ring/30">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search or add a product..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-full w-full min-w-0 bg-transparent text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            {query.trim() ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <button
                  type="button"
                  onClick={selectNew}
                  className="flex w-full items-center gap-2 bg-primary px-3.5 py-2.5 text-left text-[13.5px] font-medium text-primary-foreground hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add &quot;{query.trim()}&quot;
                </button>
                {matches.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectExisting(p)}
                    className="flex w-full items-center gap-3 border-t border-border px-3.5 py-2.5 text-left hover:bg-muted/40"
                  >
                    <ProductThumbnail imageUrl={p.imageUrl} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-foreground">{p.name}</span>
                      <span className="block truncate text-[11.5px] text-muted-foreground">{p.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : recentProducts.length > 0 ? (
              <div>
                <p className="px-1 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Recent
                </p>
                <div className="overflow-hidden rounded-xl border border-border">
                  {recentProducts.slice(0, 4).map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectExisting(p)}
                      className={
                        i > 0
                          ? "flex w-full items-center gap-3 border-t border-border px-3.5 py-2.5 text-left hover:bg-muted/40"
                          : "flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-muted/40"
                      }
                    >
                      <ProductThumbnail imageUrl={p.imageUrl} />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-foreground">{p.name}</span>
                        <span className="block truncate text-[11.5px] text-muted-foreground">{p.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="px-1 pt-2 text-[12.5px] text-muted-foreground">
                No saved products yet. Start typing a name to add one.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="flex items-center gap-1 text-[12.5px] font-medium text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to search
            </button>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-foreground">Page title</label>
              <input
                autoFocus
                type="text"
                placeholder="Enter page title here"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="h-11 w-full rounded-xl border border-border bg-card px-3.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-foreground">Cover image</label>
              {draft.imageUrl ? (
                <div className="group relative h-28 w-full overflow-hidden rounded-lg border border-border">
                  <img src={draft.imageUrl} alt="Cover" className="h-full w-full object-cover" />
                  <div className="absolute right-2 top-2 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setCropping(true)}
                      className="rounded-md bg-card/90 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, imageUrl: null })}
                      className="rounded-md bg-card/90 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCropping(true)}
                  className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-muted/20 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <ImagePlus className="h-4 w-4" />
                  <span className="text-[12px] font-medium">Add a cover image (optional)</span>
                </button>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-foreground">Page description</label>
              <PageDescriptionEditor
                value={draft.description}
                onChange={(description) => setDraft({ ...draft, description })}
              />
            </div>
          </div>
        )}

        {!cropping && (
          <div className={draft ? "mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4" : "mt-5 grid grid-cols-1 gap-3 border-t border-border pt-4"}>
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="h-11 rounded-xl border border-border bg-card text-[14px] font-semibold text-foreground hover:bg-muted/50"
            >
              Cancel
            </button>
            {draft && (
              <button
                type="button"
                onClick={handleSave}
                disabled={!valid}
                className="h-11 rounded-xl bg-primary text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
              >
                Save
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
