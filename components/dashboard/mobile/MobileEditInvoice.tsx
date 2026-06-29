"use client";

import { type ElementType, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Eye, EyeOff, Send, ChevronRight, ChevronDown, Calendar,
  Plus, Minus, FileText, Users, LayoutGrid, Pencil,
  File, Download, GripVertical, Copy, MoreVertical, ArrowLeft,
  Image as ImageIcon, Trash2, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── Types ──────────────────────────────────────────────────────────────── */
type Tag       = { label: string; color: "grey" | "amber" | "blue" };
type LineItem  = { id: number; name: string; tags: Tag[]; qty: number; rate: string };
type Recipient = { name: string; email: string; initials: string; avatarClass: string; phone?: string; role?: "primary" | "cc" };
type BillerData = { businessName: string; address: string; gstin: string; pan: string; email: string; phone: string };
type BankData   = { holderName: string; accountNumber: string; bankName: string; routing: string; bankAddress: string };

/* ── Constants ───────────────────────────────────────────────────────────── */
const FREQUENCIES = ["Weekly", "Monthly", "Quarterly", "Annually"];

/* ── Pre-fill data ───────────────────────────────────────────────────────── */
type FormPrefill = {
  invoiceNo: string; issueDate: string; dueDate: string;
  recurring: boolean; frequency: string; recurStart: string;
  recipient: Recipient | null;
  lineItems: LineItem[];
};

const EMPTY: FormPrefill = {
  invoiceNo: "", issueDate: "", dueDate: "",
  recurring: false, frequency: "Monthly", recurStart: "2026-06-26",
  recipient: null, lineItems: [],
};

const PREFILL_MAP: Record<string, FormPrefill> = {
  "INV-001": {
    invoiceNo: "INV-2026-0090", issueDate: "2026-02-19", dueDate: "2026-02-21",
    recurring: true, frequency: "Monthly", recurStart: "2026-06-26",
    recipient: { name: "Acme Corp", email: "accounts@acmecorp.in", initials: "AC", avatarClass: "bg-amber-100 text-amber-700" },
    lineItems: [{
      id: 1, name: "Professional website design",
      tags: [{ label: "Design", color: "grey" }, { label: "HSN 998314", color: "amber" }, { label: "18% GST", color: "blue" }],
      qty: 1, rate: "94400",
    }],
  },
  "INV-002": {
    invoiceNo: "INV-2026-0089", issueDate: "2026-02-19", dueDate: "2026-02-28",
    recurring: false, frequency: "Monthly", recurStart: "2026-06-26",
    recipient: { name: "John Miller Antonio", email: "john.miller@gmail.com", initials: "JM", avatarClass: "bg-sky-100 text-sky-700" },
    lineItems: [{
      id: 1, name: "Video design freelance",
      tags: [{ label: "Design", color: "grey" }, { label: "HSN 998314", color: "amber" }, { label: "18% GST", color: "blue" }],
      qty: 1, rate: "1003",
    }],
  },
  "INV-003": {
    invoiceNo: "INV-2026-0088", issueDate: "2026-02-19", dueDate: "2026-02-19",
    recurring: false, frequency: "Monthly", recurStart: "2026-06-26",
    recipient: { name: "Deepankar Raj", email: "deepankar@payglocal.in", initials: "DR", avatarClass: "bg-violet-100 text-violet-700" },
    lineItems: [{
      id: 1, name: "Test invoice line item",
      tags: [{ label: "Services", color: "grey" }, { label: "HSN 998314", color: "amber" }],
      qty: 1, rate: "100003",
    }],
  },
  "INV-004": {
    invoiceNo: "INV-2026-0087", issueDate: "2026-02-19", dueDate: "",
    recurring: false, frequency: "Monthly", recurStart: "2026-06-26",
    recipient: { name: "John Miller Antonio", email: "john.miller@gmail.com", initials: "JM", avatarClass: "bg-sky-100 text-sky-700" },
    lineItems: [{
      id: 1, name: "Website design services",
      tags: [{ label: "Design", color: "grey" }, { label: "HSN 998314", color: "amber" }],
      qty: 1, rate: "103",
    }],
  },
};

/* ── Template data ───────────────────────────────────────────────────────── */
type TemplateItem = { id: string; label: string; canDelete: boolean };
const TEMPLATES_INIT: TemplateItem[] = [
  { id: "blank",   label: "Blank invoice",            canDelete: false },
  { id: "payflow", label: "Payflow design -- monthly", canDelete: true  },
  { id: "consult", label: "Consulting standard",       canDelete: true  },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fmtNum(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${parseInt(d)} ${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}

/* ── Sub-components ─────────────────────────────────────────────────────── */
function ToggleSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button" role="switch" aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-7 w-[50px] rounded-full shrink-0",
        on ? "bg-primary" : "bg-muted-foreground/30"
      )}
      style={{ transition: "background-color 0.2s ease" }}
    >
      <span
        className="absolute top-[3px] left-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-sm"
        style={{
          transform: `translateX(${on ? 22 : 0}px)`,
          transition: "transform 0.2s ease",
        }}
      />
    </button>
  );
}

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <p className="text-[12px] font-medium text-muted-foreground mb-1.5 leading-none">
      {text}{required && <span className="text-red-500 ml-0.5">*</span>}
    </p>
  );
}

function SectionHeader({
  iconBg, icon: Icon, iconColor, title, rightContent,
  open, onToggle,
}: {
  iconBg: string; icon: ElementType; iconColor: string; title: string;
  rightContent?: React.ReactNode;
  open: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        <Icon className={cn("h-[15px] w-[15px]", iconColor)} strokeWidth={2} />
      </div>
      <p className="flex-1 text-[15px] font-bold text-foreground">{title}</p>
      {rightContent && <div className="flex items-center gap-2 shrink-0">{rightContent}</div>}
      <button type="button" onClick={onToggle} className="shrink-0 active:opacity-60 transition-opacity">
        {open
          ? <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
          : <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
        }
      </button>
    </div>
  );
}

function DateButton({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <FieldLabel text={label} />
      <div className="relative rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-2.5 flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.75} />
        <span className={cn("flex-1 min-w-0 text-[13px] whitespace-nowrap overflow-hidden", value ? "text-foreground" : "text-muted-foreground/60")}>
          {fmtDate(value) || "Select date"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
        <input
          type="date" value={value} onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

/* ── Edit Line Item Overlay ──────────────────────────────────────────────── */
function EditLineItemOverlay({
  initial,
  onSave,
  onCancel,
  onDuplicate,
  onDelete,
}: {
  initial: LineItem | null;
  onSave: (item: Omit<LineItem, "id">, addAnother: boolean) => void;
  onCancel: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}) {
  const [itemType,    setItemType]    = useState<"amount" | "quantity" | "hours">("amount");
  const [name,        setName]        = useState(initial?.name ?? "");
  const [rate,        setRate]        = useState(initial?.rate ?? "");
  const [qty,         setQty]         = useState(initial?.qty ?? 1);
  const [sacHsn,      setSacHsn]      = useState(() => {
    if (!initial) return "";
    const t = initial.tags.find(t => t.color === "amber");
    return t?.label.replace(/^HSN\s+/i, "") ?? "";
  });
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPct, setDiscountPct] = useState("");
  const [hasTax,      setHasTax]      = useState(() => initial?.tags.some(t => t.label.includes("GST")) ?? false);
  const [taxRate,     setTaxRate]     = useState("18");
  const [hasDesc,     setHasDesc]     = useState(false);
  const [desc,        setDesc]        = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const canSave = name.trim().length > 0 && rate.trim().length > 0;

  function buildItem(): Omit<LineItem, "id"> {
    const tags: Tag[] = [];
    const existingGrey = initial?.tags.find(t => t.color === "grey");
    if (existingGrey) tags.push(existingGrey);
    if (sacHsn.trim()) tags.push({ label: `HSN ${sacHsn.trim()}`, color: "amber" });
    if (hasTax) tags.push({ label: `${taxRate}% GST`, color: "blue" });
    return {
      name: name.trim(),
      tags,
      qty: itemType === "amount" ? 1 : qty,
      rate: rate.trim(),
    };
  }

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-[90] flex flex-col bg-white rounded-t-2xl overflow-hidden"
      style={{ maxHeight: "92%" }}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="w-9 h-[3px] rounded-full bg-border" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 shrink-0">
        <button type="button" onClick={onCancel}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-muted shrink-0">
          <ArrowLeft className="h-[15px] w-[15px] text-foreground" strokeWidth={2.25} />
        </button>
        <p className="text-[15px] font-bold text-foreground">
          {initial ? "Edit line item" : "New line item"}
        </p>
      </div>

      {/* Scrollable form */}
      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 pt-4 pb-2 space-y-4"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Item type */}
        <div>
          <FieldLabel text="Item type" />
          <div className="grid grid-cols-3 gap-2">
            {(["amount", "quantity", "hours"] as const).map(type => (
              <button key={type} type="button" onClick={() => setItemType(type)}
                className={cn(
                  "py-2.5 rounded-xl border text-[12.5px] font-medium transition-colors",
                  itemType === type
                    ? "border-primary bg-primary/8 text-primary"
                    : "border-border bg-[#f6f8fa] text-muted-foreground"
                )}
              >
                {type === "amount" ? "Amount only" : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <FieldLabel text="Item name" required />
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Website design services"
            className="w-full rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>

        {/* Rate + Qty */}
        <div className={cn("grid gap-2.5", itemType === "amount" ? "grid-cols-1" : "grid-cols-2")}>
          <div>
            <FieldLabel text="Rate (₹)" required />
            <input
              value={rate} onChange={e => setRate(e.target.value)}
              inputMode="decimal" placeholder="0.00"
              className="w-full rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none tabular-nums"
            />
          </div>
          {itemType !== "amount" && (
            <div>
              <FieldLabel text={itemType === "quantity" ? "Quantity" : "Hours"} />
              <div className="flex items-center gap-2 rounded-xl border border-border bg-[#f6f8fa] px-2.5 py-2.5">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="h-6 w-6 flex items-center justify-center rounded border border-border bg-white text-muted-foreground shrink-0 active:bg-muted">
                  <Minus className="h-2.5 w-2.5" strokeWidth={2.5} />
                </button>
                <span className="flex-1 text-center text-[13.5px] font-semibold text-foreground tabular-nums">{qty}</span>
                <button type="button" onClick={() => setQty(q => q + 1)}
                  className="h-6 w-6 flex items-center justify-center rounded border border-border bg-white text-muted-foreground shrink-0 active:bg-muted">
                  <Plus className="h-2.5 w-2.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SAC / HSN */}
        <div>
          <FieldLabel text="SAC / HSN code" />
          <input
            value={sacHsn} onChange={e => setSacHsn(e.target.value)}
            placeholder="e.g. 998314" inputMode="numeric"
            className="w-full rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>

        {/* Optional toggles */}
        <div className="space-y-2">
          {/* Discount */}
          <div className="bg-[#f6f8fa] rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <p className="flex-1 text-[13.5px] font-medium text-foreground">Discount</p>
              <ToggleSwitch on={hasDiscount} onChange={setHasDiscount} />
            </div>
            {hasDiscount && (
              <div className="px-3.5 pb-3 border-t border-border/30 pt-3">
                <FieldLabel text="Discount %" />
                <input
                  value={discountPct} onChange={e => setDiscountPct(e.target.value)}
                  inputMode="decimal" placeholder="e.g. 10"
                  className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none tabular-nums"
                />
              </div>
            )}
          </div>

          {/* Tax */}
          <div className="bg-[#f6f8fa] rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <p className="flex-1 text-[13.5px] font-medium text-foreground">Tax</p>
              <ToggleSwitch on={hasTax} onChange={setHasTax} />
            </div>
            {hasTax && (
              <div className="px-3.5 pb-3 border-t border-border/30 pt-3">
                <FieldLabel text="Tax rate" />
                <div className="grid grid-cols-4 gap-1.5">
                  {["5", "12", "18", "28"].map(r => (
                    <button key={r} type="button" onClick={() => setTaxRate(r)}
                      className={cn(
                        "py-2 rounded-xl border text-[12px] font-medium transition-colors",
                        taxRate === r
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border bg-white text-muted-foreground"
                      )}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-[#f6f8fa] rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <p className="flex-1 text-[13.5px] font-medium text-foreground">Description</p>
              <ToggleSwitch on={hasDesc} onChange={setHasDesc} />
            </div>
            {hasDesc && (
              <div className="px-3.5 pb-3 border-t border-border/30 pt-3">
                <textarea
                  value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="Optional item description" rows={3}
                  className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>

        {/* Duplicate + Delete -- only in edit mode */}
        {initial && (
          <div className="rounded-2xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => { onDuplicate?.(); }}
              className="w-full flex items-center gap-3 px-3.5 py-3.5 text-[14px] text-foreground active:bg-muted/10 transition-colors"
            >
              <Copy className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
              Duplicate item
            </button>
            <div className="border-t border-border/40">
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirm) { onDelete?.(); }
                  else { setDeleteConfirm(true); }
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3.5 text-[14px] text-red-600 active:bg-red-50/60 transition-colors"
              >
                <X className="h-4 w-4 text-red-500 shrink-0" strokeWidth={1.75} />
                Delete item
              </button>
              {deleteConfirm && (
                <p className="px-3.5 pb-3 text-[12px] text-red-400 leading-snug">
                  Tap again to confirm delete
                </p>
              )}
            </div>
          </div>
        )}

        <div className="h-2" />
      </div>

      {/* Bottom action bar */}
      <div
        className="shrink-0 bg-white border-t border-border/60 px-4 pt-3 space-y-2"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        {initial === null ? (
          /* New item -- primary: Save & add more */
          <>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => onSave(buildItem(), true)}
              className={cn(
                "w-full h-11 rounded-2xl text-[13.5px] font-semibold transition-all",
                canSave ? "bg-primary text-white active:scale-[0.98]" : "bg-muted text-muted-foreground"
              )}
            >
              Save &amp; add more
            </button>
            <div className="pb-1">
              <button
                type="button"
                disabled={!canSave}
                onClick={() => onSave(buildItem(), false)}
                className={cn(
                  "w-full h-10 rounded-2xl border text-[13px] font-medium transition-all",
                  canSave ? "border-border text-foreground active:bg-muted/20" : "border-border text-muted-foreground"
                )}
              >
                Save item
              </button>
            </div>
          </>
        ) : (
          /* Edit item -- primary: Save item */
          <>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => onSave(buildItem(), false)}
              className={cn(
                "w-full h-11 rounded-2xl text-[13.5px] font-semibold transition-all",
                canSave ? "bg-primary text-white active:scale-[0.98]" : "bg-muted text-muted-foreground"
              )}
            >
              Save item
            </button>
            <div className="pb-1">
              <button
                type="button"
                disabled={!canSave}
                onClick={() => onSave(buildItem(), true)}
                className={cn(
                  "w-full h-10 rounded-2xl border text-[13px] font-medium transition-all",
                  canSave ? "border-primary text-primary active:bg-primary/8" : "border-border text-muted-foreground"
                )}
              >
                Save &amp; add another
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ── Recipient overlay helpers ───────────────────────────────────────────── */
const RECENT_CONTACTS: Recipient[] = [
  { name: "Priya Mehta",     email: "priya@startupxyz.in",   phone: "9876543210", initials: "PM", avatarClass: "bg-emerald-100 text-emerald-700" },
  { name: "Rohan Shah",      email: "rohan@venture.co",      phone: "9123456789", initials: "RS", avatarClass: "bg-amber-100 text-amber-700"   },
  { name: "Deepankar Kumar", email: "deepankar@acmecorp.in", phone: "9988776655", initials: "DK", avatarClass: "bg-emerald-100 text-emerald-700" },
];

const AVATAR_CLASSES = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
];

function deriveInitials(n: string) {
  return n.trim().split(/\s+/).map(p => p[0] ?? "").join("").slice(0, 2).toUpperCase();
}

function pickAvatarClass(n: string) {
  let h = 0;
  for (const c of n) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_CLASSES[h % AVATAR_CLASSES.length];
}

/* ── Recipient Overlay ───────────────────────────────────────────────────── */
function RecipientOverlay({
  mode,
  initial,
  isOnlyPrimary,
  onSave,
  onCancel,
  onRemove,
}: {
  mode: "add" | "edit";
  initial: Recipient | null;
  isOnlyPrimary: boolean;
  onSave: (r: Recipient) => void;
  onCancel: () => void;
  onRemove?: () => void;
}) {
  const [name,       setName]       = useState(initial?.name  ?? "");
  const [phone,      setPhone]      = useState(initial?.phone ?? "");
  const [email,      setEmail]      = useState(initial?.email ?? "");
  const [notifyVia,  setNotifyVia]  = useState<Set<string>>(new Set(["email"]));
  const [role,       setRole]       = useState<"primary" | "cc">(initial?.role ?? "primary");
  const [removeWarn, setRemoveWarn] = useState(false);

  const canSave = name.trim().length > 0;

  function toggleNotify(ch: string) {
    setNotifyVia(prev => {
      const next = new Set(prev);
      if (next.has(ch)) next.delete(ch); else next.add(ch);
      return next;
    });
  }

  function handleSave() {
    const trimmed = name.trim();
    onSave({
      name: trimmed,
      email: email.trim(),
      phone: phone.trim(),
      role,
      initials: deriveInitials(trimmed),
      avatarClass: initial?.avatarClass ?? pickAvatarClass(trimmed),
    });
  }

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-[95] flex flex-col bg-white rounded-t-2xl overflow-hidden"
      style={{ maxHeight: "92%" }}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="w-9 h-[3px] rounded-full bg-border" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 shrink-0">
        <button type="button" onClick={onCancel}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-muted shrink-0">
          <ArrowLeft className="h-[15px] w-[15px] text-foreground" strokeWidth={2.25} />
        </button>
        <p className="text-[15px] font-bold text-foreground">
          {mode === "add" ? "Add recipient" : "Edit recipient"}
        </p>
      </div>

      {/* Scrollable form */}
      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 pt-4 pb-2 space-y-5"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Customer details */}
        <div>
          <p className="text-[14px] font-bold text-foreground mb-3">
            Customer details <span className="text-red-500">*</span>
          </p>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none mb-2.5"
          />
          <div className="flex gap-2.5">
            {/* Phone */}
            <div className="flex-1 min-w-0 flex items-stretch rounded-xl border border-border bg-[#f6f8fa] overflow-hidden">
              <div className="flex items-center gap-1 px-2.5 border-r border-border/60 shrink-0">
                <span className="text-[13px]">🇮🇳</span>
                <span className="text-[12px] font-medium text-foreground">+91</span>
              </div>
              <input
                value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="9876543210" inputMode="tel"
                className="flex-1 min-w-0 bg-transparent px-2.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
            {/* Email */}
            <div className="flex-1 min-w-0">
              <input
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email Id" inputMode="email" type="email"
                className="w-full h-full rounded-xl border border-border bg-[#f6f8fa] px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Recent contacts */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">RECENT</p>
          <div className="rounded-xl border border-border overflow-hidden divide-y divide-border/40">
            {RECENT_CONTACTS.map(c => (
              <button key={c.email} type="button"
                onClick={() => { setName(c.name); setPhone(c.phone ?? ""); setEmail(c.email); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 active:bg-muted/20 transition-colors text-left"
              >
                <div className={cn("h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold", c.avatarClass)}>
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground leading-snug">{c.name}</p>
                  <p className="text-[12px] text-muted-foreground leading-snug truncate">{c.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notify customer via */}
        <div>
          <p className="text-[14px] font-bold text-foreground mb-3">Notify customer via</p>
          <div className="flex items-center gap-2 flex-wrap">
            {(["sms", "email", "whatsapp"] as const).map(ch => {
              const on = notifyVia.has(ch);
              const label = ch === "sms" ? "SMS" : ch === "email" ? "Email" : "WhatsApp";
              return (
                <button key={ch} type="button" onClick={() => toggleNotify(ch)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[13px] font-medium transition-colors",
                    on ? "bg-primary border-primary text-white" : "border-border text-muted-foreground bg-transparent"
                  )}
                >
                  <span className="text-[11px] leading-none">{on ? "✓" : "+"}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Role */}
        <div>
          <p className="text-[14px] font-bold text-foreground mb-3">Role</p>
          <div className="flex items-center gap-2">
            {(["primary", "cc"] as const).map(r => {
              const on = role === r;
              const label = r === "primary" ? "Primary recipient" : "CC (copy)";
              return (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[13px] font-medium transition-colors",
                    on ? "bg-primary border-primary text-white" : "border-border text-muted-foreground bg-transparent"
                  )}
                >
                  {on && <span className="text-[11px] leading-none">✓</span>}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Remove recipient -- edit mode only */}
        {mode === "edit" && (
          <div>
            <button
              type="button"
              onClick={() => {
                if (isOnlyPrimary && role === "primary") { setRemoveWarn(true); return; }
                onRemove?.();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl border border-border/60 text-[14px] text-red-600 active:bg-red-50/60 transition-colors"
            >
              <X className="h-4 w-4 text-red-500 shrink-0" strokeWidth={1.75} />
              Remove recipient
            </button>
            {removeWarn && (
              <p className="mt-2 px-0.5 text-[12px] text-red-500 leading-snug">
                An invoice must have at least one primary recipient.
              </p>
            )}
          </div>
        )}

        <div className="h-2" />
      </div>

      {/* Bottom bar */}
      <div
        className="shrink-0 bg-white border-t border-border/60 px-4 pt-3"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <div className="pb-1">
          <button type="button" disabled={!canSave} onClick={handleSave}
            className={cn(
              "w-full h-11 rounded-2xl text-[13.5px] font-semibold transition-all",
              canSave ? "bg-primary text-white active:scale-[0.98]" : "bg-muted text-muted-foreground"
            )}>
            {mode === "add" ? "Add recipient" : "Save changes"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function maskAccountNo(n: string): string {
  if (n.length <= 14) return n;
  return `${n.slice(0, 8)}...${n.slice(-6)}`;
}

/* ── BillerEditOverlay ───────────────────────────────────────────────────── */
function BillerEditOverlay({
  initial,
  onSave,
  onClose,
}: {
  initial: BillerData;
  onSave: (data: BillerData) => void;
  onClose: () => void;
}) {
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [address,      setAddress]      = useState(initial.address);
  const [gstin,        setGstin]        = useState(initial.gstin);
  const [pan,          setPan]          = useState(initial.pan);
  const [email,        setEmail]        = useState(initial.email);
  const [phone,        setPhone]        = useState(initial.phone);

  const canSave = businessName.trim().length > 0;

  const inputCls = "w-full rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none";

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-[95] flex flex-col bg-white rounded-t-2xl overflow-hidden"
      style={{ maxHeight: "92%" }}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="w-9 h-[3px] rounded-full bg-border" />
      </div>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 shrink-0">
        <button type="button" onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-muted shrink-0">
          <ArrowLeft className="h-[15px] w-[15px] text-foreground" strokeWidth={2.25} />
        </button>
        <p className="flex-1 text-[15px] font-medium text-foreground">Biller details</p>
      </div>
      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 pt-4 pb-6 space-y-3"
        style={{ scrollbarWidth: "none" }}
      >
        <div>
          <FieldLabel text="Business name *" />
          <input value={businessName} onChange={e => setBusinessName(e.target.value)}
            placeholder="Business name" className={inputCls} />
        </div>
        <div>
          <FieldLabel text="Address" />
          <textarea value={address} onChange={e => setAddress(e.target.value)}
            placeholder="Street, city, postal code" rows={3}
            className={cn(inputCls, "resize-none leading-relaxed")} />
        </div>
        <div>
          <FieldLabel text="GSTIN" />
          <input value={gstin} onChange={e => setGstin(e.target.value)}
            placeholder="29AABCU9603R1ZX" className={inputCls} />
          <p className="text-[11px] text-muted-foreground mt-1.5">15-character GST Identification Number</p>
        </div>
        <div>
          <FieldLabel text="PAN (optional)" />
          <input value={pan} onChange={e => setPan(e.target.value)}
            placeholder="e.g. ABCDE1234F" className={inputCls} />
        </div>
        <div>
          <FieldLabel text="Email (optional)" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="billing@example.com" className={inputCls} />
        </div>
        <div>
          <FieldLabel text="Phone (optional)" />
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="+91 98765 43210" className={inputCls} />
        </div>
      </div>
      <div
        className="shrink-0 bg-white border-t border-border/60 px-4 pt-3"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <div className="pb-1">
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave({ businessName, address, gstin, pan, email, phone })}
            className={cn(
              "w-full h-11 rounded-2xl text-[13.5px] font-semibold transition-all",
              canSave ? "bg-primary text-white active:scale-[0.98]" : "bg-muted text-muted-foreground"
            )}
          >
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── BankEditOverlay ─────────────────────────────────────────────────────── */
function BankEditOverlay({
  initial,
  onSave,
  onClose,
}: {
  initial: BankData;
  onSave: (data: BankData) => void;
  onClose: () => void;
}) {
  const [holderName,     setHolderName]     = useState(initial.holderName);
  const [accountNumber,  setAccountNumber]  = useState(initial.accountNumber);
  const [showAccount,    setShowAccount]    = useState(false);
  const [bankName,       setBankName]       = useState(initial.bankName);
  const [routing,        setRouting]        = useState(initial.routing);
  const [bankAddress,    setBankAddress]    = useState(initial.bankAddress);

  const canSave = holderName.trim() && accountNumber.trim() && bankName.trim();

  const inputCls = "w-full rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none";

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-[95] flex flex-col bg-white rounded-t-2xl overflow-hidden"
      style={{ maxHeight: "92%" }}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="w-9 h-[3px] rounded-full bg-border" />
      </div>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 shrink-0">
        <button type="button" onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-muted shrink-0">
          <ArrowLeft className="h-[15px] w-[15px] text-foreground" strokeWidth={2.25} />
        </button>
        <p className="flex-1 text-[15px] font-medium text-foreground">Bank account</p>
      </div>
      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 pt-4 pb-6 space-y-3"
        style={{ scrollbarWidth: "none" }}
      >
        <div>
          <FieldLabel text="Account holder name *" />
          <input value={holderName} onChange={e => setHolderName(e.target.value)}
            placeholder="Account holder name" className={inputCls} />
        </div>
        <div>
          <FieldLabel text="Account number *" />
          <div className="relative">
            <input
              type={showAccount ? "text" : "password"}
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              className={cn(inputCls, "pr-10")}
            />
            <button type="button" onClick={() => setShowAccount(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:opacity-60">
              {showAccount
                ? <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                : <Eye    className="h-4 w-4" strokeWidth={1.75} />
              }
            </button>
          </div>
        </div>
        <div>
          <FieldLabel text="Bank name *" />
          <input value={bankName} onChange={e => setBankName(e.target.value)}
            placeholder="Bank name" className={inputCls} />
        </div>
        <div>
          <FieldLabel text="Routing / SWIFT / IFSC" />
          <input value={routing} onChange={e => setRouting(e.target.value)}
            placeholder="TCCLGB3L" className={inputCls} />
          <p className="text-[11px] text-muted-foreground mt-1.5">SWIFT, BIC, IFSC, or ACH routing number</p>
        </div>
        <div>
          <FieldLabel text="Bank address (optional)" />
          <textarea value={bankAddress} onChange={e => setBankAddress(e.target.value)}
            placeholder="Bank street address" rows={3}
            className={cn(inputCls, "resize-none leading-relaxed")} />
        </div>
      </div>
      <div
        className="shrink-0 bg-white border-t border-border/60 px-4 pt-3"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <div className="pb-1">
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave({ holderName, accountNumber, bankName, routing, bankAddress })}
            className={cn(
              "w-full h-11 rounded-2xl text-[13.5px] font-semibold transition-all",
              canSave ? "bg-primary text-white active:scale-[0.98]" : "bg-muted text-muted-foreground"
            )}
          >
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── LogoSignatureOverlay ──────────────────────────────────────────────── */
function LogoSignatureOverlay({
  initialLogo,
  initialSig,
  onUpdate,
  onClose,
}: {
  initialLogo: string | null;
  initialSig: string | null;
  onUpdate: (logo: string | null, sig: string | null) => void;
  onClose: () => void;
}) {
  const [workingLogo, setWorkingLogo] = useState(initialLogo);
  const [workingSig,  setWorkingSig]  = useState(initialSig);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef  = useRef<HTMLInputElement>(null);

  function handleFile(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string | null) => void,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Max 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => setter((ev.target?.result as string) ?? null);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-[96] flex flex-col bg-white rounded-t-2xl overflow-hidden"
      style={{ maxHeight: "92%" }}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="w-9 h-[3px] rounded-full bg-border" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-muted shrink-0"
        >
          <ArrowLeft className="h-[15px] w-[15px] text-foreground" strokeWidth={2.25} />
        </button>
        <p className="flex-1 text-[15px] font-bold text-foreground">Logo &amp; signature</p>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={e => handleFile(e, setWorkingLogo)}
      />
      <input
        ref={sigInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={e => handleFile(e, setWorkingSig)}
      />

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 pt-4 pb-6 space-y-3"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Logo section */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/20">
            <p className="text-[14px] font-bold text-foreground">Logo</p>
            <p className="text-[12px] text-muted-foreground">Shown on your invoice</p>
          </div>
          <div className="px-4 py-4">
            {workingLogo ? (
              <>
                <div className="rounded-xl bg-muted/40 h-20 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={workingLogo} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setWorkingLogo(null)}
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-red-200 text-[13px] font-medium text-red-600 active:bg-red-50/60 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-border text-[13px] font-medium text-foreground active:bg-muted/20 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Upload new
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="w-full h-20 rounded-xl border border-dashed border-primary/40 flex flex-col items-center justify-center gap-1.5 active:opacity-70 transition-opacity"
                style={{ background: "rgba(59,130,246,0.04)" }}
              >
                <ImageIcon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                <p className="text-[13px] text-primary font-medium">Upload logo</p>
                <p className="text-[11px] text-muted-foreground">PNG, JPG · Max 2 MB</p>
              </button>
            )}
          </div>
        </div>

        {/* Signature section */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/20">
            <p className="text-[14px] font-bold text-foreground">Signature</p>
            <p className="text-[12px] text-muted-foreground">Authorised signatory image</p>
          </div>
          <div className="px-4 py-4">
            {workingSig ? (
              <>
                <div className="rounded-xl bg-muted/40 h-20 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={workingSig} alt="Signature preview" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setWorkingSig(null)}
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-red-200 text-[13px] font-medium text-red-600 active:bg-red-50/60 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => sigInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-border text-[13px] font-medium text-foreground active:bg-muted/20 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Upload new
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => sigInputRef.current?.click()}
                className="w-full h-20 rounded-xl border border-dashed border-primary/40 flex flex-col items-center justify-center gap-1.5 active:opacity-70 transition-opacity"
                style={{ background: "rgba(59,130,246,0.04)" }}
              >
                <Pencil className="h-6 w-6 text-primary" strokeWidth={1.5} />
                <p className="text-[13px] text-primary font-medium">Upload signature</p>
                <p className="text-[11px] text-muted-foreground">PNG, JPG · Max 2 MB</p>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="shrink-0 bg-white border-t border-border/60 px-4 pt-3"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <div className="pb-1">
          <button
            type="button"
            onClick={() => onUpdate(workingLogo, workingSig)}
            className="w-full h-11 rounded-2xl bg-primary text-white text-[13.5px] font-semibold active:scale-[0.98] transition-all"
          >
            Update
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Component ─────────────────────────────────────────────────────────── */
export function MobileEditInvoice({
  invId,
  onClose,
  onPreview,
}: {
  invId: string | null;
  onClose: () => void;
  onPreview: (id: string) => void;
}) {
  const p = invId ? (PREFILL_MAP[invId] ?? EMPTY) : EMPTY;

  /* ── Form state ── */
  const [invoiceNo,    setInvoiceNo]    = useState(p.invoiceNo);
  const [issueDate,    setIssueDate]    = useState(p.issueDate);
  const [dueDate,      setDueDate]      = useState(p.dueDate);
  const [recurring,    setRecurring]    = useState(p.recurring);
  const [frequency,    setFrequency]    = useState(p.frequency);
  const [freqOpen,     setFreqOpen]     = useState(false);
  const [recurStart,   setRecurStart]   = useState(p.recurStart);
  const [recipients,   setRecipients]   = useState<Recipient[]>(p.recipient ? [p.recipient] : []);
  const [lineItems,    setLineItems]    = useState<LineItem[]>(p.lineItems);
  const [notes,        setNotes]        = useState("");
  const [notesOpen,    setNotesOpen]    = useState(false);
  const [invoiceOpen,  setInvoiceOpen]  = useState(true);
  const [billToOpen,   setBillToOpen]   = useState(false);
  const [lineItemsOpen, setLineItemsOpen] = useState(false);
  const nextId = useRef(p.lineItems.length + 1);

  /* ── Line item overlay state ── */
  const [editOverlayOpen, setEditOverlayOpen] = useState(false);
  const [editingItem,     setEditingItem]     = useState<LineItem | null>(null);
  const [overlayKey,      setOverlayKey]      = useState(0);

  /* ── Recipient overlay state ── */
  const [recipientOverlayOpen, setRecipientOverlayOpen] = useState(false);
  const [recipientMode,        setRecipientMode]        = useState<"add" | "edit">("add");
  const [editingRecipientIdx,  setEditingRecipientIdx]  = useState<number | null>(null);

  /* ── Header dropdown state ── */
  const [templates,       setTemplates]       = useState<TemplateItem[]>(TEMPLATES_INIT);
  const [activeTemplate,  setActiveTemplate]  = useState("payflow");
  const [templateOpen,    setTemplateOpen]    = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [kebabOpen,       setKebabOpen]       = useState(false);

  /* ── Logo & signature overlay state ── */
  const [logoOverlayOpen, setLogoOverlayOpen] = useState(false);
  const [committedLogo,   setCommittedLogo]   = useState<string | null>(null);
  const [committedSig,    setCommittedSig]    = useState<string | null>(null);

  /* ── Biller details overlay state ── */
  const [billerEditOpen, setBillerEditOpen] = useState(false);
  const [billerData,     setBillerData]     = useState<BillerData>({
    businessName: "Bhavya Artworks",
    address:      "Street 123, Chikkanhalli, Bengaluru 560035",
    gstin:        "29AABCU9603R1ZX",
    pan:          "",
    email:        "",
    phone:        "",
  });

  /* ── Bank account overlay state ── */
  const [bankEditOpen, setBankEditOpen] = useState(false);
  const [bankData,     setBankData]     = useState<BankData>({
    holderName:    "Bhavya Artworks",
    accountNumber: "GB14TCCL00170013509064",
    bankName:      "Currency Cloud",
    routing:       "TCCLGB3L",
    bankAddress:   "",
  });

  /* ── Computed totals ── */
  const subtotal = lineItems.reduce((s, i) => s + (parseFloat(i.rate) || 0) * i.qty, 0);
  const taxRate  = lineItems.some(i => i.tags.some(t => t.label.includes("GST"))) ? 0.18 : 0;
  const taxAmt   = subtotal * taxRate;
  const total    = subtotal + taxAmt;
  const sym      = "₹";

  function openEditItem(item: LineItem | null) {
    setEditingItem(item);
    setOverlayKey(k => k + 1);
    setEditOverlayOpen(true);
  }

  function handleSaveItem(saved: Omit<LineItem, "id">, addAnother: boolean) {
    if (editingItem) {
      setLineItems(prev => prev.map(it => it.id === editingItem.id ? { ...saved, id: editingItem.id } : it));
    } else {
      setLineItems(prev => [...prev, { ...saved, id: nextId.current++ }]);
    }
    if (addAnother) {
      setEditingItem(null);
      setOverlayKey(k => k + 1);
    } else {
      setEditOverlayOpen(false);
      setEditingItem(null);
    }
  }

  function duplicateItem(item: LineItem) {
    setLineItems(prev => [...prev, { ...item, id: nextId.current++ }]);
  }

  function deleteItem(id: number) {
    setLineItems(prev => prev.filter(it => it.id !== id));
  }

  /* ── Render ── */
  return (
    <div className="flex flex-col h-full relative overflow-hidden">

      {/* ── Header ── invisible (but layout-preserved) when a secondary overlay is active */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-white shrink-0 relative",
        (editOverlayOpen || recipientOverlayOpen || logoOverlayOpen || billerEditOpen || bankEditOpen) && "invisible pointer-events-none",
        (kebabOpen || templateOpen) && "z-[60]"
      )}>

        {/* X close -- left */}
        <button
          type="button" onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-foreground shrink-0"
          aria-label="Close"
        >
          <X className="h-[15px] w-[15px]" strokeWidth={2.25} />
        </button>

        {/* Template selector -- centre */}
        <div className="flex-1 flex justify-center">
          <button
            type="button"
            onClick={() => { setTemplateOpen(p => !p); setKebabOpen(false); setDeleteConfirmId(null); }}
            className="flex items-center gap-1.5 text-[14px] text-muted-foreground active:opacity-70 transition-opacity"
          >
            {templates.find(t => t.id === activeTemplate)?.label ?? "Blank invoice"}
            <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/60 transition-transform", templateOpen && "rotate-180")} strokeWidth={2} />
          </button>
        </div>

        {/* Kebab -- right */}
        <button
          type="button"
          onClick={() => { setKebabOpen(p => !p); setTemplateOpen(false); setDeleteConfirmId(null); }}
          className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground shrink-0 active:bg-muted/20 transition-colors"
        >
          <MoreVertical className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>

        {/* Template dropdown */}
        {templateOpen && (
          <div
            className="absolute top-full left-4 right-4 mt-1.5 bg-white rounded-xl border border-border overflow-hidden z-[61]"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
          >
              {templates.map((tpl, i) => (
                <div key={tpl.id} className={cn(i > 0 && "border-t border-border/50")}>
                  {deleteConfirmId === tpl.id ? (
                    <div className="flex items-center gap-2 px-4 py-3">
                      <p className="flex-1 text-[13px] text-foreground truncate">Delete &ldquo;{tpl.label}&rdquo;?</p>
                      <button type="button"
                        onClick={() => {
                          setTemplates(prev => prev.filter(t => t.id !== tpl.id));
                          if (activeTemplate === tpl.id) setActiveTemplate("blank");
                          setDeleteConfirmId(null);
                          setTemplateOpen(false);
                        }}
                        className="text-[12px] font-semibold text-red-500 active:opacity-70 shrink-0">
                        Confirm
                      </button>
                      <button type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-[12px] text-muted-foreground active:opacity-70 shrink-0 ml-1">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <button type="button"
                        onClick={() => { setActiveTemplate(tpl.id); setTemplateOpen(false); setDeleteConfirmId(null); }}
                        className="flex-1 flex items-center gap-2.5 px-4 py-3 text-left active:bg-muted/40 transition-colors"
                      >
                        <span className="w-4 text-[12px] text-primary shrink-0 leading-none">
                          {activeTemplate === tpl.id ? "✓" : ""}
                        </span>
                        <span className="text-[13.5px] text-foreground font-medium">{tpl.label}</span>
                      </button>
                      {tpl.canDelete && (
                        <button type="button"
                          onClick={e => { e.stopPropagation(); setDeleteConfirmId(tpl.id); }}
                          className="px-4 py-3 text-muted-foreground active:text-foreground shrink-0 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Kebab dropdown */}
        {kebabOpen && (
          <div
            className="absolute top-full right-4 mt-1.5 bg-white rounded-xl border border-border overflow-hidden z-[61]"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.10)", minWidth: "172px" }}
          >
              <button type="button"
                onClick={() => { setKebabOpen(false); toast.success("Saved as draft"); onClose(); }}
                className="w-full flex items-center gap-3 px-3.5 py-3 text-[13.5px] text-foreground active:bg-muted/20 transition-colors">
                <File className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
                Save as draft
              </button>
              <button type="button"
                onClick={() => { setKebabOpen(false); toast.success("Preparing PDF..."); }}
                className="w-full flex items-center gap-3 px-3.5 py-3 text-[13.5px] text-foreground active:bg-muted/20 transition-colors border-t border-border/40">
                <Download className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
                Download PDF
              </button>
              <button type="button"
                onClick={() => { setKebabOpen(false); setLogoOverlayOpen(true); }}
                className="w-full flex items-center gap-3 px-3.5 py-3 text-[13.5px] text-foreground active:bg-muted/20 transition-colors border-t border-border/40">
                <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
                Logo &amp; signature
              </button>
          </div>
        )}

      </div>

      {/* Root-level backdrop -- closes header dropdowns; absolute so no fixed stacking-context breakout */}
      {(kebabOpen || templateOpen) && (
        <div
          className="absolute inset-0 z-[59]"
          onClick={() => { setKebabOpen(false); setTemplateOpen(false); setDeleteConfirmId(null); }}
        />
      )}

      {/* ── Scrollable content ── */}
      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", background: "#f6f8fa" }}
      >
        <div className="px-4 pt-4 space-y-3 pb-10">

          {/* ── Card 1 -- Invoice details ── */}
          <div className="bg-white rounded-2xl border border-border shadow-sm">
            <SectionHeader
              iconBg="bg-primary/10" icon={FileText} iconColor="text-primary"
              title="Invoice details"
              open={invoiceOpen} onToggle={() => setInvoiceOpen(p => !p)}
            />

            {invoiceOpen && (
              <div className="px-4 pb-4 border-t border-border/20 space-y-3 pt-3">

                <div>
                  <FieldLabel text="Invoice number" />
                  <input
                    value={invoiceNo}
                    onChange={e => setInvoiceNo(e.target.value)}
                    placeholder="INV-XXXX"
                    className="w-full rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2.5">
                  <div className="flex-1 min-w-0">
                    <DateButton label="Issue date" value={issueDate} onChange={setIssueDate} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <DateButton label="Due date" value={dueDate} onChange={setDueDate} />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#f6f8fa] rounded-xl px-3.5 py-3">
                  <p className="flex-1 min-w-0 text-[13.5px] font-medium text-foreground">Make this a recurring invoice</p>
                  <ToggleSwitch on={recurring} onChange={setRecurring} />
                </div>

                {recurring && (
                  <div className="flex gap-2.5">
                    <div className="flex-1 min-w-0">
                      <FieldLabel text="Frequency" />
                      <div>
                        <button
                          type="button" onClick={() => setFreqOpen(p => !p)}
                          className="w-full rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-2.5 flex items-center justify-between text-[13px] text-foreground active:bg-muted/30"
                        >
                          {frequency}
                          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", freqOpen && "rotate-180")} strokeWidth={2} />
                        </button>
                        {freqOpen && (
                          <div className="mt-1 bg-white rounded-xl border border-border overflow-hidden" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.10)" }}>
                            {FREQUENCIES.map((f, i) => (
                              <button key={f} type="button"
                                onClick={() => { setFrequency(f); setFreqOpen(false); }}
                                className={cn("w-full text-left px-3.5 py-2.5 text-[13px] active:bg-muted/30", i > 0 && "border-t border-border/30", f === frequency && "font-semibold text-primary")}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <DateButton label="Recurring start date" value={recurStart} onChange={setRecurStart} />
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* ── Card 2 -- Bill to ── */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <SectionHeader
              iconBg="bg-primary/10" icon={Users} iconColor="text-primary"
              title="Bill to"
              rightContent={
                recipients.length > 0 ? (
                  <span className="text-[11px] text-muted-foreground">
                    {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}
                  </span>
                ) : undefined
              }
              open={billToOpen} onToggle={() => setBillToOpen(p => !p)}
            />

            {billToOpen && (
              <div className="px-4 pb-4 border-t border-border/20 pt-3 space-y-2.5">
                {recipients.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setEditingRecipientIdx(i);
                      setRecipientMode("edit");
                      setRecipientOverlayOpen(true);
                    }}
                    className="flex items-center gap-3 bg-[#f6f8fa] rounded-xl px-3.5 py-3 cursor-pointer active:bg-muted/10 transition-colors"
                  >
                    <div className={cn("h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold", r.avatarClass)}>
                      {r.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-bold text-foreground leading-snug">{r.name}</p>
                      <p className="text-[12px] text-muted-foreground leading-snug truncate">{r.email}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full shrink-0">
                      {r.role === "cc" ? "CC" : "Primary"}
                    </span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setRecipients(prev => prev.filter((_, j) => j !== i)); }}
                      className="text-muted-foreground shrink-0 active:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setEditingRecipientIdx(null);
                    setRecipientMode("add");
                    setRecipientOverlayOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-primary active:opacity-60 transition-opacity"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Add another recipient
                </button>
              </div>
            )}
          </div>

          {/* ── Card 3 -- Line items ── */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <SectionHeader
              iconBg="bg-emerald-50" icon={LayoutGrid} iconColor="text-emerald-600"
              title="Line items"
              rightContent={
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-[#f6f8fa] text-[12.5px] font-medium text-foreground">
                  {sym} INR
                  <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={2} />
                </div>
              }
              open={lineItemsOpen} onToggle={() => setLineItemsOpen(p => !p)}
            />

            {lineItemsOpen && <div className="border-t border-border/20">
              {lineItems.map((item, idx) => {
                const rowTotal = (parseFloat(item.rate) || 0) * item.qty;
                return (
                  <div
                    key={item.id}
                    onClick={() => openEditItem(item)}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3.5 cursor-pointer active:bg-muted/5 transition-colors select-none",
                      idx > 0 && "border-t border-border/20"
                    )}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground/25 shrink-0 self-start mt-0.5" strokeWidth={1.5} />

                    {/* Left: name + tags */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-foreground leading-snug">{item.name}</p>
                      {item.tags.length > 0 && (
                        <div className="flex items-center flex-nowrap gap-1 mt-1.5 overflow-hidden">
                          {item.tags.map(tag => (
                            <span key={tag.label} className={cn(
                              "text-[10px] px-1.5 py-px rounded-full font-medium whitespace-nowrap shrink-0",
                              tag.color === "grey"  ? "bg-muted text-muted-foreground" :
                              tag.color === "amber" ? "bg-amber-100 text-amber-700" :
                                                      "bg-blue-50 text-blue-600",
                            )}>
                              {tag.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: total + qty×rate */}
                    <div className="shrink-0 text-right">
                      <p className="text-[14px] font-bold text-foreground tabular-nums">{sym}{fmtNum(rowTotal)}</p>
                      <p className="text-[12px] text-muted-foreground tabular-nums mt-0.5">{item.qty} × {sym}{item.rate}</p>
                    </div>
                  </div>
                );
              })}

              {/* Add line item */}
              <button
                type="button"
                onClick={() => openEditItem(null)}
                className="flex items-center gap-1.5 w-full px-4 py-3 border-t border-border/20 text-[13px] font-medium text-primary active:opacity-60 transition-opacity"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                Add line item
              </button>

              {/* Totals block */}
              <div className="border-t border-border/40 px-4 pt-3 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] text-muted-foreground">Subtotal</p>
                  <p className="text-[13px] text-foreground tabular-nums">{sym}{fmtNum(subtotal)}</p>
                </div>
                <button type="button" className="text-[13px] font-medium text-primary text-left active:opacity-60">
                  + Add discount
                </button>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] text-muted-foreground">Tax (18% GST)</p>
                  <p className="text-[13px] text-foreground tabular-nums">{sym}{fmtNum(taxAmt)}</p>
                </div>
                <div className="border-t border-border/40 pt-2 flex items-center justify-between">
                  <p className="text-[14px] font-medium text-foreground">Total</p>
                  <p className="text-[14px] font-medium text-foreground tabular-nums">{sym}{fmtNum(total)}</p>
                </div>
              </div>
            </div>}
          </div>

          {/* ── Card 4 -- Biller details + Bank account ── */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white rounded-2xl border border-border shadow-sm p-3.5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Biller details</p>
                <button type="button" onClick={() => setBillerEditOpen(true)}
                  className="text-[11.5px] font-medium text-primary active:opacity-60">Edit</button>
              </div>
              <p className="text-[12.5px] font-bold text-foreground leading-snug">{billerData.businessName}</p>
              {billerData.address ? (
                <p className="text-[11px] text-muted-foreground leading-snug mt-1.5 whitespace-pre-line">{billerData.address}</p>
              ) : null}
              {billerData.gstin ? (
                <p className="text-[11px] text-muted-foreground mt-1.5">{billerData.gstin}</p>
              ) : null}
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-border shadow-sm p-3.5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Bank account</p>
                <button type="button" onClick={() => setBankEditOpen(true)}
                  className="text-[11.5px] font-medium text-primary active:opacity-60">Change</button>
              </div>
              <p className="text-[12.5px] font-bold text-foreground leading-snug">{bankData.holderName}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5">{maskAccountNo(bankData.accountNumber)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{bankData.bankName}</p>
              {bankData.routing ? (
                <p className="text-[11px] text-muted-foreground mt-0.5">{bankData.routing}</p>
              ) : null}
            </div>
          </div>

          {/* ── Card 5 -- Customer notes & terms ── */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <SectionHeader
              iconBg="bg-amber-50" icon={Pencil} iconColor="text-amber-500"
              title="Customer notes & terms"
              rightContent={
                <span className="text-[10.5px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Optional
                </span>
              }
              open={notesOpen} onToggle={() => setNotesOpen(p => !p)}
            />
            {notesOpen && (
              <div className="px-4 pb-4 border-t border-border/20 pt-3">
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Enter notes or payment terms for your customer"
                  rows={4}
                  className="w-full bg-[#f6f8fa] rounded-xl border border-border px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 py-3 border-t border-border/60 bg-white"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={() => onPreview(invId ?? "INV-001")}
          className="flex items-center gap-1.5 h-11 px-4 rounded-2xl border border-border text-[13px] font-medium text-foreground active:bg-muted/20 transition-colors shrink-0"
        >
          <Eye className="h-[14px] w-[14px]" strokeWidth={2} />
          Preview
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-2xl bg-primary text-white text-[13px] font-semibold active:scale-[0.98] transition-all"
        >
          <Send className="h-[14px] w-[14px]" strokeWidth={2} />
          {invId ? "Update & send" : "Finalise and send"}
        </button>
      </div>

      {/* Backdrop -- dims invoice content when any secondary overlay is active */}
      {(editOverlayOpen || recipientOverlayOpen || logoOverlayOpen || billerEditOpen || bankEditOpen) && (
        <div className="absolute inset-0 z-[89] bg-black/40" />
      )}

      {/* ── Edit line item bottom sheet ── */}
      <AnimatePresence>
        {editOverlayOpen && (
          <EditLineItemOverlay
            key={overlayKey}
            initial={editingItem}
            onSave={handleSaveItem}
            onCancel={() => { setEditOverlayOpen(false); setEditingItem(null); }}
            onDuplicate={editingItem ? () => {
              duplicateItem(editingItem);
              setEditOverlayOpen(false);
              setEditingItem(null);
            } : undefined}
            onDelete={editingItem ? () => {
              deleteItem(editingItem.id);
              setEditOverlayOpen(false);
              setEditingItem(null);
            } : undefined}
          />
        )}
      </AnimatePresence>

      {/* ── Add / Edit recipient bottom sheet ── */}
      <AnimatePresence>
        {recipientOverlayOpen && (
          <RecipientOverlay
            key={recipientMode === "edit" ? `edit-${editingRecipientIdx}` : "add"}
            mode={recipientMode}
            initial={recipientMode === "edit" && editingRecipientIdx !== null ? recipients[editingRecipientIdx] : null}
            isOnlyPrimary={
              recipients.filter(r => r.role !== "cc").length <= 1 &&
              recipientMode === "edit" &&
              editingRecipientIdx !== null &&
              (recipients[editingRecipientIdx]?.role ?? "primary") !== "cc"
            }
            onSave={r => {
              if (recipientMode === "add") {
                setRecipients(prev => [...prev, r]);
              } else if (editingRecipientIdx !== null) {
                setRecipients(prev => prev.map((x, i) => i === editingRecipientIdx ? r : x));
              }
              setRecipientOverlayOpen(false);
              setEditingRecipientIdx(null);
            }}
            onCancel={() => { setRecipientOverlayOpen(false); setEditingRecipientIdx(null); }}
            onRemove={editingRecipientIdx !== null ? () => {
              setRecipients(prev => prev.filter((_, i) => i !== editingRecipientIdx));
              setRecipientOverlayOpen(false);
              setEditingRecipientIdx(null);
            } : undefined}
          />
        )}
      </AnimatePresence>

      {/* ── Logo & signature bottom sheet ── */}
      <AnimatePresence>
        {logoOverlayOpen && (
          <LogoSignatureOverlay
            initialLogo={committedLogo}
            initialSig={committedSig}
            onUpdate={(logo, sig) => {
              setCommittedLogo(logo);
              setCommittedSig(sig);
              setLogoOverlayOpen(false);
              toast.success("Logo & signature updated");
            }}
            onClose={() => setLogoOverlayOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Biller details bottom sheet ── */}
      <AnimatePresence>
        {billerEditOpen && (
          <BillerEditOverlay
            initial={billerData}
            onSave={data => { setBillerData(data); setBillerEditOpen(false); }}
            onClose={() => setBillerEditOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Bank account bottom sheet ── */}
      <AnimatePresence>
        {bankEditOpen && (
          <BankEditOverlay
            initial={bankData}
            onSave={data => { setBankData(data); setBankEditOpen(false); }}
            onClose={() => setBankEditOpen(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
