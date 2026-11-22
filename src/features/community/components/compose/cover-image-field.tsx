"use client";

import { ImageSquare } from "@phosphor-icons/react/dist/ssr";
import type { Dispatch } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { FilePickButton } from "@/components/ui/file-pick-button";
import { useT } from "@/lib/i18n/provider";
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
  const t = useT().compose.cover;
  const upload = usePostImage((next) => dispatch({ type: "image", image: next }));
  const altMissing = image !== null && image.alt.trim() === "";
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1 text-sm font-medium">
        {t.legend} <span className="font-normal text-ink-muted">{t.optional}</span>
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
            label={t.altLabel}
            hint={t.altHint}
            error={altMissing ? t.altError : undefined}
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
            <FilePickButton kind="image" label={t.change} onPick={upload.pick}>
              {t.change}
            </FilePickButton>
            <Button
              variant="text"
              size="sm"
              onClick={() => {
                upload.clearError();
                dispatch({ type: "image", image: null });
              }}
            >
              {t.remove}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <FilePickButton kind="image" label={t.add} onPick={upload.pick} disabled={upload.busy}>
            <ImageSquare size={18} aria-hidden />
            {upload.busy ? t.processing : t.add}
          </FilePickButton>
          <p className="text-xs text-ink-muted">{t.formats}</p>
        </div>
      )}
      {upload.error && (
        <p role="alert" className="text-sm text-danger">
          {upload.error}
        </p>
      )}
      {image && <p className="text-xs text-ink-muted">{t.publicNote}</p>}
    </fieldset>
  );
}
