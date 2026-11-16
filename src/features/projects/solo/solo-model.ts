import type { Submission } from "../submission-types";
import { projectHref } from "../project-model";
import type { Project, Registration } from "../types";
import { packageStages } from "./stage-model";
import type { SoloStage } from "./types";

export const soloDashboardHref = (slug: string) => `${projectHref(slug)}/dasbor`;

/** Why the Solo dashboard cannot open for this reader; `null` means it can. */
export type SoloBlock = "bukan-solo" | "tamu" | "belum-terdaftar" | "menunggu-pembayaran";

/** The reasons a Solo project can show; "bukan-solo" is a not-found page instead. */
export type ShownBlock = Exclude<SoloBlock, "bukan-solo">;

export function soloBlock(input: {
  project: Project;
  guest: boolean;
  registration?: Registration;
}): SoloBlock | null {
  const { project, guest, registration } = input;
  if (project.block.kind !== "solo") return "bukan-solo";
  if (guest) return "tamu";
  if (!registration) return "belum-terdaftar";
  if (registration.status !== "terdaftar") return "menunggu-pembayaran";
  return null;
}

/**
 * Where the submission stands, as far as the dashboard cares: not sent yet, being looked at (still
 * could ask for a revision), turned down, or accepted so the stages run.
 */
export type SoloPhase = "belum-mengajukan" | "diajukan" | "ditolak" | "diterima";

export function soloPhase(work: Submission | undefined): SoloPhase {
  if (!work) return "belum-mengajukan";
  if (work.status === "diterima") return "diterima";
  if (work.status === "ditolak") return "ditolak";
  return "diajukan";
}

/** When the editor accepted the submission, from its own log. */
export const acceptedAt = (work: Submission) =>
  work.statusLog.findLast((c) => c.status === "diterima")?.at ?? null;

/**
 * The stages of the package this reader chose. A package that cannot be found leaves only the
 * submission and the end, so the screen never invents work that was not bought.
 */
export function stagesFor(project: Project, packageName: string | undefined): SoloStage[] {
  if (project.block.kind !== "solo") return packageStages([]);
  const pack = project.block.packages.find((p) => p.name === packageName);
  return packageStages(pack?.includes ?? []);
}
