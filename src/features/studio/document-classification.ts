export const DOCUMENT_KINDS = {
  cerpen: "Cerpen",
  puisi: "Puisi",
  esai: "Esai",
  novel: "Novel",
  naskah: "Naskah",
  lainnya: "Lainnya",
} as const;

export type DocumentKind = keyof typeof DOCUMENT_KINDS;

/** Label of a stored kind in the interface language (`labels` = the `kinds` dictionary slice). */
export function kindLabel(
  kind: DocumentKind,
  labels: Record<DocumentKind, string> = DOCUMENT_KINDS,
): string {
  return labels[kind];
}
export type DocumentClassification = { kind?: DocumentKind; tags?: string[] };
export type DocumentFilters = { kind: DocumentKind | null; tag: string | null };

// Proposed limits for the local slicing stage (STD-16).
export const MAX_DOCUMENT_TAGS = 5;
export const MAX_TAG_LENGTH = 24;

export function parseKind(raw: string | null): DocumentKind | null {
  return raw && Object.hasOwn(DOCUMENT_KINDS, raw) ? (raw as DocumentKind) : null;
}

function normalizeTag(raw: string): string {
  return raw.trim().normalize("NFC");
}

export function tagKey(tag: string): string {
  return normalizeTag(tag).toLocaleLowerCase("id").normalize("NFC");
}

export function parseTag(raw: string | null): string | null {
  const tag = normalizeTag(raw ?? "");
  return tag && Array.from(tag).length <= MAX_TAG_LENGTH ? tagKey(tag) : null;
}

/** Why a tag was refused; screens translate by code, `error` is the Indonesian default. */
export type TagErrorCode = "empty" | "tooLong" | "duplicate" | "limit";

export function addDocumentTag(
  tags: string[],
  raw: string,
): { ok: true; tags: string[] } | { ok: false; error: string; code: TagErrorCode } {
  const tag = normalizeTag(raw);
  if (!tag) return { ok: false, code: "empty", error: "Isi nama tag." };
  if (Array.from(tag).length > MAX_TAG_LENGTH)
    return {
      ok: false,
      code: "tooLong",
      error: `Gunakan paling banyak ${MAX_TAG_LENGTH} karakter per tag.`,
    };
  const key = tagKey(tag);
  if (tags.some((item) => tagKey(item) === key))
    return { ok: false, code: "duplicate", error: "Tag ini sudah ada di dokumen." };
  if (tags.length >= MAX_DOCUMENT_TAGS)
    return {
      ok: false,
      code: "limit",
      error: `Gunakan paling banyak ${MAX_DOCUMENT_TAGS} tag per dokumen.`,
    };
  return { ok: true, tags: [...tags, tag] };
}

export function validateClassification({ kind, tags }: DocumentClassification) {
  if (kind !== undefined && !parseKind(kind)) return null;
  let normalized: string[] = [];
  for (const tag of tags ?? []) {
    const result = addDocumentTag(normalized, tag);
    if (!result.ok) return null;
    normalized = result.tags;
  }
  return { kind, tags: normalized };
}

export function sameClassification(a: DocumentClassification, b: DocumentClassification) {
  const tags = a.tags ?? [];
  const other = b.tags ?? [];
  return (
    a.kind === b.kind && tags.length === other.length && tags.every((tag, i) => tag === other[i])
  );
}

export function hasDocumentFilters({ kind, tag }: DocumentFilters) {
  return Boolean(kind || tag);
}

export function matchesDocumentFilters(
  doc: DocumentClassification,
  { kind, tag }: DocumentFilters,
) {
  return (
    (!kind || doc.kind === kind) && (!tag || (doc.tags ?? []).some((item) => tagKey(item) === tag))
  );
}
