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

/**
 * The one action of a project page for this reader. Registering comes first; once registered and
 * active, categories that take work turn it into "Kirim karya" (or say why that is closed). A class
 * keeps the registration wording, since it collects assignments instead (6f-5).
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
