export const JURI_HREF = "/kelola/juri";

export const contestHref = (slug: string) => `${JURI_HREF}/${encodeURIComponent(slug)}`;
export const workHref = (slug: string, id: string) =>
  `${contestHref(slug)}/karya/${encodeURIComponent(id)}`;
