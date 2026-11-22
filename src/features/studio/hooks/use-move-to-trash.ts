"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import { STUDIO_HREF } from "@/features/app-shell/nav";
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

  return useCallback(async () => {
    const id = getId();
    const failed = () =>
      toast({ message: "Dokumen belum bisa dipindah. Coba lagi.", tone: "error" });
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
        toast({
          message: "Dokumen belum bisa dipulihkan. Buka Sampah untuk mencoba lagi.",
          tone: "error",
        });
      }
    };
    toast({
      message: "Dokumen dipindah ke Sampah.",
      action: { label: "Urungkan", onSelect: () => void undo() },
    });
    router.push(STUDIO_HREF);
  }, [saveNow, getId, router, toast, store]);
}
