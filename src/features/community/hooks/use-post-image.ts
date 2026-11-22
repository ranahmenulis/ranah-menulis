"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/provider";
import { compressImage } from "@/lib/files/compress-image";
import { problemText } from "@/lib/files/problem-text";
import { validateUpload } from "@/lib/files/validate-upload";
import type { PostImage } from "../types";

/**
 * Turns a picked file into a post image: checks the real type and size, resizes, and re-encodes as
 * WebP. The text of the last refusal is kept for the field to show; the alt text starts empty.
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
      const { dataUrl, width, height } = await compressImage(file);
      onImage({ src: dataUrl, width, height, alt: "" });
    } catch {
      setError(problemText("unreadable", "image", locale));
    } finally {
      setBusy(false);
    }
  }

  return { pick, error, busy, clearError: () => setError(null) };
}
