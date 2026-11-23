"use client";

import type { Dispatch } from "react";
import { RadioChoice } from "@/components/ui/choice";
import { Field, Input, Select } from "@/components/ui/field";
import { Notice } from "@/components/ui/states";
import { useT } from "@/lib/i18n/provider";
import type { ComposeAction, ComposeState } from "../../compose-state";
import { groupsFor } from "../../groups/group-model";
import { writingGroups } from "../../groups/group-store";
import { useGroupReader } from "../../groups/group-viewer";
import { CoverImageField } from "./cover-image-field";
import { GENRES, type Genre } from "../../types";

type Props = {
  state: ComposeState;
  dispatch: Dispatch<ComposeAction>;
  /** Pick-from-document mode has its title here; direct writing has it above the text. */
  showTitle: boolean;
  hint: string | null;
};

/**
 * Settings beside the text (COM-01, STD-10): kind, genre, who may read, and the notice that only
 * this text becomes public. Visibility has no default and the notice cannot be closed (AC-14, AC-15).
 */
/** Each settings group starts under a hairline, so the card reads as three short steps. */
const divided = "border-t border-line pt-6";

export function SettingsPanel({ state, dispatch, showTitle, hint }: Props) {
  const dict = useT();
  const t = dict.compose.settings;
  const labels = dict.community.labels;
  const groups = groupsFor(writingGroups.use(), useGroupReader());
  const lostGroup =
    state.visibility === "grup" && !groups.some((group) => group.id === state.groupId);
  return (
    <div className="grid gap-6">
      {showTitle && (
        <Field id="post-title" label={t.title}>
          <Input
            id="post-title"
            type="text"
            value={state.title}
            onChange={(e) => dispatch({ type: "title", value: e.target.value })}
          />
        </Field>
      )}

      <div className="grid gap-6">
        <fieldset className="grid content-start gap-2">
          <legend className="mb-2 text-sm font-medium">{t.kind}</legend>
          <div role="radiogroup" aria-label={t.kind} className="flex gap-5">
            <RadioChoice
              name="post-kind"
              label={labels.prolog}
              checked={state.kind === "prolog"}
              onChange={() => dispatch({ type: "kind", value: "prolog" })}
            />
            <RadioChoice
              name="post-kind"
              label={labels.cuplikan}
              checked={state.kind === "cuplikan"}
              onChange={() => dispatch({ type: "kind", value: "cuplikan" })}
            />
          </div>
        </fieldset>
        <Field id="post-genre" label={t.genre}>
          <Select
            id="post-genre"
            value={state.genre}
            onChange={(e) => dispatch({ type: "genre", value: e.target.value as Genre | "" })}
          >
            <option value="" disabled>
              {t.chooseGenre}
            </option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {labels.genres[g]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className={divided}>
        <CoverImageField image={state.image} dispatch={dispatch} />
      </div>

      <div className={divided}>
        <fieldset className="grid gap-3">
          <legend className="mb-3 text-sm font-medium">{t.whoCanRead}</legend>
          <RadioChoice
            name="post-visibility"
            label={t.public}
            hint={t.publicHint}
            checked={state.visibility === "publik"}
            onChange={() => dispatch({ type: "visibility", value: "publik" })}
          />
          {groups.map((group) => (
            <RadioChoice
              key={group.id}
              name="post-visibility"
              label={group.name}
              hint={t.groupHint}
              checked={state.visibility === "grup" && state.groupId === group.id}
              onChange={() => dispatch({ type: "visibility", value: "grup", groupId: group.id })}
            />
          ))}
          {lostGroup && <p className="text-sm text-danger">{t.lostGroup}</p>}
          {state.visibility === null && <p className="text-xs text-ink-muted">{t.pickOne}</p>}
        </fieldset>
      </div>

      <div className="-mt-2 grid gap-3">
        <Notice>
          {state.visibility === "grup" ? t.noticeGroup : state.image ? t.noticeImage : t.noticeText}{" "}
          {t.noticeTail}
        </Notice>

        {hint && <p className="text-sm text-ink-muted">{hint}</p>}
      </div>
    </div>
  );
}
