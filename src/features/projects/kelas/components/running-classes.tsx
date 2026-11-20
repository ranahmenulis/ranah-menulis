import { ButtonLink } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { dashboardHref } from "../class-model";
import type { ContinueTarget, RunningClass } from "../continue-model";

function nextText(next: ContinueTarget): string {
  if (next.kind === "materi") return `Berikutnya: materi “${next.title}”`;
  if (next.kind === "tugas") return `Berikutnya: tugas “${next.title}”`;
  return "Semua tugas sudah dikumpulkan, menunggu penilaian mentor";
}

/**
 * Classes in progress, each with where you stand and a Lanjutkan button to the next material or
 * assignment (KLS-05). The caller draws the heading and leaves the section out when the list is
 * empty, so a reader with no running class never sees it. `rail` is the Beranda side column, where
 * the button is a quiet text button because the page already has its one filled button.
 */
export function RunningClassList({
  rows,
  variant,
}: {
  rows: RunningClass[];
  variant: "rail" | "page";
}) {
  return (
    <ul className="grid">
      {rows.map(({ project, progress, next }) => (
        <li
          key={project.slug}
          className="grid gap-1 border-t border-line py-3 first:border-t-0 first:pt-0"
        >
          <TextLink
            href={dashboardHref(project.slug)}
            className="w-fit text-sm font-medium wrap-anywhere"
          >
            {project.title}
          </TextLink>
          <p className="text-xs wrap-anywhere text-ink-muted">
            {progress.percent}% selesai · {nextText(next)}
          </p>
          <ButtonLink
            href={next.href}
            variant={variant === "rail" ? "text" : "secondary"}
            size="sm"
            aria-label={`Lanjutkan ${project.title}`}
            className={
              variant === "rail" ? "justify-self-start px-0 text-ink" : "justify-self-start"
            }
          >
            Lanjutkan
          </ButtonLink>
        </li>
      ))}
    </ul>
  );
}
