"use client";

import { UserPlus, KeyRound, Link2, User } from "lucide-react";

const quickLinks = [
  { label: "Add Teammate",          icon: UserPlus, href: "/client-management", accent: false },
  { label: "My Account",            icon: User,     href: "/configure",          accent: false },
  { label: "API Keys",              icon: KeyRound, href: "/configure",          accent: false },
  { label: "+ Create Payment Link", icon: Link2,    href: "/payment-products",   accent: true  },
];

export function QuickAccess() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mr-1 leading-none">Quick Access</span>
      {quickLinks.map((item) => {
        const Icon = item.icon;
        return (
          <a key={item.label} href={item.href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
            style={item.accent
              ? { background: "#0061E3", color: "#fff", border: "1px solid #0061E3", boxShadow: "0 1px 3px rgba(0,97,227,0.25)" }
              : { background: "#fff", color: "#374151", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }
            }
            onMouseEnter={(e) => {
              if (item.accent) e.currentTarget.style.background = "#0055c8";
              else e.currentTarget.style.background = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              if (item.accent) e.currentTarget.style.background = "#0061E3";
              else e.currentTarget.style.background = "#fff";
            }}
          >
            <Icon className="w-3 h-3" />
            {item.label}
          </a>
        );
      })}
    </div>
  );
}
