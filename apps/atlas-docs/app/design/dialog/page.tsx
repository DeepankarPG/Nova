import type { Metadata } from "next";
import { PrimitiveDocLayout } from "@/components/design-system/PrimitiveDocLayout";

export const metadata: Metadata = {
  title: "Dialog — PayGlocal UI",
  description: "Modal dialog built on Radix Dialog.",
};

const IMPORT = `import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";`;

const USAGE = `<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <button type="button">Open</button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Supporting copy.</DialogDescription>
  </DialogContent>
</Dialog>`;

export default function DesignDialogPage() {
  return (
    <PrimitiveDocLayout
      title="Dialog"
      description="Accessible modal layer on @radix-ui/react-dialog, with overlay, focus trap, and a styled panel matching portal tokens."
      importSnippet={IMPORT}
      usageSnippet={USAGE}
    />
  );
}
