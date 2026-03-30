import Link from "next/link";
import { User, Building2, Layers3, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "Personal settings",
    description: "Profile photo, name, email, and contact details for your signed-in user.",
    href: "/settings/personal",
    icon: User,
  },
  {
    title: "Account & business",
    description: "Merchant account, legal entity, banking, tax IDs, and customer-facing branding.",
    href: "/settings/business/account",
    icon: Building2,
    footnote: "GST and compliance live under Tax; eBRC stays in Finance in the main nav.",
  },
  {
    title: "Payments & platform",
    description: "Payment methods, security, API keys, webhooks, and how we notify you.",
    href: "/settings/payments",
    icon: Layers3,
  },
];

export default function SettingsHubPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a category to update your personal profile, business profile, or platform configuration.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                className={cn(
                  "group flex h-full flex-col rounded-xl border border-border bg-background/60 p-5 shadow-sm transition-colors",
                  "hover:border-primary/30 hover:bg-muted/40"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                {"footnote" in s && s.footnote ? (
                  <p className="mt-3 text-[11px] leading-snug text-muted-foreground">{s.footnote}</p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
