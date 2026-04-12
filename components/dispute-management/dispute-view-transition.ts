/**
 * Shared Framer `layoutId`: quick modal snippet ↔ full dispute page.
 * Morphs position/size so the preview feels like it expands into the route.
 */
export const DISPUTE_MANAGEMENT_LAYOUT_ID = "dispute-mgmt-surface" as const;

/** Spring tuned for a smooth “snippet → full canvas” handoff (first frames ease out, no snap). */
export const DISPUTE_MANAGEMENT_LAYOUT_TRANSITION = {
  type: "spring" as const,
  stiffness: 280,
  damping: 34,
  mass: 0.88,
};
