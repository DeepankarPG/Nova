"use client";

import { useRef, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace-context";
import { ALL_BUSINESSES_ID } from "@/lib/workspace-types";
import type { ProductType } from "@/lib/workspace-types";

function MerchantAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.slice(0, 2).toUpperCase();
  const colors = [
    ["#e0f2fe", "#0369a1"],
    ["#fce7f3", "#9d174d"],
    ["#d1fae5", "#065f46"],
    ["#ede9fe", "#5b21b6"],
  ];
  const [bg, text] = colors[name.charCodeAt(0) % colors.length]!;
  const cls =
    size === "md"
      ? "w-8 h-8 rounded-lg text-[13px] font-bold"
      : "w-6 h-6 rounded-md text-[10px] font-bold";
  return (
    <div
      className={cn("flex items-center justify-center flex-shrink-0", cls)}
      style={{ background: bg, color: text }}
    >
      {initials}
    </div>
  );
}

function ProductChip({ type }: { type: ProductType }) {
  return (
    <span
      className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
      style={
        type === "pg"
          ? { background: "#eff4ff", color: "#0047b0" }
          : { background: "#f0fdf4", color: "#166534" }
      }
    >
      {type === "pg" ? "PG" : "MCA"}
    </span>
  );
}

export function MerchantSelector() {
  const { group, accessibleBusinesses, activeBusinessId, activeBusiness, setActiveBusiness } =
    useWorkspace();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectBusiness(id: string | typeof ALL_BUSINESSES_ID) {
    setActiveBusiness(id);
    router.replace(`${pathname}?mid=${id}`);
    setOpen(false);
  }

  const triggerLabel = activeBusiness ? activeBusiness.name : group.name;
  const triggerAvatarName = activeBusiness ? activeBusiness.name : group.name;

  const showAllOption = accessibleBusinesses.length > 1;

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg transition-colors",
          open ? "bg-muted" : "hover:bg-muted"
        )}
      >
        <MerchantAvatar name={triggerAvatarName} />
        <span className="text-[13px] font-semibold text-foreground max-w-[110px] truncate">
          {triggerLabel}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 rounded-2xl bg-popover text-popover-foreground z-50 overflow-hidden border border-border min-w-[480px]"
          style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)" }}
        >
          {/* Group identity header */}
          <div className="px-4 pt-4 pb-3.5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <MerchantAvatar name={group.name} size="md" />
              <div>
                <p className="text-[13px] font-semibold text-foreground leading-tight">
                  {group.name}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {accessibleBusinesses.length}{" "}
                  {accessibleBusinesses.length === 1 ? "business" : "businesses"}
                </p>
              </div>
            </div>
          </div>

          {/* Two-column body */}
          <div className="grid grid-cols-2 divide-x divide-border">
            {/* Left: business list */}
            <div className="px-3 py-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1.5">
                Your Businesses
              </p>
              <div className="space-y-0.5">
                {showAllOption && (
                  <button
                    type="button"
                    onClick={() => selectBusiness(ALL_BUSINESSES_ID)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-muted/80 transition-colors text-left",
                      activeBusinessId === ALL_BUSINESSES_ID && "bg-muted/70"
                    )}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-foreground">All Businesses</p>
                      <p className="text-[10.5px] text-muted-foreground">
                        {group.name} · {accessibleBusinesses.length} businesses
                      </p>
                    </div>
                    {activeBusinessId === ALL_BUSINESSES_ID && (
                      <span
                        className="text-[10.5px] font-medium px-2 py-0.5 rounded-md flex-shrink-0"
                        style={{ background: "#e0ecff", color: "#1d4ed8" }}
                      >
                        Selected
                      </span>
                    )}
                  </button>
                )}
                {accessibleBusinesses.map((biz) => (
                  <button
                    key={biz.id}
                    type="button"
                    onClick={() => selectBusiness(biz.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-muted/80 transition-colors text-left",
                      activeBusinessId === biz.id && "bg-muted/70"
                    )}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background:
                          biz.primaryAccount.status === "active"
                            ? "#22c55e"
                            : "var(--muted-foreground)",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-foreground truncate">
                        {biz.name}
                      </p>
                      <p className="text-[10.5px] text-muted-foreground truncate">
                        {biz.primaryAccount.mid}
                      </p>
                    </div>
                    {activeBusinessId === biz.id && (
                      <span
                        className="text-[10.5px] font-medium px-2 py-0.5 rounded-md flex-shrink-0"
                        style={{ background: "#e0ecff", color: "#1d4ed8" }}
                      >
                        Selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: product details */}
            <div className="px-3 py-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1.5">
                {activeBusiness ? "Active Products" : "Overview"}
              </p>
              <div className="space-y-0.5">
                {activeBusiness ? (
                  <div className="px-2 py-2">
                    <p className="text-[12px] font-medium text-foreground mb-2">
                      {activeBusiness.name}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {activeBusiness.primaryAccount.products.map((p) => (
                        <ProductChip key={p} type={p} />
                      ))}
                    </div>
                    <p className="text-[10.5px] text-muted-foreground">
                      MID: {activeBusiness.primaryAccount.mid}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[10.5px] text-muted-foreground capitalize">
                        {activeBusiness.primaryAccount.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  accessibleBusinesses.map((biz) => (
                    <div
                      key={biz.id}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg"
                    >
                      <MerchantAvatar name={biz.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-foreground truncate">
                          {biz.name}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {biz.primaryAccount.products.map((p) => (
                          <ProductChip key={p} type={p} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 flex items-center justify-between border-t border-border bg-muted/40">
            <span className="text-[11px] text-muted-foreground">
              {accessibleBusinesses.length}{" "}
              {accessibleBusinesses.length === 1 ? "business" : "businesses"} in {group.name}
            </span>
            <button
              type="button"
              className="text-[12px] font-medium text-primary hover:opacity-80 transition-opacity"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
