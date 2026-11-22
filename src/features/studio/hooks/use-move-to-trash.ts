"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import { STUDIO_HREF } from "@/features/app-shell/nav";
import { useT } from "@/lib/i18n/provider";
import type { DocumentStore } from "../storage/document-store";

/**
 * Moves the open document to Sampah. Reversible: the document keeps its text there, and "Urungkan"
 * opens it again. Saves first so nothing written is left behind.
 */
export function useMoveToTrash(
  saveNow: () => Promise<boolean>,
  getId: () => string,
  store: DocumentStore,
) {
  const router = useRouter();
  const toast = useToast();
  const t = useT().studioEditor;

  return useCallback(async () => {
    const id = getId();
    const failed = () => toast({ message: t.toasts.moveFailed, tone: "error" });
    if (!(await saveNow())) return failed();
    try {
      if (!(await store.updateMeta(id, { deletedAt: Date.now() }))) return failed();
    } catch {
      return failed();
    }
    const undo = async () => {
      try {
        if (!(await store.updateMeta(id, { deletedAt: null }))) throw new Error("not found");
        router.push(`/studio/${id}`);
      } catch {
        toast({ message: t.toasts.restoreFailed, tone: "error" });
      }
    };
    toast({
      message: t.toasts.moved,
      action: { label: t.toasts.undo, onSelect: () => void undo() },
    });
    router.push(STUDIO_HREF);
  }, [saveNow, getId, router, toast, store, t]);
}
