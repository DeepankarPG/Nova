import type { Metadata } from "next";
import { Package } from "lucide-react";
import { PrimitiveDocLayout } from "@/components/design-system/PrimitiveDocLayout";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Empty state — PayGlocal UI",
  description: "Centered empty view with icon, copy, and optional action.",
};

const IMPORT = `import { EmptyState } from "@/components/ui/empty-state";`;

const USAGE = `<EmptyState
  icon={Inbox}
  title="Nothing here yet"
  description="Create your first item to get started."
  action={<Button variant="primary" size="sm">Create</Button>}
/>`;

export default function DesignEmptyStatePage() {
  return (
    <PrimitiveDocLayout
      title="Empty state"
      description="Use for lists, tables, and panels with no data. Accepts a Lucide icon component and optional primary action."
      importSnippet={IMPORT}
      usageSnippet={USAGE}
      preview={
        <EmptyState
          icon={Package}
          title="No shipments"
          description="Link a carrier to see activity."
          action={
            <Button variant="primary" size="sm">
              Connect
            </Button>
          }
          className="py-10"
        />
      }
    />
  );
}
