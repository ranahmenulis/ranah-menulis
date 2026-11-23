import type { Locale } from "@/lib/i18n/config";
import { fill } from "@/features/studio/copy/fill";
import { personById } from "../admin/people";
import { ME_ID, SETUP_ID } from "../identity";
import type { AuditEntry } from "./audit-log";
import { auditCopy } from "./copy/audit-copy";

type Copy = ReturnType<typeof auditCopy>;

const roleName = (copy: Copy, role: string | undefined) =>
  role && role in copy.roles ? copy.roles[role as keyof Copy["roles"]] : (role ?? "");

const personName = (copy: Copy, id: string): string => {
  if (id === SETUP_ID) return copy.names.setup;
  const person = personById(id);
  if (!person) return id;
  return id === ME_ID ? `${person.name} ${copy.names.you}` : person.name;
};

/** One sentence per entry, from the actor's side: "Super Admin memberi Editor kepada Hafiz". */
export function auditSentence(entry: AuditEntry, locale: Locale = "id"): string {
  const copy = auditCopy(locale);
  return fill(copy.sentences[entry.action], {
    // A reopening read from the judging log does not say who did it; only Administrators can.
    actor: entry.actorId === "" ? copy.names.administrator : personName(copy, entry.actorId),
    target: entry.targetId ? personName(copy, entry.targetId) : "",
    role: roleName(copy, entry.role),
    project: entry.slug ?? copy.names.project,
    content: entry.ref?.startsWith("comment:") ? copy.names.comment : copy.names.post,
    label: entry.label ?? copy.names.post,
  });
}
