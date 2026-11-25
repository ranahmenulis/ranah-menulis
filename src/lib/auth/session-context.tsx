"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { SessionInfo } from "./session-info";

// Absent in tests and in stories that render a component alone; `useSession()` is then null and
// callers fall back to the older device-only behaviour.
export { GUEST_SESSION, type SessionInfo } from "./session-info";

const SessionContext = createContext<SessionInfo | null>(null);

/** The session of the page being shown, for button handlers (set once the provider is mounted). */
let live: SessionInfo | null = null;

export function SessionProvider({ value, children }: { value: SessionInfo; children: ReactNode }) {
  useEffect(() => {
    live = value;
    return () => {
      if (live === value) live = null;
    };
  }, [value]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** The session of this request, or null when no provider is mounted (tests). */
export function useSession(): SessionInfo | null {
  return useContext(SessionContext);
}

/** The session right now, for handlers that must not trust what they rendered. */
export function readSessionNow(): SessionInfo | null {
  return live;
}
