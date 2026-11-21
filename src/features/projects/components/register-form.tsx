"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckChoice, RadioChoice } from "@/components/ui/choice";
import { isFreeMoney, categoryLabel, moneyLabel } from "../project-model";
import { deadlineText } from "../project-text";
import { canRegister, registrationFee } from "../registration-model";
import type { Project, ProjectState } from "../types";
import { Section } from "./category-blocks";
import { ProjectStrip } from "./project-strip";

/**
 * The two statements every project shares, from the PRD (BR-PRJ-03: the author keeps the copyright
 * unless project terms say otherwise; BR-PRJ-02: terms of use and publication). Sample wording, not
 * legal text [konfirmasi Q-21].
 */
const BASE_TERMS = [
  "Hak cipta karyamu tetap padamu, kecuali ketentuan khusus di bawah menyatakan lain secara eksplisit.",
  "Karya yang kamu kirim adalah karyamu sendiri, atau kamu berhak mengirimkannya.",
];

type Props = {
  project: Project;
  state: ProjectState;
  onSubmit: (packageName?: string) => void;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line py-3 text-base">
      <dt>{label}</dt>
      <dd className="text-sm wrap-anywhere text-ink-muted">{children}</dd>
    </div>
  );
}

/** Registration form (PRJ-02): summary, package (Solo), terms to accept, and the one button. */
export function RegisterForm({ project, state, onSubmit }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [packageName, setPackageName] = useState<string | undefined>();
  const fee = registrationFee(project, packageName);
  const paid = !isFreeMoney(fee);
  const ready = canRegister(project, { agreed, packageName });
  const hintId = "register-hint";

  return (
    <form
      className="grid gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) onSubmit(packageName);
      }}
    >
      <header className="grid gap-6">
        <ProjectStrip project={project} />
        <h1 className="heading-lg">Daftar</h1>
      </header>

      <Section title="Ringkasan">
        <dl>
          <Row label="Kategori">{categoryLabel(project.category)}</Row>
          <Row label="Biaya">{moneyLabel(fee)}</Row>
          <Row label="Pendaftaran">{deadlineText(project, state)}</Row>
        </dl>
        {paid && (
          <p className="text-sm text-ink-muted">
            Biaya dibayar lewat QRIS setelah mendaftar; kuotamu ditahan 24 jam [usulan].
          </p>
        )}
      </Section>

      {project.block.kind === "solo" && (
        <fieldset className="grid gap-3">
          <legend className="mb-3 heading-md">Pilih paket</legend>
          {project.block.packages.map((pack) => (
            <RadioChoice
              key={pack.name}
              name="paket"
              value={pack.name}
              checked={packageName === pack.name}
              onChange={() => setPackageName(pack.name)}
              label={<span className="wrap-anywhere">{pack.name}</span>}
              hint={`${moneyLabel(pack.fee)} · ${pack.includes.join(", ")}`}
            />
          ))}
        </fieldset>
      )}

      <Section title="Ketentuan">
        <ul className="grid list-disc gap-1.5 pl-5 text-base marker:text-ink-muted">
          {BASE_TERMS.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <h3 className="mt-2 text-sm font-semibold">Ketentuan khusus proyek</h3>
        {project.terms.special.length > 0 ? (
          <ul className="grid list-disc gap-1.5 pl-5 text-base marker:text-ink-muted">
            {project.terms.special.map((text, i) => (
              <li key={i} className="wrap-anywhere">
                {text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base">Proyek ini tidak punya ketentuan khusus.</p>
        )}
        <p className="text-xs text-ink-muted">Versi ketentuan {project.terms.version}</p>
      </Section>

      <div className="grid gap-4">
        <CheckChoice
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          label="Saya sudah membaca dan menyetujui ketentuan di atas."
        />
        <Button
          type="submit"
          disabled={!ready}
          aria-describedby={ready ? undefined : hintId}
          className="justify-self-start"
        >
          Daftar
        </Button>
        {!ready && (
          <p id={hintId} className="text-xs text-ink-muted">
            {project.block.kind === "solo"
              ? "Pilih paket dan setujui ketentuan untuk mendaftar."
              : "Setujui ketentuan untuk mendaftar."}
          </p>
        )}
      </div>
    </form>
  );
}
