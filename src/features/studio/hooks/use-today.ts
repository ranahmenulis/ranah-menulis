"use client";

import { useEffect, useState } from "react";
import { useAccount } from "@/features/account/account-store";
import { writingTime } from "../writing-time";

/**
 * Today's date as "YYYY-MM-DD" in the account time zone, or "" until the page has loaded (Next
 * prerenders client components, and the date must be the visitor's, not the build's). It refreshes
 * when the tab becomes visible again, so a page left open overnight does not show yesterday.
 */
export function useToday(): string {
  const { timeZone } = useAccount().profile;
  const [today, setToday] = useState("");
  useEffect(() => {
    const update = () => setToday(writingTime(Date.now(), timeZone).day);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, [timeZone]);
  return today;
}
