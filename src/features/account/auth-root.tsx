import type { ReactNode } from "react";
import { AuthProvider } from "./account-session";
import { readSession } from "./session";

/** Reads the session once per request and hands it to the client tree (server component). */
export async function AuthRoot({ children }: { children: ReactNode }) {
  const snapshot = await readSession();
  return <AuthProvider snapshot={snapshot}>{children}</AuthProvider>;
}
