import type { Locale } from "@/lib/i18n/config";
import { flowCopy } from "./copy/flow";
import { holdsSeat, paymentState } from "./payment-model";
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
 * A free project registers straight away; a paid one waits for payment (see `payment-model.ts`). [usulan] The terms version shown at that moment is stored with the time (BR-PRJ-02).
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
  registration: Registration | undefined,
  now: number,
  locale: Locale = "id",
): { label: string; enabled: boolean } {
  const text = flowCopy(locale);
  if (!guest && registration) {
    const paying = paymentState(registration, now);
    if (paying === "lunas") return { label: text.action.registered, enabled: false };
    if (paying === "menunggu") return { label: text.common.payNow, enabled: true };
    // The hold ran out: the seat is free again, so registering again is offered below.
  }
  if (state === "kuota-penuh") return { label: text.action.full, enabled: false };
  if (state === "ditutup") return { label: text.action.closed, enabled: false };
  if (guest) return { label: text.action.signInToRegister, enabled: false };
  return { label: text.action.register, enabled: true };
}

/**
 * Seats follow registrations: a confirmed one fills a seat, and so does one waiting for payment
 * until its hold runs out [usulan, Q-20]. Returns the same list when nothing changes.
 */
export function applyRegistrations(
  projects: Project[],
  registrations: RegistrationMap,
  now: number,
): Project[] {
  const confirmed = Object.values(registrations).filter((r) => holdsSeat(r, now));
  if (confirmed.length === 0) return projects;
  const slugs = new Set(confirmed.map((r) => r.slug));
  return projects.map((p) =>
    slugs.has(p.slug) && p.quota
      ? { ...p, quota: { ...p.quota, taken: Math.min(p.quota.total, p.quota.taken + 1) } }
      : p,
  );
}
