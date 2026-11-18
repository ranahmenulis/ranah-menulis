"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, FeedItemSkeleton, Notice } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { SignInButton } from "@/features/account/components/auth-buttons";
import { useHydrated } from "@/features/account/hooks/use-hydrated";
import { HOME_HREF } from "@/features/app-shell/nav";
import { BackShell } from "@/features/kelola/components/back-shell";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { isPlatformAdmin } from "@/lib/roles";
import { useViewer } from "@/lib/viewer";
import { adminGroupHref, groupHref, groupsFor, type WritingGroup } from "../group-model";
import { writingGroups } from "../group-store";
import { useGroupReader } from "../group-viewer";
import { GroupSettingsDialog, JoinCodeDialog } from "./group-dialogs";
import { GroupInvitations } from "./group-invitations";

function GroupList({
  groups,
  admin = false,
}: {
  groups: readonly WritingGroup[];
  admin?: boolean;
}) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {groups.map((group) => (
        <li key={group.id} className="grid gap-1 py-4">
          <TextLink
            href={admin ? adminGroupHref(group.id) : groupHref(group.id)}
            className="font-medium wrap-anywhere"
          >
            {group.name}
          </TextLink>
          <p className="text-sm text-ink-muted">
            {group.visibility === "publik" ? "Publik" : "Privat"} · {group.members.length} anggota
            {admin && !group.members.some((member) => member.admin) && " · Belum ada Admin Grup"}
          </p>
          {group.description && <p className="text-sm wrap-anywhere">{group.description}</p>}
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
  const guest = useViewer() === "tamu";
  const mine = groupsFor(groups, reader);
  const discoverable = groups.filter(
    (group) => group.visibility === "publik" && !mine.includes(group),
  );
  return (
    <>
      <GroupInvitations groups={groups} reader={reader} />
      {reader && (
        <section aria-labelledby="my-groups" className="grid gap-3">
          <h2 id="my-groups" className="heading-md">
            Grup saya
          </h2>
          {mine.length > 0 ? (
            <GroupList groups={mine} />
          ) : (
            <EmptyState
              action={
                <Button variant="secondary" onClick={onCode}>
                  Gabung dengan kode
                </Button>
              }
            >
              Kamu belum bergabung dengan grup.
            </EmptyState>
          )}
        </section>
      )}
      <section aria-labelledby="public-groups" className="grid gap-3">
        <h2 id="public-groups" className="heading-md">
          Grup publik
        </h2>
        {discoverable.length > 0 ? (
          <GroupList groups={discoverable} />
        ) : (
          <EmptyState
            action={
              <ButtonLink href={HOME_HREF} variant="secondary">
                Kembali ke Beranda
              </ButtonLink>
            }
          >
            Belum ada grup publik lain.
          </EmptyState>
        )}
        {!reader && (
          <p className="text-sm text-ink-muted">
            Akun aktif diperlukan untuk membuat atau bergabung dengan grup.{" "}
            {guest && <SignInButton variant="text">Masuk</SignInButton>}
          </p>
        )}
      </section>
    </>
  );
}

export function GroupsView({ admin = false }: { admin?: boolean }) {
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

  return (
    <BackShell
      back={
        admin ? { href: "/kelola/admin", label: "Admin" } : { href: HOME_HREF, label: "Beranda" }
      }
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="heading-lg">{admin ? "Kelola Grup Penulis" : "Grup Penulis"}</h1>
        {reader && (!admin || platform) && (
          <div className="flex flex-wrap gap-2">
            {!admin && (
              <Button variant="secondary" onClick={() => setDialog("code")}>
                Masukkan kode
              </Button>
            )}
            <Button onClick={() => setDialog("create")}>Buat grup</Button>
          </div>
        )}
      </header>
      {!ready ? (
        <FeedItemSkeleton />
      ) : admin ? (
        platform ? (
          groups.length > 0 ? (
            <GroupList groups={groups} admin />
          ) : (
            <EmptyState>Belum ada grup.</EmptyState>
          )
        ) : (
          <Notice>Hanya Administrator dan Super Admin yang bisa membuka daftar ini.</Notice>
        )
      ) : (
        <PublicDirectory groups={groups} reader={reader} onCode={() => setDialog("code")} />
      )}
      {dialog === "create" && (
        <GroupSettingsDialog admin={admin} onSaved={openGroup} onClose={() => setDialog(null)} />
      )}
      {dialog === "code" && <JoinCodeDialog onJoined={openGroup} onClose={() => setDialog(null)} />}
    </BackShell>
  );
}
