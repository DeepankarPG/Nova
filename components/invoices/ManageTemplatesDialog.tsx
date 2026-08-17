"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { InvoiceTemplate } from "@/lib/mock-data/invoice-create";

export function ManageTemplatesDialog({
  open,
  onOpenChange,
  templates,
  onDelete,
  onRename,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: InvoiceTemplate[];
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const pendingTemplate = templates.find((t) => t.id === pendingDeleteId) ?? null;
  const mostUsedId = templates.reduce<string | null>((topId, t) => {
    if (t.usageCount <= 0) return topId;
    const top = templates.find((x) => x.id === topId);
    return !top || t.usageCount > top.usageCount ? t.id : topId;
  }, null);

  const startRename = (t: InvoiceTemplate) => {
    setRenamingId(t.id);
    setRenameValue(t.name);
  };

  const commitRename = () => {
    const name = renameValue.trim();
    if (renamingId && name) onRename(renamingId, name);
    setRenamingId(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) setRenamingId(null);
          onOpenChange(next);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogTitle>Manage templates</DialogTitle>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Rename or delete templates you no longer need. Once you apply a template to an invoice, you can still
            edit and update it from there.
          </p>

          <div className="mt-4 max-h-[22rem] space-y-1.5 overflow-y-auto">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  {renamingId === t.id ? (
                    <div className="flex items-center gap-1.5">
                      <Input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        className="h-8 text-[13px]"
                      />
                      <button
                        type="button"
                        onClick={commitRename}
                        aria-label="Save name"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-primary/10"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingId(null)}
                        aria-label="Cancel rename"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-medium text-foreground">{t.name}</span>
                      {t.id === mostUsedId && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          Most frequent
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => startRename(t)}
                        aria-label={`Rename ${t.name}`}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  <span className="mt-0.5 block text-[10.5px] text-muted-foreground">
                    Created on {formatDate(t.createdAt)} · Used {t.usageCount} time{t.usageCount === 1 ? "" : "s"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setPendingDeleteId(t.id)}
                  aria-label={`Delete ${t.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDeleteId !== null} onOpenChange={(next) => !next && setPendingDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Delete template?</DialogTitle>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            {pendingTemplate ? (
              <>
                <span className="font-medium text-foreground">{pendingTemplate.name}</span> will be removed from
                your template list. This won&apos;t affect invoices already created from it.
              </>
            ) : (
              "This template will be removed from your template list."
            )}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPendingDeleteId(null)}
              className="h-11 rounded-xl border border-border bg-card text-[14px] font-semibold text-foreground hover:bg-muted/50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (pendingDeleteId) onDelete(pendingDeleteId);
                setPendingDeleteId(null);
              }}
              className="h-11 rounded-xl bg-destructive text-[14px] font-semibold text-destructive-foreground transition-opacity hover:opacity-90"
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
