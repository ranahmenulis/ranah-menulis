"use client";

import { useEffect, useState } from "react";
import { dayKey } from "../daily-progress";

/**
 * Today's date as "YYYY-MM-DD" in the visitor's time zone, or "" until the page has loaded (Next
 * prerenders client components, and the date must be the visitor's, not the build's). It refreshes
 * when the tab becomes visible again, so a page left open overnight does not show yesterday.
 */
export function useToday(): string {
  const [today, setToday] = useState("");
  useEffect(() => {
    const update = () => setToday(dayKey(new Date()));
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return today;
}
