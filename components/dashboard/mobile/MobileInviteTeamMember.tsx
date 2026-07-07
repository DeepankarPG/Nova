"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, Copy, Link2, Mail, X } from "lucide-react";
import { useMobileOverlay } from "@/components/dashboard/mobile/MobileOverlayContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function EmailInviteSheet({ onClose }: { onClose: () => void }) {
  const [email, setEmail]   = useState("");
  const [role, setRole]     = useState<"admin" | "member">("member");
  const [visible, setVisible] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent]     = useState(false);

  const beginClose = useCallback(() => setVisible(false), []);

  const handleSend = () => {
    if (!email.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(beginClose, 1400);
    }, 900);
  };

  return (
    <div className="absolute inset-0 z-10">
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={beginClose}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl overflow-hidden"
        style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}
        initial={{ y: "100%" }}
        animate={{ y: visible ? 0 : "100%" }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        onAnimationComplete={() => { if (!visible) onClose(); }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-foreground/15" />
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-[17px] font-bold text-foreground">Email invite</span>
          <button
            type="button"
            onClick={beginClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-muted active:opacity-60 transition-opacity shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-foreground/70" strokeWidth={2} />
          </button>
        </div>

        <div className="px-5 pb-2 space-y-4">
          {sent ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-7 w-7 text-primary" strokeWidth={2} />
              </div>
              <p className="text-[16px] font-semibold text-foreground">Invite sent!</p>
              <p className="text-[13px] text-muted-foreground text-center leading-snug">
                We sent an invitation to {email}
              </p>
            </div>
          ) : (
            <>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full h-12 rounded-xl bg-muted/40 px-4 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border/40 focus:border-primary/50 transition-colors"
              />
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/60 mb-2">
                  Role
                </p>
                <div className="flex gap-2">
                  {(["admin", "member"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "flex-1 h-10 rounded-xl text-[14px] font-medium transition-colors",
                        role === r
                          ? "bg-primary text-white"
                          : "bg-muted/50 text-foreground active:bg-muted",
                      )}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                variant="primary"
                type="button"
                className="w-full h-13 rounded-xl text-sm font-semibold"
                isLoading={sending}
                onClick={handleSend}
                disabled={!email.trim()}
              >
                Send invite
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function MobileInviteTeamMember() {
  const { pushOverlay, popOverlay } = useMobileOverlay();

  const openEmailSheet = () => {
    pushOverlay(<EmailInviteSheet onClose={popOverlay} />);
  };

  const copyInviteLink = () => {
    navigator.clipboard
      .writeText("https://app.payglocal.in/invite/join")
      .then(() => toast.success("Link copied"))
      .catch(() => toast.error("Could not copy link"));
  };

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/55 px-1">
        Invite via
      </p>
      <div
        className="bg-card rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)" }}
      >
        <button
          type="button"
          onClick={openEmailSheet}
          className="w-full flex items-center gap-3.5 px-4 text-left active:bg-muted/40 transition-colors"
          style={{ minHeight: 58 }}
        >
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="h-[18px] w-[18px] text-primary" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0 py-3">
            <p className="text-[15px] font-medium text-foreground leading-tight">Email</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">Send an invitation link</p>
          </div>
          <ChevronRight className="h-4 w-4 text-foreground/20 shrink-0" strokeWidth={2} />
        </button>

        <div className="h-px bg-border/40 ml-[62px]" />

        <button
          type="button"
          onClick={copyInviteLink}
          className="w-full flex items-center gap-3.5 px-4 text-left active:bg-muted/40 transition-colors"
          style={{ minHeight: 58 }}
        >
          <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <Link2 className="h-[18px] w-[18px] text-foreground/60" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0 py-3">
            <p className="text-[15px] font-medium text-foreground leading-tight">Copy invite link</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">Share a reusable invite link</p>
          </div>
          <Copy className="h-4 w-4 text-foreground/30 shrink-0" strokeWidth={1.75} />
        </button>
      </div>

      <p className="text-[13px] leading-snug px-1" style={{ color: "#8A97AB" }}>
        Invited members will join your workspace and can be managed from the team settings.
      </p>
    </div>
  );
}
