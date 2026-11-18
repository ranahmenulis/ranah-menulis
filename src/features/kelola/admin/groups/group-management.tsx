"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/field";
import { Notice } from "@/components/ui/states";
import { people, personLabel } from "@/features/kelola/admin/people";
import { useSuspensions } from "@/features/kelola/admin/role-store";
import { REASON_EMPTY } from "@/features/kelola/admin/admin-actions";
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
    else setError(result.message);
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Undang anggota"
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          {candidates.length > 0 && (
            <Button form={formId} type="submit" disabled={!target}>
              Undang
            </Button>
          )}
        </>
      }
    >
      {candidates.length > 0 ? (
        <form id={formId} onSubmit={submit} className="grid gap-3">
          <Field id={personId} label="Penulis">
            <Select
              id={personId}
              value={target}
              onChange={(event) => {
                setTarget(event.target.value);
                setError("");
              }}
            >
              <option value="" disabled>
                Pilih penulis
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
        <Notice>Semua penulis yang tersedia sudah bergabung atau diundang.</Notice>
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
  const [ask, setAsk] = useState<ManagementAction | null>(null);
  const close = () => setAsk(null);

  function complete(result: GroupResult, focus = false) {
    close();
    onResult(result, focus);
  }

  return (
    <section aria-labelledby="manage-group" className="grid gap-4 border-t border-line pt-5">
      <h2 id="manage-group" className="heading-md">
        Kelola grup
      </h2>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setAsk({ type: "edit" })}>
          Ubah grup
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setAsk({ type: "invite" })}>
          Undang anggota
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <p>
          Kode undangan <code className="font-medium">{group.code}</code>
        </p>
        <Button variant="text" size="sm" onClick={() => setAsk({ type: "code" })}>
          Ganti kode
        </Button>
      </div>
      {group.invites.length > 0 && (
        <p className="text-sm wrap-anywhere text-ink-muted">
          Menunggu jawaban dari{" "}
          {group.invites.map((invite) => personLabel(invite.authorId)).join(", ")}.
        </p>
      )}
      {!group.members.some((member) => member.admin) && (
        <Notice>
          Belum ada Admin Grup. Administrator bisa menunjuk pengganti dari anggota grup.
        </Notice>
      )}
      {group.members.length ? (
        <ul aria-label="Kelola anggota" className="divide-y divide-line border-y border-line">
          {group.members.map((member) => (
            <li
              key={member.authorId}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <p className="min-w-0 text-sm wrap-anywhere">
                {personLabel(member.authorId)}
                {member.admin && " · Admin Grup"}
              </p>
              <div className="flex flex-wrap gap-1">
                {platform &&
                  (member.admin ? (
                    <Button
                      variant="text"
                      size="sm"
                      aria-label={`Cabut Admin Grup dari ${personLabel(member.authorId)}`}
                      onClick={() => setAsk({ type: "revoke", member })}
                    >
                      Cabut Admin Grup
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label={`Jadikan Admin Grup untuk ${personLabel(member.authorId)}`}
                      onClick={() => onResult(setGroupAdmin(group.id, member.authorId, true), true)}
                    >
                      Jadikan Admin Grup
                    </Button>
                  ))}
                {member.authorId !== reader && (!member.admin || platform) && (
                  <Button
                    variant="danger-text"
                    size="sm"
                    aria-label={`Keluarkan ${personLabel(member.authorId)}`}
                    onClick={() => setAsk({ type: "remove", member })}
                  >
                    Keluarkan
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">Belum ada anggota.</p>
      )}
      {ask?.type === "edit" && (
        <GroupSettingsDialog
          group={group}
          admin={admin}
          onClose={close}
          onSaved={(_id, message) => complete({ ok: true, message })}
        />
      )}
      {ask?.type === "invite" && (
        <InviteDialog group={group} onClose={close} onSuccess={complete} />
      )}
      {ask?.type === "code" && (
        <Dialog
          open
          onClose={close}
          title="Ganti kode undangan?"
          description="Kode lama langsung berhenti berlaku. Undangan langsung tetap bisa diterima."
          actions={
            <>
              <Button variant="secondary" onClick={close}>
                Batal
              </Button>
              <Button onClick={() => complete(rotateGroupCode(group.id))}>Ganti kode</Button>
            </>
          }
        />
      )}
      {ask?.type === "remove" && (
        <ReasonDialog
          title="Keluarkan anggota"
          confirmLabel="Keluarkan"
          emptyMessage={REASON_EMPTY}
          busy={false}
          hint={`Akses dan kontribusi ${personLabel(ask.member.authorId)} di grup ini akan dicabut.`}
          onClose={close}
          onConfirm={(reason) =>
            complete(removeGroupMember(group.id, ask.member.authorId, reason), true)
          }
        />
      )}
      {ask?.type === "revoke" && (
        <ReasonDialog
          title="Cabut Admin Grup"
          confirmLabel="Cabut Admin Grup"
          emptyMessage={REASON_EMPTY}
          busy={false}
          hint={`${personLabel(ask.member.authorId)} tetap menjadi anggota grup.`}
          onClose={close}
          onConfirm={(reason) =>
            complete(setGroupAdmin(group.id, ask.member.authorId, false, reason), true)
          }
        />
      )}
    </section>
  );
}
