import type { Locale } from "@/lib/i18n/config";
import { flowCopy } from "./copy/flow";
import { isFreeMoney } from "./project-model";
import { registrationFee } from "./registration-model";
import type { ContestStage } from "./lomba/types";
import type { Project, Registration } from "./types";

/** Why a registration cannot be cancelled right now (PRJ-06, BR-PRJ-11). */
export type CancelBlock =
  | "tidak-ada"
  | "berbayar"
  | "menunggu-pembayaran"
  | "tidak-terbit"
  | "ada-kiriman"
  | "ada-tugas"
  | "lomba-dinilai";

/** Only a confirmed registration on a free project gets a cancel button; paid ones wait for Q-30. */
export function canOfferCancel(project: Project, registration: Registration): boolean {
  return (
    registration.status === "terdaftar" &&
    isFreeMoney(registrationFee(project, registration.packageName))
  );
}

export function cancelBlock(input: {
  project: Project;
  registration: Registration | undefined;
  /** Works sent here that still count (not withdrawn). */
  sentCount: number;
  /** Class assignments handed in to this project. */
  handedIn: number;
  contestStage: ContestStage;
}): CancelBlock | null {
  const { project, registration, sentCount, handedIn, contestStage } = input;
  if (!registration) return "tidak-ada";
  if (registration.status === "menunggu-pembayaran") return "menunggu-pembayaran";
  if (!canOfferCancel(project, registration)) return "berbayar";
  if (project.publication !== "terbit") return "tidak-terbit";
  if (sentCount > 0) return "ada-kiriman";
  if (handedIn > 0) return "ada-tugas";
  if (project.block.kind === "lomba" && contestStage !== "terbuka") return "lomba-dinilai";
  return null;
}

export const cancelMessage = (block: CancelBlock, locale: Locale = "id"): string =>
  flowCopy(locale).cancel.blocks[block];
