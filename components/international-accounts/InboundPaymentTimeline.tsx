"use client";

import { Check } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { InboundPaymentExample } from "@/lib/mock-data";

type Props = {
  payment: InboundPaymentExample;
  layout?: "responsive" | "vertical";
};

export function InboundPaymentTimeline({ payment, layout = "responsive" }: Props) {
  if (layout === "vertical") {
    return (
      <VerticalTimelineBlock payment={payment} className="rounded-xl bg-white p-6 sm:p-7" referenceLayout />
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl bg-white p-5 sm:p-6 hidden md:block"
        style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
      >
        <TimelineHeader payment={payment} />
        <ol className="mt-5 flex items-start w-full">
          {payment.stages.map((stage, i) => {
            const complete = stage.status === "complete";
            const current = stage.status === "current";
            const isLast = i === payment.stages.length - 1;
            return (
              <li key={stage.id} className="flex-1 flex flex-col items-center min-w-0 relative">
                <div className="flex items-center w-full">
                  {i > 0 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 -mr-px rounded-full",
                        payment.stages[i - 1]?.status === "complete" ? "bg-emerald-400" : "bg-gray-200"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 z-[1] bg-white",
                      complete && "bg-emerald-50 border-emerald-500 text-emerald-700",
                      current && "border-[#0061E3] bg-[#eff4ff]",
                      !complete && !current && "border-gray-200"
                    )}
                  >
                    {complete ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : current ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0061E3]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-200" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 -ml-px rounded-full",
                        complete ? "bg-emerald-400" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
                <p
                  className={cn(
                    "text-[13px] font-medium text-center mt-3 px-1 leading-snug",
                    complete || current ? "text-gray-900" : "text-gray-400"
                  )}
                >
                  {stage.label}
                </p>
                {stage.detail ? (
                  <p className="text-[12px] text-gray-500 text-center mt-1 px-1 leading-snug line-clamp-2">
                    {stage.detail}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <VerticalTimelineBlock payment={payment} className="rounded-xl bg-white p-5 sm:p-6 md:hidden" />
    </div>
  );
}

function VerticalTimelineBlock({
  payment,
  className,
  referenceLayout,
}: {
  payment: InboundPaymentExample;
  className?: string;
  referenceLayout?: boolean;
}) {
  return (
    <div className={className} style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      <TimelineHeader payment={payment} spacious={referenceLayout} />
      <ol className={cn("space-y-0", referenceLayout ? "mt-6" : "mt-4")}>
        {payment.stages.map((stage, i) => {
          const isLast = i === payment.stages.length - 1;
          const complete = stage.status === "complete";
          const current = stage.status === "current";
          const upcoming = !complete && !current;
          return (
            <li key={stage.id} className="flex gap-4">
              <div className="flex flex-col items-center w-10 shrink-0">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 bg-white",
                    complete && "bg-emerald-50 border-emerald-500 text-emerald-700",
                    current && "border-[#0061E3] bg-[#eff4ff] shadow-sm",
                    upcoming && "border-gray-200"
                  )}
                >
                  {complete ? (
                    <Check className="w-[18px] h-[18px] stroke-[2.5]" />
                  ) : current ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0061E3]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[18px] my-1 rounded-full",
                      complete ? "bg-emerald-400" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
              <div className={cn("pb-5 min-w-0", isLast && "pb-0")}>
                <p
                  className={cn(
                    "leading-snug",
                    referenceLayout ? "text-[15px]" : "text-[14px]",
                    complete && "font-semibold text-gray-900",
                    current && "font-semibold text-gray-900",
                    upcoming && "font-medium text-gray-400"
                  )}
                >
                  {stage.label}
                </p>
                {stage.detail ? (
                  <p
                    className={cn(
                      "text-gray-500 mt-1.5 leading-relaxed",
                      referenceLayout ? "text-[13px]" : "text-[12px]"
                    )}
                  >
                    {stage.detail}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function TimelineHeader({ payment, spacious }: { payment: InboundPaymentExample; spacious?: boolean }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0061E3] shrink-0" aria-hidden />
          Inbound status
        </p>
        <p
          className={cn(
            "font-semibold text-gray-900 mt-2 leading-snug",
            spacious ? "text-[16px]" : "text-[15px]"
          )}
        >
          {payment.reference}
          {payment.counterparty ? (
            <span className="text-gray-500 font-medium"> · {payment.counterparty}</span>
          ) : null}
        </p>
      </div>
      <div className="text-left sm:text-right shrink-0">
        <p
          className={cn(
            "font-bold tabular-nums text-gray-900 leading-none tracking-tight",
            spacious ? "text-[1.65rem]" : "text-[1.35rem]"
          )}
        >
          {formatCurrency(payment.amount, payment.currency)}
        </p>
        <p className="text-[12px] text-gray-400 mt-2">Updated {formatDate(payment.initiatedAt)}</p>
      </div>
    </div>
  );
}
