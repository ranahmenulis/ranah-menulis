export const ADMIN_HREF = "/kelola/admin";
export const userHref = (id: string) => `${ADMIN_HREF}/pengguna/${encodeURIComponent(id)}`;
