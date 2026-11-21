"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, FeedItemSkeleton, Notice } from "@/components/ui/states";
import { SignInButton } from "@/features/account/components/auth-buttons";
import { useHydrated } from "@/features/account/hooks/use-hydrated";
import { personById } from "@/features/kelola/admin/people";
import { GroupManagement } from "@/features/kelola/admin/groups/group-management";
import { useActionStatus } from "@/features/kelola/admin/use-action-status";
import { BackShell } from "@/features/kelola/components/back-shell";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { isPlatformAdmin } from "@/lib/roles";
import { useViewer } from "@/lib/viewer";
import type { PostStore } from "../../storage/post-store";
import { joinGroup, removeGroupMember, type GroupResult } from "../group-actions";
import {
  ADMIN_GROUPS_HREF,
  GROUPS_HREF,
  canManageGroup,
  memberOf,
  type WritingGroup,
} from "../group-model";
import { writingGroups } from "../group-store";
import { useGroupReader } from "../group-viewer";
import { GroupPosts } from "./group-posts";
import { GroupHero } from "./group-seal";
import { GroupProgressSection } from "./group-progress";

type OnResult = (result: GroupResult, focus?: boolean) => void;

export function GroupLoading() {
  return <FeedItemSkeleton />;
}

function JoinPublicGroup({
  id,
  reader,
  onResult,
}: {
  id: string;
  reader: string | null;
  onResult: OnResult;
}) {
  const guest = useViewer() === "tamu";
  if (reader) {
    return (
      <Notice
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onResult(joinGroup(id, { type: "public" }), true)}
          >
            Gabung
          </Button>
        }
      >
        Gabung untuk membaca tulisan dan progres yang dibagikan anggota.
      </Notice>
    );
  }
  return (
    <Notice
      action={
        guest ? (
          <SignInButton variant="secondary" size="sm">
            Masuk
          </SignInButton>
        ) : undefined
      }
    >
      Akun aktif diperlukan untuk bergabung.
    </Notice>
  );
}

function LeaveGroup({ id, reader, onResult }: { id: string; reader: string; onResult: OnResult }) {
  const [leaving, setLeaving] = useState(false);
  return (
    <div className="border-t border-line pt-4">
      <Button variant="text" onClick={() => setLeaving(true)}>
        Keluar dari grup
      </Button>
      {leaving && (
        <Dialog
          open
          role="alertdialog"
          onClose={() => setLeaving(false)}
          title="Keluar dari grup?"
          description="Anggota tidak bisa lagi membaca tulisan atau progres yang telah kamu bagikan di grup ini."
          actions={
            <>
              <Button variant="secondary" onClick={() => setLeaving(false)}>
                Batal
              </Button>
              <Button
                onClick={() => {
                  setLeaving(false);
                  onResult(removeGroupMember(id, reader), true);
                }}
              >
                Keluar
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}

function MemberList({ group }: { group: WritingGroup }) {
  return (
    <section className="grid gap-3 border-t border-line pt-5" aria-labelledby="group-members">
      <h2 id="group-members" className="heading-md">
        Anggota
      </h2>
      <ul aria-label="Anggota grup" className="divide-y divide-line">
        {group.members.map((member) => {
          const author = personById(member.authorId);
          return (
            <li key={member.authorId} className="py-2 text-sm wrap-anywhere">
              {author ? `${author.name} · @${author.handle}` : "Penulis"}
              {member.admin && " · Admin Grup"}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function GroupDetail({
  group,
  reader,
  admin,
  platform,
  posts,
  documents,
  onResult,
}: {
  group: WritingGroup;
  reader: string | null;
  admin: boolean;
  platform: boolean;
  posts: PostStore | undefined;
  documents: DocumentStore | undefined;
  onResult: OnResult;
}) {
  const member = memberOf(group, reader);
  const manager = canManageGroup(group, reader, platform);

  return (
    <>
      <GroupHero group={group} />
      {admin && reader && (
        <GroupManagement
          group={group}
          reader={reader}
          platform={platform}
          admin
          onResult={onResult}
        />
      )}
      {!admin &&
        (member && reader ? (
          <>
            <MemberList group={group} />
            <GroupPosts groupId={group.id} manager={manager} store={posts} onResult={onResult} />
            <GroupProgressSection
              group={group}
              reader={reader}
              store={documents}
              onResult={onResult}
            />
            {manager && (
              <GroupManagement
                group={group}
                reader={reader}
                platform={platform}
                admin={false}
                onResult={onResult}
              />
            )}
            <LeaveGroup id={group.id} reader={reader} onResult={onResult} />
          </>
        ) : (
          <JoinPublicGroup id={group.id} reader={reader} onResult={onResult} />
        ))}
    </>
  );
}

export function GroupView({
  id,
  admin = false,
  posts,
  documents,
}: {
  id: string;
  admin?: boolean;
  posts?: PostStore;
  documents?: DocumentStore;
}) {
  const groups = writingGroups.use();
  const reader = useGroupReader();
  const ready = useHydrated();
  const platform = isPlatformAdmin(useEffectiveRoles());
  const { message, statusRef, show } = useActionStatus();
  const [failed, setFailed] = useState(false);
  const group = groups.find((item) => item.id === id);
  const allowed =
    group && (admin ? platform : Boolean(memberOf(group, reader)) || group.visibility === "publik");

  function report(result: GroupResult, focus = false) {
    setFailed(!result.ok);
    show(result.message, focus);
  }

  return (
    <BackShell
      back={
        admin
          ? { href: ADMIN_GROUPS_HREF, label: "Semua grup" }
          : { href: GROUPS_HREF, label: "Grup Penulis" }
      }
    >
      <p
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className={`text-sm outline-none empty:sr-only ${failed ? "text-danger" : ""}`}
      >
        {message}
      </p>
      {!ready ? (
        <GroupLoading />
      ) : !allowed ? (
        <EmptyState>
          {admin && !platform
            ? "Hanya Administrator dan Super Admin yang bisa membuka halaman ini."
            : "Grup ini tidak tersedia."}
        </EmptyState>
      ) : (
        <GroupDetail
          group={group}
          reader={reader}
          admin={admin}
          platform={platform}
          posts={posts}
          documents={documents}
          onResult={report}
        />
      )}
    </BackShell>
  );
}
