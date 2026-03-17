"use client";

import { useState, useEffect, useCallback } from "react";

export function useSimulatedLoading(delayMs: number = 1200) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const reload = useCallback(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return { isLoading, reload };
}
