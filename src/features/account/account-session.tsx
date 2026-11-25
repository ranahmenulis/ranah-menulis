"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SessionProvider } from "@/lib/auth/session-context";
import type { AccountGateway } from "./account-gateway";
import type { AuthGateway } from "./auth-gateway";
import { AuthGatewayProvider } from "./auth-gateway-context";
import { connectLiveAccount } from "./account-store";
import { mergeAccount, type Account, type AccountPatch } from "./account-model";
import { LiveAccountContext } from "./live-account-context";
import { accountToUpdate } from "./profile-mapping";
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
    connectLiveAccount({
      get: () => latest.current as Account,
      async update(patch: AccountPatch) {
        const before = latest.current;
        if (!before) return false;
        const after = mergeAccount(before, patch);
        const write = JSON.stringify(accountToUpdate(after));
        const changed = write !== JSON.stringify(accountToUpdate(before));
        latest.current = after;
        setAccount(after);
        if (!changed) return true; // email, password time: nothing in the profile row to write
        const kept = await gateway.updateProfile(userId, accountToUpdate(after));
        if (!kept && latest.current === after) {
          latest.current = before;
          setAccount(before);
        }
        return kept;
      },
    });
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
