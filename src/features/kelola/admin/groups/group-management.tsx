"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/field";
import { Notice } from "@/components/ui/states";
import { people, personLabel } from "@/features/kelola/admin/people";
import { useSuspensions } from "@/features/kelola/admin/role-store";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { groupMessage } from "@/features/community/groups/group-messages";
import { ReasonDialog } from "@/features/kelola/components/reason-dialog";
import {
  inviteToGroup,
  removeGroupMember,
  rotateGroupCode,
  setGroupAdmin,
  type GroupResult,
} from "@/features/community/groups/group-actions";
import {
  memberOf,
  type GroupMember,
  type WritingGroup,
} from "@/features/community/groups/group-model";
import { JoinRequestList } from "./join-request-list";
import { GroupSettingsDialog } from "@/features/community/groups/components/group-dialogs";

type ManagementAction =
  { type: "edit" | "code" | "invite" } | { type: "remove" | "revoke"; member: GroupMember };

function InviteDialog({
  group,
  onClose,
  onSuccess,
}: {
  group: WritingGroup;
  onClose: () => void;
  onSuccess: (result: GroupResult) => void;
}) {
  const dict = useT().groups;
  const t = dict.manage;
  const locale = useLocale();
  const suspensions = useSuspensions();
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const formId = useId();
  const personId = `${formId}-person`;
  const candidates = people.filter(
    (person) =>
      !memberOf(group, person.id) &&
      !group.invites.some((item) => item.authorId === person.id) &&
      !suspensions.some((item) => item.userId === person.id),
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = inviteToGroup(group.id, target);
    if (result.ok) onSuccess(result);
    else setError(groupMessage(result.code, dict.messages, locale));
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={t.inviteTitle}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.cancel}
          </Button>
          {candidates.length > 0 && (
            <Button form={formId} type="submit" disabled={!target}>
              {t.inviteConfirm}
            </Button>
          )}
        </>
      }
    >
      {candidates.length > 0 ? (
        <form id={formId} onSubmit={submit} className="grid gap-3">
          <Field id={personId} label={t.personLabel}>
            <Select
              id={personId}
              value={target}
              onChange={(event) => {
                setTarget(event.target.value);
                setError("");
              }}
            >
              <option value="" disabled>
                {t.choosePerson}
              </option>
              {candidates.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </Select>
          </Field>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </form>
      ) : (
        <Notice>{t.noCandidates}</Notice>
      )}
    </Dialog>
  );
}

export function GroupManagement({
  group,
  reader,
  platform,
  admin,
  onResult,
}: {
  group: WritingGroup;
  reader: string;
  platform: boolean;
  admin: boolean;
  onResult: (result: GroupResult, focus?: boolean) => void;
}) {
  const t = useT().groups.manage;
  const locale = useLocale();
  const reasonEmpty = useT().groups.messages.reasonEmpty;
  const [ask, setAsk] = useState<ManagementAction | null>(null);
  const close = () => setAsk(null);

  function complete(result: GroupResult, focus = false) {
    close();
    onResult(result, focus);
  }

  return (
    <section aria-labelledby="manage-group" className="grid gap-4 border-t border-line pt-5">
      <h2 id="manage-group" className="heading-md">
        {t.title}
      </h2>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setAsk({ type: "edit" })}>
          {t.edit}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setAsk({ type: "invite" })}>
          {t.invite}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <p>
          {t.code} <code className="font-medium">{group.code}</code>
        </p>
        <Button variant="text" size="sm" onClick={() => setAsk({ type: "code" })}>
          {t.rotate}
        </Button>
      </div>
      {group.invites.length > 0 && (
        <p className="text-sm wrap-anywhere text-ink-muted">
          {format(t.waiting, {
            names: group.invites.map((invite) => personLabel(invite.authorId, locale)).join(", "),
          })}
        </p>
      )}
      <JoinRequestList group={group} onResult={onResult} />
      {!group.members.some((member) => member.admin) && <Notice>{t.noAdminNotice}</Notice>}
      {group.members.length ? (
        <ul aria-label={t.membersLabel} className="divide-y divide-line border-y border-line">
          {group.members.map((member) => (
            <li
              key={member.authorId}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <p className="min-w-0 text-sm wrap-anywhere">
                {personLabel(member.authorId, locale)}
                {member.admin && ` · ${t.adminTag}`}
              </p>
              <div className="flex flex-wrap gap-1">
                {platform &&
                  (member.admin ? (
                    <Button
                      variant="text"
                      size="sm"
                      aria-label={format(t.revokeAria, {
                        name: personLabel(member.authorId, locale),
                      })}
                      onClick={() => setAsk({ type: "revoke", member })}
                    >
                      {t.revoke}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label={format(t.grantAria, {
                        name: personLabel(member.authorId, locale),
                      })}
                      onClick={() => onResult(setGroupAdmin(group.id, member.authorId, true), true)}
                    >
                      {t.grant}
                    </Button>
                  ))}
                {member.authorId !== reader && (!member.admin || platform) && (
                  <Button
                    variant="danger-text"
                    size="sm"
                    aria-label={format(t.removeAria, {
                      name: personLabel(member.authorId, locale),
                    })}
                    onClick={() => setAsk({ type: "remove", member })}
                  >
                    {t.remove}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">{t.noMembers}</p>
      )}
      {ask?.type === "edit" && (
        <GroupSettingsDialog
          group={group}
          admin={admin}
          onClose={close}
          onSaved={(_id, result) => complete(result)}
        />
      )}
      {ask?.type === "invite" && (
        <InviteDialog group={group} onClose={close} onSuccess={complete} />
      )}
      {ask?.type === "code" && (
        <Dialog
          open
          onClose={close}
          title={t.rotateTitle}
          description={t.rotateBody}
          actions={
            <>
              <Button variant="secondary" onClick={close}>
                {t.cancel}
              </Button>
              <Button onClick={() => complete(rotateGroupCode(group.id))}>{t.rotate}</Button>
            </>
          }
        />
      )}
      {ask?.type === "remove" && (
        <ReasonDialog
          title={t.removeTitle}
          confirmLabel={t.remove}
          emptyMessage={reasonEmpty}
          busy={false}
          hint={format(t.removeHint, { name: personLabel(ask.member.authorId, locale) })}
          onClose={close}
          onConfirm={(reason) =>
            complete(removeGroupMember(group.id, ask.member.authorId, reason), true)
          }
        />
      )}
      {ask?.type === "revoke" && (
        <ReasonDialog
          title={t.revokeTitle}
          confirmLabel={t.revoke}
          emptyMessage={reasonEmpty}
          busy={false}
          hint={format(t.revokeHint, { name: personLabel(ask.member.authorId, locale) })}
          onClose={close}
          onConfirm={(reason) =>
            complete(setGroupAdmin(group.id, ask.member.authorId, false, reason), true)
          }
        />
      )}
    </section>
  );
}
