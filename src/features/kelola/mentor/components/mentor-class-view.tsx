"use client";

import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import { formatProjectDate } from "@/features/projects/project-model";
import { MENTOR_HREF, classHref } from "../area-hrefs";
import { blockedClassMessage } from "../mentor-text";
import { TABS, parseTab } from "../mentor-queue";
import { useMentorClass } from "../use-mentor-data";
import { MentorShell } from "./mentor-shell";
import { RosterTab } from "./roster-tab";
import { SubmissionsTab } from "./submissions-tab";
import { TasksTab } from "./tasks-tab";

const BACK = { href: MENTOR_HREF, label: "Kelas" };

/** One class for the Mentor: hand-ins, tasks and participants as three tabs kept in the address. */
export function MentorClassView({ slug, store }: { slug: string; store?: AssignmentStore }) {
  const data = useMentorClass(slug, { store });
  const params = useSearchParams();
  const tab = parseTab(params?.get("tab"));

  if (data.status === "error") {
    return (
      <MentorShell back={BACK}>
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>
          Kelas belum bisa dibuka karena data di perangkat ini tidak terbaca.
        </ErrorBanner>
      </MentorShell>
    );
  }
  if (data.status === "loading") {
    return (
      <div role="status" aria-label="Memuat kelas" className="mx-auto grid max-w-260 gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }
  if (data.status === "gone" || data.status === "blocked") {
    return (
      <MentorShell back={BACK}>
        <h1 className="heading-lg">
          {data.status === "gone" ? "Kelas ini tidak ditemukan." : "Tidak bisa dibuka."}
        </h1>
        <Notice>
          {data.status === "gone"
            ? "Alamatnya mungkin salah, atau kelasnya tidak ada lagi."
            : blockedClassMessage[data.reason]}
        </Notice>
        <ButtonLink href={MENTOR_HREF} variant="secondary" className="justify-self-start">
          Kembali ke daftar kelas
        </ButtonLink>
      </MentorShell>
    );
  }

  const { project, content, now, submissions, tasks, registration } = data;
  const started = now >= content.startsAt;
  return (
    <MentorShell back={BACK} wide>
      <header className="grid gap-1">
        <h1 className="heading-lg wrap-anywhere">{project.title}</h1>
        <p className="text-sm text-ink-muted">
          {started ? "Berjalan sejak" : "Dimulai"}{" "}
          {formatProjectDate(content.startsAt, project.timeZone)}
        </p>
      </header>
      <Tabs
        label="Bagian kelas"
        value={tab}
        items={TABS.map((t) => ({ ...t, href: classHref(slug, t.id) }))}
      />
      {tab === "pengumpulan" && (
        <SubmissionsTab
          content={content}
          submissions={submissions}
          statusParam={params?.get("status") ?? null}
          tab={tab}
        />
      )}
      {tab === "tugas" && (
        <TasksTab
          slug={slug}
          zone={project.timeZone}
          content={content}
          tasks={tasks}
          submissions={submissions}
          store={store}
        />
      )}
      {tab === "peserta" && (
        <RosterTab
          project={project}
          content={content}
          submissions={submissions}
          registration={registration}
          now={now}
        />
      )}
    </MentorShell>
  );
}
