import {
  BookmarkSimple,
  Books,
  Compass,
  House,
  Notebook,
  ShieldCheck,
  User,
  CalendarDots,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { OWN_PROFILE_HREF } from "@/features/profile/profile-href";

export type NavEntry = {
  id: string;
  label: string;
  Icon: Icon;
  /** Absent while the destination does not exist yet; the entry is shown but inactive. */
  href?: string;
};

/** [konfirmasi] Dummy account until sign-in exists; login is bypassed during slicing. */
export const DUMMY_USER = { name: "Rinjani Putri" };

export const HOME_HREF = "/beranda";
export const STUDIO_HREF = "/studio";
export const SAVED_HREF = "/tersimpan";
export const NOTIFICATIONS_HREF = "/notifikasi";
export const STREAK_HREF = "/studio/streak";
export const NEW_DOCUMENT_HREF = "/studio/baru";
export const DISCOVER_HREF = "/jelajahi";
export const PROJECTS_HREF = "/projects";
export const KELOLA_NAV_HREF = "/kelola";
export const NEW_POST_HREF = "/tulis";
/** Opens "Tulis postingan" with a Studio document already chosen as the source (STD-10). */
export const postFromDocumentHref = (documentId: string) =>
  `${NEW_POST_HREF}?dokumen=${encodeURIComponent(documentId)}`;

const home: NavEntry = { id: "beranda", label: "Beranda", Icon: House, href: HOME_HREF };
const discover: NavEntry = {
  id: "jelajahi",
  label: "Jelajahi",
  Icon: Compass,
  href: DISCOVER_HREF,
};
const studio: NavEntry = { id: "studio", label: "Studio", Icon: Notebook, href: STUDIO_HREF };
const streak: NavEntry = { id: "streak", label: "Streak", Icon: CalendarDots, href: STREAK_HREF };
const projects: NavEntry = {
  id: "projects",
  label: "Projects",
  Icon: Books,
  href: PROJECTS_HREF,
};
const saved: NavEntry = {
  id: "tersimpan",
  label: "Tersimpan",
  Icon: BookmarkSimple,
  href: SAVED_HREF,
};
/** Shown only to people who hold a management role (see `useRoles`). */
export const kelolaNav: NavEntry = {
  id: "kelola",
  label: "Kelola",
  Icon: ShieldCheck,
  href: KELOLA_NAV_HREF,
};
const profile: NavEntry = { id: "profil", label: "Profil", Icon: User, href: OWN_PROFILE_HREF };

/**
 * Desktop sidebar and tablet rail. Streak is a sub-item of Studio on the sidebar (DESIGN.md 5.3).
 * Jelajahi sits under Beranda [usulan]; phones keep five tabs and open it from the search icon.
 */
export const mainNav = [home, discover, studio, projects, saved, profile];
export const sidebarSub = streak;
/** Phones: five tabs per PRD 16. [konfirmasi] four tabs is a proposal. */
export const bottomNav = [home, studio, streak, projects, profile];

/** Which nav entry the current path belongs to. Studio and Streak are separate on phones only. */
export function activeId(pathname: string): string | null {
  if (pathname.startsWith(STREAK_HREF)) return "streak";
  if (pathname.startsWith(STUDIO_HREF)) return "studio";
  if (pathname.startsWith("/beranda")) return "beranda";
  if (pathname.startsWith(DISCOVER_HREF)) return "jelajahi";
  if (pathname.startsWith(PROJECTS_HREF)) return "projects";
  if (pathname.startsWith(KELOLA_NAV_HREF)) return "kelola";
  if (pathname.startsWith(SAVED_HREF)) return "tersimpan";
  if (pathname.startsWith(NOTIFICATIONS_HREF)) return "notifikasi";
  // Only your own profile is "Profil"; another author's page belongs to no navigation entry.
  if (pathname === OWN_PROFILE_HREF) return "profil";
  return null;
}

/**
 * A post page replaces the phone bottom bar with its own action bar and the top bar with a back
 * arrow [usulan, DESIGN.md 6.9]. Applies below md only; wider screens keep the full frame.
 */
export function isPostPage(pathname: string): boolean {
  return pathname.startsWith("/postingan/");
}

/** Title in the phone top bar; Beranda shows the logo alone. */
export function mobileTitle(pathname: string): string | null {
  if (pathname.startsWith(STUDIO_HREF)) return "Studio";
  return pathname.startsWith(PROJECTS_HREF) ? "Projects" : null;
}

/** The round write button is shown on Beranda and the Studio document list only. */
export function showsWriteButton(pathname: string): boolean {
  return pathname === HOME_HREF || pathname === STUDIO_HREF;
}
