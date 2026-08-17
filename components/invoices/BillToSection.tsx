"use client";

import { useState } from "react";
import { Check, Mail, MessageSquare, Phone, Plus, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBillingAddress, isBillingAddressEmpty, type BillToRecipientDraft } from "@/lib/invoice-form-types";
import { Button } from "@/components/ui/button";
import { AddRecipientDialog } from "./AddRecipientDialog";
import { ContactAvatar } from "./ContactAvatar";

const NOTIFY_ICONS: Record<string, React.ElementType> = {
  SMS: Phone,
  Email: Mail,
  WhatsApp: MessageSquare,
};

export function BillToSection({
  recipients,
  onAdd,
  onRemove,
  onMakePrimary,
}: {
  recipients: BillToRecipientDraft[];
  onAdd: (recipient: Omit<BillToRecipientDraft, "id">) => void;
  onRemove: (id: string) => void;
  onMakePrimary: (id: string) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
          <h2 className="text-[15px] font-semibold text-foreground">Who it&apos;s for</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11.5px] font-medium text-primary">
            {recipients.length} recipient{recipients.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add recipient
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {recipients.map((r) => {
          const roleLabel = r.role === "primary" ? "Primary" : "CC";
          return (
            <div key={r.id} className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
              <div className="flex items-center gap-3">
                <ContactAvatar name={r.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-foreground">{r.name}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{r.email}</p>
                  {r.phone && <p className="truncate text-[11.5px] text-muted-foreground">+91 {r.phone}</p>}
                  {!isBillingAddressEmpty(r.address) && (
                    <p className="truncate text-[11.5px] text-muted-foreground">
                      {formatBillingAddress(r.address).replace(/\n/g, ", ")}
                    </p>
                  )}
                </div>
                {r.role === "primary" ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-primary">
                    <Check className="h-2.5 w-2.5" /> Primary
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onMakePrimary(r.id)}
                    className="shrink-0 text-[11.5px] font-medium text-muted-foreground hover:text-primary"
                  >
                    Make primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(r.id)}
                  className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Remove ${r.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {r.notify.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-12">
                  <span className="text-[10.5px] text-muted-foreground">
                    {roleLabel} &middot; notify via
                  </span>
                  {r.notify.map((channel) => {
                    const Icon = NOTIFY_ICONS[channel] ?? Mail;
                    return (
                      <span
                        key={channel}
                        className={cn(
                          "flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground"
                        )}
                      >
                        <Icon className="h-2.5 w-2.5" />
                        {channel}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {recipients.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-6 text-center">
            <p className="text-[12.5px] text-muted-foreground">No recipients yet. Add someone to bill.</p>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setDialogOpen(true)}
            >
              Add recipient
            </Button>
          </div>
        )}
      </div>

      <AddRecipientDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={onAdd} />
    </div>
  );
}
