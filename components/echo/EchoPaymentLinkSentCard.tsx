"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, Phone, User, type LucideIcon } from "lucide-react";
import type { EchoPaymentLinkResult } from "@/lib/echo/types";
import { cn } from "@/lib/utils";

type Props = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  result: EchoPaymentLinkResult;
  className?: string;
};

function DetailRow({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 text-[12px] text-foreground">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/80 bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
      </span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

/** Same shell as EchoComposer / user bubbles: rounded-2xl, shadow-sm, border-border. */
export function EchoPaymentLinkSentCard({
  customerName,
  customerEmail,
  customerPhone,
  result,
  className,
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-sm dark:bg-card/95",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-0 shadow-none ring-0 outline-none"
          style={{
            background:
              "linear-gradient(145deg, rgb(52, 211, 153) 0%, rgb(16, 185, 129) 42%, rgb(4, 120, 87) 100%)",
          }}
          aria-hidden
        >
          <motion.span
            className="inline-flex items-center justify-center"
            initial={
              reduceMotion
                ? { scale: 1, opacity: 1 }
                : { scale: 0.55, opacity: 0.3 }
            }
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: reduceMotion ? 0 : 0.52,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M20 6 9 17l-5-5"
                stroke="#fff"
                strokeWidth={2.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </span>
        <p className="text-[15px] font-semibold leading-tight text-foreground">
          Payment link sent
        </p>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">{customerName}</span> will
        receive the link for{" "}
        <span className="font-medium text-foreground">
          {result.currency} {result.amount.toLocaleString()}
        </span>
        .{" "}
        <span className="text-[11px] text-muted-foreground">
          
        </span>
      </p>
      <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
        <DetailRow icon={User}>{customerName}</DetailRow>
        <DetailRow icon={Mail}>
          <span className="break-all">{customerEmail}</span>
        </DetailRow>
        <DetailRow icon={Phone}>{customerPhone}</DetailRow>
      </div>
    </div>
  );
}
