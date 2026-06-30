"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, ChevronUp, Check, LayoutGrid, CreditCard, CircleDollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWorkspace, type ProductView } from "@/lib/workspace-context";

/* ---- WorkspaceSection ------------------------------------------ */
/* Inserted between the profile card and nav groups in the drawer.  */

interface WorkspaceSectionProps {
  onOpenSwitcher: () => void;
}

export function WorkspaceSection({ onOpenSwitcher }: WorkspaceSectionProps) {
  const { selectedMid, productView, setProductView } = useWorkspace();
  const [viewDropOpen, setViewDropOpen] = useState(false);

  const hasPg   = selectedMid.products.includes("pg");
  const hasMca  = selectedMid.products.includes("mca");
  const hasBoth = hasPg && hasMca;

  const VIEW_OPTS: { id: ProductView; label: string; Icon: React.ElementType }[] = [
    { id: "all", label: "All",             Icon: LayoutGrid        },
    { id: "pg",  label: "Payment Gateway", Icon: CreditCard        },
    { id: "mca", label: "Multi-Currency",  Icon: CircleDollarSign  },
  ];

  const selectedOpt = VIEW_OPTS.find(o => o.id === productView) ?? VIEW_OPTS[0];

  return (
    <div className="px-3 pt-3 pb-3 border-b border-border/60 shrink-0">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground px-0.5 mb-2">
        Current Workspace
      </p>

      {/* Merchant selector row */}
      <button
        type="button"
        onClick={onOpenSwitcher}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-muted/40 active:bg-muted/70 transition-colors text-left"
      >
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-primary leading-none">
            {selectedMid.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12.5px] font-semibold text-foreground truncate leading-tight">
            {selectedMid.name}
          </p>
          <p className="text-[10.5px] text-muted-foreground leading-tight mt-0.5">
            MID &bull;&bull;&bull;{selectedMid.maskedId}
          </p>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
      </button>

      {/* Viewing selector */}
      <div className="mt-2.5">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground px-0.5 mb-1.5">
          Viewing
        </p>
        {hasBoth ? (
          <div className="relative">
            {/* Trigger */}
            <button
              type="button"
              onClick={() => setViewDropOpen(v => !v)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-muted/40 active:bg-muted/70 transition-colors text-left"
            >
              <selectedOpt.Icon className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
              <span className="flex-1 text-[12.5px] font-medium text-foreground">{selectedOpt.label}</span>
              {viewDropOpen
                ? <ChevronUp   className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
                : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
              }
            </button>

            {/* Dropdown list */}
            <AnimatePresence>
              {viewDropOpen && (
                <motion.div
                  className="absolute inset-x-0 top-full mt-1 z-10 bg-card border border-border/50 rounded-xl overflow-hidden shadow-md"
                  initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  style={{ transformOrigin: "top" }}
                >
                  {VIEW_OPTS.map((opt, i) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => { setProductView(opt.id); setViewDropOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                        i > 0 && "border-t border-border/40",
                        productView === opt.id ? "bg-muted/40" : "active:bg-muted/30"
                      )}
                    >
                      <opt.Icon className={cn("h-4 w-4 shrink-0", productView === opt.id ? "text-foreground" : "text-muted-foreground")} strokeWidth={1.75} />
                      <span className={cn("flex-1 text-[12.5px]", productView === opt.id ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                        {opt.label}
                      </span>
                      {productView === opt.id && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={2.5} />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-[12.5px] font-medium text-foreground px-0.5">
            {hasPg ? "Payment Gateway" : "Multi-Currency Account"}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---- MerchantSwitcherBottomSheet --------------------------------- */
/* Rendered as a sibling to the drawer (not inside it), so it spans  */
/* the full phone frame width.                                        */

interface MerchantSwitcherProps {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
}

export function MerchantSwitcherBottomSheet({ open, onClose, contained = false }: MerchantSwitcherProps) {
  const { mids, selectedMid, setMid } = useWorkspace();
  const pos = contained ? "absolute" : "fixed";

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="switcher-backdrop"
            className={`${pos} inset-0 z-[52]`}
            style={{
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              background: "rgba(0,0,0,0.25)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="switcher-sheet"
            className={`${pos} inset-x-0 bottom-0 z-[53] bg-[#f6f8fa] flex flex-col overflow-hidden`}
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "72%",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0">
              <p className="text-[16px] font-bold text-foreground">Switch Merchant</p>
              <button
                type="button"
                onClick={onClose}
                className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground active:opacity-70 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* MID list */}
            <div className="overflow-y-auto flex-1 px-4 pb-6 space-y-2">
              {mids.map(mid => {
                const isActive = mid.id === selectedMid.id;
                const midHasPg  = mid.products.includes("pg");
                const midHasMca = mid.products.includes("mca");
                return (
                  <button
                    key={mid.id}
                    type="button"
                    onClick={() => { setMid(mid.id); onClose(); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-colors",
                      isActive
                        ? "bg-primary/[0.07] border border-primary/20"
                        : "bg-card border border-border/50 active:bg-muted/40"
                    )}
                  >
                    {/* Initials avatar */}
                    <div className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                      isActive ? "bg-primary/15" : "bg-muted"
                    )}>
                      <span className={cn(
                        "text-[12px] font-bold",
                        isActive ? "text-primary" : "text-foreground"
                      )}>
                        {mid.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-[13.5px] leading-tight truncate",
                        isActive ? "font-semibold text-foreground" : "font-medium text-foreground"
                      )}>
                        {mid.name}
                      </p>
                      <p className="text-[11.5px] text-muted-foreground leading-tight mt-0.5">
                        MID &bull;&bull;&bull;{mid.maskedId}
                      </p>
                      <div className="flex gap-1.5 mt-1.5">
                        {midHasPg && (
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600">
                            PG
                          </span>
                        )}
                        {midHasMca && (
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-600">
                            MCA
                          </span>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
