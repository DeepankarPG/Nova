"use client";

import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonCornerRadius, ButtonSize, ButtonThemeId, ButtonTypeId } from "@/lib/payment-button-form-types";

const RADIUS_CLASS: Record<ButtonCornerRadius, string> = {
  sharp: "rounded-none",
  rounded: "rounded-lg",
  pill: "rounded-full",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  small: "px-4 py-2 text-[12.5px]",
  medium: "px-6 py-2.5 text-[14px]",
  large: "px-8 py-3.5 text-[16px]",
};

export function ButtonPreviewNode({
  label,
  buttonType,
  theme,
  brandColor,
  cornerRadius = "rounded",
  size = "medium",
  fullWidth,
  className,
  style,
}: {
  label: string;
  buttonType: ButtonTypeId;
  theme: ButtonThemeId;
  brandColor: string;
  cornerRadius?: ButtonCornerRadius;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const themeStyle: React.CSSProperties =
    theme === "dark"
      ? { backgroundColor: "#111827", color: "#fff" }
      : theme === "light"
        ? { backgroundColor: "#F3F4F6", color: "#111827" }
        : theme === "outline"
          ? { backgroundColor: "transparent", color: brandColor, border: `1.5px solid ${brandColor}` }
          : { backgroundColor: brandColor, color: "#fff" };

  return (
    <div className={className} style={style}>
      <button
        type="button"
        className={cn(
          "flex items-center justify-center gap-1.5 font-bold shadow-lg",
          RADIUS_CLASS[cornerRadius],
          SIZE_CLASS[size],
          fullWidth && "w-full"
        )}
        style={themeStyle}
      >
        {buttonType === "quick_pay" && <Zap className="h-3.5 w-3.5" fill="currentColor" />}
        {label || "Pay Now"}
      </button>
      <div className="mt-1.5 flex items-center justify-center gap-1">
        <span className="text-[10.5px] font-medium text-muted-foreground">Secured by</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/payglocal-logo.png" alt="PayGlocal" className="h-3 w-auto object-contain" />
      </div>
    </div>
  );
}
