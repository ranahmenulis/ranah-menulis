"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { TextLink } from "@/components/ui/text-link";
import { PROJECTS_HREF } from "@/features/app-shell/nav";
import { useViewer } from "@/lib/viewer";
import { categoryLabel, formatProjectDate, projectState } from "../project-model";
import { cn } from "@/lib/cn";
import { deadlineText, stateLabel } from "../project-text";
import { ProjectCover } from "./project-cover";
import { liveRegistration } from "../payment-model";
import { useRegistrations } from "../registration-store";
import { activeSubmissions } from "../submission-model";
import type { SubmissionStore } from "../storage/submission-store";
import { useSubmissions } from "../use-submissions";
import { useProjects } from "../use-projects";
import type { Project, ProjectFixture, ProjectState } from "../types";
import { ClassTestimonials } from "../kelas/components/class-testimonials";
import { CategoryBlockView, Section } from "./category-blocks";
import { ProjectAside } from "./project-aside";
import { ProjectDetailSkeleton, ProjectGone } from "./projects-states";

function Schedule({ project, state, now }: { project: Project; state: ProjectState; now: number }) {
  const rows = [
    { label: "Pendaftaran", value: deadlineText(project, state), done: state === "ditutup" },
    ...project.milestones.map((m) => ({
      label: m.label,
      value: `${formatProjectDate(m.at, project.timeZone)} ${project.timeZone}`,
      done: m.at < now,
    })),
  ];
  return (
    <Section title="Jadwal">
      <dl className="relative grid gap-5 pl-7 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-line">
        {rows.map((row, i) => (
          <div key={i} className="relative grid gap-0.5">
            <span
              aria-hidden
              className={cn(
                "absolute top-1.5 -left-7 size-[11px] rounded-full border-2 border-ink",
                row.done ? "bg-ink" : "bg-canvas",
              )}
            />
            <dt className="text-base font-medium wrap-anywhere">{row.label}</dt>
            <dd className="text-sm text-ink-muted">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-ink-muted">
        Semua tanggal mengikuti zona waktu proyek ({project.timeZone}). Pendaftaran dan pengiriman
        berlaku sampai akhir hari pada tanggal itu.
      </p>
    </Section>
  );
}

/** The project's header: a dark band with its cover, so every project page opens on its face. */
function DetailHeader({ project, state }: { project: Project; state: ProjectState }) {
  return (
    <header
      data-cover-reveal
      data-seen=""
      className="rm-cover-host theme-dark app-band mt-4 grid items-end gap-6 p-6 text-ink sm:grid-cols-[minmax(0,1fr)_auto] md:p-10"
    >
      <div className="grid min-w-0 gap-3">
        <p className="text-xs text-ink-muted">
          <span className="font-medium text-ink">{categoryLabel(project.category)}</span> ·{" "}
          {stateLabel[state]}
        </p>
        <h1 className="read-title text-balance wrap-anywhere">{project.title}</h1>
        <p className="read-subtitle wrap-anywhere text-ink-soft!">{project.summary}</p>
      </div>
      <ProjectCover
        project={project}
        showTitle
        className="rm-cover-enter w-32 max-sm:-order-1 md:w-44"
      />
    </header>
  );
}

type Props = {
  slug: string;
  /** Replaces the dummy catalog in tests. */
  source?: ProjectFixture[];
  /** Replaces the device's submission store in tests. */
  store?: SubmissionStore;
};

/**
 * Detail proyek (PRJ-01, DESIGN.md 6.7): a one-column document (about, manuscript rules, the
 * category block, schedule, copyright) and a sticky right column with fee, quota, deadline, and the
 * action. A draft is treated as not found, since drafts are never public.
 */
export function ProjectDetail({ slug, source, store }: Props) {
  const data = useProjects(source);
  const guest = useViewer() === "tamu";
  const registrations = useRegistrations();
  const submissions = useSubmissions(store);

  if (data.status === "loading") return <ProjectDetailSkeleton />;

  const project = data.projects.find((p) => p.slug === slug && p.publication === "terbit");
  if (!project) return <ProjectGone />;

  const state = projectState(project, data.now);
  // Unknown while loading, so the button waits; after a failed read the send page explains itself.
  const sentCount =
    submissions.status === "loading"
      ? null
      : activeSubmissions(submissions.submissions, project.slug).length;

  return (
    <div className="mx-auto max-w-260">
      <TextLink
        href={PROJECTS_HREF}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={16} aria-hidden />
        Semua Projects
      </TextLink>

      <DetailHeader project={project} state={state} />

      <div className="mt-10 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="max-lg:order-1 lg:col-start-2 lg:row-start-1">
          <div className="lg:sticky lg:top-[calc(3.5rem+var(--safe-top)+1.5rem)]">
            <ProjectAside
              project={project}
              state={state}
              now={data.now}
              guest={guest}
              registration={liveRegistration(registrations[project.slug], data.now)}
              sentCount={sentCount}
              stores={store ? { submissions: store } : undefined}
            />
          </div>
        </div>

        <div className="grid min-w-0 content-start gap-12 max-lg:order-2 lg:col-start-1 lg:row-start-1">
          <Section title="Tentang proyek">
            {project.about.map((paragraph, i) => (
              <p key={i} className="read-body wrap-anywhere">
                {paragraph}
              </p>
            ))}
          </Section>

          <Section title="Syarat naskah">
            <ul className="grid list-disc gap-1.5 pl-5 text-base marker:text-ink-muted">
              {project.requirements.map((rule, i) => (
                <li key={i} className="wrap-anywhere">
                  {rule}
                </li>
              ))}
            </ul>
          </Section>

          <CategoryBlockView block={project.block} />
          <Schedule project={project} state={state} now={data.now} />
          {project.block.kind === "kelas" && <ClassTestimonials slug={project.slug} />}

          <Section title="Hak cipta dan ketentuan">
            <p className="text-base">
              Hak cipta karyamu tetap padamu, kecuali ketentuan proyek menyatakan lain secara
              eksplisit. Ketentuan lengkap proyek ini kamu baca dan setujui sebelum mendaftar.
            </p>
            <p className="text-sm text-ink-muted">Dikelola oleh {project.organizer}.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
