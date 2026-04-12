"use client";

import { Fragment } from "react";

/** Minimal inline **bold** for assistant copy (no full markdown). */
export function renderEchoRichText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {m[1]}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
