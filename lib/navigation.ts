import {
  LayoutDashboard,
  ArrowLeftRight,
  ShoppingCart,
  FileText,
  AlertTriangle,
  Settings,
  Users,
  Receipt,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label:     string;
  href:      string;
  icon:      LucideIcon;
  badge?:    string;
  children?: { label: string; href: string }[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Payments",
    items: [
      { label: "Transactions",          href: "/transactions",          icon: ArrowLeftRight },
      {
        label: "Payment Products",
        href:  "/payment-products",
        icon:  ShoppingCart,
        children: [
          { label: "International accounts", href: "/payment-products/international-accounts" },
          { label: "Payment Links",           href: "/payment-products/payment-links"   },
          { label: "Invoice Links",           href: "/payment-products/invoice-links"   },
          { label: "Payment Button",          href: "/payment-products/payment-button"  },
        ],
      },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Settlement Reports",  href: "/settlement-reports",  icon: FileText  },
      { label: "Invoice Management",  href: "/invoice-management",  icon: Receipt,  badge: "NEW" },
      { label: "eBRC",                href: "/ebrc",                icon: BadgeCheck },
    ],
  },
  {
    label: "Risk",
    items: [
      { label: "Dispute Management", href: "/dispute-management", icon: AlertTriangle, badge: "NEW" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Configure",          href: "/configure",          icon: Settings },
      { label: "Client Management",  href: "/client-management",  icon: Users    },
    ],
  },
];
