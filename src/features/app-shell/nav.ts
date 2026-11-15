import {
  BookmarkSimple,
  Books,
  House,
  Notebook,
  User,
  CalendarDots,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

export type NavEntry = {
  id: string;
  label: string;
  Icon: Icon;
  /** Absent while the destination does not exist yet; the entry is shown but inactive. */
  href?: string;
};

/** [konfirmasi] Dummy account until sign-in exists; login is bypassed during slicing. */
export const DUMMY_USER = { name: "Rinjani Putri", unread: 3 };

export const STUDIO_HREF = "/studio";
export const STREAK_HREF = "/studio/streak";
export const NEW_DOCUMENT_HREF = "/studio/baru";

const home: NavEntry = { id: "beranda", label: "Beranda", Icon: House, href: "/beranda" };
const studio: NavEntry = { id: "studio", label: "Studio", Icon: Notebook, href: STUDIO_HREF };
const streak: NavEntry = { id: "streak", label: "Streak", Icon: CalendarDots, href: STREAK_HREF };
const projects: NavEntry = { id: "projects", label: "Projects", Icon: Books };
const saved: NavEntry = { id: "tersimpan", label: "Tersimpan", Icon: BookmarkSimple };
const profile: NavEntry = { id: "profil", label: "Profil", Icon: User };

/** Desktop sidebar and tablet rail. Streak is a sub-item of Studio on the sidebar (DESIGN.md 5.3). */
export const mainNav = [home, studio, projects, saved, profile];
export const sidebarSub = streak;
/** Phones: five tabs per PRD 16. [konfirmasi] four tabs is a proposal. */
export const bottomNav = [home, studio, streak, projects, profile];

/** Which nav entry the current path belongs to. Studio and Streak are separate on phones only. */
export function activeId(pathname: string): string | null {
  if (pathname.startsWith(STREAK_HREF)) return "streak";
  if (pathname.startsWith(STUDIO_HREF)) return "studio";
  if (pathname.startsWith("/beranda")) return "beranda";
  return null;
}

/** Title in the phone top bar; Beranda shows the logo alone. */
export function mobileTitle(pathname: string): string | null {
  return pathname.startsWith(STUDIO_HREF) ? "Studio" : null;
}

/** The round write button is shown on Beranda and the Studio document list only. */
export function showsWriteButton(pathname: string): boolean {
  return pathname === "/beranda" || pathname === STUDIO_HREF;
}
