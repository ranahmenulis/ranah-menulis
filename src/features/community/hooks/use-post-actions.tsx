"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { mark } from "../storage/post-store";
import type { CommunityData } from "./use-community";

const SOON = "Masuk tersedia setelah akun dibuka";

/** The dialog a signed-out reader gets for anything that needs an account (PRD 16). */
export function GuestDialog({ ask, onClose }: { ask: string | null; onClose: () => void }) {
  return (
    <Dialog
      open={ask !== null}
      onClose={onClose}
      title={ask ?? "Masuk untuk melanjutkan"}
      description="Setelah masuk, kamu kembali ke tulisan ini di posisi yang sama."
      actions={
        <>
          <Button variant="text" onClick={onClose}>
            Nanti saja
          </Button>
          <Button variant="text" disabled title={SOON} className="text-ink!">
            Daftar
          </Button>
          <Button disabled title={SOON}>
            Masuk
          </Button>
        </>
      }
    />
  );
}

export type PostActions = {
  appreciate: (postId: string) => void;
  save: (postId: string) => void;
  follow: (authorId: string, name: string) => void;
  /** Mount once in the screen: it is the dialog guests get instead of the action. */
  guestDialog: ReactNode;
  /** For actions of this screen that need an account but are not toggles (replying). */
  requireAccount: (ask: string) => boolean;
};

/**
 * Appreciate, save, and follow for any Community screen. A signed-out reader gets the Masuk dialog
 * instead of the action; a failed write is reported and the toggle goes back.
 */
export function usePostActions(data: CommunityData, guest: boolean): PostActions {
  const toast = useToast();
  const [ask, setAsk] = useState<string | null>(null);
  const { marks, toggle } = data;

  const requireAccount = useCallback(
    (question: string) => {
      if (guest) setAsk(question);
      return guest;
    },
    [guest],
  );

  const flip = useCallback(
    async (key: string, question: string, failure: string) => {
      if (requireAccount(question)) return;
      const ok = await toggle(key, marks[key] ?? false);
      if (!ok) toast({ message: failure, tone: "error", key });
    },
    [marks, requireAccount, toast, toggle],
  );

  return {
    appreciate: (id) =>
      flip(mark.appreciated(id), "Masuk untuk memberi Apresiasi", "Apresiasi belum tersimpan."),
    save: (id) =>
      flip(mark.saved(id), "Masuk untuk menyimpan tulisan", "Simpanan belum tersimpan."),
    follow: (authorId, name) => {
      if (requireAccount(`Masuk untuk mengikuti ${name}`)) return;
      void toggle(mark.following(authorId), data.following(authorId)).then(
        (ok) => !ok && toast({ message: "Pilihan mengikuti belum tersimpan.", tone: "error" }),
      );
    },
    guestDialog: <GuestDialog ask={ask} onClose={() => setAsk(null)} />,
    requireAccount,
  };
}
