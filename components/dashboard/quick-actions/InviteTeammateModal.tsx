"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function InviteTeammateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");
  const [emailError, setEmailError] = useState("");
  const [sending, setSending] = useState(false);

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
    toast.success("Invitation sent!", { description: `Invite sent to ${email}` });
    setEmail("");
    setRole("Viewer");
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
      <DialogContent className="overflow-hidden p-0 sm:max-w-[25rem]">

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
              onChange={(e) => setRole(e.target.value)}
              className={cn(inputBase, "h-10 cursor-pointer")}
            >
              <option value="Viewer">Viewer — read-only</option>
              <option value="Developer">Developer — API &amp; integrations</option>
              <option value="Manager">Manager — team &amp; settings</option>
            </select>
            <p className="text-[12px] text-muted-foreground">
              You can change this later from Client management.
            </p>
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
