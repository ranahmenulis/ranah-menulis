import { createLocalListStore } from "@/lib/local-list-store";

/**
 * Which Studio document holds a copy of a class exercise (KLS-06). Only the link is kept: the copy
 * is an ordinary document, and nothing here ties it to an assignment.
 */
export type ExerciseCopy = {
  /** `<class slug>:<material id>` */
  key: string;
  docId: string;
  createdAt: number;
};

export const copyKey = (slug: string, materialId: string) => `${slug}:${materialId}`;

function isExerciseCopy(value: unknown): value is ExerciseCopy {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.key === "string" && typeof v.docId === "string" && typeof v.createdAt === "number"
  );
}

export const classCopies = createLocalListStore<ExerciseCopy>("ranah.classCopies", isExerciseCopy);
