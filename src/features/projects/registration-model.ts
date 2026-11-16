import { isFreeMoney, effectiveFee, projectHref } from "./project-model";
import type { Money, Project, ProjectState, Registration, RegistrationMap } from "./types";

export const registerHref = (slug: string) => `${projectHref(slug)}/daftar`;

/** What this registration costs: the chosen package for Solo, the project fee otherwise. */
export function registrationFee(project: Project, packageName?: string): Money {
  if (project.block.kind === "solo") {
    const pack = project.block.packages.find((p) => p.name === packageName);
    if (pack) return pack.fee;
  }
  return effectiveFee(project);
}

/**
 * The registration is allowed once the terms are accepted and, for Solo, a package that exists is
 * chosen. Whether the project is still open is checked by the caller (it depends on the clock).
 */
export function canRegister(
  project: Project,
  choice: { agreed: boolean; packageName?: string },
): boolean {
  if (!choice.agreed) return false;
  if (project.block.kind !== "solo") return true;
  return project.block.packages.some((p) => p.name === choice.packageName);
}

/**
 * A free project registers straight away; a paid one waits for payment, which does not exist yet
 * (6f-6). [usulan] The terms version shown at that moment is stored with the time (BR-PRJ-02).
 */
export function newRegistration(project: Project, now: number, packageName?: string): Registration {
  const paid = !isFreeMoney(registrationFee(project, packageName));
  return {
    slug: project.slug,
    registeredAt: now,
    agreedAt: now,
    termsVersion: project.terms.version,
    packageName: project.block.kind === "solo" ? packageName : undefined,
    status: paid ? "menunggu-pembayaran" : "terdaftar",
  };
}

/**
 * The one action of a project page for this reader. Your own registration wins over everything
 * else once signed in; a full or closed project is named before asking guests to sign in.
 */
export function registerAction(
  state: ProjectState,
  guest: boolean,
  registration?: Registration,
): { label: string; enabled: boolean } {
  if (!guest && registration) {
    return {
      label: registration.status === "terdaftar" ? "Terdaftar" : "Menunggu pembayaran",
      enabled: false,
    };
  }
  if (state === "kuota-penuh") return { label: "Kuota penuh", enabled: false };
  if (state === "ditutup") return { label: "Pendaftaran ditutup", enabled: false };
  if (guest) return { label: "Masuk untuk mendaftar", enabled: false };
  return { label: "Daftar", enabled: true };
}

/**
 * Seats follow registrations: a confirmed one fills a seat. One waiting for payment does not
 * [usulan, Q-20: how long a seat is held is undecided]. Returns the same list when nothing changes.
 */
export function applyRegistrations(projects: Project[], registrations: RegistrationMap): Project[] {
  const confirmed = Object.values(registrations).filter((r) => r.status === "terdaftar");
  if (confirmed.length === 0) return projects;
  const slugs = new Set(confirmed.map((r) => r.slug));
  return projects.map((p) =>
    slugs.has(p.slug) && p.quota
      ? { ...p, quota: { ...p.quota, taken: Math.min(p.quota.total, p.quota.taken + 1) } }
      : p,
  );
}
