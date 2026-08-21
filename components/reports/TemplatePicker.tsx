"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ReportDefinition } from "@/lib/mock-data/reports";
import { ReportIcon } from "./report-icons";
import { useWheelScrollFix } from "./useWheelScrollFix";

export const ALL_FIELDS_TEMPLATE_ID = "__all_fields__";

export function TemplatePicker({
  templates,
  savedTemplates = [],
  selectedId,
  onSelect,
  className,
}: {
  templates: ReportDefinition[];
  /** Previously saved custom reports, listed below standard templates */
  savedTemplates?: ReportDefinition[];
  /** `ALL_FIELDS_TEMPLATE_ID` = the blank/all-fields default */
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const scrollRef = useWheelScrollFix<HTMLDivElement>();
  const selected = [...templates, ...savedTemplates].find((t) => t.id === selectedId) ?? null;
  const isAllFields = selectedId === ALL_FIELDS_TEMPLATE_ID;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card pl-2.5 pr-2 text-[12.5px] font-medium text-foreground shadow-sm transition-colors",
            "hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
            className
          )}
        >
          {!isAllFields && selected && <ReportIcon report={selected} className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
          <span className="max-w-[9rem] truncate">{isAllFields ? "All fields" : selected?.name}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        ref={scrollRef}
        align="end"
        className="w-[18rem] overflow-y-auto p-1.5"
        style={{ maxHeight: "min(20rem, var(--radix-popover-content-available-height, 20rem))" }}
      >
        <button
          type="button"
          onClick={() => {
            onSelect(ALL_FIELDS_TEMPLATE_ID);
            setOpen(false);
          }}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-foreground hover:bg-muted/60"
        >
          <span className="flex-1 truncate text-left">All fields</span>
          {isAllFields && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
        </button>
        <div className="my-1 h-px bg-border" />
        {templates.map((t) => {
          const isSelected = t.id === selectedId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onSelect(t.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-foreground hover:bg-muted/60"
            >
              <ReportIcon report={t} className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-left">{t.name}</span>
              {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
            </button>
          );
        })}
        {savedTemplates.length > 0 && (
          <>
            <div className="my-1 h-px bg-border" />
            <p className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              Your saved reports
            </p>
            {savedTemplates.map((t) => {
              const isSelected = t.id === selectedId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onSelect(t.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-foreground hover:bg-muted/60"
                >
                  <ReportIcon report={t} className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-left">{t.name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                </button>
              );
            })}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
