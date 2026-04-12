"use client";

import { useMemo, useState } from "react";
import {
  DataTable,
  type Column,
  type DataTableFooterSummary,
  type DataTableHeaderStyle,
  StatusBadge,
} from "@payglocal/ui";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsVariantField, DocsVariantSelect, DocsVariantToolbar } from "@/components/docs/DocsVariantToolbar";

type Row = { id: string; name: string; status: string };

const rows: Row[] = [
  { id: "1", name: "Acme Corp", status: "active" },
  { id: "2", name: "Globex", status: "pending" },
  { id: "3", name: "Initech", status: "active" },
];

const columns: Column<Row>[] = [
  { key: "name", header: "Merchant", render: (r) => r.name },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusBadge status={r.status} size="sm" />,
  },
];

export function DataTablePlayground() {
  const [density, setDensity] = useState<
    "default" | "comfortable" | "compact"
  >("default");
  const [pageSize, setPageSize] = useState("5");
  const [headerStyle, setHeaderStyle] = useState<DataTableHeaderStyle>("surface");
  const [footerSummary, setFooterSummary] = useState<DataTableFooterSummary>("range");
  const [tableLayout, setTableLayout] = useState<"auto" | "fixed">("fixed");
  const [isLoading, setIsLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const code = useMemo(() => {
    return `const columns: Column<Row>[] = [
  { key: "name", header: "Merchant", render: (r) => r.name },
];

<DataTable
  rowKey={(r) => r.id}
  columns={columns}
  data={rows}
  density="${density}"
  pageSize={${pageSize}}
  headerStyle="${headerStyle}"
  footerSummary="${footerSummary}"
  tableLayout="${tableLayout}"
  isLoading={${isLoading}}
/>`;
  }, [density, pageSize, headerStyle, footerSummary, tableLayout, isLoading]);

  return (
    <div className="w-full space-y-4">
      <DocsVariantToolbar className="max-w-none">
        <DocsVariantField label="Density">
          <DocsVariantSelect
            value={density}
            onChange={(v) => setDensity(v as typeof density)}
            options={[
              { value: "default", label: "Default" },
              { value: "compact", label: "Compact" },
              { value: "comfortable", label: "Comfortable" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Page size">
          <DocsVariantSelect
            value={pageSize}
            onChange={setPageSize}
            options={[
              { value: "3", label: "3" },
              { value: "5", label: "5" },
              { value: "10", label: "10" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Header">
          <DocsVariantSelect
            value={headerStyle}
            onChange={(v) => setHeaderStyle(v as DataTableHeaderStyle)}
            options={[
              { value: "surface", label: "Surface" },
              { value: "minimal", label: "Minimal" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Footer">
          <DocsVariantSelect
            value={footerSummary}
            onChange={(v) => setFooterSummary(v as DataTableFooterSummary)}
            options={[
              { value: "range", label: "Range" },
              { value: "count", label: "Count" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Table layout">
          <DocsVariantSelect
            value={tableLayout}
            onChange={(v) => setTableLayout(v as "auto" | "fixed")}
            options={[
              { value: "fixed", label: "Fixed" },
              { value: "auto", label: "Auto" },
            ]}
          />
        </DocsVariantField>
        <DocsVariantField label="Loading">
          <DocsVariantSelect
            value={isLoading ? "yes" : "no"}
            onChange={(v) => setIsLoading(v === "yes")}
            options={[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes" },
            ]}
          />
        </DocsVariantField>
      </DocsVariantToolbar>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowCode((s) => !s)}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {showCode ? "Hide generated code" : "Show generated code"}
        </button>
      </div>
      {showCode ? <CodeBlock code={code} /> : null}
      <DataTable
        className="w-full shadow-sm"
        rowKey={(r) => r.id}
        columns={columns}
        data={rows}
        density={density}
        pageSize={Number(pageSize)}
        headerStyle={headerStyle}
        footerSummary={footerSummary}
        tableLayout={tableLayout}
        isLoading={isLoading}
        skeletonRows={4}
      />
    </div>
  );
}
