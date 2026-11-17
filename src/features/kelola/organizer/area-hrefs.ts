export const ORGANIZER_HREF = "/kelola/organizer";
export const NEW_PROJECT_HREF = `${ORGANIZER_HREF}/baru`;
export type ManageTab = "proyek" | "penugasan" | "peserta" | "kiriman";

export const manageHref = (slug: string, tab?: ManageTab) =>
  `${ORGANIZER_HREF}/${encodeURIComponent(slug)}${tab && tab !== "proyek" ? `?tab=${tab}` : ""}`;

export const MANAGE_TABS: { id: ManageTab; label: string }[] = [
  { id: "proyek", label: "Proyek" },
  { id: "penugasan", label: "Penugasan" },
  { id: "peserta", label: "Peserta" },
  { id: "kiriman", label: "Kiriman" },
];

export const parseManageTab = (value: string | null | undefined): ManageTab =>
  MANAGE_TABS.find((t) => t.id === value)?.id ?? "proyek";

export type ListFilter = "aktif" | "draf" | "terbit" | "ditutup" | "arsip";
export const LIST_FILTERS: { id: ListFilter; label: string }[] = [
  { id: "aktif", label: "Aktif" },
  { id: "draf", label: "Draf" },
  { id: "terbit", label: "Terbit" },
  { id: "ditutup", label: "Ditutup" },
  { id: "arsip", label: "Diarsipkan" },
];
export const DEFAULT_LIST_FILTER: ListFilter = "aktif";

export const parseListFilter = (value: string | null | undefined): ListFilter =>
  LIST_FILTERS.find((f) => f.id === value)?.id ?? DEFAULT_LIST_FILTER;

export const listQuery = (filter: ListFilter) =>
  filter === DEFAULT_LIST_FILTER ? "" : `?status=${filter}`;
