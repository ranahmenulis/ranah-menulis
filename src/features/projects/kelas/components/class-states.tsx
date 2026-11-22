"use client";

import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { useT } from "@/lib/i18n/provider";
import { MyShell } from "../../components/my-states";
import { projectHref } from "../../project-model";
import { registerHref } from "../../registration-model";
import type { Project } from "../../types";
import { classCopy } from "../class-copy";
import type { DashboardBlock } from "../class-model";
import { ProjectStrip } from "../../components/project-strip";

/** The way back to the project, always on top of a class screen. */
export const backToProject = (slug: string, label = classCopy("id").backProject) => ({
  href: projectHref(slug),
  label,
});

/** Why the dashboard is not offered. The way back stays; being unregistered offers the way on. */
export function ClassBlocked({ project, block }: { project: Project; block: DashboardBlock }) {
  const t = useT().projectsClass;
  return (
    <MyShell back={backToProject(project.slug, t.backProject)}>
      <ProjectStrip project={project} titleAs="h1" />
      <Notice>{t.blocked[block]}</Notice>
      {block === "belum-terdaftar" ? (
        <ButtonLink href={registerHref(project.slug)} className="justify-self-start">
          {t.blocked.register}
        </ButtonLink>
      ) : (
        <ButtonLink
          href={projectHref(project.slug)}
          variant="secondary"
          className="justify-self-start"
        >
          {t.blocked.viewProject}
        </ButtonLink>
      )}
    </MyShell>
  );
}
