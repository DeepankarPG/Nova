"use client";

import Image from "next/image";
import { Bell, Eye, EyeClosed } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHideAmounts } from "@/lib/hide-amounts-context";

const USER_NAME = "Deep";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function getSubtitle() {
  const h = new Date().getHours();
  if (h < 12) return "Here's your morning overview";
  if (h < 17) return "Here's how today is going";
  return "Here's your end-of-day recap";
}


interface MobileHeaderProps {
  /** Override visibility. Default: "md:hidden". Pass "" to always show (preview). */
  className?: string;
  onMenuClick?: () => void;
}

export function MobileHeader({ className = "md:hidden", onMenuClick }: MobileHeaderProps) {
  const { hidden, toggle } = useHideAmounts();
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-3 px-4 py-3 shrink-0",
        "bg-transparent",
        className
      )}
    >
      {/* Avatar — tapping opens the nav drawer */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="h-10 w-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white/60 shadow-sm"
      >
        <Image
          src="/pexels-santhosh-shanbhag-564865255-16826482.jpg"
          alt="Profile"
          width={40}
          height={40}
          className="h-full w-full object-cover"
          priority
        />
      </button>

      {/* Greeting */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-foreground leading-tight">
          {getGreeting()}, {USER_NAME}{" "}
          <span className="inline-block animate-[wave_2s_ease-in-out_infinite] origin-[70%_70%]">👋</span>
        </p>
        <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">
          {getSubtitle()}
        </p>
      </div>

      {/* Eye + Bell group — tighter gap */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={toggle}
          aria-label={hidden ? "Show amounts" : "Hide amounts"}
          className="h-9 w-9 flex items-center justify-center rounded-full text-foreground hover:bg-muted/60 transition-colors"
        >
          {hidden
            ? <EyeClosed className="h-[18px] w-[18px]" strokeWidth={1.75} />
            : <Eye       className="h-[18px] w-[18px]" strokeWidth={1.75} />
          }
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative h-9 w-9 flex items-center justify-center rounded-full text-foreground hover:bg-muted/60 transition-colors"
        >
          <Bell className="h-[19px] w-[19px]" strokeWidth={1.75} />
          <span
            className="absolute top-[9px] right-[9px] h-[7px] w-[7px] rounded-full bg-red-500 border-[1.5px] border-background"
            aria-hidden
          />
        </button>
      </div>
    </header>
  );
}
