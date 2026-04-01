"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Database, CreditCard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type AccountStatus = "active" | "inactive";

interface MerchantData {
  id: string;
  name: string;
  activeProducts: { name: string; count: number; icon: "db" | "card" }[];
  accounts: { id: string; mid: string; productName: string; status: AccountStatus }[];
}

const merchants: MerchantData[] = [
  {
    id: "swiggy",
    name: "Swiggy",
    activeProducts: [
      { name: "Global Funds Transfer", count: 2, icon: "db"   },
      { name: "Card Payments",         count: 2, icon: "card" },
    ],
    accounts: [
      { id: "mid-instamart", mid: "MID-SWIG-INS-001", productName: "Instamart", status: "active" },
      { id: "mid-dineout", mid: "MID-SWIG-DIN-002", productName: "Dineout", status: "active" },
      { id: "mid-genie", mid: "MID-SWIG-GEN-003", productName: "Genie", status: "active" },
    ],
  },
  {
    id:   "merchant2",
    name: "GlobeTech Inc",
    activeProducts: [
      { name: "Card Payments", count: 1, icon: "card" },
    ],
    accounts: [{ id: "globetech", mid: "MID-GLB-001", productName: "GlobeTech Core", status: "active" }],
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
  const [activeAccountId, setActiveAccountId] = useState(merchants[0].accounts[0]?.id ?? "");
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep a valid selected MID when merchant changes.
    const exists = activeMerchant.accounts.some((a) => a.id === activeAccountId);
    if (!exists) setActiveAccountId(activeMerchant.accounts[0]?.id ?? "");
  }, [activeMerchant, activeAccountId]);

  const activeAccount =
    activeMerchant.accounts.find((a) => a.id === activeAccountId) ?? activeMerchant.accounts[0];

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
          open ? "bg-muted" : "hover:bg-muted"
        )}
      >
        <MerchantAvatar name={activeAccount?.productName ?? activeMerchant.name} />
        <span className="text-[13px] font-semibold text-foreground max-w-[100px] truncate">
          {activeAccount?.productName ?? activeMerchant.name}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 rounded-2xl bg-popover text-popover-foreground z-50 overflow-hidden border border-border min-w-[480px]"
          style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)" }}
        >
          {/* ── Merchant identity header ── */}
          <div className="px-4 pt-4 pb-3.5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MerchantAvatar name={activeMerchant.name} size="md" />
                <div>
                  <p className="text-[13px] font-semibold text-foreground leading-tight">
                    {activeAccount?.productName ?? activeMerchant.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {activeMerchant.name} · {activeAccount?.mid ?? activeMerchant.id}
                  </p>
                </div>
              </div>
              {merchants.length > 1 && (
                <select
                  className="text-[12px] text-foreground bg-muted border border-border rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors cursor-pointer"
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
          <div className="grid grid-cols-2 divide-x divide-border">
            {/* Active products */}
            <div className="px-3 py-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1.5">
                Active Products
              </p>
              <div className="space-y-0.5">
                {activeMerchant.activeProducts.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-muted/80 transition-colors text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-muted group-hover:bg-accent flex items-center justify-center flex-shrink-0 transition-colors">
                      {p.icon === "db"
                        ? <Database className="w-3.5 h-3.5 text-muted-foreground" />
                        : <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    <span className="flex-1 text-[12.5px] font-medium text-foreground leading-tight whitespace-nowrap">
                      {p.name}
                      <span className="text-muted-foreground font-normal ml-1 text-[11.5px]">({p.count})</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground flex-shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* MID accounts */}
            <div className="px-3 py-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1.5">
                MIDs
              </p>
              <div className="space-y-0.5">
                {activeMerchant.accounts.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setActiveAccountId(a.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-muted/80 transition-colors text-left",
                      activeAccount?.id === a.id && "bg-muted/70"
                    )}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: a.status === "active" ? "#22c55e" : "var(--muted-foreground)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-foreground truncate">{a.productName}</p>
                      <p className="text-[10.5px] text-muted-foreground truncate">{a.mid}</p>
                    </div>
                    <span
                      className="text-[10.5px] font-medium px-2 py-0.5 rounded-md"
                      style={activeAccount?.id === a.id
                        ? { background: "#e0ecff", color: "#1d4ed8" }
                        : a.status === "active"
                        ? { background: "#f0fdf4", color: "#16a34a" }
                        : { background: "#f9fafb", color: "#9ca3af" }}
                    >
                      {activeAccount?.id === a.id ? "Selected" : a.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-4 py-2.5 flex items-center justify-between border-t border-border bg-muted/40">
            <span className="text-[11px] text-muted-foreground">{merchants.length} merchants available</span>
            <button
              type="button"
              className="text-[12px] font-medium text-primary hover:opacity-80 transition-opacity"
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
