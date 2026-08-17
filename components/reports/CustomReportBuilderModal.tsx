"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CalendarClock, ChevronDown, Mail, Plus, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  baseReportTypesForTab,
  customColumnCatalogForTab,
  reportFormats,
  type ReportDefinition,
  type ReportFormat,
  type ScheduleFrequency,
} from "@/lib/mock-data/reports";
import type { ProductTab } from "@/lib/workspace-types";
import { SortableSelectedColumn, type SelectedColumn } from "./SortableSelectedColumn";
import { GroupColumnPicker } from "./GroupColumnPicker";
import { TemplatePicker, ALL_FIELDS_TEMPLATE_ID } from "./TemplatePicker";
import { DeviceFramedPreview } from "./DeviceFramedPreview";

function columnId(group: string, column: string) {
  return `${group}.${column}`;
}

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** Deterministic sample cell so the preview looks like real data without Math.random(). */
function sampleCell(column: string, rowIndex: number): string {
  const key = column.toLowerCase();
  if (key.includes("id") || key.includes("code") || key.includes("reference") || key.includes("rrn")) {
    return `${column.replace(/[^a-z0-9]/gi, "").slice(0, 3).toLowerCase()}_${["9k2m", "8h1n", "7g0o"][rowIndex]}`;
  }
  if (key.includes("amount") || key.includes("fee") || key.includes("tax")) {
    return ["₹4,500.00", "₹12,000.00", "₹899.00"][rowIndex] ?? "₹0.00";
  }
  if (key.includes("status")) return ["Success", "Pending", "Failed"][rowIndex] ?? "Success";
  if (key.includes("date") || key.includes("at") || key.includes("deadline")) {
    return ["2 Jul 2026", "1 Jul 2026", "30 Jun 2026"][rowIndex];
  }
  if (key.includes("currency")) return "INR";
  if (key.includes("email")) return ["a@company.com", "b@company.com", "c@company.com"][rowIndex];
  if (key.includes("method") || key.includes("network") || key.includes("wallet") || key.includes("flow")) {
    return ["UPI", "Card", "Netbanking"][rowIndex];
  }
  if (key.includes("name")) return ["Ravi Shankar", "Meera Iyer", "Arjun Verma"][rowIndex];
  if (key.includes("reason")) return ["Fraudulent", "Duplicate", "Not received"][rowIndex];
  if (key.includes("notes") || key.includes("description")) return ["—", "Priority client", "—"][rowIndex];
  return ["—", "—", "—"][rowIndex];
}

const DEFAULT_FIELD_COUNT = 6;

const SCHEDULE_FREQUENCIES: { id: ScheduleFrequency; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

const SCHEDULE_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export type CustomReportCreatedPayload = {
  name: string;
  selected: SelectedColumn[];
  format: ReportFormat;
  schedule?: {
    frequency: ScheduleFrequency;
    time: string;
    dayOfWeek?: string;
    dayOfMonth?: number;
  };
};

export function CustomReportBuilderModal({
  open,
  onOpenChange,
  productTab,
  savedTemplates = [],
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTab: ProductTab;
  /** Previously saved custom reports, offered alongside standard templates in "Report type" */
  savedTemplates?: ReportDefinition[];
  onCreated?: (payload: CustomReportCreatedPayload) => void;
}) {
  const templates = useMemo(() => baseReportTypesForTab(productTab), [productTab]);
  const fullCatalog = useMemo(() => customColumnCatalogForTab(productTab), [productTab]);

  const [templateId, setTemplateId] = useState<string>(ALL_FIELDS_TEMPLATE_ID);
  const [reportName, setReportName] = useState("");
  const [selected, setSelected] = useState<SelectedColumn[]>([]);
  const [addFieldsOpen, setAddFieldsOpen] = useState(false);
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const [format, setFormat] = useState<ReportFormat>("csv");
  const [emailOn, setEmailOn] = useState(false);
  const [email, setEmail] = useState("");
  const [scheduleOn, setScheduleOn] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<ScheduleFrequency>("weekly");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState("Monday");
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const prevOpen = useRef(false);

  const template: ReportDefinition | null = useMemo(
    () => templates.find((t) => t.id === templateId) ?? null,
    [templates, templateId]
  );
  const savedTemplate: ReportDefinition | null = useMemo(
    () => savedTemplates.find((t) => t.id === templateId) ?? null,
    [savedTemplates, templateId]
  );
  // Saved custom reports render with the same per-group picker view as "All fields",
  // since they can span multiple sources and don't have one "own group" checklist.
  const isAllFields = templateId === ALL_FIELDS_TEMPLATE_ID || !!savedTemplate;

  // Saved custom reports can span multiple sources, so they use the "all fields"
  // per-group picker view rather than a single own-group checklist.
  const ownGroupName = !savedTemplate ? (template?.availableColumnGroups?.[0]?.group ?? null) : null;
  const additionalGroups = useMemo(
    () => fullCatalog.filter((g) => g.group !== ownGroupName),
    [fullCatalog, ownGroupName]
  );

  useEffect(() => {
    if (open && !prevOpen.current) {
      setTemplateId(ALL_FIELDS_TEMPLATE_ID);
      setReportName("");
      setSelected([]);
      setAddFieldsOpen(false);
      setCustomiseOpen(false);
      setFormat("csv");
      setEmailOn(false);
      setEmail("");
      setScheduleOn(false);
      setScheduleFrequency("weekly");
      setScheduleTime("09:00");
      setScheduleDayOfWeek("Monday");
      setScheduleDayOfMonth(1);
    }
    prevOpen.current = open;
  }, [open]);

  const scheduleCadenceLabel = useMemo(() => {
    if (scheduleFrequency === "daily") return `Every day at ${scheduleTime}`;
    if (scheduleFrequency === "weekly") return `Every ${scheduleDayOfWeek} at ${scheduleTime}`;
    return `Day ${scheduleDayOfMonth} of every month at ${scheduleTime}`;
  }, [scheduleFrequency, scheduleTime, scheduleDayOfWeek, scheduleDayOfMonth]);

  const selectTemplate = (id: string) => {
    setTemplateId(id);
    setAddFieldsOpen(false);
    setCustomiseOpen(false);
    if (id === ALL_FIELDS_TEMPLATE_ID) {
      setSelected([]);
      return;
    }
    const saved = savedTemplates.find((r) => r.id === id);
    if (saved?.savedTemplateConfig) {
      setSelected(saved.savedTemplateConfig.selectedColumns.map((c) => ({ ...c })));
      setFormat(saved.savedTemplateConfig.format);
      setReportName(saved.name);
      return;
    }
    const t = templates.find((r) => r.id === id);
    const ownGroup = t?.availableColumnGroups?.[0];
    const defaults: SelectedColumn[] = ownGroup
      ? ownGroup.columns.slice(0, DEFAULT_FIELD_COUNT).map((col) => ({
          id: columnId(ownGroup.group, col),
          group: ownGroup.group,
          column: col,
          label: slugify(col),
        }))
      : [];
    setSelected(defaults);
  };

  const selectedColumnsByGroup = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const entry of selected) {
      const list = map.get(entry.group) ?? [];
      list.push(entry.column);
      map.set(entry.group, list);
    }
    return map;
  }, [selected]);

  const toggleColumn = (group: string, col: string) => {
    const id = columnId(group, col);
    setSelected((prev) => {
      if (prev.some((s) => s.id === id)) return prev.filter((s) => s.id !== id);
      return [...prev, { id, group, column: col, label: slugify(col) }];
    });
  };

  const removeColumn = (id: string) => setSelected((prev) => prev.filter((s) => s.id !== id));
  const relabelColumn = (id: string, label: string) =>
    setSelected((prev) => prev.map((s) => (s.id === id ? { ...s, label } : s)));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setSelected((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const canCreate =
    !!reportName.trim() && selected.length > 0 && selected.every((s) => s.label.trim().length > 0) && (!emailOn || !!email);

  const handleCreate = async () => {
    if (!canCreate) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    onOpenChange(false);
    toast.success("Custom report created", {
      description: `${reportName.trim()} · ${selected.length} columns · ${format.toUpperCase()}${emailOn ? ` · emailing ${email}` : ""}${scheduleOn ? ` · ${scheduleCadenceLabel}` : ""}`,
    });
    onCreated?.({
      name: reportName.trim(),
      selected,
      format,
      schedule: scheduleOn
        ? {
            frequency: scheduleFrequency,
            time: scheduleTime,
            dayOfWeek: scheduleFrequency === "weekly" ? scheduleDayOfWeek : undefined,
            dayOfMonth: scheduleFrequency === "monthly" ? scheduleDayOfMonth : undefined,
          }
        : undefined,
    });
  };

  const previewRows = [0, 1, 2];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className={cn(
          "left-1/2 top-[4vh] max-h-[min(92vh,840px)] w-[min(100%-1.5rem,64rem)] max-w-none -translate-x-1/2 translate-y-0",
          "flex flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-none"
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <DialogTitle className="pr-0 text-[15px]">Create custom report</DialogTitle>
            <TemplatePicker
              templates={templates}
              savedTemplates={savedTemplates}
              selectedId={templateId}
              onSelect={selectTemplate}
            />
          </div>
          <DialogClose
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[27.6rem_36rem]">
          {/* Left: name, fields, customise, format, email */}
          <div className="flex min-h-0 flex-col overflow-y-auto border-b border-border px-5 py-4 lg:border-b-0 lg:border-r">
            <label className="mb-1.5 block text-[12px] font-medium text-foreground">Report name</label>
            <Input
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Eg. Monthly Recon Report"
              className="mb-5 h-9 text-[13px]"
            />

            {isAllFields ? (
              // ── All fields: every data source as its own chip-multiselect ──
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">Fields</p>
                  <span className="text-[11.5px] text-muted-foreground">{selected.length} selected</span>
                </div>
                <div className="space-y-3">
                  {fullCatalog.map((group) => (
                    <GroupColumnPicker
                      key={group.group}
                      group={group.group}
                      columns={group.columns}
                      selectedColumns={selectedColumnsByGroup.get(group.group) ?? []}
                      onToggle={(col) => toggleColumn(group.group, col)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Fields · {ownGroupName}
                  </p>
                  <span className="text-[11.5px] text-muted-foreground">{selected.length} selected</span>
                </div>
                <div className="mb-1.5 space-y-0.5 rounded-lg border border-border bg-muted/20 p-2">
                  {template?.availableColumnGroups?.[0]?.columns.map((col) => {
                    const id = columnId(ownGroupName!, col);
                    const checked = selected.some((s) => s.id === id);
                    return (
                      <label
                        key={col}
                        className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[12.5px] text-foreground hover:bg-muted/60 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleColumn(ownGroupName!, col)}
                          className="h-3.5 w-3.5 rounded border-border accent-primary"
                        />
                        <span className="truncate">{col}</span>
                      </label>
                    );
                  })}
                </div>

                {/* + Add fields from other sources */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setAddFieldsOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-lg px-1.5 py-2 text-[12.5px] font-medium text-primary hover:bg-primary/5"
                  >
                    <span className="flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Add fields from other sources
                    </span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", addFieldsOpen && "rotate-180")} />
                  </button>
                  {addFieldsOpen && (
                    <div className="mt-2 space-y-3 rounded-lg border border-border bg-muted/10 p-3">
                      {additionalGroups.map((group) => (
                        <GroupColumnPicker
                          key={group.group}
                          group={group.group}
                          columns={group.columns}
                          selectedColumns={selectedColumnsByGroup.get(group.group) ?? []}
                          onToggle={(col) => toggleColumn(group.group, col)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Customise: reorder + rename */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setCustomiseOpen((v) => !v)}
                disabled={selected.length === 0}
                className="flex w-full items-center justify-between rounded-lg px-1.5 py-2 text-[12.5px] font-medium text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Customise column order &amp; names
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", customiseOpen && "rotate-180")} />
              </button>
              {customiseOpen && selected.length > 0 && (
                <div className="mt-2 rounded-lg border border-border bg-muted/10 p-2">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={selected.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-1.5">
                        {selected.map((entry) => (
                          <SortableSelectedColumn
                            key={entry.id}
                            entry={entry}
                            onLabelChange={relabelColumn}
                            onRemove={removeColumn}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>

            {/* Format */}
            <div className="mb-3">
              <label className="mb-1.5 block text-[12px] font-medium text-foreground">Format</label>
              <Select value={format} onValueChange={(v) => setFormat(v as ReportFormat)}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportFormats.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="text-[13px]">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="rounded-lg border border-border bg-card px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-foreground">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email each run
                </div>
                <Switch checked={emailOn} onCheckedChange={setEmailOn} aria-label="Toggle email delivery" />
              </div>
              {emailOn && (
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="mt-2 h-8 text-[12.5px]"
                />
              )}
            </div>

            {/* Schedule */}
            <div className="mt-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-foreground">
                  <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                  Schedule this report
                </div>
                <Switch checked={scheduleOn} onCheckedChange={setScheduleOn} aria-label="Toggle recurring schedule" />
              </div>
              {scheduleOn && (
                <div className="mt-3 space-y-2.5">
                  <div className="flex gap-1.5">
                    {SCHEDULE_FREQUENCIES.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setScheduleFrequency(f.id)}
                        className={cn(
                          "flex-1 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                          scheduleFrequency === f.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {scheduleFrequency === "weekly" && (
                      <div>
                        <label className="mb-1 block text-[11.5px] text-muted-foreground">Day</label>
                        <Select value={scheduleDayOfWeek} onValueChange={setScheduleDayOfWeek}>
                          <SelectTrigger className="h-8 text-[12.5px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SCHEDULE_WEEKDAYS.map((d) => (
                              <SelectItem key={d} value={d} className="text-[12.5px]">
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {scheduleFrequency === "monthly" && (
                      <div>
                        <label className="mb-1 block text-[11.5px] text-muted-foreground">Day of month</label>
                        <Select value={String(scheduleDayOfMonth)} onValueChange={(v) => setScheduleDayOfMonth(Number(v))}>
                          <SelectTrigger className="h-8 text-[12.5px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-56">
                            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                              <SelectItem key={d} value={String(d)} className="text-[12.5px]">
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className={scheduleFrequency === "daily" ? "col-span-2" : ""}>
                      <label className="mb-1 block text-[11.5px] text-muted-foreground">Time</label>
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="h-8 text-[12.5px]"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground">{scheduleCadenceLabel}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: live preview */}
          <div className="flex min-h-0 flex-col overflow-hidden bg-muted/30">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-2.5">
              <span className="text-[12px] font-medium text-muted-foreground">Live preview</span>
              <span className="text-[11.5px] text-muted-foreground">{selected.length} columns selected</span>
            </div>
            <div className="flex-1 overflow-auto p-5">
              {selected.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-[13px] font-medium text-foreground">No fields selected yet</p>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">Pick fields on the left to see them appear here.</p>
                </div>
              ) : (
                <DeviceFramedPreview
                  format={format}
                  columns={selected.map((entry) => entry.label || entry.column)}
                  rows={previewRows.map((rowIndex) => selected.map((entry) => sampleCell(entry.column, rowIndex)))}
                  reportName={reportName || "custom_report"}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-card px-5 py-3.5">
          <span className="text-[11.5px] text-muted-foreground">Builds in the background — check Custom Reports.</span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" size="sm" disabled={!canCreate} isLoading={isSubmitting} onClick={handleCreate}>
              Create report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
