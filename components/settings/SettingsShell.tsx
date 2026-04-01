"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SETTINGS_NAV, isSettingsNavActive } from "@/lib/settings-nav";

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[inherit] flex-col gap-4 md:flex-row md:items-stretch md:gap-0">
      {/*
        Outer column stretches to match main height so border-r runs full height.
        Inner aside is sticky so the submenu stays visible while the page scrolls.
      */}
      <div className="w-full shrink-0 border-border md:w-[14rem] md:border-r md:pr-4 dark:border-zinc-800">
        <motion.aside
          className="w-full md:sticky md:top-0 md:z-10 md:max-h-[calc(100dvh-3.5rem)] md:overflow-y-auto"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pl-3 pr-1 pt-4 sm:pl-4 md:pl-5 md:pr-2 md:pt-6">
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

      <motion.div
        className="flex min-h-[min(560px,70vh)] min-w-0 flex-1 flex-col bg-white dark:bg-zinc-950"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="min-h-[inherit] flex-1 pt-4 pb-1 pl-0 pr-0 md:pt-6 md:pl-5 md:pr-2 lg:pl-8 lg:pr-4">{children}</div>
      </motion.div>
    </div>
  );
}
