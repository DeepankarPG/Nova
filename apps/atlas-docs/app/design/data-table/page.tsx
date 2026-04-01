import type { Metadata } from "next";
import { PrimitiveDocLayout } from "@/components/design-system/PrimitiveDocLayout";

export const metadata: Metadata = {
  title: "Data table — PayGlocal UI",
  description: "Sortable, paginated table with empty and loading states.",
};

const IMPORT = `import { DataTable, type Column } from "@/components/ui/data-table";`;

const USAGE = `const columns: Column<Row>[] = [
  { key: "name", header: "Name", render: (row) => row.name },
];

<DataTable
  columns={columns}
  rows={data}
  getRowKey={(row) => row.id}
  emptyTitle="No rows"
/>`;

export default function DesignDataTablePage() {
  return (
    <PrimitiveDocLayout
      title="Data table"
      description="Column-driven table with client-side pagination, row click handling, and built-in empty state using EmptyState."
      importSnippet={IMPORT}
      usageSnippet={USAGE}
    />
  );
}
