import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  User,
  Building2,
  FileText,
  Landmark,
  Receipt,
  Palette,
  CreditCard,
  Shield,
  KeyRound,
  Bell,
} from "lucide-react";

export type SettingsNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type SettingsNavGroup = {
  group: string;
  items: SettingsNavItem[];
};

export const SETTINGS_NAV: SettingsNavGroup[] = [
  {
    group: "Overview",
    items: [{ label: "All settings", href: "/settings", icon: LayoutGrid }],
  },
  {
    group: "Personal",
    items: [{ label: "Personal details", href: "/settings/personal", icon: User }],
  },
  {
    group: "Account & business",
    items: [
      { label: "Account details", href: "/settings/business/account", icon: Building2 },
      { label: "Business details", href: "/settings/business/details", icon: FileText },
      { label: "Banking & currencies", href: "/settings/business/banking", icon: Landmark },
      { label: "Tax details", href: "/settings/business/tax", icon: Receipt },
      { label: "Branding", href: "/settings/business/branding", icon: Palette },
    ],
  },
  {
    group: "Payments & platform",
    items: [
      { label: "Payments", href: "/settings/payments", icon: CreditCard },
      { label: "Security", href: "/settings/security", icon: Shield },
      { label: "Developer", href: "/settings/developer", icon: KeyRound },
      { label: "Notifications", href: "/settings/notifications", icon: Bell },
    ],
  },
];

export function isSettingsNavActive(pathname: string, href: string): boolean {
  if (href === "/settings") return pathname === "/settings";
  return pathname === href || pathname.startsWith(`${href}/`);
}
