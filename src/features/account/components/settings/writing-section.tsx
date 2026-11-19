"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckChoice } from "@/components/ui/choice";
import { Field, Select } from "@/components/ui/field";
import { ErrorBanner } from "@/components/ui/states";
import { useT } from "@/lib/i18n/provider";
import { saveAccount } from "../../account-store";
import {
  TYPEWRITER_POSITIONS,
  WRITING_MODES,
  WRITING_TEXT_SIZES,
  type WritingPreferences,
} from "../../writing-preferences";
import { SettingsSection } from "./settings-section";

export function WritingSection({ prefs }: { prefs: WritingPreferences }) {
  const { writing } = useT().account.settings;
  const [failed, setFailed] = useState(false);
  const sizeField = useRef<HTMLSelectElement>(null);

  function save(patch: Partial<WritingPreferences>) {
    setFailed(!saveAccount({ prefs: { writing: patch } }));
  }

  function retry() {
    if (!saveAccount({})) return;
    setFailed(false);
    sizeField.current?.focus();
  }

  return (
    <SettingsSection id="writing" title={writing.title} subtitle={writing.description}>
      <div className="grid gap-4">
        <Field id="writing-size" label={writing.textSize} className="max-w-72">
          <Select
            id="writing-size"
            ref={sizeField}
            value={prefs.textSize}
            onChange={(event) =>
              save({ textSize: event.target.value as WritingPreferences["textSize"] })
            }
          >
            {WRITING_TEXT_SIZES.map((size) => (
              <option key={size} value={size}>
                {writing.sizes[size]}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="writing-mode" label={writing.mode} className="max-w-72">
          <Select
            id="writing-mode"
            value={prefs.mode}
            onChange={(event) => save({ mode: event.target.value as WritingPreferences["mode"] })}
          >
            {WRITING_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {writing.modes[mode]}
              </option>
            ))}
          </Select>
        </Field>
        {prefs.mode === "typewriter" && (
          <Field id="typewriter-position" label={writing.typewriterPosition} className="max-w-72">
            <Select
              id="typewriter-position"
              value={prefs.typewriterPosition}
              onChange={(event) =>
                save({
                  typewriterPosition: event.target
                    .value as WritingPreferences["typewriterPosition"],
                })
              }
            >
              {TYPEWRITER_POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {writing.positions[position]}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <CheckChoice
          label={writing.curlyQuotes}
          hint={writing.curlyQuotesHint}
          checked={prefs.curlyQuotes}
          onChange={(event) => save({ curlyQuotes: event.target.checked })}
        />
        <CheckChoice
          label={writing.substitutions}
          hint={writing.substitutionsHint}
          checked={prefs.substitutions}
          onChange={(event) => save({ substitutions: event.target.checked })}
        />
      </div>
      {failed && (
        <ErrorBanner
          action={
            <Button variant="secondary" size="sm" onClick={retry}>
              {writing.retry}
            </Button>
          }
        >
          {writing.failed}
        </ErrorBanner>
      )}
    </SettingsSection>
  );
}
