"use client";

import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import { formatNumber } from "@/features/projects/project-model";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { BackShell } from "../../components/back-shell";
import { FrozenText } from "../../components/frozen-text";
import { contestHref } from "../area-hrefs";
import { useJudgeWork } from "../use-judge-data";
import { ScoreForm } from "./score-form";

/**
 * One work to score (LMB-01): the frozen text of its latest version and the form. In an anonymous
 * contest nothing here names the author, and the participant's own note to the editor is not shown
 * because it could (BR-PRJ-08, AC-27). Refuses a contest not assigned to the viewer with a way back.
 */
export function ScoreView({
  slug,
  id,
  store,
}: {
  slug: string;
  id: string;
  store?: SubmissionStore;
}) {
  const data = useJudgeWork(slug, id, { store });
  const back = { href: contestHref(slug), label: "Karya lomba" };

  if (data.status === "error") {
    return (
      <BackShell back={back}>
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>
          Karya belum bisa dibuka karena data di perangkat ini tidak terbaca.
        </ErrorBanner>
      </BackShell>
    );
  }
  if (data.status === "loading") {
    return (
      <div role="status" aria-label="Memuat karya" className="mx-auto grid max-w-170 gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (data.status === "gone" || data.status === "blocked") {
    return (
      <BackShell back={back}>
        <h1 className="heading-lg">
          {data.status === "gone"
            ? "Karya ini tidak ditemukan."
            : "Karya ini tidak ditugaskan kepadamu."}
        </h1>
        <Notice>
          {data.status === "gone"
            ? "Karya ini tidak ada di perangkat ini, atau sudah ditarik. Alamatnya mungkin salah."
            : "Kamu hanya menilai lomba yang ditugaskan kepadamu."}
        </Notice>
        <ButtonLink href={contestHref(slug)} variant="secondary" className="justify-self-start">
          Kembali ke karya lomba
        </ButtonLink>
      </BackShell>
    );
  }

  const { work, label, project, anonymous, criteria, judging, mine } = data;
  const version = work.versions.at(-1);
  return (
    <BackShell back={back}>
      <header className="grid gap-2">
        <p className="text-xs wrap-anywhere text-ink-muted">{project.title}</p>
        <h1 tabIndex={-1} className="heading-lg wrap-anywhere outline-none">
          {label} · {work.title}
        </h1>
        <p className="text-sm text-ink-muted">
          {work.genre} · {formatNumber(version?.wordCount ?? 0)} kata
          {anonymous ? " · penulis tidak ditampilkan (lomba anonim)" : ""}
        </p>
      </header>
      <section aria-labelledby="naskah-title" className="grid gap-4 border-t border-line pt-6">
        <h2 id="naskah-title" className="heading-md">
          Naskah
        </h2>
        {version ? (
          <FrozenText content={version.content} />
        ) : (
          <Notice>Karya ini tidak punya salinan beku.</Notice>
        )}
      </section>
      <ScoreForm
        key={`${work.id}-${judging}`}
        slug={slug}
        submissionId={work.id}
        criteria={criteria}
        judging={judging}
        mine={mine}
      />
    </BackShell>
  );
}
