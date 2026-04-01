import type { Metadata } from "next";
import { PrimitiveDocLayout } from "@/components/design-system/PrimitiveDocLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page header — PayGlocal UI",
  description: "Title, subtitle, and actions for list and detail pages.",
};

const IMPORT = `import { PageHeader } from "@/components/ui/page-header";`;

const USAGE = `<PageHeader
  title="Transactions"
  subtitle="Last 30 days"
  actions={<Button variant="outline" size="sm">Export</Button>}
/>`;

export default function DesignPageHeaderPage() {
  return (
    <PrimitiveDocLayout
      title="Page header"
      description="Standard page chrome: heading, optional description, and a slot for toolbar actions."
      importSnippet={IMPORT}
      usageSnippet={USAGE}
      preview={
        <PageHeader
          title="Example page"
          subtitle="Short supporting line"
          actions={
            <Button variant="outline" size="sm">
              Action
            </Button>
          }
        />
      }
    />
  );
}
