"use client";

import { Code2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EmbedCodeBlock } from "./EmbedCodeBlock";

export function GetButtonCodeDialog({
  open,
  onOpenChange,
  embedCode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedCode: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Get the code</DialogTitle>
        <p className="text-[12.5px] text-muted-foreground">
          Embed a button on your website that takes customers to this payment link.
        </p>

        <div className="mt-4">
          <EmbedCodeBlock code={embedCode} />
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Code2 className="h-3.5 w-3.5 shrink-0" />
          Embed this button on your website.
        </p>
      </DialogContent>
    </Dialog>
  );
}
