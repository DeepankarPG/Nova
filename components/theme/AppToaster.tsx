"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function AppToaster() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const theme = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <Toaster
      position="bottom-right"
      theme={theme}
      toastOptions={{
        classNames: {
          toast:
            "bg-[var(--popover)] text-[var(--popover-foreground)] border-[var(--border)] shadow-lg rounded-[10px] text-[13px]",
          description: "text-[var(--muted-foreground)]",
        },
      }}
    />
  );
}
