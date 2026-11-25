"use client";

import { PenNib } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { ErrorBanner } from "@/components/ui/states";
import { useT } from "@/lib/i18n/provider";
import { saveAccountAsync } from "../../account-store";
import {
  TYPEWRITER_POSITIONS,
  WRITING_MODES,
  type WritingPreferences,
} from "../../writing-preferences";
import { SettingRow, SettingRows } from "./setting-row";
import { SettingsSection } from "./settings-section";
import { Switch } from "./switch";

export function WritingSection({ prefs }: { prefs: WritingPreferences }) {
  const { writing } = useT().account.settings;
  const [failed, setFailed] = useState(false);
  const modeField = useRef<HTMLSelectElement>(null);

  async function save(patch: Partial<WritingPreferences>) {
    setFailed(!(await saveAccountAsync({ prefs: { writing: patch } })));
  }

  async function retry() {
    if (!(await saveAccountAsync({}))) return;
    setFailed(false);
    modeField.current?.focus();
  }

  return (
    <SettingsSection
      id="writing"
      icon={PenNib}
      title={writing.title}
      subtitle={writing.description}
    >
      <SettingRows>
        <SettingRow label={writing.mode} labelFor="writing-mode">
          <Select
            id="writing-mode"
            ref={modeField}
            className="sm:w-56"
            value={prefs.mode}
            onChange={(event) => save({ mode: event.target.value as WritingPreferences["mode"] })}
          >
            {WRITING_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {writing.modes[mode]}
              </option>
            ))}
          </Select>
        </SettingRow>
        {prefs.mode === "typewriter" && (
          <SettingRow label={writing.typewriterPosition} labelFor="typewriter-position">
            <Select
              id="typewriter-position"
              className="sm:w-56"
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
          </SettingRow>
        )}
        <SettingRow label={writing.curlyQuotes} hint={writing.curlyQuotesHint}>
          <Switch
            label={writing.curlyQuotes}
            checked={prefs.curlyQuotes}
            onChange={(checked) => save({ curlyQuotes: checked })}
          />
        </SettingRow>
        <SettingRow label={writing.substitutions} hint={writing.substitutionsHint}>
          <Switch
            label={writing.substitutions}
            checked={prefs.substitutions}
            onChange={(checked) => save({ substitutions: checked })}
          />
        </SettingRow>
      </SettingRows>
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
