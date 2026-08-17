import { useCallback, useRef } from "react";

/**
 * Radix Dialog's scroll lock (react-remove-scroll) swallows wheel events on
 * nested Popover content portaled to body, even though the element itself is
 * scrollable (programmatic scrollTop and arrow-key navigation both work).
 * This re-applies the wheel delta manually once the popover content mounts.
 *
 * Uses a callback ref (not useEffect) because Radix's Popover.Content mounts
 * via its own Presence/portal timing, which lands in a later commit than the
 * `open` state flip — an effect keyed on `open` sees a still-null ref.
 */
export function useWheelScrollFix<T extends HTMLElement>() {
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback((el: T | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop <= 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;
      if (atTop || atBottom) return;
      e.preventDefault();
      el.scrollTop += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    cleanupRef.current = () => el.removeEventListener("wheel", onWheel);
  }, []);

  return ref;
}
