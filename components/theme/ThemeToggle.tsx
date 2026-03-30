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
      className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 dark:bg-muted dark:border-border dark:hover:bg-accent flex items-center justify-center transition-colors"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted ? (
        isDark ? (
          <Sun className="w-[17px] h-[17px] text-amber-400" aria-hidden />
        ) : (
          <Moon className="w-[17px] h-[17px] text-gray-500" aria-hidden />
        )
      ) : (
        <Moon className="w-[17px] h-[17px] text-gray-500 opacity-0" aria-hidden />
      )}
    </button>
  );
}
