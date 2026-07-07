"use client";

import { useEffect, useState } from "react";

// GIF confirmed at 3000ms (90 frames, 10cs each via sequential block parse)
const GIF_DURATION_MS = 2000;

interface Props { onDone: () => void; contained?: boolean; }

export function MobileSplashScreen({ onDone, contained = false }: Props) {
  // Cache-bust on every mount so the browser always fetches a fresh GIF
  // instead of resuming a cached (partially-played) copy after a refresh.
  const [src] = useState(() => `/Splashscreen3.gif?v=${Date.now()}`);
  const pos = contained ? "absolute" : "fixed";

  useEffect(() => {
    const timer = setTimeout(onDone, GIF_DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // capture onDone at mount; timer fires exactly once

  return (
    <div className={`${pos} inset-0`} style={{ zIndex: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
