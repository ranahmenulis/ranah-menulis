"use client";

import { useAccount } from "./account-store";
import { ownProfileHref } from "./own-identity";

/** The address of the reader's own profile; follows the username of a registered account. */
export function useOwnProfileHref(): string {
  return ownProfileHref(useAccount());
}
