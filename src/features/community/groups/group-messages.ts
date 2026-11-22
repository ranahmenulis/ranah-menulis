import { RESTORE_ARCHIVED_MESSAGE } from "@/features/studio/document-archive";
import { REASON_LIMIT } from "@/features/kelola/reason";
import { GROUP_DESCRIPTION_LIMIT, GROUP_NAME_LIMIT } from "./group-model";

/**
 * Results of group actions carry a code. `message` is the Indonesian default (kept so nothing that
 * reads it breaks); screens translate by `code` with `groupMessage`.
 */
export const GROUP_MESSAGES = {
  blocked: "Kamu tidak punya akses untuk melakukan tindakan ini.",
  unavailable: "Grup ini tidak tersedia.",
  nameRequired: "Isi nama grup.",
  nameTooLong: "Nama grup maksimal {limit} karakter.",
  descriptionTooLong: "Deskripsi maksimal {limit} karakter.",
  visibilityRequired: "Pilih visibilitas grup.",
  groupChanged:
    "Pengaturan grup sudah berubah. Buka ulang formulir untuk melihat perubahan terbaru.",
  saved: "Perubahan grup disimpan.",
  created: "Grup dibuat.",
  invalidCode: "Kode undangan tidak berlaku. Minta kode terbaru dari Admin Grup.",
  inviteUnavailable: "Undangan atau grup tidak tersedia.",
  alreadyMember: "Kamu sudah menjadi anggota.",
  joined: "Kamu bergabung dengan grup.",
  inviteDeclined: "Undangan ditolak.",
  authorUnavailable: "Penulis ini tidak tersedia.",
  alreadyInvited: "Penulis ini sudah menjadi anggota atau sudah diundang.",
  inviteAdded: "Undangan ditambahkan.",
  codeRotated: "Kode diganti. Kode lama tidak berlaku.",
  notMemberAnymore: "Penulis ini sudah tidak menjadi anggota.",
  left: "Kamu keluar dari grup.",
  removed: "Anggota dikeluarkan.",
  roleChanged: "Keanggotaan atau peran sudah berubah.",
  adminGranted: "Admin Grup ditunjuk.",
  adminRevoked: "Peran Admin Grup dicabut.",
  reasonEmpty: "Tulis alasannya. Peserta membacanya di detail karya.",
  reasonTooLong: "Alasan paling banyak {limit} karakter.",
  membersOnly: "Hanya anggota yang bisa membagikan progres.",
  docReadFailed: "Dokumen gagal dibaca. Coba lagi.",
  archived: RESTORE_ARCHIVED_MESSAGE,
  docChanged: "Dokumen sudah berubah atau tidak tersedia. Pilih ulang untuk melihat pratinjau.",
  membershipChanged: "Keanggotaanmu sudah berubah. Buka ulang dialog untuk membagikan progres.",
  progressShared: "Progres dibagikan ke grup.",
  hideReasonRequired: "Isi alasan menyembunyikan tulisan.",
  postReadFailed: "Tulisan gagal dibaca. Coba lagi.",
  accessDenied: "Akses ditolak.",
  postUnavailable: "Tulisan ini sudah tidak tersedia di grup.",
  postHidden: "Tulisan disembunyikan dari grup.",
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
