import { createClient } from "@/lib/supabase/client";
import type { AccountGateway } from "./account-gateway";
import { dataUrlToBlob } from "./photo-blob";

const BUCKET = "avatars";
const PHOTO_NAME = "avatar.webp";

/** Writes the profile and the photo through the browser client, so Row Level Security decides who may. */
export const supabaseAccountGateway: AccountGateway = {
  async updateProfile(userId, update) {
    try {
      const { data, error } = await createClient()
        .from("profiles")
        .update(update)
        .eq("id", userId)
        .select("id");
      // 23505 = unique violation: the only unique column the screens write is the username.
      if (error) return error.code === "23505" ? "username-taken" : "failed";
      return (data?.length ?? 0) === 1 ? "ok" : "failed";
    } catch {
      return "failed";
    }
  },

  async uploadPhoto(userId, dataUrl) {
    try {
      const blob = dataUrlToBlob(dataUrl);
      if (!blob) return { ok: false };
      const path = `${userId}/${PHOTO_NAME}`;
      const storage = createClient().storage.from(BUCKET);
      const { error } = await storage.upload(path, blob, { contentType: blob.type, upsert: true });
      if (error) return { ok: false };
      return { ok: true, path, url: storage.getPublicUrl(path).data.publicUrl };
    } catch {
      return { ok: false };
    }
  },

  async removePhoto(userId) {
    try {
      await createClient()
        .storage.from(BUCKET)
        .remove([`${userId}/${PHOTO_NAME}`]);
    } catch {
      // A leftover file is harmless: nothing points at it any more.
    }
  },
};
