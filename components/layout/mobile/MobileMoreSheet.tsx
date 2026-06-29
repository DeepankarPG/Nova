"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Receipt,
  Link2,
  UserPlus,
  Calculator,
  Globe,
  XCircle,
  Settings2,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Create payment link",    icon: Link2,      href: "/payment-products/payment-links?create=1" },
  { label: "Create invoice",         icon: Receipt,    href: "/payment-products/invoice-links?create=1" },
  { label: "Invite teammate",        icon: UserPlus,   href: "/settings/personal"                       },
  { label: "FX calculator",          icon: Calculator, href: "/payment-products/international-accounts" },
  { label: "International accounts", icon: Globe,      href: "/payment-products/international-accounts" },
  { label: "Settlement reports",     icon: FileText,   href: "/settlement-reports"                      },
  { label: "Disputes",               icon: XCircle,    href: "/dispute-management"                      },
  { label: "Customise",              icon: Settings2,  href: "/"                                        },
] as const;


interface MobileMoreSheetProps {
  open: boolean;
  onClose: () => void;
  /**
   * When true, sheet uses `absolute` instead of `fixed` so it stays
   * contained inside a parent with `overflow-hidden` (e.g. the preview frame).
   */
  contained?: boolean;
  /** When provided, intercepts the Settlement Reports quick action and fires this instead of navigating. */
  onSettlementTap?: () => void;
}

export function MobileMoreSheet({ open, onClose, contained = false, onSettlementTap }: MobileMoreSheetProps) {
  const pos = contained ? "absolute" : "fixed";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className={`${pos} inset-0 z-50 bg-black/45`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            className={`${pos} bottom-0 left-0 right-0 z-[51] bg-card rounded-t-[24px] border-t border-border`}
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 4px)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1" aria-hidden>
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Sheet header */}
            <div className="flex items-center justify-between px-4 pt-1 pb-3">
              <h2 className="text-[15px] font-semibold text-foreground">More</h2>
              <button
                type="button"
                onClick={onClose}
                className="h-7 w-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick actions grid */}
            <div className="px-4 pb-5">
              <div className="grid grid-cols-4 gap-x-3 gap-y-4">
                {QUICK_ACTIONS.map((item) => {
                  const Icon = item.icon;
                  const inner = (
                    <>
                      <div className="h-14 w-14 rounded-2xl border border-border bg-muted/40 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight line-clamp-2">
                        {item.label}
                      </span>
                    </>
                  );
                  if (item.href === "/settlement-reports" && onSettlementTap) {
                    return (
                      <button key={item.label} type="button"
                        onClick={() => { onClose(); onSettlementTap(); }}
                        className="flex flex-col items-center gap-2"
                      >
                        {inner}
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className="flex flex-col items-center gap-2"
                    >
                      {inner}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
