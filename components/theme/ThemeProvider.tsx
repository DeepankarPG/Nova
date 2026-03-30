"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { ThemeTransitionProvider } from "@/components/theme/ThemeTransitionProvider";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <ThemeTransitionProvider>{children}</ThemeTransitionProvider>
    </NextThemesProvider>
  );
}
