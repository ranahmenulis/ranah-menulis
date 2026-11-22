"use client";

import { useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/lib/i18n/provider";
import type { DocumentVersion } from "../versions";

/** Restores a version, then says so and closes the panel. Resolves false when it could not. */
export function useRestoreVersion(
  restore: (version: DocumentVersion) => Promise<boolean>,
  onDone: () => void,
) {
  const toast = useToast();
  const t = useT().studioEditor;
  return useCallback(
    async (version: DocumentVersion) => {
      const ok = await restore(version);
      if (ok) {
        toast({ message: t.toasts.versionRestored });
        onDone();
      }
      return ok;
    },
    [restore, toast, onDone, t],
  );
}
