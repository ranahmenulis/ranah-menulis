"use client";

import { Notice } from "@/components/ui/states";
import { DashboardBand } from "../../components/dashboard-band";
import { MyError, MyShell, MySkeleton } from "../../components/my-states";
import { ProjectGone } from "../../components/projects-states";
import { formatProjectDate } from "../../project-model";
import type { ProjectFixture } from "../../types";
import { hasStarted } from "../class-model";
import { useClass } from "../hooks/use-class";
import type { AssignmentStore } from "../storage/assignment-store";
import type { ClassFixture } from "../types";
import { ClassAssignments } from "./class-assignments";
import { ClassMaterials } from "./class-materials";
import { ClassProgress, ProgressNote } from "./class-progress";
import { ClassSchedule } from "./class-schedule";
import { TestimonialSection } from "./testimonial-section";
import { backToProject, ClassBlocked } from "./class-states";

type Props = {
  slug: string;
  /** Replace the dummy catalog, the class content and the device store in tests. */
  source?: ProjectFixture[];
  classes?: ClassFixture[];
  store?: AssignmentStore;
};

/**
 * The class dashboard (KLS-02, PRD 17.5): where you stand, the next meeting, the assignments, the
 * materials. Which screen you get depends on who you are: a guest, someone who has not registered
 * or has not paid sees why it is closed; a class that has not started shows its schedule but keeps
 * the materials shut.
 */
export function ClassDashboard({ slug, source, classes, store }: Props) {
  const data = useClass(slug, { source, classes, store });

  if (data.status === "loading") return <MySkeleton label="Memuat dasbor kelas" />;
  if (data.status === "gone") return <ProjectGone />;
  if (data.status === "error") {
    return (
      <MyError back={backToProject(slug)} onRetry={data.reload}>
        Dasbor kelas belum bisa dibuka. Data di perangkat ini tidak terbaca.
      </MyError>
    );
  }
  if (data.status === "blocked") return <ClassBlocked project={data.project} block={data.block} />;

  const { project, content, now, rows, progress, done } = data;
  const zone = project.timeZone;
  const started = hasStarted(content, now);
  const teacher = project.block.kind === "kelas" ? project.block.teacher.name : null;

  return (
    <MyShell back={backToProject(slug)}>
      <DashboardBand project={project} eyebrow="Dasbor kelas">
        <ClassProgress progress={progress} mentor={teacher} />
      </DashboardBand>
      {!started && (
        <Notice>
          Kelas belum dimulai. Materi dan tugas dibuka pada{" "}
          {formatProjectDate(content.startsAt, zone)}.
        </Notice>
      )}
      <ProgressNote progress={progress} />
      <ClassSchedule content={content} now={now} zone={zone} />
      <ClassAssignments slug={slug} rows={rows} zone={zone} />
      <ClassMaterials content={content} done={done} started={started} zone={zone} />
      <TestimonialSection slug={slug} rows={rows} started={started} store={store} />
    </MyShell>
  );
}
