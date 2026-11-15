"use client";

import type { Dispatch } from "react";
import { RadioChoice } from "@/components/ui/choice";
import { Field, Input, Select } from "@/components/ui/field";
import { Notice } from "@/components/ui/states";
import type { ComposeAction, ComposeState } from "../../compose-state";
import { MY_GROUPS } from "../../fixtures/authors";
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
export function SettingsPanel({ state, dispatch, showTitle, hint }: Props) {
  // [konfirmasi] Which groups offer this option, and who can read a group post (Q-38).
  const group = MY_GROUPS[0];
  return (
    <div className="grid gap-6">
      {showTitle && (
        <Field id="post-title" label="Judul postingan">
          <Input
            id="post-title"
            type="text"
            value={state.title}
            onChange={(e) => dispatch({ type: "title", value: e.target.value })}
          />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="grid content-start gap-2">
          <legend className="mb-2 text-sm font-medium">Jenis</legend>
          <div role="radiogroup" aria-label="Jenis" className="flex gap-5">
            <RadioChoice
              name="post-kind"
              label="Prolog"
              checked={state.kind === "prolog"}
              onChange={() => dispatch({ type: "kind", value: "prolog" })}
            />
            <RadioChoice
              name="post-kind"
              label="Cuplikan"
              checked={state.kind === "cuplikan"}
              onChange={() => dispatch({ type: "kind", value: "cuplikan" })}
            />
          </div>
        </fieldset>
        <Field id="post-genre" label="Genre">
          <Select
            id="post-genre"
            value={state.genre}
            onChange={(e) => dispatch({ type: "genre", value: e.target.value as Genre | "" })}
          >
            <option value="" disabled>
              Pilih genre
            </option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-sm font-medium">Siapa yang bisa membaca</legend>
        <RadioChoice
          name="post-visibility"
          label="Publik"
          hint="Semua orang, termasuk yang belum punya akun. Muncul di feed pengikut dan Jelajahi."
          checked={state.visibility === "publik"}
          onChange={() => dispatch({ type: "visibility", value: "publik" })}
        />
        {group && (
          <RadioChoice
            name="post-visibility"
            label={group}
            hint="Hanya anggota grup ini. Tampil karena kamu anggotanya."
            checked={state.visibility === "grup"}
            onChange={() => dispatch({ type: "visibility", value: "grup" })}
          />
        )}
        {state.visibility === null && (
          <p className="text-xs text-ink-muted">
            Pilih salah satu sebelum menerbitkan. Postingan tidak pernah publik tanpa pilihanmu.
          </p>
        )}
      </fieldset>

      <Notice>
        Yang menjadi publik hanya teks ini. Dokumenmu di Studio tetap pribadi. Mengubah dokumen
        tidak mengubah postingan ini kecuali kamu memperbaruinya sendiri.
      </Notice>

      {hint && <p className="text-sm text-ink-muted">{hint}</p>}
    </div>
  );
}
