"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useThemeSurfaceTransition } from "@/components/theme/ThemeTransitionProvider";

export function ThemeToggle() {
  const { theme, resolvedTheme } = useTheme();
  const startThemeToggleFromButton = useThemeSurfaceTransition();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  return (
    <button
      type="button"
      onClick={(e) => startThemeToggleFromButton(e.currentTarget)}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100 dark:border-border dark:bg-muted dark:hover:bg-accent"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-[17px] w-[17px] text-amber-400" aria-hidden />
        ) : (
          <Moon className="h-[17px] w-[17px] text-gray-500" aria-hidden />
        )
      ) : (
        <Moon className="h-[17px] w-[17px] text-gray-500 opacity-0" aria-hidden />
      )}
    </button>
  );
}
