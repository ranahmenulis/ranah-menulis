import type { SessionInfo } from "@/lib/auth/session-info";
import type { Account } from "./account-model";

/** What the root layout reads for one request and hands to the provider (plain, serialisable). */
export type SessionSnapshot = {
  session: SessionInfo;
  /** The signed-in account; null for a visitor. */
  account: Account | null;
};
