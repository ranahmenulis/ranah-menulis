"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { Notice } from "@/components/ui/states";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { categoryLabel } from "@/features/projects/project-model";
import { projectCategories } from "@/features/projects/stored-projects";
import type { ProjectCategory, ProjectFixture } from "@/features/projects/types";
import { manageHref } from "../area-hrefs";
import { saveProject } from "../organizer-actions";
import { localizeProblems, type InputProblems } from "../project-problem";
import {
  emptyInput,
  inputOf,
  isOpenService,
  takesSubmissions,
  type ProjectInput,
} from "../project-input";
import { fileStore } from "@/lib/files/store";
import { discardImage } from "@/lib/files/store-image";
import { CategoryFields, TextField, ZoneSelect, type FormApi } from "./form-fields";
import { PosterField } from "./poster-field";
import {
  CalendarBlank,
  Coins,
  Image as ImageIcon,
  Info,
  ListChecks,
  Scroll,
} from "@phosphor-icons/react/dist/ssr";
import { FieldGroup } from "../../components/field-group";

const ORDER: (keyof ProjectInput | "block")[] = [
  "title",
  "summary",
  "about",
  "requirements",
  "posterAlt",
  "closesDate",
  "milestones",
  "feeIdr",
  "feeMyr",
  "quota",
  "minWords",
  "maxWorks",
  "block",
];

/**
 * Write a new draft or change a project written here (PRJ-03). Every failing rule shows at its
 * field and nothing typed is lost. Once there are participants the category, zone and prices are
 * fixed and the quota cannot drop below them. The clock is read when the button is pressed.
 */
export function ProjectForm({
  fixture,
  registrants,
}: {
  /** The project being changed; absent when writing a new one. */
  fixture?: ProjectFixture;
  registrants: number;
}) {
  const router = useRouter();
  const t = useT().kelolaOrganizer.form;
  const locale = useLocale();
  const [input, setInput] = useState<ProjectInput>(() =>
    fixture ? inputOf(fixture) : emptyInput(),
  );
  const [problems, setProblems] = useState<InputProblems>({});
  const errors = localizeProblems(problems, locale);
  const [said, setSaid] = useState("");
  // The poster file that is saved with the project; a save that replaces it frees the old file.
  const [savedPoster, setSavedPoster] = useState(fixture?.poster?.fileId ?? "");
  const locked = registrants > 0;
  const api: FormApi = {
    input,
    errors,
    set: (key, value) => setInput((prev) => ({ ...prev, [key]: value })),
  };

  function pickCategory(category: ProjectCategory) {
    setInput({
      ...emptyInput(category),
      title: input.title,
      posterId: input.posterId,
      posterAlt: input.posterAlt,
    });
    setProblems({});
  }

  function submit() {
    const result = saveProject(input, fixture?.slug ?? null, Date.now());
    if (!result.ok) {
      setProblems(result.problems);
      setSaid("");
      const first = ORDER.find((key) => result.errors[key]);
      if (first) document.getElementById(`proyek-${first}`)?.focus();
      return;
    }
    setProblems({});
    const posterNow = result.project.poster?.fileId ?? "";
    if (savedPoster && savedPoster !== posterNow) void discardImage(savedPoster, fileStore());
    setSavedPoster(posterNow);
    if (!fixture) return router.push(manageHref(result.project.slug));
    setSaid(result.project.terms.version !== fixture.terms.version ? t.savedTerms : t.saved);
  }

  return (
    <form
      noValidate
      className="grid max-w-170 gap-6"
      aria-label={fixture ? t.ariaEdit : t.ariaNew}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {!fixture && (
        <Field id="proyek-category" label={t.category.label} hint={t.category.hint}>
          <Select
            id="proyek-category"
            value={input.category}
            onChange={(e) => pickCategory(e.target.value as ProjectCategory)}
          >
            {projectCategories.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c, locale)}
              </option>
            ))}
          </Select>
        </Field>
      )}
      {locked && <Notice>{format(t.locked, { n: String(registrants) })}</Notice>}

      <FieldGroup title={t.sections.basics} icon={Info}>
        <TextField api={api} name="title" />
        <TextField api={api} name="summary" />
        <TextField api={api} name="about" rows={5} />
        <TextField api={api} name="requirements" rows={4} />
      </FieldGroup>

      <FieldGroup title={t.sections.poster} icon={ImageIcon}>
        <PosterField api={api} savedId={savedPoster} />
      </FieldGroup>

      <FieldGroup title={t.sections.schedule} icon={CalendarBlank}>
        <ZoneSelect api={api} disabled={locked} />
        {!isOpenService(input.category) && <TextField api={api} name="closesDate" type="date" />}
        <TextField api={api} name="milestones" rows={3} optional={input.category !== "kelas"} />
      </FieldGroup>

      {!isOpenService(input.category) && (
        <FieldGroup title={t.sections.money} icon={Coins}>
          <TextField api={api} name="feeIdr" optional disabled={locked} />
          <TextField api={api} name="feeMyr" optional disabled={locked} />
          <TextField api={api} name="quota" optional />
        </FieldGroup>
      )}

      {takesSubmissions(input.category) && (
        <FieldGroup title={t.sections.rules} icon={ListChecks}>
          <TextField api={api} name="minWords" />
          <TextField api={api} name="maxWords" />
          <TextField api={api} name="maxWorks" />
        </FieldGroup>
      )}

      <FieldGroup title={t.sections.special} icon={Scroll}>
        <TextField api={api} name="special" rows={3} optional />
      </FieldGroup>

      <CategoryFields api={api} />

      <div className="grid gap-3">
        <p role="status" className="min-h-5 text-sm">
          {said}
        </p>
        <Button type="submit" className="justify-self-start">
          {fixture ? t.saveChanges : t.createDraft}
        </Button>
      </div>
    </form>
  );
}
