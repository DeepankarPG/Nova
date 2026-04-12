"use client";

import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButtonProps,
  type DayPickerProps,
} from "react-day-picker";

import { Button } from "./button";
import type { ButtonProps } from "./button";
import { cn } from "./utils";

const cellSize = "[--cell-size:2rem]";

function navButtonClasses(variant: NonNullable<ButtonProps["variant"]>): string {
  const base =
    "inline-flex items-center justify-center rounded-lg border font-medium transition-colors duration-pg-fast ease-pg-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50";
  switch (variant) {
    case "outline":
      return cn(
        base,
        "border-border bg-card text-foreground shadow-sm hover:bg-muted"
      );
    case "ghost":
    default:
      return cn(
        base,
        "border-transparent bg-transparent text-foreground hover:bg-muted focus-visible:bg-muted/80 active:bg-muted/90"
      );
  }
}

export type CalendarProps = DayPickerProps & {
  buttonVariant?: ButtonProps["variant"];
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  showWeekNumber,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      showWeekNumber={showWeekNumber}
      locale={locale}
      className={cn(
        "group/calendar bg-background p-3",
        cellSize,
        "[[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code ?? "default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          navButtonClasses(buttonVariant),
          "h-[var(--cell-size)] w-[var(--cell-size)] min-h-0 min-w-0 shrink-0 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          navButtonClasses(buttonVariant),
          "h-[var(--cell-size)] w-[var(--cell-size)] min-h-0 min-w-0 shrink-0 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-[var(--cell-size)] w-full items-center justify-center px-[var(--cell-size)]",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-[var(--cell-size)] w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-md border border-border bg-card shadow-sm focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/35",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("absolute inset-0 cursor-pointer opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "font-medium select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-[var(--cell-size)] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none",
          "[&:last-child[data-selected=true]_button]:rounded-r-md",
          showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
            : "[&:first-child[data-selected=true]_button]:rounded-l-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none bg-accent/60", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "rounded-md bg-muted text-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className: rootClass, rootRef, ...rootProps }) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={cn(rootClass)}
            {...rootProps}
          />
        ),
        Chevron: ({ className: chClass, orientation, ...chProps }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("size-4", chClass)} {...chProps} />;
          }
          if (orientation === "right") {
            return <ChevronRight className={cn("size-4", chClass)} {...chProps} />;
          }
          return <ChevronDown className={cn("size-4", chClass)} {...chProps} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...weekProps }) => (
          <th {...weekProps}>
            <div className="flex h-[var(--cell-size)] w-[var(--cell-size)] min-h-[var(--cell-size)] min-w-[var(--cell-size)] items-center justify-center text-center text-xs tabular-nums">
              {children}
            </div>
          </th>
        ),
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: DayButtonProps) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      {...props}
      disabled={Boolean(modifiers.disabled) || props.disabled}
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex aspect-square h-auto min-h-[var(--cell-size)] w-full min-w-[var(--cell-size)] flex-col gap-1 rounded-md p-0 font-normal leading-none data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground hover:bg-muted/80 dark:hover:bg-muted/50 [&>span]:text-xs [&>span]:opacity-70",
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/35",
        defaultClassNames.day,
        className
      )}
    />
  );
}

export { Calendar, CalendarDayButton };
