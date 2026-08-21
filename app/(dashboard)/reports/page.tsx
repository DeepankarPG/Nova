"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace-context";
import {
  allReports,
  categoryOrderForTab,
  recentReports,
  reportDownloads,
  reportSchedules,
  reportsForProductTab,
  type ReportDefinition,
  type ReportSchedule,
} from "@/lib/mock-data/reports";
import { ReportRow } from "@/components/reports/ReportRow";
import { FileFormatBadge } from "@/components/reports/FileFormatBadge";
import { DownloadReportPanel } from "@/components/reports/DownloadReportPanel";
import { ScheduleReportPanel } from "@/components/reports/ScheduleReportPanel";
import { CustomReportBuilderModal, type CustomReportCreatedPayload } from "@/components/reports/CustomReportBuilderModal";
import { ReportsDownloadsTab } from "@/components/reports/ReportsDownloadsTab";
import { ReportsSchedulesTab } from "@/components/reports/ReportsSchedulesTab";

type MainTab = "overview" | "downloads" | "schedules";
type CatalogFilter = "all" | "standard" | "custom";

export default function ReportsPage() {
  const { activeProductTab, activeBusiness, group } = useWorkspace();
  const [mainTab, setMainTab] = useState<MainTab>("overview");
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("all");
  const [query, setQuery] = useState("");

  const [downloadTarget, setDownloadTarget] = useState<ReportDefinition | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<ReportDefinition | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [createdCustomReports, setCreatedCustomReports] = useState<ReportDefinition[]>([]);
  const [allSchedulesState, setAllSchedulesState] = useState<ReportSchedule[]>(reportSchedules);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const scopedReports = useMemo(
    () => reportsForProductTab(activeProductTab, [...allReports, ...createdCustomReports]),
    [activeProductTab, createdCustomReports]
  );
  const scopedRecents = useMemo(() => recentReports(scopedReports), [scopedReports]);
  const scopedCustomReports = useMemo(
    () => createdCustomReports.filter((r) => scopedReports.some((s) => s.id === r.id)),
    [createdCustomReports, scopedReports]
  );
  const favoriteReports = useMemo(
    () => scopedReports.filter((r) => favoriteIds.has(r.id)),
    [scopedReports, favoriteIds]
  );
  const categoryOrder = useMemo(() => categoryOrderForTab(activeProductTab), [activeProductTab]);

  const toggleFavorite = (report: ReportDefinition) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(report.id)) next.delete(report.id);
      else next.add(report.id);
      return next;
    });
  };

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return scopedReports.filter(
      (r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }, [query, scopedReports]);

  const catalogReports = useMemo(() => {
    const base =
      catalogFilter === "standard"
        ? scopedReports.filter((r) => r.kind === "standard")
        : catalogFilter === "custom"
          ? scopedReports.filter((r) => r.kind === "custom")
          : scopedReports;
    return base;
  }, [scopedReports, catalogFilter]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, ReportDefinition[]>();
    for (const r of catalogReports) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return map;
  }, [catalogReports]);

  const scopeSubtitle = activeBusiness
    ? `${activeBusiness.name} · ${activeBusiness.primaryAccount.mid}`
    : `${group.name} · All Businesses`;

  const productLabel = activeProductTab === "pg" ? "Payment Gateway" : activeProductTab === "mca" ? "Multi-Currency Accounts" : null;

  const scopedDownloads = useMemo(
    () =>
      activeProductTab === "pg" || activeProductTab === "mca"
        ? reportDownloads.filter((d) => d.products.includes(activeProductTab))
        : reportDownloads,
    [activeProductTab]
  );
  const scopedSchedules = useMemo(
    () =>
      activeProductTab === "pg" || activeProductTab === "mca"
        ? allSchedulesState.filter((s) => s.products.includes(activeProductTab))
        : allSchedulesState,
    [activeProductTab, allSchedulesState]
  );

  const handleToggleScheduleStatus = (id: string) => {
    setAllSchedulesState((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus = s.status === "active" ? "paused" : "active";
        toast.success(nextStatus === "active" ? "Schedule resumed" : "Schedule paused", { description: s.reportName });
        return { ...s, status: nextStatus };
      })
    );
  };

  const handleDeleteSchedule = (schedule: ReportSchedule) => {
    setAllSchedulesState((prev) => prev.filter((s) => s.id !== schedule.id));
    toast.success("Schedule deleted", { description: schedule.reportName });
  };

  const handleSaveSchedule = (id: string, updates: Partial<ReportSchedule>) => {
    setAllSchedulesState((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleCustomReportCreated = (payload: CustomReportCreatedPayload) => {
    const products: ("pg" | "mca")[] = activeProductTab === "mca" ? ["mca"] : ["pg"];
    setCreatedCustomReports((prev) => [
      ...prev,
      {
        id: `rpt_custom_new_${prev.length}`,
        name: payload.name,
        description: `${payload.selected.length} columns · ${payload.format.toUpperCase()}`,
        category: activeProductTab === "mca" ? "Multi-Currency Accounts" : "Payments",
        products,
        kind: "custom",
        icon: "file-text",
        defaultFormat: payload.format,
        savedTemplateConfig: { selectedColumns: payload.selected, format: payload.format },
      },
    ]);
    if (payload.schedule) {
      const { frequency, time, dayOfWeek, dayOfMonth } = payload.schedule;
      setAllSchedulesState((prev) => [
        ...prev,
        {
          id: `sch_custom_new_${prev.length}`,
          reportName: payload.name,
          frequency,
          time,
          dayOfWeek,
          dayOfMonth,
          format: payload.format,
          recipients: [],
          status: "active",
          nextRunAt: new Date().toISOString(),
          products,
        },
      ]);
    }
    setMainTab("overview");
    setCatalogFilter("custom");
  };

  return (
    <div className="w-full min-w-0 max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="Reports"
        subtitle={productLabel ? `${scopeSubtitle} · ${productLabel} reports` : `${scopeSubtitle} · All reports`}
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setBuilderOpen(true)}
          >
            Create custom report
          </Button>
        }
      />

      {/* Main tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
        {(
          [
            { id: "overview" as const, label: "Overview" },
            { id: "downloads" as const, label: "Downloads" },
            { id: "schedules" as const, label: "Schedules" },
          ]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMainTab(tab.id)}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              mainTab === tab.id ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mainTab === "overview" && (
        <div className="space-y-6">
          {/* Search-first picker */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reports — try “settlements”, “refunds”, “invoice”…"
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-9 text-[13.5px] text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring/25"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {searched ? (
            <section>
              <p className="mb-2.5 text-[12px] font-medium text-muted-foreground">
                {searched.length} result{searched.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
              </p>
              {searched.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-12 text-center">
                  <p className="text-[13.5px] font-medium text-foreground">No reports match your search</p>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">Try a different keyword, or build exactly what you need.</p>
                  <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setBuilderOpen(true)}>
                    Create custom report
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {searched.map((r) => (
                    <ReportRow
                      key={r.id}
                      report={r}
                      onDownload={setDownloadTarget}
                      onSchedule={setScheduleTarget}
                      isFavorite={favoriteIds.has(r.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : (
            <>
              {/* Favourites */}
              {favoriteReports.length > 0 && (
                <section>
                  <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Favourites</h3>
                  <div className="space-y-2">
                    {favoriteReports.map((r) => (
                      <ReportRow
                        key={r.id}
                        report={r}
                        onDownload={setDownloadTarget}
                        onSchedule={setScheduleTarget}
                        isFavorite
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Recent & frequently used */}
              {scopedRecents.length > 0 && (
                <section>
                  <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Recent &amp; frequently used
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {scopedRecents.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setDownloadTarget(r)}
                        className="group flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3 text-left shadow-sm transition-all duration-150 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <FileFormatBadge format={r.defaultFormat} className="h-8 w-8" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-foreground">{r.name}</p>
                          <p className="text-[11px] text-muted-foreground">One-click download</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Your custom reports */}
              {scopedCustomReports.length > 0 && (
                <section>
                  <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Your custom reports
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<Plus className="h-3.5 w-3.5" />}
                      className="h-7 px-2.5 text-[12px]"
                      onClick={() => setBuilderOpen(true)}
                    >
                      New
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {scopedCustomReports.map((r) => (
                      <ReportRow
                        key={r.id}
                        report={r}
                        onDownload={setDownloadTarget}
                        onSchedule={setScheduleTarget}
                        isFavorite={favoriteIds.has(r.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Catalog filter chips */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">All reports</h3>
                  <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
                    {(
                      [
                        { id: "all" as const, label: "All" },
                        { id: "standard" as const, label: "Standard" },
                        { id: "custom" as const, label: "Custom" },
                      ]
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setCatalogFilter(f.id)}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
                          catalogFilter === f.id
                            ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {categoryOrder
                    .filter((cat) => (groupedByCategory.get(cat)?.length ?? 0) > 0)
                    .map((cat) => (
                      <div key={cat}>
                        <p className="mb-2 text-[12.5px] font-medium text-foreground">{cat}</p>
                        <div className="space-y-2">
                          {groupedByCategory.get(cat)!.map((r) => (
                            <ReportRow
                              key={r.id}
                              report={r}
                              onDownload={setDownloadTarget}
                              onSchedule={setScheduleTarget}
                              isFavorite={favoriteIds.has(r.id)}
                              onToggleFavorite={toggleFavorite}
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                  {catalogReports.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border py-12 text-center">
                      <p className="text-[13.5px] font-medium text-foreground">
                        {catalogFilter === "custom" ? "No custom reports yet" : "No reports found"}
                      </p>
                      <p className="mt-1 text-[12.5px] text-muted-foreground">
                        {catalogFilter === "custom"
                          ? "Build one from any report's columns in a few clicks."
                          : "Try another filter."}
                      </p>
                      {catalogFilter === "custom" && (
                        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setBuilderOpen(true)}>
                          Create custom report
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {mainTab === "downloads" && <ReportsDownloadsTab downloads={scopedDownloads} />}

      {mainTab === "schedules" && (
        <ReportsSchedulesTab
          schedules={scopedSchedules}
          onCreateClick={() => setMainTab("overview")}
          onToggleStatus={handleToggleScheduleStatus}
          onDelete={handleDeleteSchedule}
          onEdit={setEditingSchedule}
        />
      )}

      <DownloadReportPanel
        open={!!downloadTarget}
        onOpenChange={(open) => !open && setDownloadTarget(null)}
        report={downloadTarget}
      />
      <ScheduleReportPanel
        open={!!scheduleTarget}
        onOpenChange={(open) => !open && setScheduleTarget(null)}
        report={scheduleTarget}
      />
      <ScheduleReportPanel
        open={!!editingSchedule}
        onOpenChange={(open) => !open && setEditingSchedule(null)}
        report={null}
        editingSchedule={editingSchedule}
        onSaved={handleSaveSchedule}
        onDeleted={handleDeleteSchedule}
      />
      <CustomReportBuilderModal
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        productTab={activeProductTab}
        savedTemplates={scopedCustomReports}
        onCreated={handleCustomReportCreated}
      />
    </div>
  );
}
