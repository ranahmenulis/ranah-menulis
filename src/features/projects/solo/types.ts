/**
 * The stages of a Solo book (SOL-02, PRD 10.6). The set of stages is a sample [usulan, Q-24 is
 * unanswered: how far production runs inside the platform]. Stage changes are entered by hand by
 * the publishing team, which is a development-only panel until the Organizer panel exists (6g).
 */
export type SoloStage =
  | "pengajuan"
  | "penyuntingan"
  | "proofreading"
  | "cover"
  | "layout"
  | "persetujuan-final"
  | "produksi"
  | "selesai";

/** A preview file of the cover or the layout. Only a description: no real file exists yet. */
export type PreviewFile = {
  id: string;
  kind: "cover" | "layout";
  name: string;
  version: number;
  at: number;
  /** A sample size in KB, shown as text. */
  sizeKb: number;
};

/**
 * One step in the history. `stage` is the stage the book was in after the step: "lanjut" moves on,
 * "minta-perubahan" sends it back, "setuju" starts production.
 */
export type SoloChange = {
  kind: "lanjut" | "minta-perubahan" | "setuju";
  stage: SoloStage;
  at: number;
  by: "organizer" | "penulis";
  /** The author's note on a change request. */
  note?: string;
};

/** What happened to one accepted Solo submission. No row yet means the first stage is running. */
export type SoloProgress = {
  /** Same id as the submission. */
  id: string;
  slug: string;
  log: SoloChange[];
  files: PreviewFile[];
};
