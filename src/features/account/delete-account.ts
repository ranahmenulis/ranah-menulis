"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type DeleteOwnAccountResult =
  { ok: true } | { ok: false; reason: "unauthenticated" | "failed" };

/**
 * Deletes the signed-in account (Pengaturan, Zona bahaya). Who it is comes from the verified
 * session, never from an argument, so nobody can delete someone else's account through it. The
 * service role is needed because an account cannot delete itself under Row Level Security.
 * Deleting the auth user removes the profile and the platform roles with it (on delete cascade);
 * the photo and cover files and one audit line (no personal data: only the id) are handled here first.
 * Data kept on the device (documents, Community) is not touched.
 */
export async function deleteOwnAccount(): Promise<DeleteOwnAccountResult> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;
    if (!userId) return { ok: false, reason: "unauthenticated" };

    const admin = createAdminClient();
    // Every bucket keeps a person's files in a folder named after them.
    for (const bucket of [
      "avatars",
      "studio-covers",
      "community-images",
      "project-posters",
      "project-files",
    ]) {
      const files = await admin.storage.from(bucket).list(userId);
      const paths = (files.data ?? []).map((file) => `${userId}/${file.name}`);
      if (paths.length > 0) await admin.storage.from(bucket).remove(paths);
    }

    // Written before the delete: `actor_id` turns to null afterwards, `target_id` stays.
    await admin.from("audit_log").insert({
      actor_id: userId,
      action: "account.delete",
      target_type: "user",
      target_id: userId,
    });

    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return { ok: false, reason: "failed" };

    // The session cookie is useless now; clear it so the next request reads a visitor.
    await supabase.auth.signOut().catch(() => undefined);
    return { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
