"use client";

import { Mail, Phone, ExternalLink } from "lucide-react";

export function MobileContactSupport() {
  return (
    <div className="space-y-5">
      <div
        className="bg-card rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)" }}
      >
        <a
          href="tel:+919240219400"
          className="flex items-center gap-3.5 px-4 active:bg-muted/40 transition-colors"
          style={{ minHeight: 58 }}
        >
          <Phone
            className="h-5 w-5 text-primary shrink-0"
            strokeWidth={1.75}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium text-foreground">Call us</p>
            <p className="text-[13px] text-muted-foreground">+91 92402 19400</p>
          </div>
          <ExternalLink
            className="h-4 w-4 text-muted-foreground/40 shrink-0"
            strokeWidth={1.75}
          />
        </a>

        <div className="h-px bg-border/40 ml-[58px]" />

        <a
          href="mailto:support@payglocal.in"
          className="flex items-center gap-3.5 px-4 active:bg-muted/40 transition-colors"
          style={{ minHeight: 58 }}
        >
          <Mail
            className="h-5 w-5 text-primary shrink-0"
            strokeWidth={1.75}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium text-foreground">Email us</p>
            <p className="text-[13px] text-muted-foreground">support@payglocal.in</p>
          </div>
          <ExternalLink
            className="h-4 w-4 text-muted-foreground/40 shrink-0"
            strokeWidth={1.75}
          />
        </a>
      </div>

      <p className="text-[13px] text-muted-foreground px-1 leading-relaxed">
        Available Monday to Friday, 9 AM to 6 PM IST. Email is monitored for urgent issues outside hours.
      </p>
    </div>
  );
}
