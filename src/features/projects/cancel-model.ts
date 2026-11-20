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

const MESSAGES: Record<CancelBlock, string> = {
  "tidak-ada": "Pendaftaranmu sudah tidak ada.",
  berbayar: "Pendaftaran proyek berbayar belum bisa dibatalkan.",
  "menunggu-pembayaran": "Pendaftaran yang menunggu pembayaran belum bisa dibatalkan.",
  "tidak-terbit": "Proyek ini sedang tidak terbit, jadi pendaftarannya tidak bisa diubah.",
  "ada-kiriman":
    "Kamu masih punya karya terkirim di proyek ini. Tarik karyamu dulu di halaman kiriman, lalu batalkan pendaftaran.",
  "ada-tugas":
    "Kamu sudah mengumpulkan tugas di kelas ini, jadi pendaftaran tidak bisa dibatalkan.",
  "lomba-dinilai": "Lomba ini sudah masuk penilaian, jadi pendaftaran tidak bisa dibatalkan.",
};

export const cancelMessage = (block: CancelBlock): string => MESSAGES[block];
