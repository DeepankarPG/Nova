"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowDownLeft, XCircle, AlertTriangle, RotateCcw,
  ShieldAlert, Bell, FileText, Zap, ArrowUpRight,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ───────────────────────────────────────────────────────── */
type NCategory = "payment" | "update";
type NGroup    = "today" | "yesterday" | "last_week";
type FilterTab = "all" | "payments" | "updates";

interface Notif {
  id: string;
  category: NCategory;
  group: NGroup;
  Icon: typeof Bell;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  action?: { label: string; href: string };
}

/* ─── Notification data ───────────────────────────────────────────── */
const NOTIFS: Notif[] = [
  // ── Today ──────────────────────────────────────────────────────
  {
    id:"n1", category:"payment", group:"today",
    Icon:ArrowDownLeft, iconColor:"text-emerald-700", iconBg:"bg-emerald-50 dark:bg-emerald-950/50",
    title:"Payment received",
    body:"₹4,500 from Priya Mehta via UPI was collected successfully.",
    time:"2m ago", unread:true,
  },
  {
    id:"n2", category:"payment", group:"today",
    Icon:CircleDollarSign, iconColor:"text-primary", iconBg:"bg-primary/10",
    title:"Settlement credited",
    body:"₹1,24,890 has been settled to your HDFC ****4521 account.",
    time:"18m ago", unread:true,
    action:{ label:"View settlement", href:"/settlement-reports" },
  },
  {
    id:"n3", category:"payment", group:"today",
    Icon:XCircle, iconColor:"text-red-700", iconBg:"bg-red-50 dark:bg-red-950/50",
    title:"Payment failed",
    body:"₹890 from SwiftPay Ltd via Net Banking could not be processed.",
    time:"1h ago", unread:true,
    action:{ label:"View transaction", href:"/transactions" },
  },
  {
    id:"n4", category:"payment", group:"today",
    Icon:AlertTriangle, iconColor:"text-amber-700", iconBg:"bg-amber-50 dark:bg-amber-950/50",
    title:"Dispute raised",
    body:"Globaltech Inc has filed a dispute for ₹14,200 (TXN #8817). Respond before Jun 10.",
    time:"2h ago", unread:true,
    action:{ label:"Respond to dispute", href:"/dispute-management" },
  },
  {
    id:"n5", category:"payment", group:"today",
    Icon:ArrowDownLeft, iconColor:"text-emerald-700", iconBg:"bg-emerald-50 dark:bg-emerald-950/50",
    title:"Large payment received",
    body:"High-value payment of ₹1,45,000 from Falcon Exports via Wire Transfer.",
    time:"4h ago",
  },

  // ── Yesterday ──────────────────────────────────────────────────
  {
    id:"n6", category:"update", group:"yesterday",
    Icon:Bell, iconColor:"text-primary", iconBg:"bg-primary/10",
    title:"Scheduled maintenance",
    body:"PayGlocal will undergo maintenance on Jun 5, 2026 from 2–4 AM IST. Transactions will be unaffected.",
    time:"9h ago",
  },
  {
    id:"n7", category:"payment", group:"yesterday",
    Icon:RotateCcw, iconColor:"text-primary", iconBg:"bg-primary/10",
    title:"Refund processed",
    body:"₹3,250 refund to Meera Sharma has been processed and will reflect in 2–3 business days.",
    time:"14h ago",
  },
  {
    id:"n8", category:"payment", group:"yesterday",
    Icon:FileText, iconColor:"text-primary", iconBg:"bg-primary/10",
    title:"Settlement report ready",
    body:"Your May 2026 settlement report is now available for download.",
    time:"1d ago",
    action:{ label:"View report", href:"/settlement-reports" },
  },
  {
    id:"n9", category:"update", group:"yesterday",
    Icon:Zap, iconColor:"text-violet-600", iconBg:"bg-violet-50 dark:bg-violet-950/50",
    title:"Payment Links updated",
    body:"Payment Links now support QR code generation and expiry reminders.",
    time:"1d ago",
    action:{ label:"See what's new", href:"/payment-products/payment-links" },
  },

  // ── Last Week ──────────────────────────────────────────────────
  {
    id:"n10", category:"payment", group:"last_week",
    Icon:ShieldAlert, iconColor:"text-red-700", iconBg:"bg-red-50 dark:bg-red-950/50",
    title:"New login detected",
    body:"A new login to your account was detected from Mumbai, India on Jun 1 at 11:42 PM.",
    time:"3d ago",
    action:{ label:"Secure account", href:"/settings" },
  },
  {
    id:"n11", category:"payment", group:"last_week",
    Icon:ArrowDownLeft, iconColor:"text-emerald-700", iconBg:"bg-emerald-50 dark:bg-emerald-950/50",
    title:"International payment received",
    body:"₹67,800 from Techno Ventures (USD 815) received via international wire.",
    time:"4d ago",
  },
  {
    id:"n12", category:"update", group:"last_week",
    Icon:Zap, iconColor:"text-violet-600", iconBg:"bg-violet-50 dark:bg-violet-950/50",
    title:"Invoice Management launched",
    body:"Create, send, and track invoices directly from your dashboard. Now available.",
    time:"5d ago",
    action:{ label:"Explore feature", href:"/invoice-management" },
  },
];

const FILTERS: { id: FilterTab; label: string }[] = [
  { id:"all",      label:"All"      },
  { id:"payments", label:"Payments" },
  { id:"updates",  label:"Updates"  },
];

const GROUP_LABELS: Record<NGroup, string> = {
  today:     "Today",
  yesterday: "Yesterday",
  last_week: "Last Week",
};
const GROUP_ORDER: NGroup[] = ["today","yesterday","last_week"];

/* ─── Component ───────────────────────────────────────────────────── */
interface MobileNotificationsProps {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
}

export function MobileNotifications({ open, onClose, contained = false }: MobileNotificationsProps) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const pos = contained ? "absolute" : "fixed";

  const visible = NOTIFS.filter((n) =>
    filter === "all" ? true :
    filter === "payments" ? n.category === "payment" : n.category === "update"
  );

  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    items: visible.filter((n) => n.group === g),
  })).filter((g) => g.items.length > 0);

  const unreadCount = NOTIFS.filter((n) => n.unread).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="notif-backdrop"
            className={`${pos} inset-0 z-50 bg-black/50`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="notif-sheet"
            className={`${pos} inset-x-0 bottom-0 z-[51] flex flex-col rounded-t-[24px] overflow-hidden bg-background`}
            style={{ height: contained ? "100%" : "100dvh" }}
            initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
            transition={{ duration: 0.32, ease:[0.32,0.72,0,1] }}
          >
            {/* Header row */}
            <div className="flex items-center gap-4 px-5 pt-6 pb-4 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/80 transition-colors shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={2} />
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-[24px] font-bold text-foreground tracking-tight">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="h-[22px] min-w-[22px] px-1.5 rounded-full bg-primary text-primary-foreground text-[12px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-2 px-5 pb-4 shrink-0 border-b border-border/50">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "px-3 py-1 text-[12px] font-semibold rounded-lg transition-colors",
                    filter === f.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground border border-border hover:bg-muted/40"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Scrollable notifications */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-10 space-y-6">
              {grouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Bell className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
                  <p className="text-[14px] text-muted-foreground">No notifications</p>
                </div>
              ) : grouped.map(({ group, items }) => (
                <div key={group}>
                  {/* Group label */}
                  <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.07em] mb-2.5">
                    {GROUP_LABELS[group]}
                  </p>

                  {/* Cards */}
                  <div className="space-y-2.5">
                    {items.map((n) => {
                      const Icon = n.Icon;
                      return (
                        <div
                          key={n.id}
                          className={cn(
                            "rounded-2xl border px-4 py-3.5",
                            n.unread
                              ? "border-primary/20 bg-primary/[0.03]"
                              : "border-border/70 bg-card"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5", n.iconBg)}>
                              <Icon className={cn("h-[18px] w-[18px]", n.iconColor)} strokeWidth={2} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={cn("text-[13.5px] font-bold text-foreground leading-snug", n.unread && "text-foreground")}>
                                  {n.title}
                                </p>
                                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                                  {n.unread && (
                                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                  )}
                                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                                </div>
                              </div>
                              <p className="text-[12.5px] text-muted-foreground leading-snug mt-1">{n.body}</p>

                              {/* Action button — same style as home page "Take action" */}
                              {n.action && (
                                <a
                                  href={n.action.href}
                                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-[12px] font-semibold text-foreground shadow-sm hover:bg-muted transition-colors"
                                >
                                  {n.action.label}
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
