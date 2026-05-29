"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SETTINGS_NAV, isSettingsNavActive } from "@/lib/settings-nav";

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "grid h-full min-h-0 w-full min-w-0 max-w-none flex-1 overflow-hidden",
        /* Mobile: sub-nav block then one scroll region below */
        "grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-4",
        /* Desktop: fixed-width sub-nav | scrollable main — one bounded row */
        "md:grid-cols-[14rem_minmax(0,1fr)] md:grid-rows-1 md:gap-0"
      )}
    >
      {/* Sub-nav column: does not scroll with main — only its own list scrolls if very long */}
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-col overflow-hidden bg-white dark:bg-zinc-950",
          "md:h-full md:border-r md:border-border md:pr-4 dark:md:border-zinc-800"
        )}
      >
        <motion.aside
          className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-y-contain md:max-h-none"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pl-3 pr-1 pb-6 pt-4 sm:pl-4 md:pl-5 md:pr-2 md:pt-6">
            <div className="mb-6 px-0 sm:mb-7">
              <h1 className="text-base font-semibold tracking-tight text-foreground dark:text-zinc-50">Settings</h1>
              <p className="mt-0.5 text-xs text-muted-foreground dark:text-zinc-400">Manage your profile and account</p>
            </div>
            <nav className="space-y-3">
              {SETTINGS_NAV.map((section) => (
                <div key={section.group}>
                  <p className="mb-1 px-0 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground dark:text-zinc-500">
                    {section.group}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isSettingsNavActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                            active
                              ? "bg-zinc-100 font-medium text-foreground dark:bg-zinc-800 dark:text-zinc-50"
                              : "font-normal text-muted-foreground hover:bg-zinc-50 hover:text-foreground dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground dark:text-zinc-400" aria-hidden />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </motion.aside>
      </div>

      {/* Main settings body: single scroll surface + solid bg */}
      <motion.div
        className={cn(
          "flex h-full min-h-0 min-w-0 flex-col overflow-y-auto overscroll-y-contain",
          "bg-white dark:bg-zinc-950"
        )}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex min-h-0 w-full min-w-0 max-w-none flex-col px-3 pb-8 pt-4 md:px-5 md:pb-10 md:pt-6 lg:pl-8 lg:pr-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
