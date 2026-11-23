"use client";

import { Button } from "@/components/ui/button";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { MANAGER_ROLES, type ManagerRole } from "@/lib/roles";
import { blockText, roleChangeBlock, type RuleBlock } from "../role-rules";
import type { RoleGrant, Suspension } from "../role-store";
import type { UserRow } from "../user-model";
import { ME_ID } from "../../identity";

export type RoleAsk = { change: "grant" | "revoke"; role: ManagerRole };

type ShortBlock = keyof ReturnType<typeof useT>["kelolaAdmin"]["user"]["short"];

/** Blocks that get a short note beside the role instead of the full sentence. */
const isShort = (block: RuleBlock): block is RuleBlock & ShortBlock =>
  block === "hanya-super-admin" ||
  block === "target-tingkat-administrator" ||
  block === "super-admin-terakhir" ||
  block === "diri-sendiri";

/**
 * One row per management role: held or not, and the button that gives or takes it. The buttons only
 * open the confirmation; the action re-checks the rules when it runs.
 */
export function RoleSection({
  user,
  actorRoles,
  grants,
  suspensions,
  onAsk,
}: {
  user: UserRow;
  actorRoles: readonly ManagerRole[];
  grants: readonly RoleGrant[];
  suspensions: readonly Suspension[];
  onAsk: (ask: RoleAsk) => void;
}) {
  const t = useT().kelolaAdmin;
  const locale = useLocale();
  return (
    <section aria-labelledby="role-title" className="grid gap-2">
      <h2 id="role-title" className="heading-md">
        {t.user.roleTitle}
      </h2>
      <ul className="border-t border-line">
        {MANAGER_ROLES.map((role) => {
          const holds = user.roles.includes(role);
          const change = holds ? "revoke" : "grant";
          const block = roleChangeBlock(
            { actorRoles, actorId: ME_ID, grants, suspensions, targetId: user.id },
            role,
            change,
          );
          return (
            <li
              key={role}
              className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line py-2"
            >
              <span className="text-sm">
                <span className="font-medium">{t.roles[role]}</span>
                <span className="text-ink-muted"> · {holds ? t.user.held : t.user.notHeld}</span>
              </span>
              {block ? (
                <span title={blockText(block, locale)} className="text-xs text-ink-muted">
                  {isShort(block) ? t.user.short[block] : t.user.unavailable}
                </span>
              ) : (
                <Button
                  variant={holds ? "danger-text" : "secondary"}
                  size="sm"
                  aria-label={format(holds ? t.user.revokeAria : t.user.grantAria, {
                    role: t.roles[role],
                  })}
                  onClick={() => onAsk({ change, role })}
                >
                  {holds ? t.user.revoke : t.user.grant}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
