"use client";

import { useRef, useState } from "react";
import { EmptyState } from "@/components/ui/states";
import { BackShell } from "../../components/back-shell";
import { ReasonDialog } from "../../components/reason-dialog";
import { ME_ID } from "../../identity";
import { useEffectiveRoles } from "../../use-effective-roles";
import { ADMIN_HREF } from "../area-hrefs";
import {
  restoreUser,
  revokeRole,
  grantRole,
  suspendUser,
  type AdminResult,
} from "../admin-actions";
import { accountChangeBlock, needsReason } from "../role-rules";
import { useRoleGrants, useSuspensions } from "../role-store";
import { useAdminUser } from "../use-admin-data";
import { roleLabel } from "../user-model";
import { RoleSection, type RoleAsk } from "./role-section";
import { AccountSection, AssignmentsSection, HistorySection } from "./user-sections";

type Ask = RoleAsk | { change: "suspend" | "restore"; role?: undefined };

function dialogText(ask: Ask) {
  const role = ask.role ? roleLabel[ask.role] : "";
  switch (ask.change) {
    case "grant":
      return {
        title: `Beri role ${role}`,
        hint: "Pemberian role dicatat di log.",
        ok: "Beri role",
      };
    case "revoke":
      return {
        title: `Cabut role ${role}`,
        hint: "Penugasan orang ini pada role itu ikut dicabut. Pencabutan dicatat di log.",
        ok: "Cabut role",
      };
    case "suspend":
      return {
        title: "Tangguhkan akun",
        hint: "Rolenya berhenti berlaku dan ia tidak bisa ditugaskan. Dicatat di log.",
        ok: "Tangguhkan",
      };
    case "restore":
      return {
        title: "Pulihkan akun",
        hint: "Rolenya berlaku lagi. Dicatat di log.",
        ok: "Pulihkan",
      };
  }
}

function run(id: string, ask: Ask, reason: string): AdminResult {
  if (ask.change === "grant") return grantRole(id, ask.role, reason);
  if (ask.change === "revoke") return revokeRole(id, ask.role, reason);
  return ask.change === "suspend" ? suspendUser(id, reason) : restoreUser(id, reason);
}

/**
 * One person on the Admin screen: roles, account, assignments and the log about them. A change goes
 * through a confirmation, and the result is said in the status line, which takes focus because the
 * button that opened the dialog may no longer be there.
 */
export function UserView({ id }: { id: string }) {
  const state = useAdminUser(id);
  const roles = useEffectiveRoles();
  const grants = useRoleGrants();
  const suspended = useSuspensions();
  const [ask, setAsk] = useState<Ask | null>(null);
  const [said, setSaid] = useState<AdminResult | null>(null);
  const status = useRef<HTMLParagraphElement>(null);

  const back = { href: ADMIN_HREF, label: "Semua pengguna" };
  if (state.status === "gone") {
    return (
      <BackShell back={back}>
        <EmptyState>Pengguna ini tidak ditemukan.</EmptyState>
      </BackShell>
    );
  }
  const { user, assignments, history } = state;
  const context = {
    actorRoles: roles,
    actorId: ME_ID,
    grants,
    suspensions: suspended,
    targetId: id,
  };
  const accountChange = user.suspended ? "restore" : "suspend";
  const accountBlock = accountChangeBlock(context, accountChange);
  const text = ask ? dialogText(ask) : null;

  function confirm(reason: string) {
    if (!ask) return;
    const result = run(id, ask, reason);
    setSaid(result);
    setAsk(null);
    requestAnimationFrame(() => status.current?.focus());
  }

  return (
    <BackShell back={back}>
      <header className="grid gap-1">
        <h1 className="heading-lg wrap-anywhere">{user.name}</h1>
        <p className="text-sm text-ink-muted">
          @{user.handle}
          {user.suspended && " · Ditangguhkan"}
          {id === ME_ID && " · Akunmu"}
        </p>
      </header>
      <p
        ref={status}
        role="status"
        tabIndex={-1}
        className={`min-h-5 text-sm outline-none ${said && !said.ok ? "text-danger" : ""}`}
      >
        {said?.message}
      </p>
      <RoleSection user={user} actorRoles={roles} onAsk={setAsk} />
      <AccountSection
        suspended={user.suspended}
        block={accountBlock}
        onAsk={() => setAsk({ change: accountChange })}
      />
      <AssignmentsSection assignments={assignments} />
      <HistorySection history={history} />
      {ask && text && (
        <ReasonDialog
          title={text.title}
          hint={text.hint}
          fieldLabel="Alasan"
          required={needsReason(ask.role ?? null, ask.change)}
          emptyMessage="Tulis alasannya. Alasan tercatat di log."
          confirmLabel={text.ok}
          busy={false}
          onConfirm={confirm}
          onClose={() => setAsk(null)}
        />
      )}
    </BackShell>
  );
}
