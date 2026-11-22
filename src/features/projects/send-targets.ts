import type { Locale } from "@/lib/i18n/config";
import { flowCopy } from "./copy/flow";
import { activeSubmissions, submitBlock, type SubmitBlock } from "./submission-model";
import { blockMessage } from "./submission-text";
import type { Submission } from "./submission-types";
import type { Project, RegistrationMap } from "./types";

/** A project the reader may be able to send a document to, and why not when they cannot. */
export type SendTarget = { project: Project; reason: string | null };

/** Short wording for the dialog; the three other blocks cannot happen for a registered project. */
function reasonOf(block: SubmitBlock, project: Project, locale: Locale): string {
  const text = flowCopy(locale).sendTargets;
  switch (block) {
    case "menunggu-pembayaran":
      return text.waiting;
    case "ditutup":
      return text.closed;
    case "batas-tercapai":
      return text.limit;
    default:
      return blockMessage(block, project.submission, locale);
  }
}

/**
 * The projects offered by "Kirim ke proyek" in Studio: the ones this reader is registered for that
 * take submissions. Those that cannot take this document right now stay listed with the reason, so
 * a missing project is never a mystery. `docId` is `null` for a document not stored yet.
 */
export function sendTargets(input: {
  projects: Project[];
  registrations: RegistrationMap;
  submissions: Submission[];
  docId: string | null;
  now: number;
  guest: boolean;
  locale?: Locale;
}): SendTarget[] {
  const { projects, registrations, submissions, docId, now, guest, locale = "id" } = input;
  if (guest) return [];
  return projects
    .filter((p) => p.publication === "terbit" && p.submission && registrations[p.slug])
    .map((project) => {
      const mine = activeSubmissions(submissions, project.slug);
      const block = submitBlock({
        project,
        guest,
        registration: registrations[project.slug],
        now,
        sent: mine.length,
      });
      if (block === null) {
        const dup = docId !== null && mine.some((s) => s.docId === docId);
        return { project, reason: dup ? flowCopy(locale).sendTargets.duplicate : null };
      }
      return { project, reason: reasonOf(block, project, locale) };
    });
}
