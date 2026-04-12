"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ChevronDown, CalendarDays } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "./utils";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const PRIMARY = "#0061E3";
const PANEL_W = 296;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDayOf(y: number, m: number)  { return new Date(y, m, 1).getDay(); }

function parseYMD(s: string) {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m: m - 1, d };
}
function toYMD(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function displayDate(ymd: string) {
  const p = parseYMD(ymd);
  if (!p) return "";
  return `${String(p.d).padStart(2, "0")} ${MONTHS[p.m].slice(0, 3)} ${p.y}`;
}

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface DatePickerProps {
  value:        string;
  onChange:     (v: string) => void;
  placeholder?: string;
  className?:   string;
  min?:         string;
  label?:       string;
}

/* ─── DatePicker ─────────────────────────────────────────────────────────── */
export function DatePicker({ value, onChange, placeholder = "Select date", className, min, label }: DatePickerProps) {
  const today   = new Date();
  const parsed  = parseYMD(value);

  const [open,      setOpen]      = useState(false);
  const [panelPos,  setPanelPos]  = useState({ top: 0, left: 0 });
  const [viewYear,  setViewYear]  = useState(parsed?.y  ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.m  ?? today.getMonth());
  const [yearMenu,  setYearMenu]  = useState(false);
  const [monthMenu, setMonthMenu] = useState(false);
  const [mounted,   setMounted]   = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  /* Sync view when value changes */
  useEffect(() => {
    if (parsed) { setViewYear(parsed.y); setViewMonth(parsed.m); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /* Compute fixed position from trigger rect */
  function openPanel() {
    if (!triggerRef.current) return;
    const trigger = triggerRef.current;
    const vw     = window.innerWidth;
    const vh     = window.innerHeight;
    const PANEL_H = 340; // approx height

    // Scroll trigger into view so panel can appear next to it (avoids panel far from input in scrollable forms)
    trigger.scrollIntoView({ block: "center", behavior: "auto" });

    requestAnimationFrame(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();

      // Horizontal: align left edge, clamp so it doesn't go off screen
      let left = rect.left;
      if (left + PANEL_W > vw - 8) left = vw - PANEL_W - 8;

      // Vertical: prefer below trigger; if not enough room open above
      let top = rect.bottom + 6;
      if (top + PANEL_H > vh - 8) top = rect.top - PANEL_H - 6;

      setPanelPos({ top, left });
      setOpen(true);
    });
  }

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const inTrigger = triggerRef.current?.contains(e.target as Node);
      const inPanel   = panelRef.current?.contains(e.target as Node);
      if (!inTrigger && !inPanel) {
        setOpen(false); setYearMenu(false); setMonthMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Navigation */
  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  /* Day grid */
  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstDay  = firstDayOf(viewYear, viewMonth);
  const prevTotal = daysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);
  const minParsed = parseYMD(min ?? "");

  function isDisabled(y: number, m: number, d: number) {
    if (!minParsed) return false;
    return new Date(y, m, d) < new Date(minParsed.y, minParsed.m, minParsed.d);
  }

  type Cell = { d: number; m: number; y: number; current: boolean };
  const cells: Cell[] = [];
  for (let i = 0; i < firstDay; i++) {
    const d = prevTotal - firstDay + 1 + i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ d, m, y, current: false });
  }
  for (let d = 1; d <= totalDays; d++) cells.push({ d, m: viewMonth, y: viewYear, current: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ d, m, y, current: false });
  }

  const years = Array.from({ length: 15 }, (_, i) => today.getFullYear() - 2 + i);

  function selectDay(cell: Cell) {
    if (!cell.current) { setViewYear(cell.y); setViewMonth(cell.m); }
    if (cell.current && isDisabled(cell.y, cell.m, cell.d)) return;
    onChange(toYMD(cell.y, cell.m, cell.d));
    setOpen(false);
  }

  const isToday    = (c: Cell) => c.d === today.getDate() && c.m === today.getMonth() && c.y === today.getFullYear();
  const isSelected = (c: Cell) => !!parsed && c.d === parsed.d && c.m === parsed.m && c.y === parsed.y;

  /* ── Calendar panel (portalled) ── */
  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.97, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -6 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="isolate rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg select-none dark:shadow-black/40"
          style={{
            position:        "fixed",
            top:             panelPos.top,
            left:            panelPos.left,
            width:           PANEL_W,
            zIndex:          20000,
            backgroundColor: "var(--popover)",
            boxShadow:       "0 16px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.07)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <button onClick={prevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {/* Month */}
              <div className="relative">
                <button onClick={() => { setMonthMenu(o => !o); setYearMenu(false); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[14px] font-semibold text-gray-900 hover:bg-gray-100 transition-colors">
                  {MONTHS[viewMonth].slice(0, 3)}
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                <AnimatePresence>
                  {monthMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full left-0 z-[10000] mt-1 max-h-[220px] min-w-[130px] overflow-y-auto rounded-xl border border-border bg-popover py-1 shadow-lg"
                    >
                      {MONTHS.map((mn, mi) => (
                        <button key={mn} onClick={() => { setViewMonth(mi); setMonthMenu(false); }}
                          className="w-full px-3 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-muted"
                          style={{ fontWeight: mi === viewMonth ? 600 : 400, color: mi === viewMonth ? PRIMARY : undefined }}
                        >
                          {mn}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Year */}
              <div className="relative">
                <button onClick={() => { setYearMenu(o => !o); setMonthMenu(false); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[14px] font-semibold text-gray-900 hover:bg-gray-100 transition-colors">
                  {viewYear}
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                <AnimatePresence>
                  {yearMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full left-0 z-[10000] mt-1 max-h-[200px] min-w-[90px] overflow-y-auto rounded-xl border border-border bg-popover py-1 shadow-lg"
                    >
                      {years.map(yr => (
                        <button key={yr} onClick={() => { setViewYear(yr); setYearMenu(false); }}
                          className="w-full px-3 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-muted"
                          style={{ fontWeight: yr === viewYear ? 600 : 400, color: yr === viewYear ? PRIMARY : undefined }}
                        >
                          {yr}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button onClick={nextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers — explicit grid: Tailwind grid-cols-7 can be dropped from CSS output for portalled nodes */}
          <div
            className="px-3 pb-1"
            style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
          >
            {DAYS.map((d) => (
              <div key={d} className="py-1 text-center text-[11.5px] font-semibold text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div
            className="gap-y-0.5 px-3 pb-4"
            style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
          >
            {cells.map((cell, i) => {
              const selected = isSelected(cell);
              const tod      = isToday(cell);
              const disabled = cell.current && isDisabled(cell.y, cell.m, cell.d);
              return (
                <button key={i} onClick={() => selectDay(cell)} disabled={disabled}
                  className={cn(
                    "h-9 w-9 mx-auto rounded-full text-[13px] font-medium flex items-center justify-center transition-all",
                    selected  && "text-white font-semibold",
                    !selected && tod      && "font-semibold",
                    !selected && !tod && cell.current  && !disabled && "text-gray-800 hover:bg-gray-100",
                    !selected && !cell.current && "text-gray-300 hover:bg-gray-50",
                    disabled  && "opacity-30 cursor-not-allowed",
                  )}
                  style={selected ? { background: PRIMARY } : tod ? { background: `${PRIMARY}18`, color: PRIMARY } : {}}>
                  {cell.d}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={cn("relative", className)}>
      {label && <p className="mb-2 text-sm font-medium text-foreground">{label}</p>}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => open ? setOpen(false) : openPanel()}
        className={cn(
          "flex h-12 min-h-12 w-full items-center gap-3 rounded-xl border border-border bg-card px-5 text-left text-[15px] shadow-sm transition-colors",
          open ? "border-ring ring-2 ring-ring/20" : "hover:border-muted-foreground/45",
        )}
      >
        <CalendarDays className="size-[1.125rem] shrink-0 text-muted-foreground" />
        <span className={cn("flex-1", value ? "text-foreground" : "text-muted-foreground")}>
          {value ? displayDate(value) : placeholder}
        </span>
        <ChevronDown className={cn("size-[1.125rem] shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {/* Portal */}
      {mounted && createPortal(panel, document.body)}
    </div>
  );
}
