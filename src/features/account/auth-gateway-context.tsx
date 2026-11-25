"use client";

import { createContext, useContext } from "react";
import type { AuthGateway } from "./auth-gateway";
import { dummyAuthGateway } from "./dummy-auth-gateway";

const AuthGatewayContext = createContext<AuthGateway>(dummyAuthGateway);

export const AuthGatewayProvider = AuthGatewayContext.Provider;

/** The sign-in system for this page; the simulated one when no provider is mounted (tests). */
export function useAuthGateway(): AuthGateway {
  return useContext(AuthGatewayContext);
}
