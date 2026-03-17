"use client";

import { Shimmer } from "@/components/shared/ShimmerSkeleton";
import { cn } from "@/lib/utils";

interface CountryData {
  country: string;
  code: string;
  amount: number;
  transactions: number;
}

interface CountryInsightsMapProps {
  data: CountryData[];
  isLoading?: boolean;
  className?: string;
}

function fmt(n: number): string {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000)    return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
}

const flagEmoji: Record<string, string> = {
  US: "🇺🇸", IE: "🇮🇪", GB: "🇬🇧", CA: "🇨🇦", QA: "🇶🇦", SG: "🇸🇬", DE: "🇩🇪",
};

export function CountryInsightsMap({ data, isLoading, className }: CountryInsightsMapProps) {
  if (isLoading) {
    return (
      <div className={cn("bg-white rounded-xl p-5", className)}
        style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between mb-5">
          <Shimmer className="h-4 w-36" />
          <Shimmer className="h-7 w-28 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Shimmer className="h-3 w-20 rounded" />
              <Shimmer className="flex-1 h-5 rounded-md" />
              <Shimmer className="h-3 w-14 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount));

  return (
    <div className={cn("bg-white rounded-xl p-5", className)}
      style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Country Insights</h3>
          <p className="text-xs text-gray-400 mt-0.5">Revenue by geography</p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 transition-colors"
          style={{ background: "#f2f4f7", border: "1px solid rgba(0,0,0,0.08)" }}
        >
          Last 30 days
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2.5 3.75L5 6.25L7.5 3.75" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {data.map((item, i) => {
          const pct = (item.amount / maxAmount) * 100;
          return (
            <div key={item.code} className="flex items-center gap-3 group">
              {/* Flag + name */}
              <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                <span className="text-sm leading-none">{flagEmoji[item.code] ?? "🌍"}</span>
                <span className="text-xs text-gray-600 font-medium truncate">{item.country}</span>
              </div>

              {/* Bar */}
              <div className="flex-1 relative h-6 flex items-center">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: i === 0
                        ? "linear-gradient(90deg, #0061E3, #60a5fa)"
                        : i === 1
                        ? "linear-gradient(90deg, #1d4ed8, #3b82f6)"
                        : "linear-gradient(90deg, #6d28d9, #8b5cf6)",
                      opacity: 0.7 + i * -0.08,
                    }}
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="w-16 text-right flex-shrink-0">
                <span className="text-xs font-semibold text-gray-700">{fmt(item.amount)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
