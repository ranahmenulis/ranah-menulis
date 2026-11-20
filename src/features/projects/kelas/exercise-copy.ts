import type { JSONContent } from "@tiptap/react";
import { isActiveDocument } from "@/features/studio/document-archive";
import { docStats } from "@/features/studio/editor-stats";
import type { DocumentStore, StudioDocument } from "@/features/studio/storage/document-store";
import { textToDoc } from "./assignment-model";
import { classCopies, copyKey } from "./copy-store";
import type { ClassMaterial } from "./types";

export const exerciseTitle = (material: Pick<ClassMaterial, "title">) =>
  `Latihan: ${material.title}`;

/** The exercise text, then an empty paragraph where the participant starts writing. */
export function exerciseContent(exercise: string): JSONContent {
  return { type: "doc", content: [...(textToDoc(exercise).content ?? []), { type: "paragraph" }] };
}

/**
 * Copies a class exercise into Studio as a new document, or returns the copy made before when it is
 * still in the writing list. Read again on every press, so a copy moved to Sampah or Archive is
 * copied afresh instead of opening a document that cannot be used.
 *
 * The document is written with `duplicate`, not `save`: a save would count the exercise's own words
 * as words written today (streak and statistics). Its word count is stored as it is, so only what
 * the participant adds afterwards counts. It is not an assignment and nothing links it to one.
 */
export async function copyExercise(
  slug: string,
  material: Pick<ClassMaterial, "id" | "title" | "exercise">,
  store: Pick<DocumentStore, "get" | "duplicate">,
  now = Date.now(),
): Promise<{ docId: string; created: boolean }> {
  const key = copyKey(slug, material.id);
  const existing = classCopies.read().find((c) => c.key === key);
  if (existing) {
    const doc = await store.get(existing.docId);
    if (doc && isActiveDocument(doc)) return { docId: existing.docId, created: false };
  }
  if (!material.exercise) throw new Error(`Material ${material.id} has no exercise`);

  const content = exerciseContent(material.exercise);
  const title = exerciseTitle(material);
  const draft: StudioDocument = {
    id: "",
    title,
    content,
    wordCount: docStats(content).words,
    version: 1,
    updatedAt: now,
  };
  const copy = await store.duplicate(draft, title);
  classCopies.write([
    ...classCopies.read().filter((c) => c.key !== key),
    { key, docId: copy.id, createdAt: now },
  ]);
  return { docId: copy.id, created: true };
}
