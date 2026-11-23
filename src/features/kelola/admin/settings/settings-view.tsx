"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, describedBy } from "@/components/ui/field";
import { adminMessage } from "../copy/admin-copy";
import { useLocale, useT } from "@/lib/i18n/provider";
import { platformSettings } from "@/lib/platform-settings";
import { useActionStatus } from "../use-action-status";
import { clearCommunityLink, saveCommunityLink } from "./settings-actions";
import { linkProblemText, validateCommunityLink } from "./settings-model";

type Ask = "simpan" | "hapus" | null;

/**
 * Admin: platform settings (PLT-05, PLT-12). Only the outside community link for now; the PRD does
 * not define other settings. Saving or removing asks first, because everyone sees the result.
 */
export function SettingsView() {
  const t = useT().kelolaAdmin.settings;
  const locale = useLocale();
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
    setError(problem ? linkProblemText(problem, locale) : undefined);
    if (!problem) setAsk("simpan");
  }

  function confirm() {
    const result = ask === "hapus" ? clearCommunityLink() : saveCommunityLink(text);
    setAsk(null);
    show(adminMessage(result, locale), true);
  }

  const id = "tautan-komunitas";
  return (
    <section aria-labelledby="pengaturan-title" className="grid max-w-xl gap-5">
      <div className="grid gap-1">
        <h1 id="pengaturan-title" className="heading-lg">
          {t.title}
        </h1>
        <p className="text-sm text-ink-muted">{t.intro}</p>
      </div>
      <p
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className="min-h-5 text-sm font-medium text-ink outline-none"
      >
        {message}
      </p>
      <Field id={id} label={t.linkLabel} hint={t.linkHint} error={error}>
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
        <Button onClick={request}>{t.save}</Button>
        {current !== "" && (
          <Button variant="text" onClick={() => setAsk("hapus")}>
            {t.remove}
          </Button>
        )}
      </div>
      {ask && (
        <Dialog
          open
          onClose={() => setAsk(null)}
          title={ask === "hapus" ? t.removeTitle : t.saveTitle}
          description={ask === "hapus" ? t.removeBody : t.saveBody}
          actions={
            <>
              <Button variant="secondary" onClick={() => setAsk(null)}>
                {t.cancel}
              </Button>
              <Button onClick={confirm}>{ask === "hapus" ? t.removeConfirm : t.saveConfirm}</Button>
            </>
          }
        >
          {ask === "simpan" && <p className="text-sm wrap-anywhere text-ink">{text.trim()}</p>}
        </Dialog>
      )}
    </section>
  );
}
