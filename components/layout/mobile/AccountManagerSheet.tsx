"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, LogOut, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace-context";
import { useProfileAvatar } from "@/hooks/useProfileAvatar";

const USER_NAME = "Deepankar Raj";
const USER_ROLE = "Admin · Instamart";

function getInitials(name: string) {
  return name.trim().split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

/* ---- BottomProfileCard ------------------------------------------- */
/* Pinned to the bottom of the drawer. Tapping opens AccountManager.  */

interface BottomProfileCardProps {
  onOpen: () => void;
}

export function BottomProfileCard({ onOpen }: BottomProfileCardProps) {
  const { selectedMid } = useWorkspace();
  const { avatarUrl } = useProfileAvatar();

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/40 transition-colors"
    >
      <div className="h-9 w-9 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[12px] font-bold text-foreground">{getInitials(USER_NAME)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-foreground truncate leading-tight">
          {USER_NAME}
        </p>
        <p className="text-[11.5px] text-muted-foreground truncate leading-tight mt-0.5">
          {USER_ROLE}
        </p>
        <p className="text-[11px] text-muted-foreground/60 truncate leading-tight mt-0.5">
          {selectedMid.name}
        </p>
      </div>

      <ChevronUp className="h-4 w-4 text-muted-foreground/40 shrink-0" strokeWidth={1.75} />
    </button>
  );
}

/* ---- AccountManagerSheet ----------------------------------------- */
/* Full account manager: merchant switching, product view, sign out.  */

interface AccountManagerSheetProps {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
  onSignOut: () => void;
}

export function AccountManagerSheet({
  open,
  onClose,
  contained = false,
  onSignOut,
}: AccountManagerSheetProps) {
  const { mids, selectedMid, setMid } = useWorkspace();
  const { avatarUrl } = useProfileAvatar();
  const pos = contained ? "absolute" : "fixed";

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="acct-backdrop"
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
            key="acct-sheet"
            className={`${pos} inset-x-0 bottom-0 z-[53] bg-card flex flex-col overflow-hidden`}
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "90%",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-0 shrink-0">
              <div className="h-1 w-9 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
              {/* User header */}
              <div className="flex items-center gap-3.5 px-5 py-4">
                <div className="h-11 w-11 rounded-2xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[13px] font-bold text-foreground">{getInitials(USER_NAME)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold text-foreground leading-tight">{USER_NAME}</p>
                  <p className="text-[12.5px] text-muted-foreground leading-tight mt-0.5">{USER_ROLE}</p>
                </div>
              </div>

              <div className="h-px bg-border/40 mx-5 mb-5" />

              {/* Merchant section */}
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50 px-5 mb-3">
                Merchant
              </p>
              <div className="px-4 space-y-2 mb-5">
                {mids.map(mid => {
                  const isActive  = mid.id === selectedMid.id;
                  const midHasPg  = mid.products.includes("pg");
                  const midHasMca = mid.products.includes("mca");
                  return (
                    <button
                      key={mid.id}
                      type="button"
                      onClick={() => setMid(mid.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors",
                        isActive
                          ? "bg-primary/8 border border-primary/15"
                          : "bg-muted/30 active:bg-muted/60"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-[11px] font-bold leading-none",
                        isActive ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
                      )}>
                        {mid.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-[13px] leading-tight truncate",
                          isActive ? "font-semibold text-foreground" : "font-medium text-foreground"
                        )}>
                          {mid.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[11px] text-muted-foreground">MID ···{mid.maskedId}</p>
                          <div className="flex gap-1">
                            {midHasPg && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                                PG
                              </span>
                            )}
                            {midHasMca && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-violet-50 text-violet-600">
                                MCA
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isActive && (
                        <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sign out */}
              <div className="h-px bg-border/40 mx-5 mb-2" />
              <div className="px-4 pb-10">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-destructive active:bg-destructive/5 transition-colors"
                >
                  <LogOut className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} />
                  <span className="text-[13.5px] font-medium">Sign out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
