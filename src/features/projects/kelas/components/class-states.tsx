import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { MyShell } from "../../components/my-states";
import { projectHref } from "../../project-model";
import { registerHref } from "../../registration-model";
import type { Project } from "../../types";
import type { DashboardBlock } from "../class-model";

const MESSAGE: Record<DashboardBlock, string> = {
  tamu: "Masuk untuk membuka dasbor kelas.",
  "belum-terdaftar": "Dasbor kelas hanya terbuka untuk peserta. Daftar dulu untuk masuk.",
  "menunggu-pembayaran":
    "Dasbor kelas terbuka setelah pembayaranmu dikonfirmasi. Pendaftaranmu sudah tercatat.",
  "bukan-kelas": "Proyek ini bukan kelas, jadi tidak punya dasbor kelas.",
};

/** The way back to the project, always on top of a class screen. */
export const backToProject = (slug: string) => ({
  href: projectHref(slug),
  label: "Kembali ke proyek",
});

/** Why the dashboard is not offered. The way back stays; being unregistered offers the way on. */
export function ClassBlocked({ project, block }: { project: Project; block: DashboardBlock }) {
  return (
    <MyShell back={backToProject(project.slug)}>
      <h1 className="heading-lg wrap-anywhere">{project.title}</h1>
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
