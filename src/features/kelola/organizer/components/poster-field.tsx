"use client";

import { ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilePickButton } from "@/components/ui/file-pick-button";
import { fileStore } from "@/lib/files/store";
import { PosterCover } from "@/features/projects/components/poster-cover";
import { discardPoster, storePoster } from "../poster-files";
import { TextField, type FormApi } from "./form-fields";

type Props = {
  api: FormApi;
  /** The poster file already saved with the project; it is only freed once a save replaces it. */
  savedId: string;
};

/**
 * One optional poster for the project. Without it the catalog shows the generated cover, so the
 * field only ever adds. The image is shrunk to WebP on this device and cropped to 4:5 wherever the
 * project is shown. A poster that was picked but never saved is freed when replaced or removed;
 * the saved one stays until the form is saved.
 */
export function PosterField({ api, savedId }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { posterId } = api.input;

  async function pick(file: File) {
    setBusy(true);
    setError(null);
    const result = await storePoster(file, fileStore());
    setBusy(false);
    if (!result.ok) return setError(result.message);
    if (posterId !== savedId) await discardPoster(posterId, fileStore());
    api.set("posterId", result.id);
    // The old description no longer fits a new image.
    api.set("posterAlt", "");
  }

  async function remove() {
    setError(null);
    if (posterId !== savedId) await discardPoster(posterId, fileStore());
    api.set("posterId", "");
    api.set("posterAlt", "");
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-ink-muted">
        Tanpa poster, katalog memakai sampul otomatis dari judul. Poster dipotong ke bentuk 4:5,
        jadi pilih gambar tegak.
      </p>
      {posterId ? (
        <div className="grid gap-4">
          <PosterCover
            poster={{ fileId: posterId, alt: "" }}
            className="w-40"
            fallback={<p className="text-sm text-danger">Poster ini tidak ditemukan lagi.</p>}
          />
          <TextField
            api={api}
            name="posterAlt"
            label="Teks alternatif poster"
            hint="Jelaskan poster, termasuk tulisan di dalamnya, untuk pembaca yang tidak bisa melihatnya."
          />
          <div className="flex flex-wrap gap-2">
            <FilePickButton
              kind="image"
              label="Ganti poster"
              onPick={pick}
              disabled={busy}
              id="proyek-posterId"
            >
              {busy ? "Memproses…" : "Ganti poster"}
            </FilePickButton>
            <Button variant="text" size="sm" onClick={remove}>
              Hapus poster
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <FilePickButton
            kind="image"
            label="Tambah poster"
            onPick={pick}
            disabled={busy}
            id="proyek-posterId"
          >
            <ImageSquare size={18} aria-hidden />
            {busy ? "Memproses…" : "Tambah poster"}
          </FilePickButton>
          <p className="text-xs text-ink-muted">JPG, PNG, atau WebP, diperkecil di perangkatmu.</p>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
