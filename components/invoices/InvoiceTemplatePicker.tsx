"use client";

import { useState } from "react";
import { Check, ChevronDown, LayoutTemplate } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { invoiceTemplates as invoiceTemplatesSeed, type InvoiceTemplate } from "@/lib/mock-data/invoice-create";

export function InvoiceTemplatePicker({
  templateId,
  onChange,
  templates = invoiceTemplatesSeed,
  onManageTemplates,
}: {
  templateId: string;
  onChange: (id: string) => void;
  templates?: InvoiceTemplate[];
  onManageTemplates?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const active = templates.find((t) => t.id === templateId) ?? templates[0]!;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutTemplate className="h-4 w-4" />
          </div>
          <h2 className="text-[15px] font-semibold text-foreground">Template</h2>
        </div>
        {onManageTemplates && (
          <button
            type="button"
            onClick={onManageTemplates}
            className="text-[12.5px] font-medium text-primary hover:underline"
          >
            Manage templates
          </button>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3.5 py-2.5 text-left hover:border-primary/50"
          >
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-medium text-foreground">{active.name}</span>
              <span className="block truncate text-[12px] text-muted-foreground">{active.description}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[20rem] p-1.5">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onChange(t.id);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left hover:bg-muted/60"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-foreground">{t.name}</span>
                <span className="block truncate text-[11.5px] text-muted-foreground">{t.description}</span>
              </span>
              {t.id === templateId && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
