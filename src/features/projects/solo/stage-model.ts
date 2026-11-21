import type { PreviewFile, SoloChange, SoloProgress, SoloStage } from "./types";

/** [usulan, Q-24] How many times the author may ask for changes at the final approval. */
export const MAX_CHANGE_ROUNDS = 2;

export const STAGE_LABEL: Record<SoloStage, string> = {
  pengajuan: "Pengajuan",
  penyuntingan: "Penyuntingan",
  proofreading: "Proofreading",
  cover: "Desain cover",
  layout: "Layout isi buku",
  "persetujuan-final": "Persetujuan final",
  produksi: "Produksi",
  selesai: "Selesai",
};

/** One line of what a stage means for the author. */
export const STAGE_HINT: Record<SoloStage, string> = {
  pengajuan: "Tim penerbitan meninjau kelayakan naskahmu.",
  penyuntingan: "Naskahmu disunting.",
  proofreading: "Naskahmu diperiksa ejaan dan tanda bacanya.",
  cover: "Sampul bukumu dirancang.",
  layout: "Isi bukumu ditata menjadi halaman.",
  "persetujuan-final": "Periksa pratinjau, lalu setujui atau minta perubahan.",
  produksi: "Bukumu dicetak dan disiapkan.",
  selesai: "Penerbitan bukumu selesai.",
};

/** What an `includes` line of a package turns into. Anything unknown adds no stage. */
const INCLUDES: Record<string, SoloStage[]> = {
  "Penyuntingan naskah": ["penyuntingan"],
  Proofreading: ["proofreading"],
  "Desain cover": ["cover"],
  "Layout isi buku": ["layout"],
  "Persetujuan final dan produksi buku": ["persetujuan-final", "produksi"],
};

const ORDER: SoloStage[] = [
  "pengajuan",
  "penyuntingan",
  "proofreading",
  "cover",
  "layout",
  "persetujuan-final",
  "produksi",
  "selesai",
];

/**
 * The stages one package goes through, in order. Submission and Selesai are always there; the rest
 * come from what the package includes, so nobody sees a stage they did not pay for.
 */
export function packageStages(includes: string[]): SoloStage[] {
  const wanted = new Set<SoloStage>(["pengajuan", "selesai"]);
  for (const line of includes) INCLUDES[line]?.forEach((s) => wanted.add(s));
  return ORDER.filter((s) => wanted.has(s));
}

export const hasFinalApproval = (stages: SoloStage[]) => stages.includes("persetujuan-final");

/** The stage running once the submission is accepted: the first one after the submission. */
const firstStage = (stages: SoloStage[]): SoloStage => stages[1] ?? "selesai";

export function currentStage(stages: SoloStage[], progress: SoloProgress | null): SoloStage {
  return progress?.log.at(-1)?.stage ?? firstStage(stages);
}

export const changeRounds = (progress: SoloProgress | null) =>
  progress?.log.filter((c) => c.kind === "minta-perubahan").length ?? 0;

const entry = (kind: SoloChange["kind"], stage: SoloStage, by: SoloChange["by"], at: number) => ({
  kind,
  stage,
  by,
  at,
});

const empty = (id: string, slug: string): SoloProgress => ({ id, slug, log: [], files: [] });

type Base = { id: string; slug: string };
const base = (progress: SoloProgress | null, b: Base) => progress ?? empty(b.id, b.slug);

/**
 * The publishing team moves the book one stage on. Never backwards, and never out of the final
 * approval: that step is the author's. `null` = refused.
 */
export function withAdvance(
  stages: SoloStage[],
  progress: SoloProgress | null,
  b: Base,
  now: number,
): SoloProgress | null {
  const current = currentStage(stages, progress);
  if (current === "persetujuan-final" || current === "selesai") return null;
  const next = stages[stages.indexOf(current) + 1];
  if (!next) return null;
  const row = base(progress, b);
  return { ...row, log: [...row.log, entry("lanjut", next, "organizer", now)] };
}

/** Why the author cannot decide on the final approval now; `null` means they can. */
export type ApprovalBlock = "bukan-persetujuan" | "tanpa-pratinjau" | "putaran-habis";

/** Preview files the package promises: a cover and a layout, when it includes them. */
export const neededPreviews = (stages: SoloStage[]): PreviewFile["kind"][] =>
  (["cover", "layout"] as const).filter((k) => stages.includes(k));

/** The author must have something to look at before deciding: every promised kind has a file. */
export const hasPreviews = (stages: SoloStage[], progress: SoloProgress | null) =>
  neededPreviews(stages).every((k) => progress?.files.some((f) => f.kind === k));

export function approvalBlock(
  stages: SoloStage[],
  progress: SoloProgress | null,
  forChange = false,
): ApprovalBlock | null {
  if (currentStage(stages, progress) !== "persetujuan-final") return "bukan-persetujuan";
  if (!hasPreviews(stages, progress)) return "tanpa-pratinjau";
  if (forChange && changeRounds(progress) >= MAX_CHANGE_ROUNDS) return "putaran-habis";
  return null;
}

/** The author approves. Production starts, and there is no way back (Q-24). */
export function withApproval(
  stages: SoloStage[],
  progress: SoloProgress | null,
  b: Base,
  now: number,
): SoloProgress | null {
  if (approvalBlock(stages, progress) !== null) return null;
  const row = base(progress, b);
  return { ...row, log: [...row.log, entry("setuju", "produksi", "penulis", now)] };
}

/** Where a change request sends the book: the layout, or the cover when the package has no layout. */
export function changeTarget(stages: SoloStage[]): SoloStage | null {
  return stages.includes("layout") ? "layout" : stages.includes("cover") ? "cover" : null;
}

/** The author asks for changes. A note is required, and the rounds are limited. */
export function withChangeRequest(
  stages: SoloStage[],
  progress: SoloProgress | null,
  b: Base,
  now: number,
  note: string,
): SoloProgress | null {
  const target = changeTarget(stages);
  const text = note.trim();
  if (!target || !text || approvalBlock(stages, progress, true) !== null) return null;
  const row = base(progress, b);
  const change = { ...entry("minta-perubahan", target, "penulis", now), note: text };
  return { ...row, log: [...row.log, change] };
}

/** The team adds a preview file. The version counts up per kind. */
export function withFile(
  progress: SoloProgress | null,
  b: Base,
  kind: PreviewFile["kind"],
  now: number,
  /** The file the team attached; without it the row is only a description. */
  upload?: { id: string; name: string; type: string; size: number },
): SoloProgress {
  const row = base(progress, b);
  const version = row.files.filter((f) => f.kind === kind).length + 1;
  const name = kind === "cover" ? "Sampul buku" : "Isi buku";
  const file: PreviewFile = {
    id: `${kind}-${version}-${now}`,
    kind,
    name,
    version,
    at: now,
    sizeKb: upload ? Math.max(1, Math.round(upload.size / 1024)) : kind === "cover" ? 840 : 2_300,
    ...(upload ? { fileId: upload.id, fileName: upload.name, fileType: upload.type } : {}),
  };
  return { ...row, files: [...row.files, file] };
}

export type StageRow = {
  stage: SoloStage;
  state: "selesai" | "berjalan" | "menunggu";
  /** When the stage was last entered; `null` if it has not started. */
  at: number | null;
};

/**
 * The timeline: stages before the current one are done, the current one runs, the rest wait. When
 * the book is finished every stage is done. `acceptedAt` is when the submission was accepted.
 */
export function timeline(
  stages: SoloStage[],
  progress: SoloProgress | null,
  submitted: { accepted: boolean; submittedAt: number; acceptedAt: number | null },
): StageRow[] {
  const current = submitted.accepted ? currentStage(stages, progress) : "pengajuan";
  const at = stages.indexOf(current);
  return stages.map((stage, i) => {
    const entered = progress?.log.findLast((c) => c.stage === stage)?.at ?? null;
    const startedAt =
      stage === "pengajuan"
        ? submitted.submittedAt
        : (entered ?? (i === 1 ? submitted.acceptedAt : null));
    const finished = i < at || current === "selesai";
    return {
      stage,
      state: finished ? "selesai" : i === at ? "berjalan" : "menunggu",
      at: i <= at ? startedAt : null,
    };
  });
}

/** Where the running stage sits in the package: "Tahap 3 dari 6", counting the submission. */
export function stagePosition(
  stages: SoloStage[],
  progress: SoloProgress | null,
): { index: number; total: number; stage: SoloStage } {
  const stage = currentStage(stages, progress);
  const at = stages.indexOf(stage);
  return { index: at < 0 ? stages.length : at + 1, total: stages.length, stage };
}
