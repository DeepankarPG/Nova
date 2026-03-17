"use client";

import { Search, Calendar, HelpCircle } from "lucide-react";
import { MerchantSelector } from "./MerchantSelector";

export default function Header() {

  return (
    <header className="h-[57px] flex items-center gap-3 px-5 flex-shrink-0 bg-white"
      style={{ borderBottom: "1px solid #e2e5ea" }}>

      {/* ── Merchant selector ─────────────────────────────── */}
      <MerchantSelector />

      {/* ── Spacer ────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Actions ───────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search…"
            className="w-52 pl-9 pr-9 py-1.5 text-[13px] rounded-lg bg-gray-50 border border-gray-200 text-gray-600 placeholder:text-gray-400 transition-all focus:outline-none"
            onFocus={(e) => { e.currentTarget.style.borderColor = "#0061E3"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,97,227,0.10)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 hidden sm:block">⌘K</kbd>
        </div>

        {/* Date range */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Mar 1 – 16</span>
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
            <path d="M2.5 3.75L5 6.25L7.5 3.75" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Help */}
        <button className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 flex items-center justify-center transition-colors">
          <HelpCircle className="w-[18px] h-[18px] text-gray-400" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
          style={{ background: "#374151" }}>
          BB
        </div>
      </div>
    </header>
  );
}
