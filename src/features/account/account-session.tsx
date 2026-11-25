"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SessionProvider } from "@/lib/auth/session-context";
import type { AccountGateway } from "./account-gateway";
import type { AuthGateway } from "./auth-gateway";
import { AuthGatewayProvider } from "./auth-gateway-context";
import { connectLiveAccount } from "./account-store";
import { createLiveAccount } from "./live-account";
import { LiveAccountContext } from "./live-account-context";
import type { SessionSnapshot } from "./session-types";
import { supabaseAccountGateway } from "./supabase-account-gateway";
import { supabaseAuthGateway } from "./supabase-auth-gateway";

/**
 * Holds the signed-in account the server read, and is the one place that saves changes to it:
 * the screen updates at once, the profile row is written behind it, and a failed write puts the
 * old values back. Mounted once in the root layout, so every screen below sees the same account.
 */
export function AuthProvider({
  snapshot,
  gateway = supabaseAccountGateway,
  auth = supabaseAuthGateway,
  children,
}: {
  snapshot: SessionSnapshot;
  gateway?: AccountGateway;
  /** Sign in, sign up, sign out; the real one unless a test passes its own. */
  auth?: AuthGateway;
  children: ReactNode;
}) {
  const [account, setAccount] = useState(snapshot.account);
  const [seen, setSeen] = useState(snapshot);
  // A fresh server read (after sign-in, sign-out or a refresh) replaces what was held.
  if (seen !== snapshot) {
    setSeen(snapshot);
    setAccount(snapshot.account);
  }

  const latest = useRef(account);
  const userId = snapshot.session.userId;

  useEffect(() => {
    latest.current = account;
  }, [account]);

  useEffect(() => {
    if (!userId) return;
    connectLiveAccount(
      createLiveAccount({
        userId,
        gateway,
        read: () => latest.current,
        write: (next) => {
          latest.current = next;
          setAccount(next);
        },
      }),
    );
    return () => connectLiveAccount(null);
  }, [userId, gateway]);

  return (
    <SessionProvider value={snapshot.session}>
      <AuthGatewayProvider value={auth}>
        <LiveAccountContext.Provider value={account}>{children}</LiveAccountContext.Provider>
      </AuthGatewayProvider>
    </SessionProvider>
  );
}
