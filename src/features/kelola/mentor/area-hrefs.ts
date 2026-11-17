export const MENTOR_HREF = "/kelola/mentor";
export type MentorTab = "pengumpulan" | "tugas" | "peserta";

export const classHref = (slug: string, tab?: MentorTab) =>
  `${MENTOR_HREF}/${encodeURIComponent(slug)}${tab && tab !== "pengumpulan" ? `?tab=${tab}` : ""}`;

export const handInHref = (slug: string, id: string) =>
  `${MENTOR_HREF}/${encodeURIComponent(slug)}/pengumpulan/${encodeURIComponent(id)}`;
