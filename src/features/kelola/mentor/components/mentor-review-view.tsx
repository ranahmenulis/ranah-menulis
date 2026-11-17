"use client";

import { useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import { DUMMY_USER } from "@/features/app-shell/nav";
import { notifyAssignmentsChanged } from "@/features/projects/kelas/storage/assignment-events";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import { assignmentStore } from "@/features/projects/kelas/storage/store";
import { StatusTugas } from "@/features/projects/kelas/components/status-tugas";
import type { AssignmentSubmission } from "@/features/projects/kelas/types";
import { formatNumber } from "@/features/projects/project-model";
import { sentAtText } from "@/features/projects/submission-text";
import { FrozenText } from "../../components/frozen-text";
import { classHref } from "../area-hrefs";
import { mentorHint } from "../mentor-review";
import { blockedClassMessage } from "../mentor-text";
import { useMentorClass, type MentorClassData } from "../use-mentor-data";
import { MentorDecisionPanel } from "./mentor-decision-panel";
import { MentorHistory } from "./mentor-history";
import { BackShell } from "../../components/back-shell";

type Ready = Extract<MentorClassData, { status: "ready" }>;

function Text({ work }: { work: AssignmentSubmission }) {
  const [picked, setPicked] = useState<number | null>(null);
  const latest = work.versions.length;
  const version =
    work.versions.find((v) => v.version === (picked ?? latest)) ?? work.versions.at(-1);
  if (!version) return <Notice>Pengumpulan ini tidak punya salinan beku.</Notice>;
  return (
    <section aria-labelledby="naskah-title" className="grid gap-4 border-t border-line pt-6">
      <h2 id="naskah-title" className="heading-md">
        Tulisan peserta
      </h2>
      {latest > 1 && (
        <div role="group" aria-label="Versi tulisan" className="flex flex-wrap gap-2">
          {work.versions.map((v) => (
            <Chip
              key={v.version}
              pressed={v.version === version.version}
              onClick={() => setPicked(v.version)}
            >
              Versi {v.version}
              {v.version === latest ? " (terbaru)" : ""}
            </Chip>
          ))}
        </div>
      )}
      <p className="text-xs text-ink-muted">
        Versi {version.version} · {formatNumber(version.wordCount)} kata · dibekukan{" "}
        {sentAtText(version.frozenAt)} ·{" "}
        {work.source === "teks" ? "diketik langsung" : `dari dokumen ${work.docTitle}`}
      </p>
      <FrozenText content={version.content} />
    </section>
  );
}

function Body({
  data,
  work,
  store,
}: {
  data: Ready;
  work: AssignmentSubmission;
  store: AssignmentStore;
}) {
  const { project, content } = data;
  const assignment = content.modules.find((m) => m.assignment.id === work.assignmentId)?.assignment;
  const title = useRef<HTMLHeadingElement>(null);
  return (
    <BackShell back={{ href: classHref(project.slug), label: project.title }}>
      <header className="grid gap-2">
        <p className="text-xs wrap-anywhere text-ink-muted">{assignment?.module}</p>
        <h1 ref={title} tabIndex={-1} className="heading-lg wrap-anywhere outline-none">
          {assignment?.title ?? "Tugas"}
        </h1>
        <p className="text-sm wrap-anywhere text-ink-muted">
          oleh {DUMMY_USER.name} · dikumpulkan {sentAtText(work.submittedAt)}
          {work.late ? " · terlambat" : ""}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
          <StatusTugas state={work.status} />
          <p className="text-sm">{mentorHint[work.status]}</p>
        </div>
      </header>
      <MentorDecisionPanel
        work={work}
        store={store}
        onDone={() => requestAnimationFrame(() => title.current?.focus())}
        onRejected={notifyAssignmentsChanged}
      />
      {assignment && (
        <section aria-labelledby="petunjuk-title" className="grid gap-2 border-t border-line pt-6">
          <h2 id="petunjuk-title" className="heading-md">
            Petunjuk tugas
          </h2>
          {assignment.instructions.map((p, i) => (
            <p key={i} className="text-sm wrap-anywhere text-ink-muted">
              {p}
            </p>
          ))}
        </section>
      )}
      <Text work={work} />
      <MentorHistory work={work} />
    </BackShell>
  );
}

/**
 * One hand-in for the Mentor (KLS-03): the frozen text, the task it answers, the history, and the
 * steps its status allows. Work of a class that is not assigned to the viewer is refused with a
 * way back. Hiding the entry is not access control; Row Level Security is.
 */
export function MentorReviewView({
  slug,
  id,
  store = assignmentStore,
}: {
  slug: string;
  id: string;
  store?: AssignmentStore;
}) {
  const data = useMentorClass(slug, { store });
  const back = { href: classHref(slug), label: "Kelas" };

  if (data.status === "error") {
    return (
      <BackShell back={back}>
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>
          Tugas belum bisa dibuka karena data di perangkat ini tidak terbaca.
        </ErrorBanner>
      </BackShell>
    );
  }
  if (data.status === "loading") {
    return (
      <div role="status" aria-label="Memuat tugas" className="mx-auto grid max-w-170 gap-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  const work = data.status === "ready" ? data.submissions.find((s) => s.id === id) : undefined;
  if (data.status !== "ready" || !work) {
    const blocked = data.status === "blocked";
    return (
      <BackShell back={back}>
        <h1 className="heading-lg">
          {blocked ? "Tidak bisa dibuka." : "Pengumpulan ini tidak ditemukan."}
        </h1>
        <Notice>
          {blocked
            ? blockedClassMessage[data.reason]
            : "Pengumpulan ini tidak ada di perangkat ini. Alamatnya mungkin salah."}
        </Notice>
        <ButtonLink href={back.href} variant="secondary" className="justify-self-start">
          Kembali ke kelas
        </ButtonLink>
      </BackShell>
    );
  }
  return <Body data={data} work={work} store={store} />;
}
