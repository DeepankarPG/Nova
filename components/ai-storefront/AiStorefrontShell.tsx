"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Package,
  RefreshCw,
  Sparkles,
  Eye,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/ai-storefront", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/ai-storefront/setup", label: "Setup", icon: Wand2, exact: true },
  { href: "/ai-storefront/catalogue", label: "Catalogue", icon: Package, exact: false },
  { href: "/ai-storefront/inventory", label: "Inventory", icon: RefreshCw, exact: false },
  { href: "/ai-storefront/settings", label: "Store & AI", icon: Sparkles, exact: false },
  { href: "/ai-storefront/preview", label: "Preview", icon: Eye, exact: false },
] as const;

function pathActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Sub-nav link styling matches Settings; rail border runs full viewport height below the header.
 */
export function AiStorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain md:flex-row md:gap-0 md:overflow-hidden">
      <div className="flex w-full shrink-0 border-border md:h-full md:min-h-0 md:w-[14rem] md:shrink-0 md:border-r md:pr-4 dark:border-zinc-800">
        <motion.aside
          className="w-full md:flex md:h-full md:min-h-0 md:flex-col md:overflow-y-auto md:overscroll-y-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <nav className="space-y-0.5 pl-3 pr-1 pt-4 sm:pl-4 md:pl-5 md:pr-2 md:pt-6">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathActive(pathname, item.href, item.exact);
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
          </nav>
        </motion.aside>
      </div>

      <motion.div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* pr-2 gives breathing room between page content and the 4px scrollbar gutter */}
        <div className="min-h-0 flex-1 pb-1 pr-2 pt-0 pl-0 md:pt-1 md:pl-2 md:pr-3 lg:pl-4">{children}</div>
      </motion.div>
    </div>
  );
}
