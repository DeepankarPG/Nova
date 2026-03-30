import { SettingsShell } from "@/components/settings/SettingsShell";

/**
 * Cancels dashboard main padding so settings can use a full-width white canvas
 * (main sidebar + header unchanged). Tighter left inset brings sub-nav closer to the primary sidebar.
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-m-4 min-h-[calc(100dvh-57px)] bg-white text-foreground md:-m-6 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="flex min-h-[inherit] flex-col pb-4 pl-2 pr-4 pt-4 md:pb-6 md:pl-3 md:pr-6 md:pt-6">
        <SettingsShell>{children}</SettingsShell>
      </div>
    </div>
  );
}
