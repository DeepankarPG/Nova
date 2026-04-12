"use client";

import Link from "next/link";
import { History, Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavShortcutRow } from "@/hooks/useNavShortcuts";

export function NavShortcuts({
  collapsed,
  pathname,
  onNavClick,
  hydrated,
  rows,
  pinHref,
  unpinHref,
  shortcutPreferredHref,
  onShortcutNavigate,
}: {
  collapsed: boolean;
  pathname: string;
  onNavClick?: () => void;
  hydrated: boolean;
  rows: NavShortcutRow[];
  pinHref: (href: string) => void;
  unpinHref: (href: string) => void;
  shortcutPreferredHref: string | null;
  onShortcutNavigate: (href: string) => void;
}) {
  if (!hydrated) return null;

  const rowActive = (href: string) => {
    const matches =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`);
    return matches && shortcutPreferredHref === href;
  };

  if (collapsed) {
    if (rows.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="space-y-0.5">
          {rows.map((row) => {
            const isActive = rowActive(row.href);
            const LeftIcon = row.kind === "pinned" ? Pin : History;
            return (
              <Link
                key={row.href}
                href={row.href}
                onClick={() => {
                  onShortcutNavigate(row.href);
                  onNavClick?.();
                }}
                title={row.label}
                className={cn(
                  "flex items-center justify-center rounded-lg px-2.5 py-2 text-[14px] font-medium transition-all duration-100",
                  isActive
                    ? "bg-card text-foreground border border-border shadow-sm"
                    : "text-sidebar-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                )}
              >
                <LeftIcon
                  className={cn(
                    "flex-shrink-0",
                    !isActive && "text-muted-foreground",
                    isActive && "text-primary"
                  )}
                  style={{ width: 16, height: 16 }}
                  strokeWidth={2}
                />
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground px-2 mb-1.5">
        Shortcuts
      </p>
      {rows.length === 0 ? (
        <p className="px-2.5 py-1.5 text-[12px] text-muted-foreground leading-snug">
          Pages you open appear here. Pin any recent row to keep it on top.
        </p>
      ) : (
        <div className="space-y-0.5">
          {rows.map((row) => {
            const isActive = rowActive(row.href);
            const LeftIcon = row.kind === "pinned" ? Pin : History;

            return (
              <div key={row.href} className="group relative">
                <Link
                  href={row.href}
                  onClick={() => {
                    onShortcutNavigate(row.href);
                    onNavClick?.();
                  }}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 pr-9 text-[14px] font-medium transition-all duration-100",
                    isActive
                      ? "bg-card text-foreground border border-border shadow-sm"
                      : "text-sidebar-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <LeftIcon
                    className={cn(
                      "flex-shrink-0",
                      !isActive && "text-muted-foreground",
                      isActive && "text-primary"
                    )}
                    style={{ width: 16, height: 16 }}
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="flex-1 truncate">{row.label}</span>
                </Link>

                {row.kind === "recent" ? (
                  <button
                    type="button"
                    className={cn(
                      "absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md",
                      "text-muted-foreground opacity-0 pointer-events-none transition-opacity",
                      "group-hover:opacity-100 group-hover:pointer-events-auto",
                      "hover:bg-muted hover:text-foreground"
                    )}
                    aria-label={`Pin ${row.label}`}
                    title="Pin shortcut"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      pinHref(row.href);
                    }}
                  >
                    <Pin style={{ width: 15, height: 15 }} strokeWidth={2} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={cn(
                      "absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md",
                      "text-muted-foreground opacity-0 pointer-events-none transition-opacity",
                      "group-hover:opacity-100 group-hover:pointer-events-auto",
                      "hover:bg-muted hover:text-foreground"
                    )}
                    aria-label={`Unpin ${row.label}`}
                    title="Remove pin"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      unpinHref(row.href);
                    }}
                  >
                    <PinOff style={{ width: 15, height: 15 }} strokeWidth={2} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
