"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronsUpDown, Database, CreditCard, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type AccountStatus = "active" | "inactive";

interface MerchantData {
  id:             string;
  name:           string;
  activeProducts: { name: string; count: number; icon: "db" | "card" }[];
  accounts:       { id: string; name: string; status: AccountStatus }[];
}

const merchants: MerchantData[] = [
  {
    id:   "mcatest123",
    name: "mcatest123",
    activeProducts: [
      { name: "Global Funds Transfer", count: 2, icon: "db"   },
      { name: "Card Payments",         count: 2, icon: "card" },
    ],
    accounts: [
      { id: "bhavya",  name: "Bhavyaaaaa", status: "active"   },
      { id: "google",  name: "Google",     status: "inactive" },
    ],
  },
  {
    id:   "merchant2",
    name: "GlobeTech Inc",
    activeProducts: [
      { name: "Card Payments", count: 1, icon: "card" },
    ],
    accounts: [
      { id: "globetech", name: "GlobeTech", status: "active" },
    ],
  },
];

export function MerchantSelector() {
  const [activeMerchant, setActiveMerchant] = useState(merchants[0]);
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[14px] font-medium transition-colors",
          open ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span className="text-gray-900 font-semibold">{activeMerchant.name}</span>
        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 rounded-xl bg-white z-50 overflow-hidden"
          style={{ minWidth: 420, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", border: "1px solid #e5e7eb" }}
        >
          {/* ── Header ── */}
          <div className="px-4 pt-3 pb-2" style={{ borderBottom: "1px solid #f0f0f0" }}>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Switch merchant</p>
          </div>

          {merchants.length > 1 && (
            <div className="px-3 pt-2 pb-1 flex gap-1.5 flex-wrap">
              {merchants.map((m) => (
                <button key={m.id}
                  onClick={() => setActiveMerchant(m)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    m.id === activeMerchant.id
                      ? "bg-[#eff4ff] text-[#0047b0] border-[#c7d9fb]"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {m.id === activeMerchant.id && <Check className="w-3 h-3" />}
                  {m.name}
                </button>
              ))}
            </div>
          )}

          {/* ── Two-column body ── */}
          <div className="grid grid-cols-2 divide-x divide-gray-100 p-1">
            {/* Active products */}
            <div className="px-3 py-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Active products
              </p>
              <div className="space-y-0.5">
                {activeMerchant.activeProducts.map((p) => (
                  <button key={p.name}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {p.icon === "db"
                        ? <Database className="w-3.5 h-3.5 text-gray-500" />
                        : <CreditCard className="w-3.5 h-3.5 text-gray-500" />}
                    </div>
                    <span className="flex-1 text-[12px] font-medium text-gray-700 leading-tight">
                      {p.name}
                      <span className="text-gray-400 font-normal ml-1">({p.count})</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Accounts */}
            <div className="px-3 py-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Accounts
              </p>
              <div className="space-y-0.5">
                {activeMerchant.accounts.map((a) => (
                  <div key={a.id}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <span className="flex-1 text-[12px] font-semibold text-gray-800">{a.name}</span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                      style={a.status === "active"
                        ? { background: "#f0fdf4", color: "#16a34a", borderColor: "#bbf7d0" }
                        : { background: "#fff1f2", color: "#be123c", borderColor: "#fecdd3" }}
                    >
                      {a.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-4 py-2.5 flex items-center justify-end"
            style={{ borderTop: "1px solid #f0f0f0", background: "#fafafa" }}>
            <button className="text-[11px] font-medium transition-colors"
              style={{ color: "#0061E3" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#0049ad"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#0061E3"}
              onClick={() => setOpen(false)}
            >
              View all merchants →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
