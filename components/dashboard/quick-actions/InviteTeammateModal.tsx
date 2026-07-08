"use client";

import { useState } from "react";
import { Check, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PERMISSIONS = [
  { id: "view_analytics", label: "View analytics" },
  { id: "manage_payments", label: "Manage payments" },
  { id: "manage_links", label: "Manage payment links" },
  { id: "view_settlements", label: "View settlements" },
  { id: "manage_disputes", label: "Manage disputes" },
  { id: "manage_team", label: "Manage team members" },
  { id: "manage_keys", label: "Manage API keys" },
] as const;

type PermissionId = typeof PERMISSIONS[number]["id"];

const ROLE_PRESETS: Record<string, PermissionId[]> = {
  Viewer: ["view_analytics", "view_settlements"],
  Developer: ["view_analytics", "manage_payments", "manage_links", "manage_keys"],
  Manager: ["view_analytics", "manage_payments", "manage_links", "view_settlements", "manage_disputes", "manage_team"],
};

export function InviteTeammateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");
  const [permissions, setPermissions] = useState<Set<PermissionId>>(new Set(ROLE_PRESETS.Viewer));
  const [emailError, setEmailError] = useState("");
  const [sending, setSending] = useState(false);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setPermissions(new Set(ROLE_PRESETS[newRole] ?? []));
  };

  const togglePermission = (id: PermissionId) => {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const validateEmail = (val: string) => {
    if (!val) { setEmailError(""); return; }
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setEmailError(ok ? "" : "Please enter a valid email address");
  };

  const valid = email.trim() && !emailError;

  const handleSend = async () => {
    if (!valid) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    toast.success("Invitation sent!", { description: `Invite sent to ${email} with ${permissions.size} permission${permissions.size !== 1 ? "s" : ""}` });
    setEmail("");
    setRole("Viewer");
    setPermissions(new Set(ROLE_PRESETS.Viewer));
    onOpenChange(false);
  };

  const inputBase = cn(
    "w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground",
    "placeholder:text-muted-foreground/70 transition-[border-color,box-shadow]",
    "focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/25"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
       * p-0: kill the base p-6 pt-10 so sections own their padding.
       * The close button is absolute top-3 right-3 (12 px / 12 px).
       * Header pt-4 aligns content with the close button row.
       * pr-12 on the text block keeps text clear of the × button.
       */}
      <DialogContent className="overflow-hidden p-0 sm:max-w-[26rem]">

        {/* ── Header ──────────────────────────────────────────────────────
            pt-4 lines up vertically with the absolute close button (top-3).
            pr-12 clears the × (h-9 w-9 at right-3 = 12+36=48px from right).
        */}
        <div className="flex items-start gap-3 px-5 pb-4 pt-4 pr-12">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Mail className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-sm font-semibold leading-snug tracking-tight">
              Invite teammate
            </DialogTitle>
            <DialogDescription className="mt-1 text-[13px] leading-snug">
              They&apos;ll receive an email to join your workspace with the role you choose.
            </DialogDescription>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="h-px bg-border" />

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <div className="space-y-4 px-5 py-4">
          <div className="space-y-1.5">
            <label htmlFor="qa-invite-email" className="block text-[13px] font-medium text-foreground">
              Work email
            </label>
            <input
              id="qa-invite-email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
              placeholder="name@company.com"
              className={cn(
                inputBase,
                emailError && "border-destructive/60 focus:border-destructive/70 focus:ring-destructive/20"
              )}
            />
            {emailError ? (
              <p className="text-[12px] text-destructive">{emailError}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="qa-invite-role" className="block text-[13px] font-medium text-foreground">
              Role
            </label>
            <select
              id="qa-invite-role"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className={cn(inputBase, "h-10 cursor-pointer")}
            >
              <option value="Viewer">Viewer — read-only</option>
              <option value="Developer">Developer — API &amp; integrations</option>
              <option value="Manager">Manager — team &amp; settings</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <p className="text-[13px] font-medium text-foreground">
              Permissions
              <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">(customise for this invite)</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {PERMISSIONS.map(({ id, label }) => {
                const checked = permissions.has(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => togglePermission(id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors",
                      checked
                        ? "border-primary/30 bg-primary/5 text-foreground"
                        : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        checked ? "border-primary bg-primary" : "border-border bg-background"
                      )}
                    >
                      {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                    </span>
                    <span className="text-[11px] font-medium leading-snug">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="h-px bg-border" />

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!valid || sending}
            isLoading={sending}
            onClick={handleSend}
          >
            Send invite
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
