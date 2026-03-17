"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const styles: Record<string, React.CSSProperties> = {
  primary:   { background: "#0061E3", color: "#fff", border: "1px solid #0061E3" },
  secondary: { background: "#111827", color: "#fff", border: "1px solid #111827" },
  ghost:     { background: "transparent", color: "#374151", border: "1px solid transparent" },
  danger:    { background: "#dc2626", color: "#fff", border: "1px solid #dc2626" },
  outline:   { background: "#fff", color: "#374151", border: "1px solid #e5e7eb" },
};

const hoverStyles: Record<string, React.CSSProperties> = {
  primary:   { background: "#0055c8" },
  secondary: { background: "#1f2937" },
  ghost:     { background: "#f3f4f6" },
  danger:    { background: "#b91c1c" },
  outline:   { background: "#f9fafb" },
};

const sizes = {
  sm: "h-7 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-8 px-3.5 text-sm gap-2 rounded-lg",
  lg: "h-10 px-4 text-sm gap-2 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading = false, leftIcon, rightIcon,
     children, className, disabled, style, ...props }, ref) => {

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0061E3]/30",
          sizes[size],
          className
        )}
        style={{ ...styles[variant], boxShadow: "0 1px 2px rgba(0,0,0,0.06)", ...style }}
        onMouseEnter={(e) => {
          if (!disabled && !isLoading) {
            Object.assign(e.currentTarget.style, hoverStyles[variant]);
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isLoading) {
            Object.assign(e.currentTarget.style, styles[variant]);
          }
        }}
        {...props}
      >
        {isLoading
          ? <Loader2 className={cn("animate-spin", size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
          : leftIcon}
        <span className={cn(isLoading && "opacity-70")}>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";
