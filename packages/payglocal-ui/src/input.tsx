import * as React from "react";

import { cn } from "./utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 min-h-11 w-full rounded-lg border border-border bg-card px-4 py-2 text-[15px] leading-tight shadow-sm transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-60",
          "read-only:bg-muted/25 read-only:text-muted-foreground",
          "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25 dark:aria-invalid:ring-destructive/40",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
