"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Search, Plus, X, Upload, ChevronDown, Check, Loader2,
  Pencil, Archive, ArchiveRestore, Trash2, Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─── Types ───────────────────────────────────────────────────────── */
type SkuType   = "Goods" | "Services";
type SkuStatus = "active" | "archived";
type SkuTab    = "all" | "goods" | "services" | "archived";

type SkuItem = {
  id:           string;
  name:         string;
  type:         SkuType;
  hsnSac:       string;
  currency:     string;
  sellingPrice: number;
  productCost:  number;
  description:  string;
  status:       SkuStatus;
};

/* ─── Mock data ───────────────────────────────────────────────────── */
const SKU_ITEMS: SkuItem[] = [
  { id: "sku_001", name: "Noise Cancelling Headphones", type: "Goods",    hsnSac: "85183000", currency: "USD", sellingPrice: 229.00,  productCost: 148.50, description: "Over-ear wireless headphones with active noise cancellation and 30h battery.",              status: "active" },
  { id: "sku_002", name: "Brand Strategy Consultation",  type: "Services", hsnSac: "998311",   currency: "GBP", sellingPrice: 1450.00, productCost: 620.00, description: "Two-week engagement covering positioning, messaging, and visual identity guidelines.",       status: "active" },
  { id: "sku_003", name: "Mechanical Keyboard 87-Key",   type: "Goods",    hsnSac: "84716060", currency: "EUR", sellingPrice: 89.90,   productCost: 47.25,  description: "Hot-swappable tenkeyless board with PBT keycaps and USB-C.",                                  status: "active" },
  { id: "sku_004", name: "Website Maintenance Retainer", type: "Services", hsnSac: "998314",   currency: "CAD", sellingPrice: 420.00,  productCost: 165.00, description: "Monthly retainer covering uptime monitoring, backups, and minor updates.",                    status: "active" },
  { id: "sku_005", name: "Cotton Crew Neck T-Shirt",     type: "Goods",    hsnSac: "61091000", currency: "AED", sellingPrice: 79.00,   productCost: 26.50,  description: "240 GSM combed cotton tee, pre-shrunk and garment dyed.",                                     status: "active" },
  { id: "sku_006", name: "Product Photography Session",  type: "Services", hsnSac: "998383",   currency: "AUD", sellingPrice: 640.00,  productCost: 285.00, description: "Half-day studio shoot, up to 25 catalog-ready images.",                                      status: "active" },
  { id: "sku_007", name: "Stainless Steel Water Bottle",  type: "Goods",    hsnSac: "96170019", currency: "SGD", sellingPrice: 38.90,   productCost: 12.40,  description: "750ml double-walled vacuum flask, keeps drinks cold for 24h.",                                 status: "active" },
];

const SKU_TABS: { id: SkuTab; label: string }[] = [
  { id: "all",      label: "All"      },
  { id: "goods",    label: "Goods"    },
  { id: "services", label: "Services" },
  { id: "archived", label: "Archived" },
];

const TYPE_CFG: Record<SkuType, { text: string; bg: string }> = {
  Goods:    { text: "text-blue-700 dark:text-blue-400",  bg: "bg-blue-50 dark:bg-blue-950/40"  },
  Services: { text: "text-muted-foreground",             bg: "bg-muted"                        },
};

const CURRENCY_OPTIONS = ["USD", "GBP", "EUR", "CAD", "AED", "AUD", "SGD", "INR"];

/* ─── Helpers ─────────────────────────────────────────────────────── */
function fmtAmount(amount: number, currency: string) {
  const sym: Record<string, string> = { USD: "$", GBP: "£", EUR: "€", CAD: "C$", AED: "AED ", AUD: "A$", SGD: "S$", INR: "₹" };
  const prefix = sym[currency] ?? "";
  return prefix + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── Shared small components ────────────────────────────────────── */
function ImagePlaceholder({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <div className={cn("rounded-lg bg-muted flex items-center justify-center shrink-0", className)}>
      <ImageIcon className={cn("text-muted-foreground/50", iconClassName)} strokeWidth={1.5} />
    </div>
  );
}

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <p className="text-[12px] font-semibold text-muted-foreground mb-1.5">
      {required && <span className="text-red-500 mr-0.5">*</span>}
      {text}
    </p>
  );
}

function FormField({
  label, value, onChange, onBlur, placeholder, error, type = "text", required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  onBlur?: () => void; placeholder?: string; error?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <FieldLabel text={label} required={required} />
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border bg-[#f6f8fa] px-3.5 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors",
          error ? "border-red-400" : "border-border"
        )}
      />
      {error && <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function SelectDropdown({ value, placeholder, options, onChange }: {
  value: string; placeholder: string; options: string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-3 text-left"
      >
        <span className={cn("text-[14px] truncate", value ? "text-foreground font-medium" : "text-muted-foreground/60")}>
          {value || placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} strokeWidth={2} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[95]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1.5 z-[96] rounded-xl border border-border bg-card shadow-lg overflow-hidden overflow-y-auto" style={{ maxHeight: 220 }}>
            {options.map((opt) => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-left text-[13px] transition-colors hover:bg-muted",
                  value === opt ? "text-primary font-semibold" : "text-foreground font-medium"
                )}
              >
                {opt}
                {value === opt && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Swipe-to-reveal row actions ────────────────────────────────── */
const SWIPE_WIDTH = 210; // 3 actions × 70px each

function SwipeCard({
  isOpen, onOpen, onClose, onTap, onEdit, onArchive, onDelete, isArchived, children,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onTap: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  isArchived: boolean;
  children: React.ReactNode;
}) {
  const [dragX,      setDragX]      = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX     = useRef(0);
  const startY     = useRef(0);
  const gestureDir = useRef<"h" | "v" | null>(null);
  const didMove    = useRef(false);

  const baseX      = isOpen ? -SWIPE_WIDTH : 0;
  const translateX = isDragging
    ? Math.max(-SWIPE_WIDTH, Math.min(0, baseX + dragX))
    : baseX;

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    startX.current     = e.clientX;
    startY.current     = e.clientY;
    gestureDir.current = null;
    didMove.current    = false;
    setDragX(0);
    setIsDragging(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (!gestureDir.current) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      didMove.current    = true;
      gestureDir.current = Math.abs(dx) >= Math.abs(dy) * 2 ? "h" : "v";
      if (gestureDir.current === "v") { setIsDragging(false); return; }
    }
    if (gestureDir.current === "h") setDragX(dx);
  }

  function onPointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    if (!didMove.current) {
      setDragX(0);
      if (isOpen) onClose(); else onTap();
      return;
    }
    const finalX = Math.max(-SWIPE_WIDTH, Math.min(0, baseX + dragX));
    setDragX(0);
    if (isOpen) {
      if (finalX > -(SWIPE_WIDTH * 0.5)) onClose(); else onOpen();
    } else {
      if (finalX < -(SWIPE_WIDTH * 0.3)) onOpen(); else onClose();
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons — fixed behind the row */}
      <div className="absolute right-0 top-0 bottom-0 flex" style={{ width: SWIPE_WIDTH }}>
        <button type="button" onClick={onEdit}
          className="flex flex-col items-center justify-center flex-1 bg-amber-500"
        >
          <Pencil className="h-[17px] w-[17px] text-white" strokeWidth={2} />
          <span className="text-[10.5px] font-medium text-white mt-1">Edit item</span>
        </button>
        <button type="button" onClick={onArchive}
          className="flex flex-col items-center justify-center flex-1 bg-slate-500"
        >
          {isArchived
            ? <ArchiveRestore className="h-[17px] w-[17px] text-white" strokeWidth={2} />
            : <Archive className="h-[17px] w-[17px] text-white" strokeWidth={2} />}
          <span className="text-[10.5px] font-medium text-white mt-1">{isArchived ? "Unarchive" : "Archive"}</span>
        </button>
        <button type="button" onClick={onDelete}
          className="flex flex-col items-center justify-center flex-1 bg-red-500"
        >
          <Trash2 className="h-[17px] w-[17px] text-white" strokeWidth={2} />
          <span className="text-[10.5px] font-medium text-white mt-1">Delete</span>
        </button>
      </div>

      {/* Row content — slides left on swipe */}
      <div
        className="relative z-[1] bg-card"
        style={{
          transform:   `translateX(${translateX}px)`,
          transition:  isDragging ? "none" : "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
          touchAction: "pan-y",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Delete confirmation — centered dialog ─────────────────────────── */
function DeleteConfirmModal({ item, onClose, onConfirm }: {
  item: SkuItem | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="delete-confirm-backdrop"
          className="absolute inset-0 z-[95] flex items-center justify-center px-6"
          style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.35)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[300px] rounded-2xl bg-card border border-border shadow-xl overflow-hidden"
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="px-5 pt-5 pb-4 text-center">
              <div className="h-11 w-11 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="h-5 w-5 text-red-600" strokeWidth={2} />
              </div>
              <p className="text-[15px] font-bold text-foreground leading-snug">Delete {item.name}?</p>
              <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-snug">
                This item will be permanently removed. This action cannot be undone.
              </p>
            </div>
            <div className="flex border-t border-border/60">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 text-[14px] font-semibold text-muted-foreground border-r border-border/60 active:bg-muted/40 transition-colors"
              >
                Cancel
              </button>
              <button type="button" onClick={onConfirm}
                className="flex-1 py-3 text-[14px] font-bold text-red-600 active:bg-muted/40 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Item Detail — bottom sheet ─────────────────────────────────── */
function SkuDetail({ item, onClose }: { item: SkuItem; onClose: () => void }) {
  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-11 flex flex-col bg-[#f6f8fa] overflow-hidden"
      style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%" }}
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="flex justify-center pt-2.5 pb-0.5 shrink-0">
        <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/60 bg-background shrink-0">
        <p className="text-[15px] font-bold text-foreground truncate">{item.name}</p>
        <button type="button" onClick={onClose}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-foreground shrink-0"
          aria-label="Close">
          <X className="h-[17px] w-[17px]" strokeWidth={2.25} />
        </button>
      </div>

      <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col gap-5 pt-4 pb-10">

          <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
            <ImagePlaceholder className="w-full h-[220px] rounded-none" iconClassName="h-12 w-12" />
            <div className="px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[17px] font-bold text-foreground leading-tight">{item.name}</p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    {item.type} · HSN/SAC {item.hsnSac}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-3.5">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Selling price</p>
                  <p className="text-[16px] font-bold text-foreground tabular-nums">{fmtAmount(item.sellingPrice, item.currency)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Product cost</p>
                  <p className="text-[16px] font-bold text-foreground tabular-nums">{fmtAmount(item.productCost, item.currency)}</p>
                </div>
              </div>
              <div className="mt-3.5 pt-3.5 border-t border-border/50">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1">Description</p>
                <p className="text-[13px] text-foreground leading-snug">{item.description}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

/* ─── Add / Edit item — bottom sheet form ───────────────────────── */
interface NewSkuInput {
  name:         string;
  type:         SkuType | null;
  hsnSac:       string;
  currency:     string;
  sellingPrice: string;
  productCost:  string;
  description:  string;
}

function emptyNewSku(): NewSkuInput {
  return { name: "", type: null, hsnSac: "", currency: "", sellingPrice: "", productCost: "", description: "" };
}

function itemToFormInput(item: SkuItem): NewSkuInput {
  return {
    name: item.name,
    type: item.type,
    hsnSac: item.hsnSac,
    currency: item.currency,
    sellingPrice: item.sellingPrice ? String(item.sellingPrice) : "",
    productCost: item.productCost ? String(item.productCost) : "",
    description: item.description,
  };
}

const REQUIRED_SKU_FIELDS = ["name", "type", "hsnSac", "currency", "sellingPrice"] as const;

function isSkuFieldMissing(form: NewSkuInput, field: string): boolean {
  switch (field) {
    case "name":         return !form.name.trim();
    case "type":         return form.type === null;
    case "hsnSac":       return !form.hsnSac.trim();
    case "currency":     return !form.currency.trim();
    case "sellingPrice": return !form.sellingPrice.trim();
    default: return false;
  }
}

function AddSkuSheet({ open, onClose, contained, editingItem, onSaved }: {
  open: boolean;
  onClose: () => void;
  contained: boolean;
  editingItem?: SkuItem | null;
  onSaved: (item: SkuItem) => void;
}) {
  const pos = contained ? "absolute" : "fixed";
  const isEdit = !!editingItem;
  const [form,    setForm]    = useState<NewSkuInput>(() => editingItem ? itemToFormInput(editingItem) : emptyNewSku());
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);

  const setField = <K extends keyof NewSkuInput>(f: K, v: NewSkuInput[K]) => setForm((prev) => ({ ...prev, [f]: v }));
  const markTouched = (f: string) => setTouched((t) => ({ ...t, [f]: true }));
  const isComplete = REQUIRED_SKU_FIELDS.every((f) => !isSkuFieldMissing(form, f));

  const resetAndClose = () => {
    if (sending) return;
    setForm(emptyNewSku());
    setTouched({});
    onClose();
  };

  function buildItem(): SkuItem {
    return {
      id: editingItem ? editingItem.id : `sku_${Date.now()}`,
      name: form.name.trim(),
      type: form.type ?? "Goods",
      hsnSac: form.hsnSac.trim(),
      currency: form.currency,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      productCost: parseFloat(form.productCost) || 0,
      description: form.description.trim(),
      status: editingItem ? editingItem.status : "active",
    };
  }

  function submit(keepOpen: boolean) {
    if (sending) return;
    if (!isComplete) {
      setTouched((t) => ({ ...t, ...Object.fromEntries(REQUIRED_SKU_FIELDS.map((f) => [f, true])) }));
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      const item = buildItem();
      onSaved(item);
      toast.success(isEdit ? `${item.name} updated` : `${item.name} added`);
      setForm(emptyNewSku());
      setTouched({});
      if (!keepOpen) onClose();
    }, 900);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={`${pos} inset-0 z-[90] bg-black/40 backdrop-blur-sm`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={resetAndClose}
          />
          <motion.div
            className={`${pos} inset-x-0 bottom-0 z-[91] flex flex-col bg-background overflow-hidden rounded-t-[24px]`}
            style={{ height: "92%" }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden>
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="flex items-start justify-between gap-3 px-4 pb-3 border-b border-border/40 shrink-0">
              <div className="min-w-0">
                <p className="text-[17px] font-bold text-foreground tracking-tight leading-tight">
                  {isEdit ? "Edit item" : "Add item"}
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {isEdit ? "Update this product or service." : "Add a product or service to your catalogue."}
                </p>
              </div>
              <button type="button" onClick={resetAndClose}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
              <div className="px-4 py-4 space-y-4">

                <FormField label="Product/Service Name" required value={form.name} onChange={(v) => setField("name", v)}
                  onBlur={() => markTouched("name")} placeholder="e.g. Consulting services"
                  error={touched.name && isSkuFieldMissing(form, "name") ? "Enter a product name" : undefined} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel text="Type" required />
                    <SelectDropdown value={form.type ?? ""} placeholder="Select type" options={["Goods", "Services"]}
                      onChange={(v) => setField("type", v as SkuType)} />
                    {touched.type && isSkuFieldMissing(form, "type") && (
                      <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">Required</p>
                    )}
                  </div>
                  <FormField label="HSN / SAC" required value={form.hsnSac} onChange={(v) => setField("hsnSac", v)}
                    onBlur={() => markTouched("hsnSac")} placeholder="e.g. 998311"
                    error={touched.hsnSac && isSkuFieldMissing(form, "hsnSac") ? "Required" : undefined} />
                </div>

                <div className="rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-3.5 space-y-3">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Pricing</p>
                  <div>
                    <FieldLabel text="Currency" required />
                    <SelectDropdown value={form.currency} placeholder="Select" options={CURRENCY_OPTIONS}
                      onChange={(v) => setField("currency", v)} />
                    {touched.currency && isSkuFieldMissing(form, "currency") && (
                      <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">Required</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Selling price" required type="number" value={form.sellingPrice} onChange={(v) => setField("sellingPrice", v)}
                      onBlur={() => markTouched("sellingPrice")} placeholder="0.00"
                      error={touched.sellingPrice && isSkuFieldMissing(form, "sellingPrice") ? "Required" : undefined} />
                    <FormField label="Product cost" type="number" value={form.productCost} onChange={(v) => setField("productCost", v)} placeholder="0.00" />
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1.5">Media</p>
                  <button type="button" onClick={() => toast("Image upload is coming soon")}
                    className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-primary/50 bg-primary/[0.03] active:bg-primary/[0.07] transition-colors"
                    style={{ height: 110 }}
                  >
                    <ImageIcon className="h-6 w-6 text-primary/70" strokeWidth={1.5} />
                    <p className="text-[13px] font-semibold text-primary">Tap to upload product images</p>
                    <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP or AVIF, up to 5.0 MB each</p>
                  </button>
                </div>

                <div>
                  <FieldLabel text="Description (Optional)" />
                  <textarea value={form.description} onChange={(e) => setField("description", e.target.value)}
                    placeholder="Optional notes that appear with the item on invoices" rows={3}
                    className="w-full rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors resize-none" />
                </div>

              </div>
            </div>

            <div
              className="shrink-0 bg-background border-t border-border/60 px-4 pt-3"
              style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
            >
              <div className="flex gap-2.5">
                {isEdit ? (
                  <button type="button" onClick={resetAndClose}
                    className="flex-1 h-12 rounded-2xl border border-border text-[14.5px] font-bold text-foreground active:scale-[0.98] transition-transform"
                  >
                    Cancel
                  </button>
                ) : (
                  <button type="button" onClick={() => submit(true)}
                    className="flex-1 h-12 rounded-2xl border border-border text-[14.5px] font-bold text-foreground active:scale-[0.98] transition-transform"
                  >
                    Save and add another
                  </button>
                )}
                <button type="button" aria-disabled={!isComplete} onClick={() => submit(false)}
                  className={cn(
                    "flex-1 h-12 rounded-2xl text-[14.5px] font-bold transition-all flex items-center justify-center gap-2",
                    isComplete ? "bg-primary text-white active:scale-[0.98]" : "bg-muted text-muted-foreground"
                  )}
                >
                  {sending
                    ? <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> {isEdit ? "Saving..." : "Adding..."}</>
                    : isEdit ? "Save changes" : "Add item"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Root — SKU Management landing screen ──────────────────────── */
export interface MobileSkuManagementProps {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
}

export function MobileSkuManagement({ open, onClose, contained = false }: MobileSkuManagementProps) {
  const pos = contained ? "absolute" : "fixed";
  const [items,          setItems]          = useState<SkuItem[]>(SKU_ITEMS);
  const [tab,            setTab]            = useState<SkuTab>("all");
  const [search,         setSearch]         = useState("");
  const [addOpen,        setAddOpen]        = useState(false);
  const [editingItem,    setEditingItem]    = useState<SkuItem | null>(null);
  const [addSheetToken,  setAddSheetToken]  = useState(0);
  const [swipedId,       setSwipedId]       = useState<string | null>(null);
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<SkuItem | null>(null);

  const openAddSheet = () => { setEditingItem(null); setAddSheetToken((t) => t + 1); setAddOpen(true); };
  const closeAddSheet = () => { setAddOpen(false); setEditingItem(null); };
  const requestEdit = (item: SkuItem) => { setSwipedId(null); setEditingItem(item); setAddSheetToken((t) => t + 1); setAddOpen(true); };
  const toggleArchive = (item: SkuItem) => {
    setSwipedId(null);
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: i.status === "archived" ? "active" : "archived" } : i));
    toast.success(item.status === "archived" ? `${item.name} restored` : `${item.name} archived`);
  };
  const requestDelete = (item: SkuItem) => { setSwipedId(null); setDeleteTarget(item); };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  };

  const q = search.trim().toLowerCase();
  const filtered = items
    .filter((i) => {
      if (tab === "all") return i.status === "active";
      if (tab === "goods") return i.status === "active" && i.type === "Goods";
      if (tab === "services") return i.status === "active" && i.type === "Services";
      return i.status === "archived";
    })
    .filter((i) => !q || i.hsnSac.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));

  const selected = selectedId ? (items.find((i) => i.id === selectedId) ?? null) : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="sku-management-screen"
          className={`${pos} inset-x-0 bottom-0 z-[80] flex flex-col bg-background overflow-hidden`}
          style={{ top: 44 }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 bg-background border-b border-border/40 shrink-0"
            style={{ paddingTop: 14, paddingBottom: 14 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-bold text-foreground tracking-tight leading-tight">SKU Management</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{items.filter((i) => i.status === "active").length} Items</p>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            <div className="mx-4 mt-4 mb-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

              {/* Header — title + Import + Add item */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 gap-2">
                <p className="text-[15px] font-bold text-foreground shrink-0">All Items</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toast("Import is coming soon")}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-[11.5px] font-medium text-muted-foreground active:bg-muted/40 transition-colors"
                  >
                    <Upload className="h-[12px] w-[12px]" strokeWidth={2} />
                    Import
                  </button>
                  <button
                    type="button"
                    onClick={openAddSheet}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-[11.5px] font-semibold active:scale-[0.97] transition-all shrink-0"
                  >
                    <Plus className="h-[13px] w-[13px]" strokeWidth={2.5} />
                    Add item
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="px-4 pb-3">
                <div className="flex items-center gap-2.5 bg-muted/50 rounded-xl px-3.5 py-2.5">
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by HSN/SAC"
                    className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch("")}>
                      <X className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mx-4 mb-3 bg-muted/60 p-1 rounded-xl overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                {SKU_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center py-1.5 text-[11.5px] font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 px-1",
                      tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">No items found</p>
                ) : filtered.map((item) => {
                  const typeCfg = TYPE_CFG[item.type];
                  const rowContent = (
                    <div className="w-full flex items-start gap-3 px-4 py-3.5 text-left active:bg-muted/30 transition-colors duration-100">
                      <ImagePlaceholder className="h-10 w-10" iconClassName="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-[12.5px] font-bold text-foreground leading-snug truncate">{item.name}</p>
                          <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold shrink-0", typeCfg.text, typeCfg.bg)}>
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono truncate">HSN/SAC {item.hsnSac}</p>
                        <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">{item.description}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[13px] font-bold text-foreground tabular-nums leading-snug whitespace-nowrap">
                          {fmtAmount(item.sellingPrice, item.currency)}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug whitespace-nowrap">
                          {fmtAmount(item.productCost, item.currency)}
                        </p>
                      </div>
                    </div>
                  );
                  return (
                    <SwipeCard
                      key={item.id}
                      isOpen={swipedId === item.id}
                      onOpen={() => setSwipedId(item.id)}
                      onClose={() => setSwipedId(null)}
                      onTap={() => setSelectedId(item.id)}
                      onEdit={() => requestEdit(item)}
                      onArchive={() => toggleArchive(item)}
                      onDelete={() => requestDelete(item)}
                      isArchived={item.status === "archived"}
                    >
                      {rowContent}
                    </SwipeCard>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Item detail slide-up */}
          <AnimatePresence>
            {selected && (
              <>
                <motion.div
                  key="sku-detail-backdrop"
                  className="absolute inset-0 z-10"
                  style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setSelectedId(null)}
                />
                <SkuDetail key={selected.id} item={selected} onClose={() => setSelectedId(null)} />
              </>
            )}
          </AnimatePresence>

          {/* Add / Edit sheet */}
          <AddSkuSheet
            key={addSheetToken}
            open={addOpen}
            onClose={closeAddSheet}
            contained={contained}
            editingItem={editingItem}
            onSaved={(item) => setItems((prev) => {
              const exists = prev.some((i) => i.id === item.id);
              return exists ? prev.map((i) => i.id === item.id ? item : i) : [item, ...prev];
            })}
          />

          <DeleteConfirmModal
            item={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
