import type { CSSProperties, ReactNode } from "react";
import type { ProjectCategory } from "../types";
import { ProjectCover } from "./project-cover";

type Props = {
  project: { slug: string; category: ProjectCategory; title: string };
  /** What this page is, above the title ("Dasbor kelas"). */
  eyebrow: string;
  /** The title's id, for screens that move focus to it after a decision. */
  titleId?: string;
  /** The one large figure and what goes with it: progress, the running stage. */
  children?: ReactNode;
};

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * The head of a project dashboard (DESIGN.md 7.7): the project's cover on a dark band, the title in
 * serif, and one large figure that says where you stand. The buttons stay under the band, on the
 * page surface. Everything is shown at once under reduced motion.
 */
export function DashboardBand({ project, eyebrow, titleId, children }: Props) {
  return (
    <section
      data-cover-reveal
      data-seen=""
      className="rm-cover-host theme-dark app-band relative isolate overflow-hidden px-6 py-8 text-ink md:px-10 md:py-10"
    >
      <div className="grid items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8">
        <ProjectCover project={project} showTitle className="rm-cover-enter w-24 md:w-32" />
        <div className="grid min-w-0 gap-4">
          <div className="rm-rise-in grid gap-1.5" style={step(0)}>
            <p className="text-xs text-ink-soft">{eyebrow}</p>
            <h1
              id={titleId}
              tabIndex={titleId ? -1 : undefined}
              className="font-serif text-[26px] leading-8 font-semibold text-balance wrap-anywhere outline-none md:text-[32px] md:leading-10"
            >
              {project.title}
            </h1>
          </div>
          {children && (
            <div className="rm-rise-in grid min-w-0 gap-2" style={step(1)}>
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** The large figure of a band: a rolling number or a short status, with a line under it. */
export function BandFigure({
  figure,
  caption,
  words = false,
}: {
  figure: ReactNode;
  caption?: ReactNode;
  /** A status in words is set smaller than a number. */
  words?: boolean;
}) {
  return (
    <div className="grid gap-1">
      <p
        className={
          words
            ? "font-serif text-[26px] leading-8 font-semibold text-balance md:text-[30px] md:leading-9"
            : "font-serif text-[44px] leading-none font-semibold tabular-nums md:text-[56px]"
        }
      >
        {figure}
      </p>
      {caption && <p className="text-sm wrap-anywhere text-ink-soft">{caption}</p>}
    </div>
  );
}
