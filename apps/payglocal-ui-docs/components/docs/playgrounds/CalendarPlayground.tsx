"use client";

import { useEffect, useState } from "react";
import { addDays } from "date-fns";
import { Clock } from "lucide-react";
import { arSA } from "react-day-picker/locale";
import type { DayButtonProps } from "react-day-picker";
import {
  Button,
  Calendar,
  CalendarDayButton,
  Card,
  CardContent,
  CardFooter,
  Field,
  FieldGroup,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  type DateRange,
} from "@payglocal/ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-4">{children}</div>
    </section>
  );
}

export function CalendarPlayground() {
  const [single, setSingle] = useState<Date | undefined>(new Date());
  const [dropdownSingle, setDropdownSingle] = useState<Date | undefined>(new Date());
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 12),
    to: addDays(new Date(new Date().getFullYear(), 0, 12), 30),
  });
  const [weekNum, setWeekNum] = useState<Date | undefined>(new Date(new Date().getFullYear(), 1, 3));
  const [bookedDemo, setBookedDemo] = useState<Date | undefined>(new Date(new Date().getFullYear(), 1, 3));
  const bookedDates = Array.from({ length: 15 }, (_, i) => new Date(new Date().getFullYear(), 1, 12 + i));
  const [presetDate, setPresetDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), 1, 12)
  );
  const [presetMonth, setPresetMonth] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [timeCal, setTimeCal] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 12)
  );
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 11, 8),
    to: addDays(new Date(new Date().getFullYear(), 11, 8), 10),
  });
  const [rtlDate, setRtlDate] = useState<Date | undefined>(new Date());
  const [tzDate, setTzDate] = useState<Date | undefined>(undefined);
  const [timeZone, setTimeZone] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return (
    <div className="flex w-full flex-col gap-10 text-left">
      <Section title="Single (default caption)">
        <Calendar
          mode="single"
          selected={single}
          onSelect={setSingle}
          className="rounded-xl border border-border shadow-sm"
        />
      </Section>

      <Section title="Month & year dropdowns">
        <Calendar
          mode="single"
          selected={dropdownSingle}
          onSelect={setDropdownSingle}
          captionLayout="dropdown"
          className="rounded-xl border border-border shadow-sm"
        />
      </Section>

      <Section title="Range · two months">
        <div className="max-w-full overflow-x-auto rounded-xl border border-border bg-card p-2 shadow-sm">
          <Calendar
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
            className="rounded-lg"
          />
        </div>
      </Section>

      <Section title="Week numbers">
        <Calendar
          mode="single"
          defaultMonth={weekNum}
          selected={weekNum}
          onSelect={setWeekNum}
          showWeekNumber
          className="rounded-xl border border-border shadow-sm"
        />
      </Section>

      <Section title="Modifiers · booked dates">
        <Calendar
          mode="single"
          defaultMonth={bookedDemo}
          selected={bookedDemo}
          onSelect={setBookedDemo}
          disabled={bookedDates}
          modifiers={{ booked: bookedDates }}
          modifiersClassNames={{ booked: "[&>button]:line-through opacity-100" }}
          className="rounded-xl border border-border shadow-sm"
        />
      </Section>

      <Section title="Presets">
        <Card className="w-full max-w-[min(100%,320px)] shadow-md">
          <CardContent>
            <Calendar
              mode="single"
              selected={presetDate}
              onSelect={setPresetDate}
              month={presetMonth}
              onMonthChange={setPresetMonth}
              fixedWeeks
              className="rounded-lg p-0 [--cell-size:2.375rem]"
            />
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 border-t border-border">
            {[
              { label: "Today", value: 0 },
              { label: "Tomorrow", value: 1 },
              { label: "In 3 days", value: 3 },
              { label: "In a week", value: 7 },
              { label: "In 2 weeks", value: 14 },
            ].map((preset) => (
              <Button
                key={preset.value}
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 min-w-[5.5rem]"
                onClick={() => {
                  const next = addDays(new Date(), preset.value);
                  setPresetDate(next);
                  setPresetMonth(new Date(next.getFullYear(), next.getMonth(), 1));
                }}
              >
                {preset.label}
              </Button>
            ))}
          </CardFooter>
        </Card>
      </Section>

      <Section title="Date + time">
        <Card className="w-full max-w-[min(100%,320px)] shadow-md">
          <CardContent>
            <Calendar
              mode="single"
              selected={timeCal}
              onSelect={setTimeCal}
              className="rounded-lg p-0"
            />
          </CardContent>
          <CardFooter className="border-t border-border bg-card">
            <FieldGroup className="w-full gap-4">
              <Field>
                <FieldLabel htmlFor="cal-time-from">Start time</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="cal-time-from"
                    type="time"
                    step={1}
                    defaultValue="10:30:00"
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                  <InputGroupAddon align="inline-end">
                    <Clock className="size-4 text-muted-foreground" aria-hidden />
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="cal-time-to">End time</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="cal-time-to"
                    type="time"
                    step={1}
                    defaultValue="12:30:00"
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                  <InputGroupAddon align="inline-end">
                    <Clock className="size-4 text-muted-foreground" aria-hidden />
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Custom cells · larger grid">
        <div className="max-w-full overflow-x-auto rounded-xl border border-border bg-card p-2 shadow-sm">
          <Calendar
            mode="range"
            defaultMonth={customRange?.from}
            selected={customRange}
            onSelect={setCustomRange}
            numberOfMonths={1}
            captionLayout="dropdown"
            className="rounded-lg [--cell-size:2.5rem] md:[--cell-size:2.75rem]"
            formatters={{
              formatMonthDropdown: (date) => date.toLocaleString("default", { month: "long" }),
            }}
            components={{
              DayButton: ({ children, modifiers, day, ...rest }: DayButtonProps) => {
                const weekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                return (
                  <CalendarDayButton day={day} modifiers={modifiers} {...rest}>
                    {children}
                    {!modifiers.outside ? (
                      <span className="text-[10px] leading-none opacity-80">{weekend ? "$120" : "$100"}</span>
                    ) : null}
                  </CalendarDayButton>
                );
              },
            }}
          />
        </div>
      </Section>

      <Section title="RTL · Arabic locale">
        <Calendar
          mode="single"
          selected={rtlDate}
          onSelect={setRtlDate}
          locale={arSA}
          dir="rtl"
          captionLayout="dropdown"
          className="rounded-xl border border-border shadow-sm [--cell-size:2.25rem]"
        />
      </Section>

      <Section title="Timezone-aware selection">
        <p className="w-full text-xs text-muted-foreground">
          Uses <code className="rounded bg-muted px-1 font-mono">timeZone</code> from{" "}
          <code className="rounded bg-muted px-1 font-mono">Intl</code> after mount to avoid hydration drift.
        </p>
        <Calendar
          mode="single"
          selected={tzDate}
          onSelect={setTzDate}
          timeZone={timeZone}
          className="rounded-xl border border-border shadow-sm"
        />
      </Section>
    </div>
  );
}
