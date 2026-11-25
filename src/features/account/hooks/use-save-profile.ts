"use client";

import { useT } from "@/lib/i18n/provider";
import { saveProfileDetailed } from "../account-store";
import type { SaveResult } from "../account-gateway";
import { useAuthGateway } from "../auth-gateway-context";
import { cleanProfile } from "../profile-validation";
import { normalizeUsername } from "../validation";
import type { ProfileForm } from "./use-profile-form";

/**
 * Saves the profile form of Mulai and Pengaturan and says what to tell the reader. A username the
 * server found taken (someone saved it first) goes back onto the field; the other failures come
 * back as a sentence. `null` means it was saved or the field already shows the problem.
 */
export function useSaveProfile(form: ProfileForm) {
  const t = useT().account;
  const gateway = useAuthGateway();

  async function save(options?: { finish?: boolean }): Promise<{
    result: SaveResult;
    problem: string | null;
  }> {
    const result = await saveProfileDetailed(cleanProfile(form.values, normalizeUsername), options);
    if (result === "username-taken") form.refuseUsername();
    const problem =
      result === "photo-failed"
        ? t.settings.personal.photoFailed
        : result === "failed"
          ? gateway.simulated
            ? t.settings.personal.failed
            : t.settings.personal.failedRemote
          : null;
    return { result, problem };
  }

  return save;
}
