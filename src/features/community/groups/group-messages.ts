import { RESTORE_ARCHIVED_MESSAGE } from "@/features/studio/document-archive";
import { REASON_LIMIT } from "@/features/kelola/reason";
import { GROUP_DESCRIPTION_LIMIT, GROUP_NAME_LIMIT } from "./group-model";

/**
 * Results of group actions carry a code. `message` is the Indonesian default (kept so nothing that
 * reads it breaks); screens translate by `code` with `groupMessage`.
 */
export const GROUP_MESSAGES = {
  blocked: "Kamu tidak punya akses untuk melakukan tindakan ini.",
  unavailable: "Lingkar ini tidak tersedia.",
  nameRequired: "Isi nama lingkar.",
  nameTooLong: "Nama lingkar maksimal {limit} karakter.",
  descriptionTooLong: "Deskripsi maksimal {limit} karakter.",
  visibilityRequired: "Pilih visibilitas lingkar.",
  startRequired: "Isi tanggal mulai tantangan.",
  startInvalid: "Tanggal mulai tidak valid.",
  startInPast: "Tanggal mulai tidak boleh sebelum hari ini.",
  groupChanged:
    "Pengaturan lingkar sudah berubah. Buka ulang formulir untuk melihat perubahan terbaru.",
  saved: "Perubahan lingkar disimpan.",
  created: "Lingkar dibuat.",
  invalidCode: "Kode undangan tidak berlaku. Minta kode terbaru dari Admin Lingkar.",
  inviteUnavailable: "Undangan atau lingkar tidak tersedia.",
  alreadyMember: "Kamu sudah menjadi anggota.",
  joined: "Kamu bergabung dengan lingkar.",
  inviteDeclined: "Undangan ditolak.",
  authorUnavailable: "Penulis ini tidak tersedia.",
  alreadyInvited: "Penulis ini sudah menjadi anggota atau sudah diundang.",
  inviteAdded: "Undangan ditambahkan.",
  codeRotated: "Kode diganti. Kode lama tidak berlaku.",
  notMemberAnymore: "Penulis ini sudah tidak menjadi anggota.",
  left: "Kamu keluar dari lingkar.",
  removed: "Anggota dikeluarkan.",
  roleChanged: "Keanggotaan atau peran sudah berubah.",
  adminGranted: "Admin Lingkar ditunjuk.",
  adminRevoked: "Peran Admin Lingkar dicabut.",
  reasonEmpty: "Tulis alasannya. Peserta membacanya di detail karya.",
  reasonTooLong: "Alasan paling banyak {limit} karakter.",
  membersOnly: "Hanya anggota yang bisa membagikan progres.",
  docReadFailed: "Dokumen gagal dibaca. Coba lagi.",
  archived: RESTORE_ARCHIVED_MESSAGE,
  docChanged: "Dokumen sudah berubah atau tidak tersedia. Pilih ulang untuk melihat pratinjau.",
  membershipChanged: "Keanggotaanmu sudah berubah. Buka ulang dialog untuk membagikan progres.",
  progressShared: "Progres dibagikan ke lingkar.",
  hideReasonRequired: "Isi alasan menyembunyikan tulisan.",
  postReadFailed: "Tulisan gagal dibaca. Coba lagi.",
  accessDenied: "Akses ditolak.",
  postUnavailable: "Tulisan ini sudah tidak tersedia di lingkar.",
  postHidden: "Tulisan disembunyikan dari lingkar.",
} as const;

export type GroupCode = keyof typeof GROUP_MESSAGES;

const LIMITS: Partial<Record<GroupCode, number>> = {
  nameTooLong: GROUP_NAME_LIMIT,
  descriptionTooLong: GROUP_DESCRIPTION_LIMIT,
  reasonTooLong: REASON_LIMIT,
};

/** Text of a result code from a dictionary of the same shape; `{limit}` is filled in. */
export function groupMessage(
  code: GroupCode,
  messages: Record<GroupCode, string> = GROUP_MESSAGES,
  locale: "id" | "en" = "id",
): string {
  const limit = LIMITS[code];
  return limit === undefined
    ? messages[code]
    : messages[code].replace("{limit}", limit.toLocaleString(locale === "en" ? "en-US" : "id-ID"));
}
