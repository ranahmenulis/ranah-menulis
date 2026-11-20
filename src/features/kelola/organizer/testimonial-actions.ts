import { storedProjects } from "@/features/projects/stored-projects";
import { mergeCatalog } from "@/features/projects/use-catalog";
import { allTestimonials, testimonialDecisions } from "@/features/projects/kelas/testimonial-store";
import { isHidden } from "@/features/projects/kelas/testimonial-model";
import { appendAudit } from "../audit/audit-log";
import { ME_ID } from "../identity";
import { validateReason } from "../reason";
import { readEffectiveRoles } from "../use-effective-roles";
import { manageAccess } from "./organizer-access";

export type TestimonialDecisionResult =
  { ok: true; message: string } | { ok: false; message: string };

const refuse = (message: string): TestimonialDecisionResult => ({ ok: false, message });

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
    return refuse("Hanya Organizer kelas ini dan Administrator yang bisa mengatur testimoni.");
  }
  const testimonial = allTestimonials().find((t) => t.id === id && t.slug === slug);
  if (!testimonial) return refuse("Testimoni ini sudah dihapus penulisnya.");

  const decisions = testimonialDecisions.read();
  const hide = decision === "sembunyikan";
  if (isHidden(id, decisions) === hide) {
    return refuse(hide ? "Testimoni ini sudah disembunyikan." : "Testimoni ini sudah tampil.");
  }
  if (validateReason(reason, hide) !== null) {
    return refuse(
      hide
        ? "Tulis alasan menyembunyikannya (paling banyak 1.000 karakter)."
        : "Alasan terlalu panjang.",
    );
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
      state: hide ? "disembunyikan" : "dipulihkan",
      at: now,
      by: ME_ID,
      reason: note,
    },
  ]);
  return {
    ok: true,
    message: hide
      ? "Testimoni disembunyikan dari halaman kelas."
      : "Testimoni tampil lagi di halaman kelas.",
  };
}
