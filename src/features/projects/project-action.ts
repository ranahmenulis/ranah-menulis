import { dashboardHref } from "./kelas/class-model";
import { soloDashboardHref } from "./solo/solo-model";
import { registerAction, registerHref } from "./registration-model";
import { kirimHref, submitAction, submitBlock } from "./submission-model";
import { worksText } from "./submission-text";
import type { Project, ProjectState, Registration } from "./types";

const WAITING = { label: "Kirim karya", enabled: false };

export type ProjectAction = {
  label: string;
  enabled: boolean;
  href: string;
  /** "1 dari 2 karya": set once registered and active in a category that takes work. */
  sentLine: string | null;
};

/** A registered reader of a class goes to its dashboard: a class collects assignments there. */
function classAction(
  project: Project,
  guest: boolean,
  registration?: Registration,
): ProjectAction | null {
  if (guest || registration?.status !== "terdaftar" || project.block.kind !== "kelas") return null;
  return {
    label: "Buka dasbor kelas",
    enabled: true,
    href: dashboardHref(project.slug),
    sentLine: null,
  };
}

/** A Solo author who has sent the manuscript follows the book on its dashboard. */
function soloAction(
  project: Project,
  guest: boolean,
  registration: Registration | undefined,
  sentCount: number | null,
): ProjectAction | null {
  if (guest || registration?.status !== "terdaftar" || project.block.kind !== "solo") return null;
  if (!sentCount) return null;
  return {
    label: "Buka dasbor",
    enabled: true,
    href: soloDashboardHref(project.slug),
    sentLine: `${sentCount} dari ${worksText(project.submission?.maxWorks ?? 1)}`,
  };
}

/** A registered reader of a class or a Solo book goes to the dashboard of their project. */
function dashboardAction(
  project: Project,
  guest: boolean,
  registration: Registration | undefined,
  sentCount: number | null,
): ProjectAction | null {
  return (
    classAction(project, guest, registration) ?? soloAction(project, guest, registration, sentCount)
  );
}

/**
 * The one action of a project page for this reader. Registering comes first; once registered and
 * active, categories that take work turn it into "Kirim karya" (or say why that is closed). A class
 * collects assignments instead, so a registered reader gets the way into the class dashboard.
 */
export function projectAction(input: {
  project: Project;
  state: ProjectState;
  guest: boolean;
  registration?: Registration;
  now: number;
  /** Works this reader sent here that still count against the limit; `null` while unknown. */
  sentCount: number | null;
}): ProjectAction {
  const { project, state, guest, registration, now, sentCount } = input;
  const rules = project.submission;
  const dashboardEntry = dashboardAction(project, guest, registration, sentCount);
  if (dashboardEntry) return dashboardEntry;
  const sending = !guest && registration && rules ? { registration, rules } : null;
  const block = sending
    ? submitBlock({ project, guest, registration, now, sent: sentCount ?? 0 })
    : null;
  // Until the count is known the button waits, so it never offers a send the limit would refuse.
  const waiting = sentCount === null && block === null;
  const send = sending ? (waiting ? WAITING : submitAction(block)) : null;
  const action = send ?? registerAction(state, guest, registration);
  return {
    ...action,
    href: send ? kirimHref(project.slug) : registerHref(project.slug),
    sentLine:
      sending?.registration.status === "terdaftar"
        ? `${sentCount ?? 0} dari ${worksText(sending.rules.maxWorks)}`
        : null,
  };
}
