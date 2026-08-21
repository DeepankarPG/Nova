import type { CSSProperties } from "react";
import {
  Link2,
  FileText,
  RefreshCcw,
  List,
  ArrowRight,
  IndianRupee,
  Landmark,
  Receipt,
  Globe,
  BadgeCheck,
  Users,
  AlertTriangle,
  CreditCard,
  ShieldAlert,
  FileWarning,
  Scale,
  Wallet,
  Banknote,
  ClipboardList,
  FileCheck,
  type LucideIcon,
} from "lucide-react";
import type { ReportDefinition } from "@/lib/mock-data/reports";

export const REPORT_ICON_MAP: Record<ReportDefinition["icon"], LucideIcon> = {
  link: Link2,
  "file-text": FileText,
  "refresh-ccw": RefreshCcw,
  list: List,
  "arrow-right": ArrowRight,
  "indian-rupee": IndianRupee,
  landmark: Landmark,
  receipt: Receipt,
  globe: Globe,
  "badge-check": BadgeCheck,
  users: Users,
  "alert-triangle": AlertTriangle,
  "credit-card": CreditCard,
  "shield-alert": ShieldAlert,
  "file-warning": FileWarning,
  scale: Scale,
  wallet: Wallet,
  banknote: Banknote,
  "clipboard-list": ClipboardList,
  "file-check": FileCheck,
};

/** Renders the icon for a report's `icon` key. Prefer this over resolving a component reference during render. */
export function ReportIcon({
  report,
  className,
  style,
}: {
  report: ReportDefinition;
  className?: string;
  style?: CSSProperties;
}) {
  const Icon = REPORT_ICON_MAP[report.icon] ?? FileText;
  return <Icon className={className} style={style} />;
}
