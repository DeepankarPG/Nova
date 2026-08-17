import { cn } from "@/lib/utils";

const COLORS: [string, string][] = [
  ["#e0f2fe", "#0369a1"],
  ["#fce7f3", "#9d174d"],
  ["#d1fae5", "#065f46"],
  ["#ede9fe", "#5b21b6"],
  ["#fef9c3", "#854d0e"],
  ["#fee2e2", "#991b1b"],
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function ContactAvatar({ name, className }: { name: string; className?: string }) {
  const [bg, text] = COLORS[name.charCodeAt(0) % COLORS.length]!;
  return (
    <div
      className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold", className)}
      style={{ background: bg, color: text }}
    >
      {initials(name)}
    </div>
  );
}
