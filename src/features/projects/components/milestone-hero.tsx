import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties, ReactNode } from "react";
import { heroCardClass } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { ProjectCategory } from "../types";
import { ProjectCover } from "./project-cover";

type Props = {
  project: { slug: string; category: ProjectCategory; title: string };
  /** The sentence that says what just happened, in serif ("Karyamu terkirim."). */
  title: string;
  /** Rings burst from the cover: for the moment itself, not when the page is opened again later. */
  celebrate?: boolean;
  /** The facts under the title (status pill, what was frozen, fee). */
  children?: ReactNode;
  /** The way on, kept out of the band so the one filled button stays on the page surface. */
  actions?: ReactNode;
  className?: string;
};

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * A milestone screen (DESIGN.md 7.7): registered, work sent, revision sent, payment received. The
 * project's cover arrives on a hero card, rings burst from it once, and the sentence rises in with a
 * check when it just happened. The way on sits under the card. Everything is shown at once under reduced motion.
 */
export function MilestoneHero({
  project,
  title,
  celebrate = false,
  children,
  actions,
  className,
}: Props) {
  return (
    <div className={cn("grid gap-6", className)}>
      <section
        data-cover-reveal
        data-seen=""
        className={cn(heroCardClass, "rm-cover-host px-6 py-10 md:px-10 md:py-12")}
      >
        {celebrate && (
          <span aria-hidden className="rm-burst pointer-events-none absolute -z-10">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={step(i)} />
            ))}
          </span>
        )}
        <div className="grid items-center gap-8 sm:grid-cols-[auto_minmax(0,1fr)]">
          <ProjectCover
            project={project}
            showTitle
            className="rm-cover-enter w-28 -rotate-2 shadow-card md:w-36"
          />
          <div className="grid min-w-0 justify-items-start gap-3">
            <h1
              className="rm-rise-in flex flex-wrap items-center gap-3 font-serif text-[30px] leading-9 font-semibold text-balance md:text-[40px] md:leading-[48px]"
              style={step(0)}
            >
              {celebrate && (
                <CheckCircle
                  size={36}
                  weight="fill"
                  aria-hidden
                  className="shrink-0 text-accent max-md:size-8"
                />
              )}
              {title}
            </h1>
            <div className="rm-rise-in grid justify-items-start gap-3" style={step(1)}>
              {children}
            </div>
          </div>
        </div>
      </section>
      {actions && (
        <div className="rm-rise-in flex flex-wrap items-center gap-x-4 gap-y-3" style={step(2)}>
          {actions}
        </div>
      )}
    </div>
  );
}
