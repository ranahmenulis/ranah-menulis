"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Notice } from "@/components/ui/states";
import {
  announcementDates,
  contestStage,
  stageLabel,
  stageRank,
} from "@/features/projects/lomba/contest-model";
import { advanceContest, useContestOverrides } from "@/features/projects/lomba/stage-store";
import type { ContestStage } from "@/features/projects/lomba/types";
import { formatProjectDate } from "@/features/projects/project-model";
import { JudgingControls } from "./judging-controls";
import { ResultsEditor } from "./results-editor";
import type { Submission } from "@/features/projects/submission-types";
import type { Project } from "@/features/projects/types";

const STEPS: { stage: ContestStage; label: string; body: string }[] = [
  {
    stage: "dinilai",
    label: "Tutup penerimaan, mulai dinilai",
    body: "Karya tidak diterima lagi dan penilaian dimulai.",
  },
  {
    stage: "finalis",
    label: "Umumkan finalis",
    body: "Daftar finalis tampil di halaman hasil, terbuka untuk siapa saja.",
  },
  {
    stage: "pemenang",
    label: "Umumkan pemenang",
    body: "Pemenang tampil di halaman hasil, dan lomba anonim membuka nama penulisnya.",
  },
];

/**
 * The stages of a contest (LMB-02). An announcement is never taken back (PRD 17.5), so the only
 * move is forward and the dialog says so. The result is said beside the button, because the button
 * for that step is gone afterwards. Who the finalists and winners are comes from the Juri (6g-4).
 */
export function ContestStagePanel({
  project,
  now,
  works = [],
}: {
  project: Project;
  now: number;
  /** The non-draft works of the project, for the results below. */
  works?: Submission[];
}) {
  const overrides = useContestOverrides();
  const stage = contestStage(project, now, overrides[project.slug]?.stage);
  const next = STEPS.filter((s) => stageRank(s.stage) > stageRank(stage));
  const [asking, setAsking] = useState<(typeof STEPS)[number] | null>(null);
  const [said, setSaid] = useState("");
  const line = useRef<HTMLParagraphElement>(null);
  const dates = announcementDates(project);

  function confirm(step: (typeof STEPS)[number]) {
    advanceContest(project.slug, step.stage);
    setAsking(null);
    setSaid(`${step.label}: selesai.`);
    requestAnimationFrame(() => line.current?.focus());
  }

  return (
    <section aria-labelledby="tahap-title" className="grid max-w-170 gap-4">
      <h2 id="tahap-title" className="heading-md">
        Tahap lomba
      </h2>
      <p className="text-sm">
        Sekarang: <b className="font-medium">{stageLabel[stage]}</b>
      </p>
      <p className="text-xs text-ink-muted">
        Jadwal: finalis{" "}
        {dates.finalists === null
          ? "tanpa tanggal"
          : formatProjectDate(dates.finalists, project.timeZone)}
        , pemenang{" "}
        {dates.winners === null
          ? "tanpa tanggal"
          : formatProjectDate(dates.winners, project.timeZone)}
        . Tahap berjalan sesuai tanggal; tombol di bawah mendahuluinya.
      </p>
      <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
        {said}
      </p>
      {next.length === 0 ? (
        <Notice>Pemenang sudah diumumkan. Pengumuman tidak bisa ditarik.</Notice>
      ) : (
        <div className="flex flex-wrap gap-2">
          {next.map((step, i) => (
            <Button
              key={step.stage}
              variant={i === 0 ? "secondary" : "text"}
              onClick={() => setAsking(step)}
            >
              {step.label}
            </Button>
          ))}
        </div>
      )}
      <JudgingControls slug={project.slug} stage={stage} />
      <ResultsEditor project={project} stage={stage} works={works} />
      {asking && (
        <Dialog
          open
          onClose={() => setAsking(null)}
          role="alertdialog"
          title={`${asking.label}?`}
          description={`${asking.body} Pengumuman tidak bisa ditarik kembali.`}
          actions={
            <>
              <Button variant="secondary" onClick={() => setAsking(null)}>
                Batal
              </Button>
              <Button onClick={() => confirm(asking)}>{asking.label}</Button>
            </>
          }
        />
      )}
    </section>
  );
}
