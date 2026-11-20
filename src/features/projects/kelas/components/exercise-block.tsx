"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { studioStore } from "@/features/studio/storage/store";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { copyExercise } from "../exercise-copy";
import { useExerciseCopy } from "../hooks/use-exercise-copy";
import type { ClassMaterial } from "../types";

/**
 * The writing exercise of a material (KLS-06): the text, and a button that copies it into Studio as
 * a new document, then opens it. The copy is not an assignment. Pressing again opens the same
 * copy instead of making another, unless it was moved to Sampah or Archive.
 */
export function ExerciseBlock({
  slug,
  material,
  store = studioStore,
}: {
  slug: string;
  material: ClassMaterial;
  /** Replaces the device store in tests. */
  store?: Pick<DocumentStore, "get" | "duplicate">;
}) {
  const router = useRouter();
  const copied = useExerciseCopy(slug, material.id, store);
  const [state, setState] = useState<"idle" | "working" | "error">("idle");
  if (!material.exercise) return null;
  const paragraphs = material.exercise.split(/\n{2,}/);

  async function press() {
    setState("working");
    try {
      const { docId } = await copyExercise(slug, material, store);
      setState("idle");
      router.push(`/studio/${docId}`);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="grid gap-2 border-t border-line pt-3">
      <p className="text-xs font-medium text-ink-muted">Latihan menulis</p>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className="text-base wrap-anywhere">
          {paragraph}
        </p>
      ))}
      <div>
        <Button variant="secondary" size="sm" onClick={press} disabled={state === "working"}>
          {copied ? "Buka salinan di Studio" : "Salin latihan ke Studio"}
        </Button>
      </div>
      {state === "error" && (
        <p role="alert" className="text-sm text-danger">
          Latihan belum bisa disalin. Coba lagi.
        </p>
      )}
    </div>
  );
}
