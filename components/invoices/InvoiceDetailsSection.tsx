"use client";

import { Repeat } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { recurringFrequencies, type RecurringFrequency } from "@/lib/mock-data/invoice-create";
import { DatePicker } from "@/components/ui/date-picker";

export function InvoiceDetailsSection({
  isRecurring,
  onIsRecurringChange,
  recurringFrequency,
  onRecurringFrequencyChange,
  recurringStartDate,
  onRecurringStartDateChange,
}: {
  isRecurring: boolean;
  onIsRecurringChange: (v: boolean) => void;
  recurringFrequency: RecurringFrequency;
  onRecurringFrequencyChange: (v: RecurringFrequency) => void;
  recurringStartDate: string;
  onRecurringStartDateChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 pb-4 shadow-sm">
      <div className={isRecurring ? "mb-4 flex items-center justify-between" : "flex items-center justify-between"}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Repeat className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-foreground">Recurring invoice</h2>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Optional
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground">Automatically bill this on a schedule</p>
          </div>
        </div>
        <Switch checked={isRecurring} onCheckedChange={onIsRecurringChange} aria-label="Toggle recurring invoice" />
      </div>

      {isRecurring && (
        <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">Frequency</label>
            <Select value={recurringFrequency} onValueChange={(v) => onRecurringFrequencyChange(v as RecurringFrequency)}>
              <SelectTrigger className="h-11 text-[14px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recurringFrequencies.map((f) => (
                  <SelectItem key={f.id} value={f.id} className="text-[14px]">
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DatePicker label="Recurring start date" value={recurringStartDate} onChange={onRecurringStartDateChange} />
        </div>
      )}
    </div>
  );
}
