"use client";

import { useEffect, useState } from "react";
import { CreditCard, Smartphone, Building2, Wallet, TrendingUp, Activity, ToggleLeft, ToggleRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Shimmer } from "@/components/shared/ShimmerSkeleton";
import { cn } from "@/lib/utils";
import { paymentProducts } from "@/lib/mock-data";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "credit-card": CreditCard,
  "smartphone": Smartphone,
  "building-2": Building2,
  "wallet": Wallet,
};

export default function PaymentProductsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState(paymentProducts);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const toggleProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p
      )
    );
    const product = products.find((p) => p.id === id);
    if (product) {
      toast.success(
        product.status === "active" ? `${product.name} disabled` : `${product.name} enabled`
      );
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="Payment Products"
        subtitle="Manage your active payment methods and channels"
      />

      {/* Overall stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active Methods", value: isLoading ? null : products.filter((p) => p.status === "active").length.toString(), sub: "of 4 available" },
          { label: "Total Volume", value: isLoading ? null : "₹78.5L", sub: "this month" },
          { label: "Avg. Success Rate", value: isLoading ? null : "94.8%", sub: "across all methods" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-sm">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{s.label}</p>
            {isLoading ? (
              <Shimmer className="h-6 w-16 mt-1.5" />
            ) : (
              <p className="text-xl font-bold text-slate-900 mt-0.5">{s.value}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Shimmer className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <Shimmer className="h-4 w-24" />
                    <Shimmer className="h-3 w-40" />
                  </div>
                </div>
                <Shimmer className="h-6 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Shimmer key={j} className="h-14 rounded-xl" />
                ))}
              </div>
            </div>
          ))
        ) : (
          products.map((product) => {
            const Icon = iconMap[product.icon] ?? CreditCard;
            const isActive = product.status === "active";
            return (
              <div
                key={product.id}
                className={cn(
                  "bg-white rounded-2xl border shadow-sm p-5 transition-all",
                  isActive ? "border-slate-200" : "border-slate-100 opacity-75"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      isActive ? "bg-[#eff4ff]" : "bg-slate-100"
                    )}>
                      <Icon className={cn("w-5 h-5", isActive ? "text-[#0061E3]" : "text-slate-400")} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{product.name}</h3>
                      <p className="text-xs text-slate-500">{product.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={product.status} size="sm" />
                    <button
                      onClick={() => toggleProduct(product.id)}
                      className={cn(
                        "transition-colors",
                        isActive ? "text-[#0061E3] hover:text-[#0049ad]" : "text-slate-300 hover:text-slate-400"
                      )}
                    >
                      {isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>
                </div>

                {isActive && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Transactions</p>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">{product.transactions.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Activity className="w-3 h-3 text-slate-400" />
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Success</p>
                      </div>
                      <p className={cn(
                        "text-lg font-bold",
                        product.successRate >= 95 ? "text-green-600" : product.successRate >= 90 ? "text-amber-600" : "text-red-600"
                      )}>
                        {product.successRate}%
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-1 mb-0.5">
                        <TrendingUp className="w-3 h-3 text-slate-400" />
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Volume</p>
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        ₹{(product.volume / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>
                )}

                {!isActive && (
                  <div className="text-center py-3 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-400">Enable to start accepting {product.name} payments</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
