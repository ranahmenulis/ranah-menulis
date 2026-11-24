"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { ProjectCover } from "@/features/projects/components/project-cover";
import { coverDrift, passage, registerDrift, setVars } from "../motion/scroll-drift";
import { useReveal } from "../motion/use-reveal";
import { samplePathProjects } from "../sample-data";

/**
 * The four publishing paths as the app draws them (client, 24 Nov 2026): one project cover from
 * the Projects catalog per path, in the order of the list beside it (anthology, solo, class,
 * contest). Two by two and large enough to read (client: bigger books), the right column set a
 * little lower. They rise in once when the stack comes into view, then drift at two depths while
 * the page scrolls (`--cp`; the transforms are `.lp-cover` in globals.css).
 */
export function CoverStack() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerDrift(() => {
      const { top, height } = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (top > viewport * 2 || top + height < -viewport) return;
      setVars(el, coverDrift(passage(top, height, viewport)));
    });
  }, []);
  return (
    <div
      ref={ref}
      data-reveal="covers"
      className="lp-covers grid w-full max-w-110 grid-cols-2 items-end gap-4 md:gap-5"
    >
      {samplePathProjects().map((project, i) => (
        <div
          key={project.slug}
          className="lp-cover"
          data-depth={i % 2 === 1 ? "2" : undefined}
          style={{ "--i": i } as CSSProperties}
        >
          <ProjectCover
            project={project}
            showTitle
            className={cn("shadow-float", i % 2 === 1 && "translate-y-6")}
          />
        </div>
      ))}
    </div>
  );
}
