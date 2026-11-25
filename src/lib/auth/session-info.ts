import type { ManagerRole } from "@/lib/roles";

// Plain data, deliberately NOT a client module: the server builds it (`features/account/session.ts`)
// and anything imported from a "use client" file is only an opaque reference on the server.

/**
 * Who is signed in, as the server saw it for this request. Read in the root layout and handed down
 * once, so the first render already knows (no flash of the signed-out view).
 */
export type SessionInfo = {
  status: "guest" | "user";
  userId: string | null;
  /** Platform roles held in the database (Administrator, Super Admin). */
  platformRoles: readonly ManagerRole[];
};

export const GUEST_SESSION: SessionInfo = { status: "guest", userId: null, platformRoles: [] };
