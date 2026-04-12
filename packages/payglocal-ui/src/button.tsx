"use client";

import { cn } from "./utils";
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
    "bg-muted text-foreground border border-border shadow-sm hover:bg-muted/85 dark:bg-muted/35 dark:text-foreground dark:border-border dark:hover:bg-muted/55",
  ghost:
    "bg-transparent text-foreground border border-transparent hover:bg-muted focus-visible:bg-muted/80 active:bg-muted/90",
  danger:
    "bg-red-600 text-white border border-red-600 shadow-sm hover:bg-red-700",
  outline:
    "bg-card text-foreground border border-border shadow-sm hover:bg-muted",
  link:
    "h-auto min-h-0 rounded-md border border-transparent bg-transparent px-2 py-2 text-[15px] font-medium text-primary shadow-none underline-offset-4 hover:bg-primary/5 hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:no-underline",
};

/** Heights and padding match dashboard primary actions (~44–48px) and comfortable tap targets. */
const sizes = {
  sm: "h-9 min-h-9 px-3.5 text-xs gap-1.5 rounded-lg",
  md: "h-10 min-h-10 px-5 text-sm gap-2 rounded-lg",
  lg: "h-[3.25rem] min-h-[3.25rem] px-10 text-[15px] gap-2.5 rounded-xl",
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
          "inline-flex items-center justify-center font-medium transition-colors duration-pg-fast ease-pg-standard",
          variant !== "link" && "disabled:cursor-not-allowed disabled:opacity-50",
          variant === "link" && "justify-center",
          variant !== "link" && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
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
              size === "sm" ? "size-3.5" : size === "lg" ? "size-[1.125rem]" : "size-3.5"
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
