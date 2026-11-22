import { useT } from "@/lib/i18n/provider";
import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { MyShell } from "../../components/my-states";
import { projectHref } from "../../project-model";
import { registerHref } from "../../registration-model";
import type { Project } from "../../types";
import type { ShownBlock } from "../solo-model";
import { ProjectStrip } from "../../components/project-strip";

/** The way back to the project, always on top of a Solo screen. */
export const backToProject = (slug: string, label = "Kembali ke proyek") => ({
  href: projectHref(slug),
  label,
});

/** Why the dashboard is not offered. The way back stays; being unregistered offers the way on. */
export function SoloBlocked({ project, block }: { project: Project; block: ShownBlock }) {
  const c = useT().projectsSolo;
  return (
    <MyShell back={backToProject(project.slug, c.back)}>
      <ProjectStrip project={project} titleAs="h1" />
      <Notice>{c.blocked[block]}</Notice>
      {block === "belum-terdaftar" ? (
        <ButtonLink href={registerHref(project.slug)} className="justify-self-start">
          {c.blocked.register}
        </ButtonLink>
      ) : (
        <ButtonLink
          href={projectHref(project.slug)}
          variant="secondary"
          className="justify-self-start"
        >
          {c.blocked.viewProject}
        </ButtonLink>
      )}
    </MyShell>
  );
}
