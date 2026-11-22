"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import { STUDIO_HREF } from "@/features/app-shell/nav";
import { useT } from "@/lib/i18n/provider";

export function useLeaveEditor(
  saveNow: () => Promise<boolean>,
  saveEventProgress: () => Promise<unknown>,
) {
  const router = useRouter();
  const toast = useToast();
  const t = useT().studioEditor;

  const saveBeforeLeaving = useCallback(
    async (flushEvent: boolean) => {
      if (await saveNow()) {
        if (flushEvent) await saveEventProgress();
        return true;
      }
      toast({
        message: t.toasts.unsavedLeave,
        tone: "error",
      });
      return false;
    },
    [saveNow, saveEventProgress, toast, t],
  );

  const goBack = useCallback(
    async (href = STUDIO_HREF) => {
      if (await saveBeforeLeaving(href !== STUDIO_HREF)) router.push(href);
    },
    [saveBeforeLeaving, router],
  );

  return { goBack, saveBeforeLeaving };
}
