"use client";

import { useCallback, useRef } from "react";

/**
 * Returns a callback ref that attaches two desktop scroll behaviours to any
 * horizontal scroll container, including those that render conditionally:
 *
 *   1. Vertical mouse-wheel → horizontal scroll
 *   2. Click-and-drag to scroll (grabbing cursor via document.body)
 *
 * Uses a callback ref (not useRef + useEffect) so listeners attach the moment
 * the element mounts, even when rendered conditionally, and clean up on unmount.
 *
 * Usage:  const ref = useHorizontalScroll();  →  <div ref={ref} ...>
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>() {
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback((el: T | null) => {
    /* Clean up the previous element's listeners (handles unmount + remount) */
    cleanupRef.current?.();
    cleanupRef.current = null;

    if (!el) return;

    /* ── Wheel: vertical delta → horizontal scroll ─────────────────── */
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    /* ── Drag to scroll ─────────────────────────────────────────────── */
    let dragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let didDrag = false;

    const onMouseDown = (e: MouseEvent) => {
      dragging = true;
      didDrag = false;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      /* Set on body so the cursor overrides all child elements (buttons, etc.) */
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) didDrag = true;
      el.scrollLeft = startScrollLeft - dx;
    };

    const stopDrag = () => {
      if (!dragging) return;
      dragging = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    /* Suppress child click when the gesture was a drag, not a tap */
    const onClickCapture = (e: MouseEvent) => {
      if (didDrag) {
        e.stopPropagation();
        didDrag = false;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDrag);
    el.addEventListener("click", onClickCapture, true);

    cleanupRef.current = () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDrag);
      el.removeEventListener("click", onClickCapture, true);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []); // stable — no deps, never recreated

  return ref;
}
