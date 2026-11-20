"use client";

import { ImageSquare } from "@phosphor-icons/react/dist/ssr";
import type { Dispatch } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { FilePickButton } from "@/components/ui/file-pick-button";
import type { ComposeAction } from "../../compose-state";
import { usePostImage } from "../../hooks/use-post-image";
import type { PostImage } from "../../types";

type Props = { image: PostImage | null; dispatch: Dispatch<ComposeAction> };

/**
 * One optional photo for the post. It is resized and turned into WebP on this device, and the
 * camera's location data is dropped. The alt text is required: without it the post cannot be
 * published (a reader who cannot see the photo still gets a description).
 */
export function CoverImageField({ image, dispatch }: Props) {
  const upload = usePostImage((next) => dispatch({ type: "image", image: next }));
  const altMissing = image !== null && image.alt.trim() === "";
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1 text-sm font-medium">
        Gambar <span className="font-normal text-ink-muted">(opsional)</span>
      </legend>
      {image ? (
        <div className="grid gap-3">
          {/* A data URL made on this device; nothing to optimise. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt=""
            width={image.width}
            height={image.height}
            className="block aspect-3/2 w-full max-w-xs bg-subtle object-cover"
          />
          <Field
            id="post-image-alt"
            label="Teks alternatif"
            hint="Jelaskan gambar ini untuk pembaca yang tidak bisa melihatnya."
            error={altMissing ? "Isi teks alternatif gambar untuk menerbitkan." : undefined}
          >
            <Input
              id="post-image-alt"
              type="text"
              maxLength={200}
              value={image.alt}
              aria-invalid={altMissing || undefined}
              onChange={(e) =>
                dispatch({ type: "image", image: { ...image, alt: e.target.value } })
              }
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <FilePickButton kind="image" label="Ganti gambar" onPick={upload.pick}>
              Ganti gambar
            </FilePickButton>
            <Button
              variant="text"
              size="sm"
              onClick={() => {
                upload.clearError();
                dispatch({ type: "image", image: null });
              }}
            >
              Hapus gambar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <FilePickButton
            kind="image"
            label="Tambah gambar"
            onPick={upload.pick}
            disabled={upload.busy}
          >
            <ImageSquare size={18} aria-hidden />
            {upload.busy ? "Memproses…" : "Tambah gambar"}
          </FilePickButton>
          <p className="text-xs text-ink-muted">
            JPG, PNG, atau WebP. Diperkecil dan diubah ke WebP di perangkatmu.
          </p>
        </div>
      )}
      {upload.error && (
        <p role="alert" className="text-sm text-danger">
          {upload.error}
        </p>
      )}
      {image && (
        <p className="text-xs text-ink-muted">
          Gambar ini ikut menjadi publik bersama teks. Hanya satu gambar per postingan.
        </p>
      )}
    </fieldset>
  );
}
