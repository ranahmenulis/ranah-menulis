"use client";

import Link from "next/link";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { RoleBand } from "../../components/role-band";
import { bandFrom, mentorWork } from "../../role-band";
import { classHref } from "../area-hrefs";
import { useMentorClasses } from "../use-mentor-data";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";

/**
 * The classes the viewer manages (KLS-03), with what needs a mentor first: how many hand-ins wait
 * for a decision. Only classes assigned to the viewer are listed.
 */
export function MentorClassesView({ store }: { store?: AssignmentStore }) {
  const data = useMentorClasses({ store });
  const work = bandFrom(data, (d) => mentorWork(d.items));
  return (
    <section aria-labelledby="kelas-title" className="grid max-w-170 gap-5">
      <RoleBand
        area="mentor"
        title="Kelas"
        titleId="kelas-title"
        description="Kelas yang ditugaskan kepadamu."
        work={work}
      />
      {data.status === "error" ? (
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>
          Kelas belum bisa dibuka karena data di perangkat ini tidak terbaca.
        </ErrorBanner>
      ) : data.status === "loading" ? (
        <div role="status" aria-label="Memuat kelas" className="grid gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState>Belum ada kelas yang ditugaskan kepadamu.</EmptyState>
      ) : (
        <ul className="border-t border-line">
          {data.items.map(({ project, started, participants, tasks, toGrade }) => (
            <li key={project.slug} className="border-b border-line">
              <Link
                href={classHref(project.slug)}
                className="grid gap-1 py-4 no-underline hover:bg-subtle"
              >
                <span className="heading-sm wrap-anywhere">{project.title}</span>
                <span className="text-sm text-ink-muted">
                  {started ? "Berjalan" : "Belum dimulai"} · {participants} peserta di perangkat ini
                  · {tasks} tugas
                </span>
                <span className="text-sm">
                  {toGrade > 0 ? (
                    <b className="font-medium">{toGrade} menunggu penilaianmu</b>
                  ) : (
                    <span className="text-ink-muted">Tidak ada yang menunggu penilaianmu</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
