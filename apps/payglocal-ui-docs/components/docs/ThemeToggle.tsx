"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-[17px] w-[17px] text-amber-400" aria-hidden />
        ) : (
          <Moon className="h-[17px] w-[17px]" aria-hidden />
        )
      ) : (
        <Moon className="h-[17px] w-[17px] opacity-0" aria-hidden />
      )}
    </button>
  );
}
