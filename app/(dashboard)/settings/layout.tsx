import { SettingsShell } from "@/components/settings/SettingsShell";

/**
 * Cancels dashboard main padding so settings can use a full-width white canvas.
 *
 * min-height uses svh + header + main padding so the shell always fills the visible main
 * region (no dead white strip at the bottom). Horizontal padding is only on the left so
 * the canvas can extend to the right edge of the main column.
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        "-m-4 flex min-w-0 flex-1 flex-col overflow-hidden bg-white text-foreground dark:bg-zinc-950 dark:text-zinc-50 " +
        /* w-full + negative margin does not widen the box — add dashboard main horizontal padding (p-4 / p-6) */
        "w-[calc(100%+2rem)] max-w-none md:-m-6 md:w-[calc(100%+3rem)] " +
        "min-h-[calc(100svh-57px-2rem)] md:min-h-[calc(100svh-57px-3.5rem)]"
      }
    >
      <div className="flex h-full min-h-0 min-w-0 w-full max-w-none flex-1 flex-col overflow-hidden pl-2 pr-0 md:pl-3 md:pr-0">
        <SettingsShell>{children}</SettingsShell>
      </div>
    </div>
  );
}
