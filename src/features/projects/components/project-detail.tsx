"use client";

import {
  ArrowLeft,
  BookOpenText,
  CalendarBlank,
  CheckCircle,
  ListChecks,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import { heroCardClass } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { PROJECTS_HREF } from "@/features/app-shell/nav";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { useViewer } from "@/lib/viewer";
import { categoryLabel, formatProjectDate, projectState } from "../project-model";
import { cn } from "@/lib/cn";
import { deadlineText, stateLabelOf } from "../project-text";
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
  const t = useT().projectsCatalog.detail;
  const locale = useLocale();
  const rows = [
    {
      label: t.registration,
      value: deadlineText(project, state, locale),
      done: state === "ditutup",
    },
    ...project.milestones.map((m) => ({
      label: m.label,
      value: `${formatProjectDate(m.at, project.timeZone, locale)} ${project.timeZone}`,
      done: m.at < now,
    })),
  ];
  const next = rows.findIndex((row) => !row.done);
  return (
    <Section title={t.scheduleTitle} icon={CalendarBlank}>
      <dl className="relative grid gap-2 pl-7 before:absolute before:top-4 before:bottom-4 before:left-[5px] before:w-0.5 before:rounded-full before:bg-accent-subtle">
        {rows.map((row, i) => (
          <div
            key={i}
            className={cn(
              "relative -ml-2 grid gap-0.5 rounded-xl px-2 py-2",
              i === next && "bg-accent-subtle/60",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute top-3.5 -left-5 size-3 rounded-full border-2 border-accent",
                row.done ? "bg-accent" : "bg-surface",
                i === next && "ring-4 ring-accent/20",
              )}
            />
            <dt className="flex flex-wrap items-center gap-2 text-base font-medium wrap-anywhere">
              {row.label}
              {i === next && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-on-accent">
                  {t.next}
                </span>
              )}
            </dt>
            <dd className="text-sm text-ink-muted">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-ink-muted">{format(t.scheduleNote, { zone: project.timeZone })}</p>
    </Section>
  );
}

/**
 * The project's header: a hero card (client reference, 23 November 2026) with its cover leaning
 * at the right, so every project page opens on its face.
 */
function DetailHeader({ project, state }: { project: Project; state: ProjectState }) {
  const locale = useLocale();
  return (
    <header
      data-cover-reveal
      data-seen=""
      className={cn(
        heroCardClass,
        "rm-cover-host mt-4 grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_auto] md:p-10",
      )}
    >
      <div className="grid min-w-0 gap-3">
        <p className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          <span className="rounded-full bg-accent-subtle px-2.5 py-1 font-semibold text-accent-ink">
            {categoryLabel(project.category, locale)}
          </span>
          {stateLabelOf(state, locale)}
        </p>
        <h1 className="read-title text-balance wrap-anywhere">{project.title}</h1>
        <p className="read-subtitle wrap-anywhere text-ink-soft!">{project.summary}</p>
      </div>
      <ProjectCover
        project={project}
        showTitle
        describe
        className="rm-cover-enter w-32 rotate-2 shadow-card max-sm:-order-1 md:w-44"
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
  const t = useT().projectsCatalog.detail;
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
        {t.allProjects}
      </TextLink>

      <DetailHeader project={project} state={state} />

      <div className="mt-6 grid gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
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

        <div className="grid min-w-0 content-start gap-4 max-lg:order-2 lg:col-start-1 lg:row-start-1">
          <Section title={t.about} icon={BookOpenText}>
            {project.about.map((paragraph, i) => (
              <p key={i} className="read-body wrap-anywhere">
                {paragraph}
              </p>
            ))}
          </Section>

          <Section title={t.requirements} icon={ListChecks}>
            <ul className="grid gap-2 text-base">
              {project.requirements.map((rule, i) => (
                <li key={i} className="flex gap-2.5 wrap-anywhere">
                  <CheckCircle
                    size={20}
                    weight="fill"
                    aria-hidden
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  <span className="min-w-0">{rule}</span>
                </li>
              ))}
            </ul>
          </Section>

          <CategoryBlockView block={project.block} />
          <Schedule project={project} state={state} now={data.now} />
          {project.block.kind === "kelas" && <ClassTestimonials slug={project.slug} />}

          <Section title={t.rightsTitle} icon={ShieldCheck}>
            <p className="text-base">{t.rights}</p>
            <p className="text-sm text-ink-muted">
              {format(t.managedBy, { organizer: project.organizer })}
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
