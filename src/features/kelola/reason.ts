/** [usulan] Longest reason or feedback a reviewer can write, as for the participant's note. */
export const REASON_LIMIT = 1000;

export type ReasonProblem = "kosong" | "terlalu-panjang";

/** `required` is false where the note is optional: an empty one is then fine, a long one is not. */
export function validateReason(text: string, required = true): ReasonProblem | null {
  const trimmed = text.trim();
  if (trimmed === "") return required ? "kosong" : null;
  return trimmed.length > REASON_LIMIT ? "terlalu-panjang" : null;
}

export const reasonMessage: Record<ReasonProblem, string> = {
  kosong: "Tulis alasannya. Peserta membacanya di detail karya.",
  "terlalu-panjang": `Alasan paling banyak ${REASON_LIMIT.toLocaleString("id-ID")} karakter.`,
};
