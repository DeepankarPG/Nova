"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function SaveAsTemplateDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState("");

  const reset = () => setName("");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogTitle>Save as template</DialogTitle>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Reuse this invoice&apos;s line items, payment details, and settings the next time you create one.
        </p>

        <div className="mt-4">
          <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">Template name</label>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Monthly retainer"
            className="h-10 text-[13.5px]"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            className="h-11 rounded-xl border border-border bg-card text-[14px] font-semibold text-foreground hover:bg-muted/50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="h-11 rounded-xl bg-primary text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
          >
            Save template
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
