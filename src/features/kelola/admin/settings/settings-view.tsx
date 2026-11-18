"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, describedBy } from "@/components/ui/field";
import { platformSettings } from "@/lib/platform-settings";
import { useActionStatus } from "../use-action-status";
import { clearCommunityLink, saveCommunityLink } from "./settings-actions";
import { linkMessage, validateCommunityLink } from "./settings-model";

type Ask = "simpan" | "hapus" | null;

/**
 * Admin: platform settings (PLT-05, PLT-12). Only the outside community link for now; the PRD does
 * not define other settings. Saving or removing asks first, because everyone sees the result.
 */
export function SettingsView() {
  const current = platformSettings.use()[0]?.communityLink ?? "";
  const [text, setText] = useState(current);
  const [seen, setSeen] = useState(current);
  const [error, setError] = useState<string | undefined>();
  const [ask, setAsk] = useState<Ask>(null);
  const { message, statusRef, show } = useActionStatus();
  // The field follows what is stored (another tab, a removal), but only when that value changes.
  if (seen !== current) {
    setSeen(current);
    setText(current);
  }

  function request() {
    const problem = validateCommunityLink(text);
    setError(problem ? linkMessage[problem] : undefined);
    if (!problem) setAsk("simpan");
  }

  function confirm() {
    const result = ask === "hapus" ? clearCommunityLink() : saveCommunityLink(text);
    setAsk(null);
    show(result.message, true);
  }

  const id = "tautan-komunitas";
  return (
    <section aria-labelledby="pengaturan-title" className="grid max-w-xl gap-5">
      <div className="grid gap-1">
        <h1 id="pengaturan-title" className="heading-lg">
          Pengaturan platform
        </h1>
        <p className="text-sm text-ink-muted">
          Berlaku untuk semua pengguna. Setiap perubahan dicatat.
        </p>
      </div>
      <p
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className="min-h-5 text-sm font-medium text-ink outline-none"
      >
        {message}
      </p>
      <Field
        id={id}
        label="Tautan komunitas"
        hint="Satu alamat Discord atau WhatsApp tempat percakapan diarahkan. Tanpa tautan, bagian Komunitas tidak tampil."
        error={error}
      >
        <Input
          id={id}
          type="url"
          inputMode="url"
          value={text}
          placeholder="https://"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { hint: true, error })}
          onChange={(e) => setText(e.target.value)}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={request}>Simpan</Button>
        {current !== "" && (
          <Button variant="text" onClick={() => setAsk("hapus")}>
            Hapus tautan
          </Button>
        )}
      </div>
      {ask && (
        <Dialog
          open
          onClose={() => setAsk(null)}
          title={ask === "hapus" ? "Hapus tautan komunitas?" : "Simpan tautan komunitas?"}
          description={
            ask === "hapus"
              ? "Bagian Komunitas tidak lagi tampil bagi siapa pun."
              : "Semua pengguna akan melihat tautan ini."
          }
          actions={
            <>
              <Button variant="secondary" onClick={() => setAsk(null)}>
                Batal
              </Button>
              <Button onClick={confirm}>{ask === "hapus" ? "Hapus" : "Simpan"}</Button>
            </>
          }
        >
          {ask === "simpan" && <p className="text-sm wrap-anywhere text-ink">{text.trim()}</p>}
        </Dialog>
      )}
    </section>
  );
}
