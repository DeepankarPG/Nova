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
    if (!val) {
      setEmailError("");
      return;
    }
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

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-ring/35";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-[26rem]">
        <div className="border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0 pt-0.5">
              <DialogTitle className="text-left">Invite teammate</DialogTitle>
              <DialogDescription className="mt-1.5 text-left text-[13px] leading-relaxed">
                They&apos;ll receive an email to join your workspace with the role you choose.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label htmlFor="qa-invite-email" className="text-sm font-medium text-foreground">
              Work email
            </label>
            <input
              id="qa-invite-email"
              type="email"
              autoComplete="email"
              className={cn(inputCls, emailError && "border-destructive/60 focus:ring-destructive/25")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              placeholder="name@company.com"
            />
            {emailError ? <p className="text-[13px] text-destructive">{emailError}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="qa-invite-role" className="text-sm font-medium text-foreground">
              Role
            </label>
            <select
              id="qa-invite-role"
              className={cn(inputCls, "h-[42px] cursor-pointer")}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Viewer">Viewer — read-only</option>
              <option value="Developer">Developer — API &amp; integrations</option>
              <option value="Manager">Manager — team &amp; settings</option>
            </select>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              You can change this later from Client management.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
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
