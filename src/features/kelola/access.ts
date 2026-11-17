import { isPlatformAdmin, type ManagerRole } from "@/lib/roles";

/**
 * Management areas under /kelola (PRD 17.6). [usulan] Administrator and Super Admin reach every
 * area, following the permission matrix (PRD 15.2: manage on projects, feedback and judging).
 *
 * Only decides which screens to show. Real enforcement is Row Level Security, and nothing here
 * may stand in for it.
 */
export type Area = "editor" | "mentor" | "organizer" | "juri" | "admin";

export type AreaInfo = {
  id: Area;
  label: string;
  href: string;
  summary: string;
  /** Roles that hold this area by assignment; platform admins reach it regardless. */
  roles: readonly ManagerRole[];
};

export const KELOLA_HREF = "/kelola";

export const AREAS: readonly AreaInfo[] = [
  {
    id: "organizer",
    label: "Proyek",
    href: `${KELOLA_HREF}/organizer`,
    summary: "Buat dan ubah proyek, lihat peserta, konfirmasi pembayaran, dan majukan tahap.",
    roles: ["organizer"],
  },
  {
    id: "editor",
    label: "Antrean submission",
    href: `${KELOLA_HREF}/editor`,
    summary: "Tinjau karya yang ditugaskan kepadamu, beri catatan, dan putuskan.",
    roles: ["editor"],
  },
  {
    id: "juri",
    label: "Penilaian",
    href: `${KELOLA_HREF}/juri`,
    summary: "Nilai karya lomba yang ditugaskan kepadamu.",
    roles: ["juri"],
  },
  {
    id: "mentor",
    label: "Kelas",
    href: `${KELOLA_HREF}/mentor`,
    summary: "Kelola peserta, tugas, pengumpulan, dan feedback kelasmu.",
    roles: ["mentor"],
  },
  {
    id: "admin",
    label: "Admin",
    href: `${KELOLA_HREF}/admin`,
    summary: "Pengguna dan role, moderasi, kurasi, grup, dan audit log.",
    roles: ["administrator", "super-admin"],
  },
];

export function canAccess(roles: readonly ManagerRole[], area: Area): boolean {
  if (area === "admin") return isPlatformAdmin(roles);
  if (isPlatformAdmin(roles)) return true;
  const info = AREAS.find((a) => a.id === area);
  return !!info && info.roles.some((role) => roles.includes(role));
}

export function areasFor(roles: readonly ManagerRole[]): readonly AreaInfo[] {
  return AREAS.filter((area) => canAccess(roles, area.id));
}

/** The area a /kelola path belongs to, or null for the overview and unknown paths. */
export function areaOf(pathname: string): AreaInfo | null {
  const segment = pathname.split("/")[2];
  return AREAS.find((a) => a.id === segment) ?? null;
}
