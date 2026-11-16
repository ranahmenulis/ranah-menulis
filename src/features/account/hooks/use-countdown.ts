"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Seconds left until a moment the caller sets (resend cooldown, sign-in lock). The clock is read
 * only in events and timers, never while rendering. `start(seconds)` begins a wait.
 */
export function useCountdown(): { seconds: number; start: (seconds: number) => void } {
  const [until, setUntil] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!until) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setSeconds(left);
      if (left === 0) setUntil(0);
    };
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [until]);

  const start = useCallback((wait: number) => {
    setUntil(Date.now() + wait * 1000);
    setSeconds(wait);
  }, []);

  return { seconds, start };
}
