"use client";

import { useState } from "react";
import { accountSession } from "@/features/studio/storage/store";
import { useLocale } from "@/lib/i18n/provider";
import { compressImage } from "@/lib/files/compress-image";
import { problemText } from "@/lib/files/problem-text";
import { validateUpload } from "@/lib/files/validate-upload";
import type { PostImage } from "../types";

/**
 * Turns a picked file into a post image: checks the real type and size, resizes, and re-encodes as
 * WebP. When signed in, uploads to the public `community-images` bucket and returns its URL;
 * visitors keep a local data URL.
 */
export function usePostImage(onImage: (image: PostImage) => void) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const locale = useLocale();

  async function pick(file: File) {
    setBusy(true);
    setError(null);
    try {
      const check = await validateUpload(file, "image");
      if (!check.ok) return setError(problemText(check.problem, "image", locale));
      const { blob, dataUrl, width, height } = await compressImage(file);
      let src = dataUrl;
      const session = await accountSession();
      if (session) {
        const path = `${session.userId}/${crypto.randomUUID()}.webp`;
        const { error: uploadError } = await session.client.storage
          .from("community-images")
          .upload(path, blob, { contentType: "image/webp", upsert: true });
        if (uploadError) return setError(problemText("unreadable", "image", locale));
        src = session.client.storage.from("community-images").getPublicUrl(path).data.publicUrl;
      }
      onImage({ src, width, height, alt: "" });
    } catch {
      setError(problemText("unreadable", "image", locale));
    } finally {
      setBusy(false);
    }
  }

  return { pick, error, busy, clearError: () => setError(null) };
}
