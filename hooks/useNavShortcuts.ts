"use client";

/* eslint-disable react-hooks/set-state-in-effect -- localStorage hydrate + sync recents from pathname */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getShortcutRoute,
  resolveShortcutHref,
  type ShortcutRoute,
} from "@/lib/navigation";

const PINNED_KEY = "payglocal-nav-shortcuts-pinned-v1";
const RECENT_KEY = "payglocal-nav-shortcuts-recent-v1";
const SYNC_EVENT = "payglocal-nav-shortcuts-sync";

export const MAX_NAV_SHORTCUTS = 5;
const MAX_RECENT_STORED = 12;

export type NavShortcutRow = ShortcutRoute & {
  kind: "pinned" | "recent";
};

function loadStringArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function arraysShallowEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

/** Writes and notifies other sidebar instances only when the serialized value changes. */
function saveStringArray(key: string, value: string[]) {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(value);
    if (localStorage.getItem(key) === serialized) return;
    localStorage.setItem(key, serialized);
    window.dispatchEvent(new Event(SYNC_EVENT));
  } catch {
    // private mode / quota
  }
}

function validPinnedOrder(hrefs: string[]): string[] {
  return hrefs.filter((h) => getShortcutRoute(h) != null);
}

export function useNavShortcuts() {
  const pathname = usePathname();
  const [pinned, setPinned] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPinned(validPinnedOrder(loadStringArray(PINNED_KEY)));
    setRecent(validPinnedOrder(loadStringArray(RECENT_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onSync = () => {
      const p = validPinnedOrder(loadStringArray(PINNED_KEY));
      const r = validPinnedOrder(loadStringArray(RECENT_KEY));
      setPinned((prev) => (arraysShallowEqual(prev, p) ? prev : p));
      setRecent((prev) => (arraysShallowEqual(prev, r) ? prev : r));
    };
    window.addEventListener(SYNC_EVENT, onSync);
    return () => window.removeEventListener(SYNC_EVENT, onSync);
  }, []);

  const pinnedRef = useRef<string[]>([]);
  useEffect(() => {
    pinnedRef.current = pinned;
  }, [pinned]);

  useEffect(() => {
    if (!hydrated) return;
    setRecent((prev) => {
      const next = prev.filter((h) => !pinned.includes(h));
      if (arraysShallowEqual(prev, next)) return prev;
      saveStringArray(RECENT_KEY, next);
      return next;
    });
  }, [hydrated, pinned]);

  useEffect(() => {
    if (!hydrated) return;
    const href = resolveShortcutHref(pathname);
    if (!href) return;
    setRecent((prev) => {
      const pinSet = pinnedRef.current;
      let next = prev.filter((h) => h !== href);
      next = [href, ...next];
      next = next.filter((h) => !pinSet.includes(h));
      if (next.length > MAX_RECENT_STORED) next = next.slice(0, MAX_RECENT_STORED);
      if (arraysShallowEqual(prev, next)) return prev;
      saveStringArray(RECENT_KEY, next);
      return next;
    });
  }, [hydrated, pathname]);

  const rows: NavShortcutRow[] = useMemo(() => {
    const out: NavShortcutRow[] = [];
    for (const h of pinned) {
      const r = getShortcutRoute(h);
      if (r) out.push({ ...r, kind: "pinned" });
    }
    for (const h of recent) {
      if (out.length >= MAX_NAV_SHORTCUTS) break;
      if (pinned.includes(h)) continue;
      const r = getShortcutRoute(h);
      if (r) out.push({ ...r, kind: "recent" });
    }
    return out.slice(0, MAX_NAV_SHORTCUTS);
  }, [pinned, recent]);

  const pinHref = useCallback(
    (href: string) => {
      if (!getShortcutRoute(href)) return;
      setRecent((prev) => {
        const next = prev.filter((h) => h !== href);
        saveStringArray(RECENT_KEY, next);
        return next;
      });
      setPinned((prev) => {
        let next = prev.filter((h) => h !== href);
        next = [...next, href];
        if (next.length > MAX_NAV_SHORTCUTS) {
          next = next.slice(next.length - MAX_NAV_SHORTCUTS);
        }
        saveStringArray(PINNED_KEY, next);
        return next;
      });
    },
    []
  );

  const unpinHref = useCallback((href: string) => {
    setPinned((prev) => {
      const next = prev.filter((h) => h !== href);
      saveStringArray(PINNED_KEY, next);
      return next;
    });
  }, []);

  return { hydrated, rows, pinHref, unpinHref };
}
