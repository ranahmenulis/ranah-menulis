import type { JSONContent } from "@tiptap/react";
import { docStats } from "@/features/studio/editor-stats";
import { sha256Bytes, sha256Hex } from "@/lib/sha256";
import type { SubmissionVersion, VersionFile } from "./submission-types";

/** JSON with object keys sorted, so the same content always gives the same hash. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const parts = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
    return `{${parts.join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/**
 * The frozen copy of a document (STD-09, BR-STD-03). The content is copied, not referenced, so
 * nothing done to the document afterwards can reach it. Words come from `docStats`, the one place
 * the editor, the daily target and this screen all count from.
 */
export function freezeVersion(content: JSONContent, now: number, version = 1): SubmissionVersion {
  const copy = JSON.parse(JSON.stringify(content)) as JSONContent;
  return {
    version,
    content: copy,
    wordCount: docStats(copy).words,
    hash: sha256Hex(canonicalJson(copy)),
    frozenAt: now,
  };
}

/**
 * A version that is an uploaded file. The text is not read (PDF and DOCX are only kept), so the
 * word count is 0 and the hash is of the bytes: the same file always has the same hash.
 */
export function freezeFile(
  file: VersionFile,
  bytes: Uint8Array,
  now: number,
  version = 1,
): SubmissionVersion {
  return {
    version,
    content: { type: "doc", content: [] },
    wordCount: 0,
    hash: sha256Bytes(bytes),
    frozenAt: now,
    file,
  };
}
