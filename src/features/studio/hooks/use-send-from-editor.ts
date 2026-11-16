"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { kirimHref } from "@/features/projects/submission-model";

/**
 * Opens the send page for a project from the editor. What was typed is stored first, so the send
 * page reads the text as it is now; when that fails nothing is left (resolves false). The dialog is
 * closed before leaving, because a modal left open on a hidden page would freeze the next one.
 */
export function useSendFromEditor(input: {
  saveNow: () => Promise<boolean>;
  getId: () => string;
  closeDialog: () => void;
}) {
  const { saveNow, getId, closeDialog } = input;
  const router = useRouter();
  return useCallback(
    async (slug: string) => {
      if (!(await saveNow())) return false;
      closeDialog();
      router.push(kirimHref(slug, getId()));
      return true;
    },
    [saveNow, getId, closeDialog, router],
  );
}
