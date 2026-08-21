"use client";

import { Info, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { customFieldInputTypeOptions } from "@/lib/mock-data/payment-page-create";
import type { PaymentPageCustomField } from "@/lib/payment-page-form-types";

function nextFieldId() {
  return `pf_${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyCustomField(): PaymentPageCustomField {
  return {
    id: nextFieldId(),
    label: "",
    inputType: "single_line_text",
    optional: false,
    hasDefaultValue: false,
    defaultValue: "",
  };
}

/** Stripe-style checkbox: rounded indigo fill when checked, with indented content revealed below. */
export function NestedCheckboxSection({
  checked,
  onCheckedChange,
  label,
  info,
  children,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  info?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <button type="button" onClick={() => onCheckedChange(!checked)} className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
            checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
          )}
        >
          {checked && (
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
              <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="text-[13.5px] font-semibold text-foreground">{label}</span>
        {info && <Info className="h-3.5 w-3.5 text-muted-foreground/70" />}
      </button>

      {checked && children && <div className="ml-[1.875rem] mt-3 space-y-3">{children}</div>}
    </div>
  );
}

export function CustomFieldConfig({
  field,
  onChange,
  onRemove,
  withTopDivider,
}: {
  field: PaymentPageCustomField;
  onChange: (patch: Partial<PaymentPageCustomField>) => void;
  onRemove?: () => void;
  withTopDivider?: boolean;
}) {
  return (
    <div className={withTopDivider ? "space-y-3 border-t border-border pt-4" : "space-y-3"}>
      <div className="flex items-center gap-2">
        <select
          value={field.inputType}
          onChange={(e) => onChange({ inputType: e.target.value as PaymentPageCustomField["inputType"] })}
          className="h-10 w-36 shrink-0 rounded-lg border border-border bg-card px-2.5 text-[13px] text-foreground"
        >
          {customFieldInputTypeOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Label name"
          className="h-10 flex-1 rounded-lg border border-border bg-card px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove field"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <NestedCheckboxSection
        checked={field.hasDefaultValue}
        onCheckedChange={(v) => onChange({ hasDefaultValue: v })}
        label="Set a default value"
        info
      >
        <input
          value={field.defaultValue}
          onChange={(e) => onChange({ defaultValue: e.target.value })}
          placeholder="Default value"
          className="h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </NestedCheckboxSection>

      <NestedCheckboxSection checked={field.optional} onCheckedChange={(v) => onChange({ optional: v })} label="Mark as optional" />
    </div>
  );
}

/** Simple checkbox row for a toggleable field, styled per the simplified fields design. */
export function FieldCheckboxRow({
  label,
  icon,
  checked,
  onCheckedChange,
}: {
  label: string;
  icon: React.ReactNode;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-muted/40">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-ring/30"
      />
      {icon}
      <span className="text-[13px] font-medium text-foreground">{label}</span>
    </label>
  );
}

/** Shared "Add custom fields" block: checkbox reveals the field list + add-another button. */
export function CustomFieldsSection({
  customFields,
  onCustomFieldsChange,
}: {
  customFields: PaymentPageCustomField[];
  onCustomFieldsChange: (fields: PaymentPageCustomField[]) => void;
}) {
  const customFieldsEnabled = customFields.length > 0;

  const setCustomFieldsEnabled = (enabled: boolean) => {
    onCustomFieldsChange(enabled ? [emptyCustomField()] : []);
  };

  const addField = () => {
    onCustomFieldsChange([...customFields, emptyCustomField()]);
  };

  const updateField = (id: string, patch: Partial<PaymentPageCustomField>) => {
    onCustomFieldsChange(customFields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeField = (id: string) => {
    onCustomFieldsChange(customFields.filter((f) => f.id !== id));
  };

  return (
    <NestedCheckboxSection checked={customFieldsEnabled} onCheckedChange={setCustomFieldsEnabled} label="Add custom fields" info>
      {customFields.map((field, idx) => (
        <CustomFieldConfig
          key={field.id}
          field={field}
          onChange={(patch) => updateField(field.id, patch)}
          onRemove={customFields.length > 1 ? () => removeField(field.id) : undefined}
          withTopDivider={idx > 0}
        />
      ))}

      <button
        type="button"
        onClick={addField}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-primary/40 px-3 py-1.5 text-[12.5px] font-medium text-primary hover:bg-primary/5"
      >
        <Plus className="h-3.5 w-3.5" />
        Add another field
      </button>
    </NestedCheckboxSection>
  );
}
