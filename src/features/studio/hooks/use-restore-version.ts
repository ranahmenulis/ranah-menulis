"use client";

import { useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import type { DocumentVersion } from "../versions";

/** Restores a version, then says so and closes the panel. Resolves false when it could not. */
export function useRestoreVersion(
  restore: (version: DocumentVersion) => Promise<boolean>,
  onDone: () => void,
) {
  const toast = useToast();
  return useCallback(
    async (version: DocumentVersion) => {
      const ok = await restore(version);
      if (ok) {
        toast({ message: "Versi dipulihkan. Tulisan sebelumnya masih ada di riwayat." });
        onDone();
      }
      return ok;
    },
    [restore, toast, onDone],
  );
}
