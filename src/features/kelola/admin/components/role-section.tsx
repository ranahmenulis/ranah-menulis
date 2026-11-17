"use client";

import { Button } from "@/components/ui/button";
import { MANAGER_ROLES, type ManagerRole } from "@/lib/roles";
import { blockMessage, roleChangeBlock, type RuleBlock } from "../role-rules";
import { useRoleGrants, useSuspensions } from "../role-store";
import { roleLabel, type UserRow } from "../user-model";
import { ME_ID } from "../../identity";

export type RoleAsk = { change: "grant" | "revoke"; role: ManagerRole };

/** What to show beside a role when the viewer cannot change it: short, not the full sentence. */
const shortBlock: Partial<Record<RuleBlock, string>> = {
  "hanya-super-admin": "Hanya Super Admin",
  "target-tingkat-administrator": "Hanya Super Admin",
  "super-admin-terakhir": "Super Admin terakhir",
  "diri-sendiri": "Bukan untuk akunmu sendiri",
};

/**
 * One row per management role: held or not, and the button that gives or takes it. The buttons only
 * open the confirmation; the action re-checks the rules when it runs.
 */
export function RoleSection({
  user,
  actorRoles,
  onAsk,
}: {
  user: UserRow;
  actorRoles: readonly ManagerRole[];
  onAsk: (ask: RoleAsk) => void;
}) {
  const grants = useRoleGrants();
  const suspended = useSuspensions();
  return (
    <section aria-labelledby="role-title" className="grid gap-2">
      <h2 id="role-title" className="heading-md">
        Role
      </h2>
      <ul className="border-t border-line">
        {MANAGER_ROLES.map((role) => {
          const holds = user.roles.includes(role);
          const change = holds ? "revoke" : "grant";
          const block = roleChangeBlock(
            { actorRoles, actorId: ME_ID, grants, suspensions: suspended, targetId: user.id },
            role,
            change,
          );
          return (
            <li
              key={role}
              className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line py-2"
            >
              <span className="text-sm">
                <span className="font-medium">{roleLabel[role]}</span>
                <span className="text-ink-muted"> · {holds ? "Dipegang" : "Tidak dipegang"}</span>
              </span>
              {block ? (
                <span title={blockMessage[block]} className="text-xs text-ink-muted">
                  {shortBlock[block] ?? "Tidak tersedia"}
                </span>
              ) : (
                <Button
                  variant={holds ? "danger-text" : "secondary"}
                  size="sm"
                  aria-label={`${holds ? "Cabut" : "Beri"} role ${roleLabel[role]}`}
                  onClick={() => onAsk({ change, role })}
                >
                  {holds ? "Cabut" : "Beri"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
