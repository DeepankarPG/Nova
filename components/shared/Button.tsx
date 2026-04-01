"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-primary-foreground border border-primary shadow-sm hover:bg-[var(--primary-hover)]",
  secondary:
    "bg-neutral-900 text-white border border-neutral-900 shadow-sm hover:bg-neutral-800 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200 dark:hover:bg-zinc-300",
  ghost:
    "bg-transparent text-foreground border border-transparent hover:bg-muted",
  danger:
    "bg-red-600 text-white border border-red-600 shadow-sm hover:bg-red-700",
  outline:
    "bg-card text-foreground border border-border shadow-sm hover:bg-muted",
  link: "border border-transparent bg-transparent text-primary shadow-none hover:underline underline-offset-4 h-auto px-0 py-0 rounded-none font-medium",
};

const sizes = {
  sm: "h-7 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-8 px-3.5 text-sm gap-2 rounded-lg",
  lg: "h-10 px-4 text-sm gap-2 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
          variantClasses[variant],
          variant !== "link" && sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2
            className={cn(
              "animate-spin",
              size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"
            )}
          />
        ) : (
          leftIcon
        )}
        <span className={cn(isLoading && "opacity-70")}>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";
