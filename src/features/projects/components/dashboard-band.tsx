import type { CSSProperties, ReactNode } from "react";
import { ClassPath } from "@/components/illustrations/class-art";
import { BookAssembly } from "@/components/illustrations/projects-art";
import { heroArtClass, heroCardClass, heroSceneClass } from "@/components/ui/card";
import { cn } from "@/lib/cn";
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

/** The dashboard's own picture: the path of modules for a class, the book being made for Solo. */
function BandArt({ category }: { category: ProjectCategory }) {
  if (category === "kelas") {
    return <ClassPath className={cn(heroSceneClass, "max-md:opacity-40")} />;
  }
  return <BookAssembly className={cn(heroArtClass, "max-md:max-w-[48%] max-md:opacity-40")} />;
}

/**
 * The head of a project dashboard (DESIGN.md 7.7, client Streak reference 23 November 2026): a hero
 * card with the dashboard's picture at the right, the project's small cover beside its name, and
 * one large figure that says where you stand. The buttons stay under the card.
 */
export function DashboardBand({ project, eyebrow, titleId, children }: Props) {
  return (
    <section
      data-cover-reveal
      data-seen=""
      className={cn(heroCardClass, "rm-cover-host grid gap-5 md:min-h-64")}
    >
      <BandArt category={project.category} />
      <div className="rm-rise-in flex items-center gap-4 md:max-w-[62%]" style={step(0)}>
        <ProjectCover
          project={project}
          className="rm-cover-enter w-14 shrink-0 -rotate-3 shadow-card md:w-16"
        />
        <div className="grid min-w-0 justify-items-start gap-1.5">
          <p className="rounded-full bg-accent-subtle px-2.5 py-1 text-xs font-semibold text-accent-ink">
            {eyebrow}
          </p>
          <h1
            id={titleId}
            tabIndex={titleId ? -1 : undefined}
            className="font-serif text-[24px] leading-8 font-semibold text-balance wrap-anywhere outline-none md:text-[30px] md:leading-10"
          >
            {project.title}
          </h1>
        </div>
      </div>
      {children && (
        <div className="rm-rise-in grid min-w-0 gap-2 md:max-w-[62%]" style={step(1)}>
          {children}
        </div>
      )}
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
            : "text-[56px] leading-[0.95] font-bold tracking-tight tabular-nums md:text-[72px]"
        }
      >
        {figure}
      </p>
      {caption && <p className="text-sm wrap-anywhere text-ink-soft">{caption}</p>}
    </div>
  );
}
