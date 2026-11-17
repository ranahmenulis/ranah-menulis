import { personLabel } from "../admin/people";
import { roleLabel, type ManagerRole } from "@/lib/roles";
import type { AuditAction, AuditEntry } from "./audit-log";

const roleName = (role: string | undefined) =>
  role && role in roleLabel ? roleLabel[role as ManagerRole] : (role ?? "");

const contentName = (ref: string | undefined) =>
  ref?.startsWith("comment:") ? "komentar" : "tulisan";

type Parts = { actor: string; target: string; role: string; project: string; content: string };

const SENTENCES: Record<AuditAction, (p: Parts) => string> = {
  "role.grant": (p) => `${p.actor} memberi role ${p.role} kepada ${p.target}.`,
  "role.revoke": (p) => `${p.actor} mencabut role ${p.role} dari ${p.target}.`,
  "account.suspend": (p) => `${p.actor} menangguhkan akun ${p.target}.`,
  "account.restore": (p) => `${p.actor} memulihkan akun ${p.target}.`,
  "staff.assign": (p) => `${p.actor} menugaskan ${p.target} sebagai ${p.role} di ${p.project}.`,
  "staff.unassign": (p) => `${p.actor} mencabut penugasan ${p.role} ${p.target} di ${p.project}.`,
  "report.dismiss": (p) => `${p.actor} mengabaikan laporan atas ${p.content} ${p.target}.`,
  "content.hide": (p) => `${p.actor} menyembunyikan ${p.content} ${p.target}.`,
  "content.restore": (p) => `${p.actor} memulihkan ${p.content} ${p.target}.`,
  "content.delete": (p) => `${p.actor} menghapus ${p.content} ${p.target}.`,
  "contest.results.amend": (p) => `${p.actor} mengubah hasil lomba ${p.project} setelah diumumkan.`,
  "contest.reopen": (p) => `${p.actor} membuka kembali penilaian lomba ${p.project}.`,
};

/** One sentence per entry, from the actor's side: "Super Admin memberi Editor kepada Hafiz". */
export function auditSentence(entry: AuditEntry): string {
  return SENTENCES[entry.action]({
    // A reopening read from the judging log does not say who did it; only Administrators can.
    actor: entry.actorId === "" ? "Administrator" : personLabel(entry.actorId),
    target: entry.targetId ? personLabel(entry.targetId) : "",
    role: roleName(entry.role),
    project: entry.slug ?? "proyek",
    content: contentName(entry.ref),
  });
}
