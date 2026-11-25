"use client";

import { createContext, useContext } from "react";
import type { AuthGateway } from "./auth-gateway";

const AuthGatewayContext = createContext<AuthGateway | null>(null);

export const AuthGatewayProvider = AuthGatewayContext.Provider;

let fallback: AuthGateway | null = null;

/** Test seam: the gateway used when no provider is mounted. Never set by app code. */
export function setFallbackAuthGateway(gateway: AuthGateway | null) {
  fallback = gateway;
}

/** The sign-in system for this page. The app always mounts one (`AuthProvider`). */
export function useAuthGateway(): AuthGateway {
  const gateway = useContext(AuthGatewayContext) ?? fallback;
  if (!gateway) throw new Error("useAuthGateway needs an AuthGatewayProvider above it.");
  return gateway;
}
