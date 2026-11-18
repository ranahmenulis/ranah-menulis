"use client";

import { useHydrated } from "@/features/account/hooks/use-hydrated";
import { suspensions, useSuspensions } from "@/features/kelola/admin/role-store";
import { ME_ID } from "@/features/kelola/identity";
import { readViewerNow, useViewer } from "@/lib/viewer";

export function useGroupReader() {
  const ready = useHydrated();
  const viewer = useViewer();
  const suspended = useSuspensions();
  return ready && viewer === "masuk" && !suspended.some((item) => item.userId === ME_ID)
    ? ME_ID
    : null;
}

export function readGroupReader() {
  return readViewerNow().viewer === "masuk" &&
    !suspensions.read().some((item) => item.userId === ME_ID)
    ? ME_ID
    : null;
}
