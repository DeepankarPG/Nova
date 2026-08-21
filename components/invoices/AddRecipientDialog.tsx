"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronLeft, Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { notifyChannels, recentCustomers, type NotifyChannel, type RecentCustomer } from "@/lib/mock-data/invoice-create";
import type { BillToRecipientDraft } from "@/lib/invoice-form-types";
import { ContactAvatar } from "./ContactAvatar";

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium transition-colors",
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50"
      )}
    >
      {active ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      {children}
    </button>
  );
}

type Draft = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const EMPTY_ADDRESS = { addressLine1: "", city: "", state: "", postalCode: "", country: "" };

export function AddRecipientDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (recipient: Omit<BillToRecipientDraft, "id">) => void;
}) {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [role, setRole] = useState<"primary" | "cc">("primary");
  const [notify, setNotify] = useState<Set<NotifyChannel>>(new Set(["Email"]));

  const reset = () => {
    setQuery("");
    setDraft(null);
    setRole("primary");
    setNotify(new Set(["Email"]));
  };

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return recentCustomers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [query]);

  const toggleNotify = (channel: NotifyChannel) => {
    setNotify((prev) => {
      const next = new Set(prev);
      if (next.has(channel)) next.delete(channel);
      else next.add(channel);
      return next;
    });
  };

  const selectExisting = (c: RecentCustomer) => {
    setDraft({
      name: c.name,
      email: c.email,
      phone: "",
      addressLine1: c.address.line1,
      city: c.address.city,
      state: c.address.state,
      postalCode: c.address.postalCode,
      country: c.address.country,
    });
  };

  const selectNew = () => {
    setDraft({ name: query.trim(), email: "", phone: "", ...EMPTY_ADDRESS });
  };

  const valid = !!draft && (draft.name.trim().length > 0 || draft.email.trim().length > 0);

  const handleAdd = () => {
    if (!draft || !valid) return;
    onAdd({
      name: draft.name.trim() || "Unknown",
      email: draft.email.trim() || `${(draft.name || "customer").toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: draft.phone.trim(),
      role,
      notify: Array.from(notify),
      address: {
        line1: draft.addressLine1.trim(),
        city: draft.city.trim(),
        state: draft.state.trim(),
        postalCode: draft.postalCode.trim(),
        country: draft.country.trim(),
      },
    });
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
      <DialogContent className="max-w-md">
        <DialogTitle>{draft ? "Recipient details" : "Add recipient"}</DialogTitle>

        {!draft ? (
          <div className="mt-4 space-y-1.5">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3.5 focus-within:ring-2 focus-within:ring-ring/30">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search or add a recipient..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-full w-full min-w-0 bg-transparent text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            {query.trim() ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <button
                  type="button"
                  onClick={selectNew}
                  className="flex w-full items-center gap-2 bg-primary px-3.5 py-2.5 text-left text-[13.5px] font-medium text-primary-foreground hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add &quot;{query.trim()}&quot;
                </button>
                {matches.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectExisting(c)}
                    className="flex w-full items-center gap-3 border-t border-border px-3.5 py-2.5 text-left hover:bg-muted/40"
                  >
                    <ContactAvatar name={c.name} className="h-7 w-7 text-[11px]" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-foreground">{c.name}</span>
                      <span className="block truncate text-[11.5px] text-muted-foreground">{c.email}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : recentCustomers.length > 0 ? (
              <div>
                <p className="px-1 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Recent
                </p>
                <div className="overflow-hidden rounded-xl border border-border">
                  {recentCustomers.slice(0, 4).map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectExisting(c)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-muted/40",
                        i > 0 && "border-t border-border"
                      )}
                    >
                      <ContactAvatar name={c.name} className="h-7 w-7 text-[11px]" />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-foreground">{c.name}</span>
                        <span className="block truncate text-[11.5px] text-muted-foreground">{c.email}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="px-1 pt-2 text-[12.5px] text-muted-foreground">
                No saved recipients yet. Start typing a name or email to add one.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="flex items-center gap-1 text-[12.5px] font-medium text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to search
            </button>

            <div className="space-y-2.5">
              <input
                autoFocus
                type="text"
                placeholder="Full name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-card px-3.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="flex h-10 items-center overflow-hidden rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring/30">
                  <div className="flex h-full flex-shrink-0 items-center gap-1.5 border-r border-border bg-muted/40 pl-3 pr-2">
                    <span className="text-[13px] font-semibold text-foreground">+91</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={draft.phone}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    className="h-full flex-1 bg-transparent px-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email ID"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-[13.5px] font-semibold text-foreground">Billing address</p>
              <input
                type="text"
                placeholder="Address line"
                value={draft.addressLine1}
                onChange={(e) => setDraft({ ...draft, addressLine1: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-card px-3.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="City"
                  value={draft.city}
                  onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
                <input
                  type="text"
                  placeholder="State / region"
                  value={draft.state}
                  onChange={(e) => setDraft({ ...draft, state: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
                <input
                  type="text"
                  placeholder="Postal code"
                  value={draft.postalCode}
                  onChange={(e) => setDraft({ ...draft, postalCode: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={draft.country}
                  onChange={(e) => setDraft({ ...draft, country: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-[13.5px] font-semibold text-foreground">Notify customer via</p>
              <div className="flex flex-wrap items-center gap-2">
                {notifyChannels.map((channel) => (
                  <ChipButton key={channel} active={notify.has(channel)} onClick={() => toggleNotify(channel)}>
                    {channel}
                  </ChipButton>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[13.5px] font-semibold text-foreground">Role</p>
              <div className="flex items-center gap-2">
                <ChipButton active={role === "primary"} onClick={() => setRole("primary")}>
                  Primary recipient
                </ChipButton>
                <ChipButton active={role === "cc"} onClick={() => setRole("cc")}>
                  CC (copy)
                </ChipButton>
              </div>
            </div>
          </div>
        )}

        <div className={cn("mt-5 grid gap-3 border-t border-border pt-4", draft ? "grid-cols-2" : "grid-cols-1")}>
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
          {draft && (
            <button
              type="button"
              onClick={handleAdd}
              disabled={!valid}
              className="h-11 rounded-xl bg-primary text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
            >
              Add recipient
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
