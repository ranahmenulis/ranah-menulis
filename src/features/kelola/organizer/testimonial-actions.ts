import type { Locale } from "@/lib/i18n/config";
import { storedProjects } from "@/features/projects/stored-projects";
import { mergeCatalog } from "@/features/projects/use-catalog";
import { allTestimonials, testimonialDecisions } from "@/features/projects/kelas/testimonial-store";
import { isHidden } from "@/features/projects/kelas/testimonial-model";
import { appendAudit } from "../audit/audit-log";
import { ME_ID } from "../identity";
import { validateReason } from "../reason";
import { readEffectiveRoles } from "../use-effective-roles";
import { manageAccess } from "./organizer-access";
import { tabsCopy } from "./copy/tabs-copy";

/** Why a decision answered as it did; `message` on the result is the Indonesian default. */
export type TestimonialDecisionCode =
  | "forbidden"
  | "gone"
  | "alreadyHidden"
  | "alreadyShown"
  | "reasonRequired"
  | "reasonTooLong"
  | "hidden"
  | "restored";

export type TestimonialDecisionResult =
  | { ok: true; code: TestimonialDecisionCode; message: string }
  | { ok: false; code: TestimonialDecisionCode; message: string };

const messages = tabsCopy("id").testimonials.codes;

const refuse = (code: TestimonialDecisionCode): TestimonialDecisionResult => ({
  ok: false,
  code,
  message: messages[code],
});

/** The sentence for a decision code in the interface language. */
export const decisionText = (code: TestimonialDecisionCode, locale: Locale = "id"): string =>
  tabsCopy(locale).testimonials.codes[code];

/**
 * A curator hides a testimonial from the class page or brings it back (KLS-07). Only the Organizer
 * of that project and Administrators; a Mentor does not curate. Reads the roles, the project and the
 * testimonial again now, and writes the audit entry before the decision it records. Hiding needs a
 * reason; bringing back does not.
 */
export function decideTestimonial(
  slug: string,
  id: string,
  decision: "sembunyikan" | "pulihkan",
  reason: string,
  now = Date.now(),
): TestimonialDecisionResult {
  const project = mergeCatalog(storedProjects.read()).find((p) => p.slug === slug);
  if (manageAccess(readEffectiveRoles(), project) !== "ok" || project?.category !== "kelas") {
    return refuse("forbidden");
  }
  const testimonial = allTestimonials().find((t) => t.id === id && t.slug === slug);
  if (!testimonial) return refuse("gone");

  const decisions = testimonialDecisions.read();
  const hide = decision === "sembunyikan";
  if (isHidden(id, decisions) === hide) {
    return refuse(hide ? "alreadyHidden" : "alreadyShown");
  }
  if (validateReason(reason, hide) !== null) {
    return refuse(hide ? "reasonRequired" : "reasonTooLong");
  }

  const note = reason.trim() || undefined;
  appendAudit(
    [
      {
        action: hide ? "testimonial.hide" : "testimonial.restore",
        actorId: ME_ID,
        slug,
        label: testimonial.name,
        reason: note,
      },
    ],
    now,
  );
  testimonialDecisions.write([
    ...decisions,
    {
      testimonialId: id,
      slug,
      state: hide ? "disembunyikan" : "dipulihkan",
      at: now,
      by: ME_ID,
      reason: note,
    },
  ]);
  const code = hide ? "hidden" : "restored";
  return { ok: true, code, message: messages[code] };
}
