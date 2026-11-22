import type { Locale } from "@/lib/i18n/config";
import { catalogCopy } from "./copy/catalog";
import { formatNumber } from "./project-model";
import { dashboardHref } from "./kelas/class-model";
import { soloDashboardHref } from "./solo/solo-model";
import { payHref, paymentState } from "./payment-model";
import { registerAction, registerHref } from "./registration-model";
import { kirimHref, submitAction, submitBlock } from "./submission-model";
import type { Project, ProjectState, Registration } from "./types";

const sentLine = (n: number, maxWorks: number, locale: Locale) => {
  const copy = catalogCopy(locale).action;
  return copy.sentOf
    .replace("{n}", String(n))
    .replace("{works}", copy.works.replace("{n}", formatNumber(maxWorks, locale)));
};

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
  registration: Registration | undefined,
  locale: Locale,
): ProjectAction | null {
  if (guest || registration?.status !== "terdaftar" || project.block.kind !== "kelas") return null;
  return {
    label: catalogCopy(locale).action.openClassDashboard,
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
  locale: Locale,
): ProjectAction | null {
  if (guest || registration?.status !== "terdaftar" || project.block.kind !== "solo") return null;
  if (!sentCount) return null;
  return {
    label: catalogCopy(locale).action.openDashboard,
    enabled: true,
    href: soloDashboardHref(project.slug),
    sentLine: sentLine(sentCount, project.submission?.maxWorks ?? 1, locale),
  };
}

/** A registered reader of a class or a Solo book goes to the dashboard of their project. */
function dashboardAction(
  project: Project,
  guest: boolean,
  registration: Registration | undefined,
  sentCount: number | null,
  locale: Locale,
): ProjectAction | null {
  return (
    classAction(project, guest, registration, locale) ??
    soloAction(project, guest, registration, sentCount, locale)
  );
}

/** Registering, or paying when a registration still holds its seat. */
function nextHref(
  project: Project,
  guest: boolean,
  registration: Registration | undefined,
  now: number,
) {
  const paying = !guest && registration && paymentState(registration, now) === "menunggu";
  return paying ? payHref(project.slug) : registerHref(project.slug);
}

/** Until the count is known the button waits, so it never offers a send the limit would refuse. */
function sendEntry(
  block: ReturnType<typeof submitBlock>,
  sentCount: number | null,
  locale: Locale,
) {
  if (sentCount === null && block === null) {
    return { label: catalogCopy(locale).action.sendWork, enabled: false };
  }
  return submitAction(block, locale);
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
  locale?: Locale;
}): ProjectAction {
  const { project, state, guest, registration, now, sentCount, locale = "id" } = input;
  const rules = project.submission;
  const dashboardEntry = dashboardAction(project, guest, registration, sentCount, locale);
  if (dashboardEntry) return dashboardEntry;
  const sending = !guest && registration && rules ? { registration, rules } : null;
  const block = sending
    ? submitBlock({ project, guest, registration, now, sent: sentCount ?? 0 })
    : null;
  const send = sending ? sendEntry(block, sentCount, locale) : null;
  const action = send ?? registerAction(state, guest, registration, now, locale);
  return {
    ...action,
    href: send ? kirimHref(project.slug) : nextHref(project, guest, registration, now),
    sentLine:
      sending?.registration.status === "terdaftar"
        ? sentLine(sentCount ?? 0, sending.rules.maxWorks, locale)
        : null,
  };
}
