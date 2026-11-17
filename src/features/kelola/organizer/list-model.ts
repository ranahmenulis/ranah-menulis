import type { ListFilter } from "./area-hrefs";
import type { OrganizerRow } from "./use-organizer-data";

/** "Aktif" is everything except the archive: what an Organizer still works on. */
export const matchesList = (row: OrganizerRow, filter: ListFilter): boolean =>
  filter === "aktif" ? row.status !== "arsip" : row.status === filter;

export function countByList(rows: readonly OrganizerRow[]): Record<ListFilter, number> {
  const count = (f: ListFilter) => rows.filter((r) => matchesList(r, f)).length;
  return {
    aktif: count("aktif"),
    draf: count("draf"),
    terbit: count("terbit"),
    ditutup: count("ditutup"),
    arsip: count("arsip"),
  };
}

export const listEmptyText: Record<ListFilter, string> = {
  aktif: "Belum ada proyek. Buat proyek pertamamu.",
  draf: "Tidak ada draf.",
  terbit: "Tidak ada proyek yang sedang terbuka.",
  ditutup: "Tidak ada proyek yang pendaftarannya ditutup.",
  arsip: "Belum ada proyek yang diarsipkan.",
};
