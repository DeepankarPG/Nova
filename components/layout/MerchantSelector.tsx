"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Database, CreditCard, ChevronRight } from "lucide-react";
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

function MerchantAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.slice(0, 2).toUpperCase();
  const colors = [
    ["#e0f2fe", "#0369a1"],
    ["#fce7f3", "#9d174d"],
    ["#d1fae5", "#065f46"],
    ["#ede9fe", "#5b21b6"],
  ];
  const [bg, text] = colors[name.charCodeAt(0) % colors.length];
  const cls = size === "md"
    ? "w-8 h-8 rounded-lg text-[13px] font-bold"
    : "w-6 h-6 rounded-md text-[10px] font-bold";
  return (
    <div className={cn("flex items-center justify-center flex-shrink-0", cls)}
      style={{ background: bg, color: text }}>
      {initials}
    </div>
  );
}

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
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg transition-colors",
          open ? "bg-gray-100" : "hover:bg-gray-100"
        )}
      >
        <MerchantAvatar name={activeMerchant.name} />
        <span className="text-[13px] font-semibold text-gray-800 max-w-[100px] truncate">
          {activeMerchant.name}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 rounded-2xl bg-white z-50 overflow-hidden"
          style={{ minWidth: 480, boxShadow: "0 12px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}
        >
          {/* ── Merchant identity header ── */}
          <div className="px-4 pt-4 pb-3.5" style={{ borderBottom: "1px solid #f3f4f6" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MerchantAvatar name={activeMerchant.name} size="md" />
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 leading-tight">{activeMerchant.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Merchant ID · {activeMerchant.id}</p>
                </div>
              </div>
              {merchants.length > 1 && (
                <select
                  className="text-[12px] text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-gray-400 transition-colors cursor-pointer"
                  value={activeMerchant.id}
                  onChange={(e) => {
                    const m = merchants.find((x) => x.id === e.target.value);
                    if (m) setActiveMerchant(m);
                  }}
                >
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* ── Two-column body ── */}
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            {/* Active products */}
            <div className="px-3 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1.5">
                Active Products
              </p>
              <div className="space-y-0.5">
                {activeMerchant.activeProducts.map((p) => (
                  <button key={p.name}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors">
                      {p.icon === "db"
                        ? <Database className="w-3.5 h-3.5 text-gray-500" />
                        : <CreditCard className="w-3.5 h-3.5 text-gray-500" />}
                    </div>
                    <span className="flex-1 text-[12.5px] font-medium text-gray-700 leading-tight whitespace-nowrap">
                      {p.name}
                      <span className="text-gray-400 font-normal ml-1 text-[11.5px]">({p.count})</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Accounts */}
            <div className="px-3 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1.5">
                Accounts
              </p>
              <div className="space-y-0.5">
                {activeMerchant.accounts.map((a) => (
                  <div key={a.id}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: a.status === "active" ? "#22c55e" : "#d1d5db" }} />
                    <span className="flex-1 text-[12.5px] font-medium text-gray-800">{a.name}</span>
                    <span
                      className="text-[10.5px] font-medium px-2 py-0.5 rounded-md"
                      style={a.status === "active"
                        ? { background: "#f0fdf4", color: "#16a34a" }
                        : { background: "#f9fafb", color: "#9ca3af" }}
                    >
                      {a.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
            <span className="text-[11px] text-gray-400">{merchants.length} merchants available</span>
            <button
              className="text-[12px] font-medium text-[#0061E3] hover:text-[#0049ad] transition-colors"
              onClick={() => setOpen(false)}
            >
              View all →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
