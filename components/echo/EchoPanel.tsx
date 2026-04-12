"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Maximize2, PanelRight, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEchoPanel } from "./EchoPanelContext";
import { useEchoChat } from "@/hooks/useEchoChat";
import { EchoMessageList } from "./EchoMessageList";
import { EchoQuickAccessStrip } from "./EchoQuickAccessStrip";
import { EchoComposer } from "./EchoComposer";
import { cn } from "@/lib/utils";

export function EchoPanel() {
  const { open, setOpen, panelWidth, setPanelWidth } = useEchoPanel();
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const { messages, phase, busy, sendUserMessage, reset } = useEchoChat();
  const panelRef = useRef<HTMLElement>(null);
  const [resizing, setResizing] = useState(false);
  const dragRef = useRef<{ startX: number; startW: number } | null>(null);
  const panelWidthRef = useRef(panelWidth);
  panelWidthRef.current = panelWidth;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      /* Composer textarea only — "textarea, button" matched header buttons first. */
      const el = panelRef.current?.querySelector<HTMLTextAreaElement>(
        "textarea[data-echo-composer]"
      );
      el?.focus();
    }, 100);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const next = Math.round(
        d.startW + (d.startX - e.clientX)
      );
      setPanelWidth(next);
    };
    const end = () => {
      setResizing(false);
      dragRef.current = null;
      document.body.style.removeProperty("user-select");
    };
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [resizing, setPanelWidth]);

  const onResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!open) return;
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startW: panelWidthRef.current,
    };
    setResizing(true);
  };

  const spring = reduceMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 380, damping: 38, mass: 0.9 };

  return (
    <motion.aside
      ref={panelRef}
      role="complementary"
      aria-label="Echo assistant"
      aria-hidden={!open}
      initial={false}
      animate={{
        width: open ? panelWidth : 0,
      }}
      transition={spring}
      className={cn(
        "relative flex min-h-0 shrink-0 flex-col overflow-hidden border-border bg-card/90 backdrop-blur-md",
        open && "border-l border-border",
        "dark:bg-card/95"
      )}
    >
      {open ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize Echo panel"
          className={cn(
            "absolute left-0 top-0 z-20 h-full w-2 -translate-x-1/2 cursor-ew-resize touch-none select-none",
            "hover:bg-primary/15 active:bg-primary/20"
          )}
          onPointerDown={onResizePointerDown}
        />
      ) : null}
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col border-border">
        <header className="flex h-[57px] shrink-0 items-center justify-end gap-0.5 border-b border-header-border bg-header px-2 sm:px-3">
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Reset chat"
            title="Reset chat"
            onClick={() => reset()}
          >
            <RotateCcw className="h-[17px] w-[17px]" strokeWidth={2} />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Open Echo full page"
            title="Open full page"
            onClick={() => { setOpen(false); router.push("/echo"); }}
          >
            <Maximize2 className="h-[17px] w-[17px]" strokeWidth={2} />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Collapse Echo panel"
            title="Collapse panel"
            onClick={() => setOpen(false)}
          >
            <PanelRight className="h-[17px] w-[17px]" strokeWidth={2} />
          </button>
        </header>

        <EchoMessageList messages={messages} phase={phase} busy={busy} />
        {messages.length === 0 ? (
          <EchoQuickAccessStrip
            onSend={sendUserMessage}
            disabled={busy}
          />
        ) : null}
        <EchoComposer onSend={sendUserMessage} disabled={busy} />
      </div>
    </motion.aside>
  );
}
