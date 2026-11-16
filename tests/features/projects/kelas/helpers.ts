import { classFixtures } from "@/features/projects/kelas/fixtures/all";
import { resolveClass } from "@/features/projects/kelas/class-model";
import type { AssignmentSubmission, ClassContent } from "@/features/projects/kelas/types";
import { NOW, project, textOf } from "../helpers";

export const CERPEN = "kelas-cerpen-untuk-pemula";
export const PUISI = "kelas-menulis-puisi-dasar";
export const DAY = 86_400_000;

/** The class of a fixture project, resolved against `now` (a running class for cerpen, not yet for puisi). */
export function classOf(slug: string, now = NOW): ClassContent {
  const fixture = classFixtures.find((c) => c.slug === slug);
  const content = fixture ? resolveClass(fixture, project(slug, now)) : null;
  if (!content) throw new Error(`no class ${slug}`);
  return content;
}

export function handedIn(over: Partial<AssignmentSubmission> = {}): AssignmentSubmission {
  return {
    id: "a1",
    slug: CERPEN,
    assignmentId: "tugas-1",
    source: "studio",
    docId: "d1",
    docTitle: "Kerangka",
    status: "dikumpulkan",
    late: false,
    submittedAt: NOW,
    versions: [{ version: 1, content: textOf(5), wordCount: 5, hash: "h1", frozenAt: NOW }],
    statusLog: [{ status: "dikumpulkan", at: NOW, by: "peserta" }],
    ...over,
  };
}
