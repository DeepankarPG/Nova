"use client";

import { useState } from "react";
import { Check, Pencil, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { formatDate } from "@/lib/utils";
import { dueTermOptions, type DueTermId } from "@/lib/mock-data/invoice-create";

function EditableChip({
  displayValue,
  children,
}: {
  displayValue: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-muted/80"
        >
          {displayValue}
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        {children}
      </PopoverContent>
    </Popover>
  );
}

export function InvoiceNumberChip({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <EditableChip displayValue={value || "Invoice number"}>
      <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">Invoice number</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 font-mono text-[13.5px]"
        autoFocus
      />
    </EditableChip>
  );
}

export function IssueDateChip({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const display = value ? formatDate(value, { day: "2-digit", month: "short", year: "numeric" }) : "Issue date";

  return (
    <EditableChip displayValue={display}>
      <DatePicker label="Issue date" value={value} onChange={onChange} />
    </EditableChip>
  );
}

function dueDateLabel(dueTermId: DueTermId | null, dueDate: string) {
  if (!dueTermId) return "";
  if (dueTermId === "custom") {
    return dueDate ? `Due on ${formatDate(dueDate, { day: "2-digit", month: "short", year: "numeric" })}` : "";
  }
  const term = dueTermOptions.find((t) => t.id === dueTermId);
  if (!term) return "";
  if (term.id === "today") return "Due today";
  if (term.id === "tomorrow") return "Due tomorrow";
  return `Due in ${term.days} days`;
}

export function DueDateChip({
  dueTermId,
  dueDate,
  onChange,
  onCustomDateChange,
}: {
  dueTermId: DueTermId | null;
  dueDate: string;
  onChange: (id: DueTermId) => void;
  onCustomDateChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = dueDateLabel(dueTermId, dueDate);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {label ? (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-muted/80"
          >
            {label}
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </button>
        ) : (
          <button
            type="button"
            className="flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add due date
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1.5">
        {dueTermOptions.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              onChange(t.id);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-muted/60"
          >
            {t.label}
            {t.id === dueTermId && <Check className="h-3.5 w-3.5 text-primary" />}
          </button>
        ))}
        <div className="my-1 border-t border-border" />
        {dueTermId === "custom" ? (
          <div className="px-1 py-1">
            <DatePicker
              value={dueDate}
              onChange={(v) => {
                onCustomDateChange(v);
                setOpen(false);
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onChange("custom")}
            className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-muted/60"
          >
            Custom
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
