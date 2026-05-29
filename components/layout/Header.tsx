"use client";

import { Search, Bell, HelpCircle, Menu, Plus, FileText, Link2, CreditCard, Repeat2, Send } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { MerchantSelector } from "./MerchantSelector";
import { AskEchoButton } from "./AskEchoButton";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

declare global {
  interface Window {
    figma?: {
      captureForDesign?: (options?: {
        selector?: string;
        captureId?: string;
        endpoint?: string;
        verbose?: boolean;
        delayMs?: number;
      }) => Promise<{ success?: boolean; error?: string } | unknown>;
    };
  }
}

const SEARCH_HINTS = [
  "Search transactions…",
  "Search settlements…",
  "Search disputes…",
  "Search payment links…",
];

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [hintIdx, setHintIdx]   = useState(0);
  const [focused, setFocused]   = useState(false);
  const [value, setValue]       = useState("");
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createHover, setCreateHover] = useState(false);
  const [figmaCaptureReady, setFigmaCaptureReady] = useState(false);
  const notifRef  = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const CREATE_ITEMS = [
    { label: "Invoice link",  icon: FileText,   href: "/payment-products/invoice-links?create=1" },
    { label: "Payment link",  icon: Link2,      href: "/payment-products/payment-links?create=1" },
    { label: "Payment",       icon: CreditCard, href: "/payment-products" },
    { label: "Subscription",  icon: Repeat2,    href: "/payment-products" },
  ];

  /* cycle placeholder */
  useEffect(() => {
    if (focused || value) return;
    const t = setInterval(() => setHintIdx(i => (i + 1) % SEARCH_HINTS.length), 2600);
    return () => clearInterval(t);
  }, [focused, value]);

  /* close panels on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current  && !notifRef.current.contains(e.target as Node))  setNotifOpen(false);
      if (createRef.current && !createRef.current.contains(e.target as Node)) setCreateOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Figma capture script is loaded async from app layout */
  useEffect(() => {
    let active = true;
    const checkReady = () => {
      if (!active) return false;
      const ready = typeof window !== "undefined" && typeof window.figma?.captureForDesign === "function";
      setFigmaCaptureReady(ready);
      return ready;
    };
    if (checkReady()) return () => { active = false; };
    const id = window.setInterval(() => {
      if (checkReady()) window.clearInterval(id);
    }, 400);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  const onSendToFigma = async () => {
    const capture = window.figma?.captureForDesign;
    if (typeof capture !== "function") {
      toast.error("Send to Figma is not ready yet.");
      return;
    }
    try {
      const result = await capture({ selector: "main", delayMs: 120 });
      if (result && typeof result === "object" && "success" in result && (result as { success?: boolean }).success === false) {
        const err = (result as { error?: string }).error ?? "Capture failed.";
        toast.error(err);
        return;
      }
      toast.success("Sent to Figma.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send to Figma.");
    }
  };

  const MOCK_NOTIFS = [
    { id: 1, title: "Settlement processed",   body: "₹1,24,890 settled to HDFC ****4521",  time: "2m ago",  dot: "bg-green-400" },
    { id: 2, title: "New dispute raised",      body: "TXN #tx_00312 — Chargeback filed",    time: "18m ago", dot: "bg-red-400" },
    { id: 3, title: "Payment link expired",    body: "Link for Priya Mehta has expired",    time: "1h ago",  dot: "bg-amber-400" },
    { id: 4, title: "Invoice sent",            body: "INV-2026-0091 sent to deepankar@acme", time: "3h ago", dot: "bg-blue-400" },
  ];

  return (
    <header className="relative z-30 flex h-[57px] shrink-0 items-center gap-2 border-b border-header-border bg-header px-4 md:px-5">

      {/* ── Hamburger (mobile only) ── */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-shrink-0"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Merchant selector ── */}
      <MerchantSelector />

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Actions ── */}
      <div className="flex items-center gap-2">

        {/* Search with animated placeholder */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />

          {/* Animated hint — only when unfocused & empty */}
          {!focused && !value && (
            <div className="absolute left-9 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden h-5 w-[180px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={hintIdx}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0,  opacity: 1 }}
                  exit={{ y: -10,   opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  className="absolute text-[13px] text-muted-foreground whitespace-nowrap"
                >
                  {SEARCH_HINTS[hintIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}

          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder=""
            className="w-52 sm:w-64 md:w-72 pl-9 pr-9 py-1.5 text-[13px] rounded-lg bg-muted border border-border text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground hidden sm:block pointer-events-none select-none">⌘K</kbd>
        </div>

        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative w-9 h-9 rounded-lg bg-muted border border-border hover:bg-accent flex items-center justify-center transition-colors"
          >
            <Bell className="w-[17px] h-[17px] text-muted-foreground" />
            {/* Unread dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-header" />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-11 z-50 w-[340px] bg-popover text-popover-foreground rounded-2xl shadow-xl overflow-hidden border border-border"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <p className="text-[14px] font-semibold text-foreground">Notifications</p>
                  <button type="button" className="text-[12px] text-primary font-medium hover:opacity-80 transition-opacity">
                    Mark all read
                  </button>
                </div>
                <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
                  {MOCK_NOTIFS.map(n => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground">{n.title}</p>
                        <p className="text-[12px] text-muted-foreground truncate mt-0.5">{n.body}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground flex-shrink-0 mt-0.5">{n.time}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 text-center border-t border-border bg-muted/30">
                  <button type="button" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                    View all notifications →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ThemeToggle />

        {/* Help */}
        <button
          type="button"
          className="w-9 h-9 rounded-lg bg-muted border border-border hover:bg-accent flex items-center justify-center transition-colors"
        >
          <HelpCircle className="w-[17px] h-[17px] text-muted-foreground" />
        </button>

        {/* Figma capture (MCP html-to-design script) */}
        <button
          type="button"
          onClick={() => void onSendToFigma()}
          className="w-9 h-9 rounded-lg bg-muted border border-border hover:bg-accent flex items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-55"
          aria-label="Send page to Figma"
          title={figmaCaptureReady ? "Send page to Figma" : "Figma capture is loading"}
          disabled={!figmaCaptureReady}
        >
          <Send className="w-[17px] h-[17px] text-muted-foreground" />
        </button>

        <AskEchoButton />

        {/* ── Create button ── */}
        <div ref={createRef} className="relative">
          {/* Tooltip */}
          <AnimatePresence>
            {createHover && !createOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.12 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-[11px] font-medium text-white whitespace-nowrap pointer-events-none z-50"
                style={{ background: "#1a1a2e" }}
              >
                Create
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                  style={{ background: "#1a1a2e" }} />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => { setCreateOpen(o => !o); setCreateHover(false); }}
            onMouseEnter={() => setCreateHover(true)}
            onMouseLeave={() => setCreateHover(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{ background: "#0061E3" }}
          >
            <Plus className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </button>

          {/* Popup menu */}
          <AnimatePresence>
            {createOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-11 z-50 bg-popover text-popover-foreground rounded-2xl overflow-hidden border border-border min-w-[200px]"
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)" }}
              >
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 pt-3.5 pb-2">
                  Create new
                </p>
                <div className="pb-2">
                  {CREATE_ITEMS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setCreateOpen(false); router.push(item.href); }}
                        className="w-full flex items-center gap-3 px-3 mx-2 py-2.5 rounded-xl hover:bg-muted/80 transition-colors group"
                        style={{ width: "calc(100% - 16px)" }}
                      >
                        <div className="w-8 h-8 rounded-xl bg-muted group-hover:bg-accent flex items-center justify-center flex-shrink-0 transition-colors">
                          <Icon className="w-[15px] h-[15px] text-muted-foreground" />
                        </div>
                        <span className="text-[13.5px] font-medium text-foreground">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
