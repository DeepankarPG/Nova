"use client";

import { Search, Bell, HelpCircle, Menu, Plus, FileText, Link2, CreditCard, Repeat2 } from "lucide-react";
import { MerchantSelector } from "./MerchantSelector";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const SEARCH_HINTS = [
  "Search transactions…",
  "Search settlements…",
  "Search disputes…",
  "Search payment links…",
];

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [hintIdx, setHintIdx]   = useState(0);
  const [focused, setFocused]   = useState(false);
  const [value, setValue]       = useState("");
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createHover, setCreateHover] = useState(false);
  const notifRef  = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const CREATE_ITEMS = [
    { label: "Invoice link",  icon: FileText,   href: "/payment-products/invoice-links?create=1" },
    { label: "Payment link",  icon: Link2,      href: "/payment-products/payment-links?create=1" },
    { label: "Payment",       icon: CreditCard, href: "/payment-products" },
    { label: "Subscription",  icon: Repeat2,    href: "/payment-products" },
  ];

  /* cycle placeholder */
  useEffect(() => {
    if (focused || value) return;
    const t = setInterval(() => setHintIdx(i => (i + 1) % SEARCH_HINTS.length), 2600);
    return () => clearInterval(t);
  }, [focused, value]);

  /* close panels on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current  && !notifRef.current.contains(e.target as Node))  setNotifOpen(false);
      if (createRef.current && !createRef.current.contains(e.target as Node)) setCreateOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const MOCK_NOTIFS = [
    { id: 1, title: "Settlement processed",   body: "₹1,24,890 settled to HDFC ****4521",  time: "2m ago",  dot: "bg-green-400" },
    { id: 2, title: "New dispute raised",      body: "TXN #tx_00312 — Chargeback filed",    time: "18m ago", dot: "bg-red-400" },
    { id: 3, title: "Payment link expired",    body: "Link for Priya Mehta has expired",    time: "1h ago",  dot: "bg-amber-400" },
    { id: 4, title: "Invoice sent",            body: "INV-2026-0091 sent to deepankar@acme", time: "3h ago", dot: "bg-blue-400" },
  ];

  return (
    <header className="h-[57px] flex items-center gap-2 px-4 md:px-5 flex-shrink-0 bg-white"
      style={{ borderBottom: "1px solid #e2e5ea" }}>

      {/* ── Hamburger (mobile only) ── */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Merchant selector ── */}
      <MerchantSelector />

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Actions ── */}
      <div className="flex items-center gap-2">

        {/* Search with animated placeholder */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none z-10" />

          {/* Animated hint — only when unfocused & empty */}
          {!focused && !value && (
            <div className="absolute left-9 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden h-5 w-[180px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={hintIdx}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0,  opacity: 1 }}
                  exit={{ y: -10,   opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  className="absolute text-[13px] text-gray-400 whitespace-nowrap"
                >
                  {SEARCH_HINTS[hintIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}

          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder=""
            className="w-52 sm:w-64 md:w-72 pl-9 pr-9 py-1.5 text-[13px] rounded-lg bg-gray-50 border border-gray-200 text-gray-600 transition-all focus:outline-none"
            onFocus={e  => { setFocused(true);  e.currentTarget.style.borderColor = "#6b7280"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(75,85,99,0.10)"; }}
            onBlur={e   => { setFocused(false); e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 hidden sm:block pointer-events-none select-none">⌘K</kbd>
        </div>

        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <Bell className="w-[17px] h-[17px] text-gray-500" />
            {/* Unread dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-11 z-50 w-[340px] bg-white rounded-2xl shadow-xl overflow-hidden"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <p className="text-[14px] font-semibold text-gray-900">Notifications</p>
                  <button className="text-[12px] text-[#0061E3] font-medium hover:text-[#0049ad] transition-colors">
                    Mark all read
                  </button>
                </div>
                <div className="divide-y divide-gray-50 max-h-[320px] overflow-y-auto">
                  {MOCK_NOTIFS.map(n => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-800">{n.title}</p>
                        <p className="text-[12px] text-gray-400 truncate mt-0.5">{n.body}</p>
                      </div>
                      <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5">{n.time}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 text-center" style={{ borderTop: "1px solid #f0f0f0" }}>
                  <button className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
                    View all notifications →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Help */}
        <button className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 flex items-center justify-center transition-colors">
          <HelpCircle className="w-[17px] h-[17px] text-gray-500" />
        </button>

        {/* ── Create button ── */}
        <div ref={createRef} className="relative">
          {/* Tooltip */}
          <AnimatePresence>
            {createHover && !createOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.12 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-[11px] font-medium text-white whitespace-nowrap pointer-events-none z-50"
                style={{ background: "#1a1a2e" }}
              >
                Create
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                  style={{ background: "#1a1a2e" }} />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => { setCreateOpen(o => !o); setCreateHover(false); }}
            onMouseEnter={() => setCreateHover(true)}
            onMouseLeave={() => setCreateHover(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{ background: "#0061E3" }}
          >
            <Plus className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </button>

          {/* Popup menu */}
          <AnimatePresence>
            {createOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-11 z-50 bg-white rounded-2xl overflow-hidden"
                style={{ border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)", minWidth: 200 }}
              >
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-4 pt-3.5 pb-2">Create new</p>
                <div className="pb-2">
                  {CREATE_ITEMS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => { setCreateOpen(false); router.push(item.href); }}
                        className="w-full flex items-center gap-3 px-3 mx-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                        style={{ width: "calc(100% - 16px)" }}
                      >
                        <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors">
                          <Icon className="w-[15px] h-[15px] text-gray-500" />
                        </div>
                        <span className="text-[13.5px] font-medium text-gray-700">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
