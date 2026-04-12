import * as React from "react";
import { cn } from "./utils";

/** Maps to Tailwind spacing steps used across PayGlocal dashboard surfaces */
export type LayoutSpacing = "none" | "xs" | "sm" | "md" | "lg" | "xl";

const gapClass: Record<LayoutSpacing, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
  xl: "gap-6",
};

const padClass: Record<LayoutSpacing, string> = {
  none: "p-0",
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

const padXClass: Record<LayoutSpacing, string> = {
  none: "px-0",
  xs: "px-1",
  sm: "px-2",
  md: "px-4",
  lg: "px-6",
  xl: "px-8",
};

const padYClass: Record<LayoutSpacing, string> = {
  none: "py-0",
  xs: "py-1",
  sm: "py-2",
  md: "py-4",
  lg: "py-6",
  xl: "py-8",
};

export type BoxProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
  p?: LayoutSpacing;
  px?: LayoutSpacing;
  py?: LayoutSpacing;
};

/** Neutral block with token-aligned padding; extend with `className` for radius, borders, flex, etc. */
export function Box({ as: Comp = "div", className, p = "none", px, py, ...props }: BoxProps) {
  const axis = px !== undefined || py !== undefined;
  return (
    <Comp
      className={cn(
        !axis && padClass[p],
        px !== undefined && padXClass[px],
        py !== undefined && padYClass[py],
        className
      )}
      {...props}
    />
  );
}

export type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
  gap?: LayoutSpacing;
  align?: "start" | "center" | "stretch" | "end";
};

/** Vertical flex stack; default gap matches common section rhythm (`gap-4`). */
export function Stack({
  as: Comp = "div",
  className,
  gap = "lg",
  align = "stretch",
  ...props
}: StackProps) {
  const alignCls =
    align === "start"
      ? "items-start"
      : align === "center"
        ? "items-center"
        : align === "end"
          ? "items-end"
          : "items-stretch";
  return <Comp className={cn("flex flex-col", gapClass[gap], alignCls, className)} {...props} />;
}

export type InlineProps = React.HTMLAttributes<HTMLDivElement> & {
  gap?: LayoutSpacing;
  wrap?: boolean;
  justify?: "start" | "center" | "end" | "between";
};

/** Horizontal flex row for toolbars and inline field groups */
export function Inline({
  className,
  gap = "md",
  wrap = false,
  justify = "start",
  ...props
}: InlineProps) {
  const justifyCls =
    justify === "center"
      ? "justify-center"
      : justify === "end"
        ? "justify-end"
        : justify === "between"
          ? "justify-between"
          : "justify-start";
  return (
    <div
      className={cn("flex flex-row items-center", gapClass[gap], justifyCls, wrap && "flex-wrap", className)}
      {...props}
    />
  );
}
