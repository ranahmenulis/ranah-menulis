"use client";

import { useState } from "react";
import { fill } from "@/features/studio/copy/fill";
import { useLocale, useT } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { CheckChoice, RadioChoice } from "@/components/ui/choice";
import { isFreeMoney, categoryLabel, moneyLabel } from "../project-model";
import { deadlineText } from "../project-text";
import { canRegister, registrationFee } from "../registration-model";
import type { Project, ProjectState } from "../types";
import { Section } from "@/components/ui/section-card";
import { ProjectStrip } from "./project-strip";

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
  const t = useT().projectsFlow.register.form;
  const locale = useLocale();
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
        <h1 className="heading-lg">{t.title}</h1>
      </header>

      <Section title={t.summary}>
        <dl>
          <Row label={t.category}>{categoryLabel(project.category, locale)}</Row>
          <Row label={t.fee}>{moneyLabel(fee, locale)}</Row>
          <Row label={t.registration}>{deadlineText(project, state, locale)}</Row>
        </dl>
        {paid && <p className="text-sm text-ink-muted">{t.paidNote}</p>}
      </Section>

      {project.block.kind === "solo" && (
        <fieldset className="grid gap-3">
          <legend className="mb-3 heading-md">{t.choosePackage}</legend>
          {project.block.packages.map((pack) => (
            <RadioChoice
              key={pack.name}
              name="paket"
              value={pack.name}
              checked={packageName === pack.name}
              onChange={() => setPackageName(pack.name)}
              label={<span className="wrap-anywhere">{pack.name}</span>}
              hint={`${moneyLabel(pack.fee, locale)} · ${pack.includes.join(", ")}`}
            />
          ))}
        </fieldset>
      )}

      <Section title={t.terms}>
        <ul className="grid list-disc gap-1.5 pl-5 text-base marker:text-ink-muted">
          {t.baseTerms.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <h3 className="mt-2 text-sm font-semibold">{t.specialHeading}</h3>
        {project.terms.special.length > 0 ? (
          <ul className="grid list-disc gap-1.5 pl-5 text-base marker:text-ink-muted">
            {project.terms.special.map((text, i) => (
              <li key={i} className="wrap-anywhere">
                {text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base">{t.noSpecial}</p>
        )}
        <p className="text-xs text-ink-muted">
          {fill(t.version, { version: String(project.terms.version) })}
        </p>
      </Section>

      <div className="grid gap-4">
        <CheckChoice
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          label={t.agree}
        />
        <Button
          type="submit"
          disabled={!ready}
          aria-describedby={ready ? undefined : hintId}
          className="justify-self-start"
        >
          {t.submit}
        </Button>
        {!ready && (
          <p id={hintId} className="text-xs text-ink-muted">
            {project.block.kind === "solo" ? t.hintSolo : t.hint}
          </p>
        )}
      </div>
    </form>
  );
}
