import type { Project } from "@/features/projects/types";

/** What the Organizer sees (PRD 17.6): draft, published, closed, archived. Derived, not stored. */
export type OrganizerStatus = "draf" | "terbit" | "ditutup" | "arsip";

export const statusLabel: Record<OrganizerStatus, string> = {
  draf: "Draf",
  terbit: "Terbit",
  ditutup: "Ditutup",
  arsip: "Diarsipkan",
};

export function organizerStatus(
  project: Pick<Project, "publication" | "closesAt">,
  now: number,
): OrganizerStatus {
  if (project.publication === "arsip") return "arsip";
  if (project.publication === "draf") return "draf";
  return project.closesAt !== null && project.closesAt < now ? "ditutup" : "terbit";
}

export type StatusAction = "terbitkan" | "tutup" | "arsipkan" | "hapus";

/**
 * What may be done from this status. A project with participants is archived, never deleted
 * (BR-PRJ-07). Only a draft can be published; closing only makes sense while it is open.
 */
export function allowedActions(status: OrganizerStatus, registrants: number): StatusAction[] {
  switch (status) {
    case "draf":
      return registrants === 0 ? ["terbitkan", "hapus", "arsipkan"] : ["terbitkan", "arsipkan"];
    case "terbit":
      return ["tutup", "arsipkan"];
    case "ditutup":
      return ["arsipkan"];
    case "arsip":
      return [];
  }
}

export const actionText: Record<StatusAction, { label: string; title: string; body: string }> = {
  terbitkan: {
    label: "Terbitkan",
    title: "Terbitkan proyek ini?",
    body: "Proyek tampil di katalog dan orang bisa mendaftar. Ketentuan yang kamu ubah sesudah ini dikabarkan ke peserta.",
  },
  tutup: {
    label: "Tutup pendaftaran",
    title: "Tutup pendaftaran sekarang?",
    body: "Orang tidak bisa mendaftar lagi. Peserta yang sudah terdaftar tetap bisa mengirim karya sesuai jadwal.",
  },
  arsipkan: {
    label: "Arsipkan",
    title: "Arsipkan proyek ini?",
    body: "Proyek hilang dari katalog dan penugasan Editor, Mentor, dan Juri dicabut. Data peserta tetap tersimpan. Arsip tidak bisa dibuka lagi.",
  },
  hapus: {
    label: "Hapus draf",
    title: "Hapus draf ini?",
    body: "Draf hilang dan tidak bisa dikembalikan. Belum ada peserta, jadi tidak ada yang ikut hilang.",
  },
};
