import type { ReactNode } from "react";

/**
 * Standalone layout for /m/* routes (mobile preview pages).
 * Inherits root app/layout.tsx (ThemeProvider, fonts, globals)
 * but NOT the dashboard layout — no sidebar, no header.
 */
export default function MobileGroupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
