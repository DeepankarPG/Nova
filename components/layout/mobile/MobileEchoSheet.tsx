"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { History, MessageCirclePlus, X } from "lucide-react";
import { EchoGlobeMark } from "@/components/echo/EchoGlobeMark";
import { EchoMessageList } from "@/components/echo/EchoMessageList";
import { EchoQuickAccessStrip } from "@/components/echo/EchoQuickAccessStrip";
import { EchoComposer } from "@/components/echo/EchoComposer";
import { useEchoChat } from "@/hooks/useEchoChat";
import { ECHO_USER_FIRST_NAME } from "@/lib/echo/demoUser";

interface MobileEchoSheetProps {
  open: boolean;
  onClose: () => void;
  /** Use absolute positioning so the sheet stays inside an overflow-hidden frame (e.g. preview). */
  contained?: boolean;
}

export function MobileEchoSheet({ open, onClose, contained = false }: MobileEchoSheetProps) {
  const pos = contained ? "absolute" : "fixed";
  const { messages, phase, busy, sendUserMessage, reset } = useEchoChat();
  const reduceMotion = useReducedMotion();

  // Lock body scroll when sheet is open (real device only, not contained preview)
  useEffect(() => {
    if (contained) return;
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, contained]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="echo-backdrop"
            className={`${pos} inset-0 z-50 bg-black/50`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Full-screen sheet */}
          <motion.div
            key="echo-sheet"
            className={`${pos} inset-x-0 bottom-0 z-[51] flex flex-col bg-card rounded-t-[24px] overflow-hidden border-t border-border/40`}
            style={{ height: contained ? "100%" : "100dvh" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* ── Header ── */}
            <div className="relative z-10 shrink-0 bg-header border-b border-header-border">
              {/* Drag handle */}
              <div className="flex justify-center pt-2.5" aria-hidden>
                <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
              </div>
              {/* Title row */}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-[15px] font-semibold text-foreground">Echo</span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Reset chat"
                    title="Reset chat"
                  >
                    <History className="h-[17px] w-[17px]" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="New chat"
                    title="New chat"
                  >
                    <MessageCirclePlus className="h-[17px] w-[17px]" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Close Echo"
                    title="Close"
                  >
                    <X className="h-[17px] w-[17px]" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Body — mirrors EchoPanel exactly ── */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {/* EchoMessageList: renders welcome greeting when empty, messages when active */}
              <EchoMessageList messages={messages} phase={phase} busy={busy} />

              {/* Quick chips — only shown when no messages yet */}
              {messages.length === 0 ? (
                <EchoQuickAccessStrip
                  onSend={sendUserMessage}
                  disabled={busy}
                />
              ) : null}

              {/* Composer */}
              <div style={contained ? undefined : { paddingBottom: "env(safe-area-inset-bottom)" }}>
                <EchoComposer
                  onSend={sendUserMessage}
                  disabled={busy}
                  hidePageContext
                  hideToolbarDivider
                  placeholder={messages.length > 0 ? "Type your message…" : undefined}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
