"use client";

import { Camera } from "@phosphor-icons/react/dist/ssr";
import { useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import type { ProfileForm } from "../hooks/use-profile-form";
import { PHOTO_TYPES } from "../validation";

/**
 * The profile photo: the avatar, a button that opens the file picker, and one line that is the
 * hint until a chosen file is refused, then the reason. The real input is hidden; the button is
 * the control (it stays reachable by keyboard).
 */
export function PhotoPicker({ form }: { form: ProfileForm }) {
  const t = useT().account;
  const picker = useRef<HTMLInputElement>(null);
  const { values, photoError } = form;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Avatar name={values.name || t.photo.label} src={values.avatar} size={88} />
      <div className="grid min-w-0 justify-items-start gap-2">
        <input
          ref={picker}
          type="file"
          accept={PHOTO_TYPES.join(",")}
          aria-label={t.photo.label}
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void form.choosePhoto(file);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => picker.current?.click()}>
            <Camera size={18} aria-hidden />
            {values.avatar ? t.photo.change : t.photo.add}
          </Button>
          {values.avatar && (
            <Button variant="text" size="sm" onClick={form.removePhoto}>
              {t.photo.remove}
            </Button>
          )}
        </div>
        <p
          role={photoError ? "alert" : undefined}
          className={photoError ? "text-sm text-danger" : "text-xs text-ink-muted"}
        >
          {photoError ? t.errors[photoError] : t.photo.hint}
        </p>
      </div>
    </div>
  );
}
