import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { MyShell } from "../../components/my-states";
import { projectHref } from "../../project-model";
import { registerHref } from "../../registration-model";
import type { Project } from "../../types";
import type { ShownBlock } from "../solo-model";
import { ProjectStrip } from "../../components/project-strip";

const MESSAGE: Record<ShownBlock, string> = {
  tamu: "Masuk untuk membuka dasbor penerbitan.",
  "belum-terdaftar": "Dasbor penerbitan hanya terbuka untuk penulis yang sudah mendaftar.",
  "menunggu-pembayaran":
    "Dasbor penerbitan terbuka setelah pembayaranmu dikonfirmasi. Pendaftaranmu sudah tercatat.",
};

/** The way back to the project, always on top of a Solo screen. */
export const backToProject = (slug: string) => ({
  href: projectHref(slug),
  label: "Kembali ke proyek",
});

/** Why the dashboard is not offered. The way back stays; being unregistered offers the way on. */
export function SoloBlocked({ project, block }: { project: Project; block: ShownBlock }) {
  return (
    <MyShell back={backToProject(project.slug)}>
      <ProjectStrip project={project} titleAs="h1" />
      <Notice>{MESSAGE[block]}</Notice>
      {block === "belum-terdaftar" ? (
        <ButtonLink href={registerHref(project.slug)} className="justify-self-start">
          Daftar
        </ButtonLink>
      ) : (
        <ButtonLink
          href={projectHref(project.slug)}
          variant="secondary"
          className="justify-self-start"
        >
          Lihat proyek
        </ButtonLink>
      )}
    </MyShell>
  );
}
