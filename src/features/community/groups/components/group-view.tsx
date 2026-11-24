"use client";

import { UsersThree } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/ui/section-card";
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
import { useLocale, useT } from "@/lib/i18n/provider";
import { useViewer } from "@/lib/viewer";
import type { PostStore } from "../../storage/post-store";
import { joinGroup, removeGroupMember, type GroupResult } from "../group-actions";
import { groupMessage } from "../group-messages";
import {
  ADMIN_GROUPS_HREF,
  GROUPS_HREF,
  canManageGroup,
  memberOf,
  type WritingGroup,
} from "../group-model";
import { writingGroups } from "../group-store";
import { useGroupReader } from "../group-viewer";
import { CircleStats } from "./circle-stats";
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
  const t = useT().groups.view;
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
            {t.join}
          </Button>
        }
      >
        {t.joinBody}
      </Notice>
    );
  }
  return (
    <Notice
      action={
        guest ? (
          <SignInButton variant="secondary" size="sm">
            {t.signIn}
          </SignInButton>
        ) : undefined
      }
    >
      {t.needAccount}
    </Notice>
  );
}

function LeaveGroup({ id, reader, onResult }: { id: string; reader: string; onResult: OnResult }) {
  const t = useT().groups.view;
  const [leaving, setLeaving] = useState(false);
  return (
    <div>
      <Button variant="text" onClick={() => setLeaving(true)}>
        {t.leave}
      </Button>
      {leaving && (
        <Dialog
          open
          role="alertdialog"
          onClose={() => setLeaving(false)}
          title={t.leaveTitle}
          description={t.leaveBody}
          actions={
            <>
              <Button variant="secondary" onClick={() => setLeaving(false)}>
                {t.cancel}
              </Button>
              <Button
                onClick={() => {
                  setLeaving(false);
                  onResult(removeGroupMember(id, reader), true);
                }}
              >
                {t.leaveConfirm}
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}

function MemberList({ group }: { group: WritingGroup }) {
  const t = useT().groups.view;
  return (
    <Section id="group-members" title={t.membersTitle} icon={UsersThree} className="gap-3">
      <ul aria-label={t.membersLabel} className="divide-y divide-line">
        {group.members.map((member) => {
          const author = personById(member.authorId);
          return (
            <li
              key={member.authorId}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm wrap-anywhere"
            >
              <span className="min-w-0">
                {author ? `${author.name} · @${author.handle}` : t.writer}
              </span>
              {member.admin && (
                <span className="inline-flex h-6 items-center rounded-full bg-accent-subtle px-2.5 text-xs font-medium text-accent-ink">
                  {t.adminTag}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
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
            <CircleStats group={group} />
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
  const t = useT().groups;
  const dict = t;
  const locale = useLocale();
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
    show(groupMessage(result.code, dict.messages, locale), focus);
  }

  return (
    <BackShell
      back={
        admin
          ? { href: ADMIN_GROUPS_HREF, label: t.view.allGroups }
          : { href: GROUPS_HREF, label: t.list.title }
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
        <EmptyState>{admin && !platform ? t.view.adminOnlyPage : t.view.notAvailable}</EmptyState>
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
