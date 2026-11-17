"use client";

import { createLocalListStore } from "@/lib/local-list-store";

/**
 * The log of sensitive actions (PLT-05: who, what, when). Append-only: there is no function that
 * changes or removes an entry, and none may be added (AC-SA4). Kept in localStorage `ranah.auditLog`
 * until the backend exists, where it becomes a table nobody can update or delete. The screen that
 * reads it is 6g-6.
 */
export type AuditAction =
  | "role.grant"
  | "role.revoke"
  | "account.suspend"
  | "account.restore"
  | "staff.assign"
  | "staff.unassign";

export type AuditEntry = {
  id: string;
  at: number;
  actorId: string;
  action: AuditAction;
  targetId: string;
  /** The role granted, revoked or assigned. */
  role?: string;
  /** The project an assignment belongs to. */
  slug?: string;
  reason?: string;
};

const ACTIONS: readonly string[] = [
  "role.grant",
  "role.revoke",
  "account.suspend",
  "account.restore",
  "staff.assign",
  "staff.unassign",
];

const optionalText = (value: unknown) => value === undefined || typeof value === "string";

const isEntry = (value: unknown): value is AuditEntry => {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    Number.isFinite(e.at) &&
    typeof e.actorId === "string" &&
    ACTIONS.includes(e.action as string) &&
    typeof e.targetId === "string" &&
    optionalText(e.role) &&
    optionalText(e.slug) &&
    optionalText(e.reason)
  );
};

export const auditLog = createLocalListStore<AuditEntry>("ranah.auditLog", isEntry);

export type NewAuditEntry = Omit<AuditEntry, "id" | "at">;

/** Adds entries in one write, all stamped with the same moment. */
export function appendAudit(entries: readonly NewAuditEntry[], at = Date.now()) {
  if (entries.length === 0) return;
  const current = auditLog.read();
  const added = entries.map((entry, i) => ({ ...entry, id: `${at}-${current.length + i}`, at }));
  auditLog.write([...current, ...added]);
}

export const useAuditLog = auditLog.use;
