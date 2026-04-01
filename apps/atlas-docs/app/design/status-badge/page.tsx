import type { Metadata } from "next";
import { PrimitiveDocLayout } from "@/components/design-system/PrimitiveDocLayout";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata: Metadata = {
  title: "Status badge — PayGlocal UI",
  description: "Semantic status chips for transactions and workflows.",
};

const IMPORT = `import { StatusBadge } from "@/components/ui/status-badge";`;

const USAGE = `<StatusBadge status="completed" />
<StatusBadge status="pending" size="sm" />`;

export default function DesignStatusBadgePage() {
  return (
    <PrimitiveDocLayout
      title="Status badge"
      description="Maps known status strings to label, color variant, and optional trailing icon. Unknown statuses fall back to a muted treatment."
      importSnippet={IMPORT}
      usageSnippet={USAGE}
      preview={
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="completed" />
          <StatusBadge status="pending" />
          <StatusBadge status="failed" />
        </div>
      }
    />
  );
}
