"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useEffect, useState } from "react";

/** Drop-in toast host; pair with `toast` from `sonner`. Resolves theme via next-themes when mounted. */
export function Toaster({ theme, ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const resolved =
    theme ?? (mounted && resolvedTheme === "dark" ? "dark" : "light");

  return (
    <Sonner
      theme={resolved}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-[var(--popover)] text-[var(--popover-foreground)] border-[var(--border)] shadow-lg rounded-[10px] text-[13px]",
          description: "text-[var(--muted-foreground)]",
        },
      }}
      {...props}
    />
  );
}

export { toast } from "sonner";
