import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { SessionProvider, type SessionInfo } from "@/lib/auth/session-context";

afterEach(() => window.sessionStorage.clear());

function wrap(session: SessionInfo) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <SessionProvider value={session}>{children}</SessionProvider>;
  };
}

describe("useEffectiveRoles with a session", () => {
  it("adds the platform roles held in the database", () => {
    const { result } = renderHook(() => useEffectiveRoles(), {
      wrapper: wrap({ status: "user", userId: "u1", platformRoles: ["administrator"] }),
    });
    expect(result.current).toContain("administrator");
  });

  it("gives a user without roles no management role", () => {
    const { result } = renderHook(() => useEffectiveRoles(), {
      wrapper: wrap({ status: "user", userId: "u1", platformRoles: [] }),
    });
    expect(result.current).toEqual([]);
  });
});
