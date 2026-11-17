import { CLASS_START_LABEL } from "@/features/projects/kelas/class-model";
import type { ProjectCategory, ProjectFixture, TimeZoneName } from "@/features/projects/types";
import {
  dateInputOf,
  formatCriteria,
  formatModules,
  formatMilestones,
  formatPackages,
  formatRinggit,
  formatRupiah,
} from "./project-lines";

/** What the project form holds: every field as text, exactly as typed. */
export type ProjectInput = {
  category: ProjectCategory;
  title: string;
  summary: string;
  about: string;
  requirements: string;
  zone: TimeZoneName;
  closesDate: string;
  milestones: string;
  feeIdr: string;
  feeMyr: string;
  quota: string;
  minWords: string;
  maxWords: string;
  maxWorks: string;
  special: string;
  theme: string;
  stages: string;
  packages: string;
  criteria: string;
  prizes: string;
  anonymous: boolean;
  teacherName: string;
  teacherBio: string;
  modules: string;
};

export type InputErrors = Partial<Record<keyof ProjectInput | "block", string>>;

/** Categories that take submissions (PRJ-04): Kelas collects assignments instead. */
export const takesSubmissions = (category: ProjectCategory) => category !== "kelas";
/** Solo is open all year: no deadline, no quota, and its prices live in the packages. */
export const isOpenService = (category: ProjectCategory) => category === "solo";

export const emptyInput = (category: ProjectCategory = "antologi"): ProjectInput => ({
  category,
  title: "",
  summary: "",
  about: "",
  requirements: "",
  zone: "WIB",
  closesDate: "",
  milestones: category === "kelas" ? `${CLASS_START_LABEL} | ` : "",
  feeIdr: "",
  feeMyr: "",
  quota: "",
  minWords: "",
  maxWords: "",
  maxWorks: "1",
  special: "",
  theme: "",
  stages: "",
  packages: "",
  criteria: "",
  prizes: "",
  anonymous: false,
  teacherName: "",
  teacherBio: "",
  modules: "",
});

/** The form's text for a project already written, so editing starts from what is saved. */
export function inputOf(project: ProjectFixture): ProjectInput {
  const base = emptyInput(project.category);
  const zone = project.timeZone;
  const abs = project.absolute;
  const block = project.block;
  return {
    ...base,
    title: project.title,
    summary: project.summary,
    about: project.about.join("\n\n"),
    requirements: project.requirements.join("\n"),
    zone,
    closesDate: abs?.closesAt ? dateInputOf(abs.closesAt, zone) : "",
    milestones: formatMilestones(abs?.milestones ?? [], zone),
    feeIdr: formatRupiah(project.fee.idr),
    feeMyr: formatRinggit(project.fee.myr),
    quota: project.quota ? String(project.quota.total) : "",
    minWords: project.submission ? String(project.submission.minWords) : "",
    maxWords: project.submission ? String(project.submission.maxWords) : "",
    maxWorks: project.submission ? String(project.submission.maxWorks) : "1",
    special: project.terms.special.join("\n"),
    ...blockInput(block),
  };
}

/** The text fields of the part that differs per category. */
function blockInput(block: ProjectFixture["block"]): Partial<ProjectInput> {
  switch (block.kind) {
    case "antologi":
      return { theme: block.theme, stages: block.stages.join("\n") };
    case "solo":
      return { packages: formatPackages(block.packages) };
    case "lomba":
      return {
        criteria: formatCriteria(block.criteria),
        prizes: block.prizes.join("\n"),
        anonymous: block.anonymous,
      };
    case "kelas":
      return {
        teacherName: block.teacher.name,
        teacherBio: block.teacher.bio,
        modules: formatModules(block.modules),
      };
  }
}
