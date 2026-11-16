import { projectHref } from "./project-model";

/** "Proyek saya" (PRJ-04, PRD 17.5). A static segment, so it wins over a project slug. */
export const MY_PROJECTS_HREF = "/projects/saya";

export const submissionHref = (slug: string, id: string) =>
  `${projectHref(slug)}/kiriman/${encodeURIComponent(id)}`;

export const reviseHref = (slug: string, id: string) => `${submissionHref(slug, id)}/revisi`;
