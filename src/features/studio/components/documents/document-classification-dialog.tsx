"use client";

import { X } from "@phosphor-icons/react/dist/ssr";
import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, describedBy } from "@/components/ui/field";
import { ErrorBanner } from "@/components/ui/states";
import { format, useT } from "@/lib/i18n/provider";
import {
  addDocumentTag,
  MAX_DOCUMENT_TAGS,
  MAX_TAG_LENGTH,
  parseKind,
  type DocumentClassification,
} from "../../document-classification";
import type {
  ClassificationResult,
  DocumentSummary,
  StudioDocument,
} from "../../storage/document-store";

type Props = {
  doc: DocumentSummary;
  onSave: (
    expected: DocumentClassification,
    changes: DocumentClassification,
  ) => Promise<ClassificationResult>;
  onSaved: (doc: StudioDocument) => void;
  onClose: () => void;
};

export function DocumentClassificationDialog({ doc, onSave, onSaved, onClose }: Props) {
  const id = useId();
  const copy = useT().studioDocuments;
  const t = copy.classification;
  const kinds = copy.kinds;
  const tagInput = useRef<HTMLInputElement>(null);
  const [expected, setExpected] = useState<DocumentClassification>(doc);
  const [kind, setKind] = useState(doc.kind);
  const [tags, setTags] = useState(doc.tags ?? []);
  const [draftTag, setDraftTag] = useState("");
  const [tagError, setTagError] = useState("");
  const [error, setError] = useState("");
  const [latest, setLatest] = useState<StudioDocument | null>(null);
  const [saving, setSaving] = useState(false);
  const tagId = `${id}-tag`;
  const hint = format(t.hint, { tags: String(MAX_DOCUMENT_TAGS), length: String(MAX_TAG_LENGTH) });
  const tagErrorText = (code: "empty" | "tooLong" | "duplicate" | "limit") =>
    format(t.errors[code], {
      limit: String(code === "limit" ? MAX_DOCUMENT_TAGS : MAX_TAG_LENGTH),
    });

  function readDraftTag() {
    const result = addDocumentTag(tags, draftTag);
    if (!result.ok) {
      setTagError(tagErrorText(result.code));
      tagInput.current?.focus();
      return null;
    }
    return result.tags;
  }

  function addTag() {
    const next = readDraftTag();
    if (!next) return;
    setTags(next);
    setDraftTag("");
    setTagError("");
    tagInput.current?.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || latest) return;
    const next = draftTag.trim() ? readDraftTag() : tags;
    if (!next) return;
    setTagError("");
    setError("");
    setSaving(true);
    try {
      const result = await onSave(expected, { kind, tags: next });
      switch (result.status) {
        case "saved":
          onSaved(result.doc);
          break;
        case "conflict":
          setLatest(result.doc);
          break;
        case "unavailable":
          setError(t.unavailable);
          break;
        case "invalid":
          setError(t.invalid);
          break;
      }
    } catch {
      setError(t.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  function loadLatest(current: StudioDocument) {
    setExpected(current);
    setKind(current.kind);
    setTags(current.tags ?? []);
    setDraftTag("");
    setTagError("");
    setLatest(null);
    tagInput.current?.focus();
  }

  return (
    <Dialog
      open
      title={t.title}
      onClose={onClose}
      dismissible={!saving}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {copy.dialogs.cancel}
          </Button>
          <Button type="submit" form={`${id}-form`} disabled={saving || latest !== null}>
            {saving ? t.saving : t.save}
          </Button>
        </>
      }
    >
      <form id={`${id}-form`} onSubmit={submit} className="grid gap-4">
        {error && <ErrorBanner>{error}</ErrorBanner>}
        {latest && (
          <div className="grid justify-items-start gap-2">
            <ErrorBanner>{t.conflict}</ErrorBanner>
            <Button variant="secondary" size="sm" onClick={() => loadLatest(latest)}>
              {t.loadLatest}
            </Button>
          </div>
        )}
        <Field id={`${id}-kind`} label={t.kindLabel} optional>
          <Select
            id={`${id}-kind`}
            value={kind ?? ""}
            autoFocus
            disabled={saving}
            onChange={(event) => setKind(parseKind(event.target.value) ?? undefined)}
          >
            <option value="">{t.noKind}</option>
            {Object.entries(kinds).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id={tagId}
          label={t.newTag}
          optional
          hint={hint}
          error={tagError && <span role="alert">{tagError}</span>}
        >
          <div className="flex gap-2">
            <Input
              id={tagId}
              ref={tagInput}
              value={draftTag}
              disabled={saving}
              aria-describedby={describedBy(tagId, { hint, error: tagError })}
              aria-invalid={Boolean(tagError)}
              onChange={(event) => {
                setDraftTag(event.target.value);
                setTagError("");
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
                event.preventDefault();
                addTag();
              }}
            />
            <Button variant="secondary" disabled={saving} onClick={addTag}>
              {t.add}
            </Button>
          </div>
        </Field>
        {tags.length > 0 && (
          <ul aria-label={t.tagsLabel} className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag} className="max-w-full min-w-0">
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label={format(t.removeTag, { tag })}
                  className="h-auto! min-h-8 max-w-full py-1 text-start leading-tight [overflow-wrap:anywhere] whitespace-normal!"
                  disabled={saving}
                  onClick={() => {
                    setTags((current) => current.filter((item) => item !== tag));
                    setTagError("");
                    tagInput.current?.focus();
                  }}
                >
                  {tag}
                  <X size={14} className="shrink-0" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </form>
    </Dialog>
  );
}
