"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { format, useT } from "@/lib/i18n/provider";
import { SignInButton, SignUpButton } from "@/features/account/components/auth-buttons";
import { mark } from "../storage/post-store";
import type { CommunityData } from "./use-community";

/** The dialog a signed-out reader gets for anything that needs an account (PRD 16). */
export function GuestDialog({ ask, onClose }: { ask: string | null; onClose: () => void }) {
  const t = useT().post.dialog;
  return (
    <Dialog
      open={ask !== null}
      onClose={onClose}
      title={ask ?? t.title}
      description={t.description}
      actions={
        <>
          <Button variant="text" onClick={onClose}>
            {t.later}
          </Button>
          <SignUpButton variant="text" onClick={onClose} className="text-ink!">
            {t.signUp}
          </SignUpButton>
          <SignInButton onClick={onClose}>{t.signIn}</SignInButton>
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
  const t = useT().post.actions;
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
    appreciate: (id) => flip(mark.appreciated(id), t.askAppreciate, t.appreciateFailed),
    save: (id) => flip(mark.saved(id), t.askSave, t.saveFailed),
    follow: (authorId, name) => {
      if (requireAccount(format(t.askFollow, { name }))) return;
      void toggle(mark.following(authorId), data.following(authorId)).then(
        (ok) => !ok && toast({ message: t.followFailed, tone: "error" }),
      );
    },
    guestDialog: <GuestDialog ask={ask} onClose={() => setAsk(null)} />,
    requireAccount,
  };
}
