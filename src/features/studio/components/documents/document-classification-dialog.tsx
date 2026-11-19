"use client";

import { X } from "@phosphor-icons/react/dist/ssr";
import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, describedBy } from "@/components/ui/field";
import { ErrorBanner } from "@/components/ui/states";
import {
  addDocumentTag,
  DOCUMENT_KINDS,
  MAX_DOCUMENT_TAGS,
  MAX_TAG_LENGTH,
  parseKind,
  type DocumentClassification,
} from "../../document-classification";
import type { ClassificationResult, StudioDocument } from "../../storage/document-store";

type Props = {
  doc: StudioDocument;
  onSave: (
    expected: DocumentClassification,
    changes: DocumentClassification,
  ) => Promise<ClassificationResult>;
  onSaved: (doc: StudioDocument) => void;
  onClose: () => void;
};

export function DocumentClassificationDialog({ doc, onSave, onSaved, onClose }: Props) {
  const id = useId();
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
  const hint = `Batas sementara ${MAX_DOCUMENT_TAGS} tag, masing-masing ${MAX_TAG_LENGTH} karakter.`;

  function readDraftTag() {
    const result = addDocumentTag(tags, draftTag);
    if (!result.ok) {
      setTagError(result.error);
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
          setError("Dokumen ini sudah tidak tersedia di daftar aktif.");
          break;
        case "invalid":
          setError("Periksa kembali jenis dan tag dokumen.");
          break;
      }
    } catch {
      setError("Jenis dan tag gagal disimpan. Coba lagi.");
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
      title="Jenis dan tag"
      onClose={onClose}
      dismissible={!saving}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form={`${id}-form`} disabled={saving || latest !== null}>
            {saving ? "Menyimpan…" : "Simpan"}
          </Button>
        </>
      }
    >
      <form id={`${id}-form`} onSubmit={submit} className="grid gap-4">
        {error && <ErrorBanner>{error}</ErrorBanner>}
        {latest && (
          <div className="grid justify-items-start gap-2">
            <ErrorBanner>
              Jenis atau tag berubah di tab lain. Memuat data terbaru akan mengganti isian ini.
            </ErrorBanner>
            <Button variant="secondary" size="sm" onClick={() => loadLatest(latest)}>
              Muat data terbaru
            </Button>
          </div>
        )}
        <Field id={`${id}-kind`} label="Jenis dokumen" optional>
          <Select
            id={`${id}-kind`}
            value={kind ?? ""}
            autoFocus
            disabled={saving}
            onChange={(event) => setKind(parseKind(event.target.value) ?? undefined)}
          >
            <option value="">Tanpa jenis</option>
            {Object.entries(DOCUMENT_KINDS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id={tagId}
          label="Tag baru"
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
              Tambah
            </Button>
          </div>
        </Field>
        {tags.length > 0 && (
          <ul aria-label="Tag dokumen" className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag} className="max-w-full min-w-0">
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label={`Lepas tag ${tag}`}
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
