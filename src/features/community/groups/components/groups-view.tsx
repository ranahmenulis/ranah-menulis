"use client";

import { Globe, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { Campfire, LitWindows } from "@/components/illustrations/community-art";
import { Button, ButtonLink } from "@/components/ui/button";
import { cardClass } from "@/components/ui/card";
import { Section } from "@/components/ui/section-card";
import { EmptyState, FeedItemSkeleton, Notice } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { SignInButton } from "@/features/account/components/auth-buttons";
import { useHydrated } from "@/features/account/hooks/use-hydrated";
import { DISCOVER_HREF } from "@/features/app-shell/nav";
import { BackShell } from "@/features/kelola/components/back-shell";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { format, useT } from "@/lib/i18n/provider";
import { isPlatformAdmin } from "@/lib/roles";
import { useViewer } from "@/lib/viewer";
import { CommunityEmpty } from "../../components/community-empty";
import { CommunityFrame } from "../../components/community-frame";
import { CommunityHero } from "../../components/community-hero";
import { adminGroupHref, groupHref, groupsFor, type WritingGroup } from "../group-model";
import { writingGroups } from "../group-store";
import { useGroupReader } from "../group-viewer";
import { GroupSettingsDialog, JoinCodeDialog } from "./group-dialogs";
import { GroupInvitations } from "./group-invitations";
import { GroupSeal } from "./group-seal";

function GroupList({
  groups,
  admin = false,
}: {
  groups: readonly WritingGroup[];
  admin?: boolean;
}) {
  const t = useT().groups.list;
  return (
    <ul className="grid divide-y divide-line">
      {groups.map((group, index) => (
        <li
          key={group.id}
          className="rm-row-in group/row relative -mx-2 flex items-start gap-4 rounded-xl px-2 py-4 transition-colors first:pt-2 last:pb-2 hover:bg-accent-subtle/60"
          style={{ "--i": Math.min(index, 12) } as CSSProperties}
        >
          <GroupSeal
            group={group}
            className="transition-[rotate] duration-500 group-hover/row:rotate-12 motion-reduce:transition-none"
          />
          <div className="grid min-w-0 gap-1">
            <TextLink
              href={admin ? adminGroupHref(group.id) : groupHref(group.id)}
              className="font-medium wrap-anywhere after:absolute after:inset-0"
            >
              {group.name}
            </TextLink>
            <p className="text-sm text-ink-muted">
              {group.visibility === "publik" ? t.public : t.private} ·{" "}
              {format(t.members, { count: String(group.members.length) })}
              {admin && !group.members.some((member) => member.admin) && ` · ${t.noAdmin}`}
            </p>
            {group.description && <p className="text-sm wrap-anywhere">{group.description}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function PublicDirectory({
  groups,
  reader,
  onCode,
}: {
  groups: readonly WritingGroup[];
  reader: string | null;
  onCode: () => void;
}) {
  const t = useT().groups.list;
  const guest = useViewer() === "tamu";
  const mine = groupsFor(groups, reader);
  const discoverable = groups.filter(
    (group) => group.visibility === "publik" && !mine.includes(group),
  );
  // From a wide container My groups and Public groups stand side by side.
  return (
    <>
      <GroupInvitations groups={groups} reader={reader} />
      <div className="grid items-start gap-5 md:gap-6 @4xl:grid-cols-2">
        {reader && (
          <Section id="my-groups" title={t.mine} icon={UsersThree}>
            {mine.length > 0 ? (
              <GroupList groups={mine} />
            ) : (
              <CommunityEmpty
                art={Campfire}
                action={
                  <Button variant="secondary" size="sm" onClick={onCode}>
                    {t.joinWithCode}
                  </Button>
                }
              >
                {t.none}
              </CommunityEmpty>
            )}
          </Section>
        )}
        <Section id="public-groups" title={t.publicTitle} icon={Globe}>
          {discoverable.length > 0 ? (
            <GroupList groups={discoverable} />
          ) : (
            <CommunityEmpty
              art={LitWindows}
              action={
                <ButtonLink href={DISCOVER_HREF} variant="secondary" size="sm">
                  {t.toCommunity}
                </ButtonLink>
              }
            >
              {t.noPublic}
            </CommunityEmpty>
          )}
          {!reader && (
            <p className="text-sm text-ink-muted">
              {t.needAccount} {guest && <SignInButton variant="text">{t.signIn}</SignInButton>}
            </p>
          )}
        </Section>
      </div>
    </>
  );
}

/** Every group, for Administrators and Super Admins (Kelola · Admin · Grup). */
function AdminGroups({
  groups,
  ready,
  platform,
}: {
  groups: readonly WritingGroup[];
  ready: boolean;
  platform: boolean;
}) {
  const t = useT().groups.list;
  if (!ready) return <FeedItemSkeleton />;
  if (!platform) return <Notice>{t.adminOnly}</Notice>;
  if (groups.length === 0) return <EmptyState>{t.empty}</EmptyState>;
  return (
    <div className={cardClass}>
      <GroupList groups={groups} admin />
    </div>
  );
}

export function GroupsView({ admin = false }: { admin?: boolean }) {
  const t = useT().groups.list;
  const router = useRouter();
  const groups = writingGroups.use();
  const ready = useHydrated();
  const reader = useGroupReader();
  const platform = isPlatformAdmin(useEffectiveRoles());
  const [dialog, setDialog] = useState<"create" | "code" | null>(null);

  function openGroup(id: string) {
    setDialog(null);
    router.push(admin ? adminGroupHref(id) : groupHref(id));
  }

  const dialogs = (
    <>
      {dialog === "create" && (
        <GroupSettingsDialog admin={admin} onSaved={openGroup} onClose={() => setDialog(null)} />
      )}
      {dialog === "code" && <JoinCodeDialog onJoined={openGroup} onClose={() => setDialog(null)} />}
    </>
  );

  if (admin) {
    return (
      <BackShell back={{ href: "/kelola/admin", label: t.backAdmin }}>
        <header className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="heading-lg">{t.titleAdmin}</h1>
          {reader && platform && <Button onClick={() => setDialog("create")}>{t.create}</Button>}
        </header>
        <AdminGroups groups={groups} ready={ready} platform={platform} />
        {dialogs}
      </BackShell>
    );
  }

  const mine = groupsFor(groups, reader).length;
  const invitations = groups.filter((group) =>
    group.invites.some((invite) => invite.authorId === reader),
  ).length;
  const publicCount = groups.filter((group) => group.visibility === "publik").length;
  return (
    <CommunityFrame>
      <CommunityHero
        titleId="groups-title"
        title={t.title}
        body={t.hero.body}
        art={Campfire}
        figure={
          reader
            ? { value: ready ? mine : null, label: t.hero.mine }
            : { value: ready ? publicCount : null, label: t.hero.public }
        }
        stats={
          ready && reader
            ? [
                { label: t.hero.invitations, value: invitations },
                { label: t.hero.publicStat, value: publicCount },
              ]
            : []
        }
        actions={
          reader && (
            <>
              <Button onClick={() => setDialog("create")}>{t.create}</Button>
              <Button variant="secondary" onClick={() => setDialog("code")}>
                {t.enterCode}
              </Button>
            </>
          )
        }
      />
      {!ready ? (
        <FeedItemSkeleton />
      ) : (
        <PublicDirectory groups={groups} reader={reader} onCode={() => setDialog("code")} />
      )}
      {dialogs}
    </CommunityFrame>
  );
}
