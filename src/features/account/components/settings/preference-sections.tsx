"use client";

import { CheckChoice } from "@/components/ui/choice";
import { Field, Select } from "@/components/ui/field";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { useChangeLocale, useLocale, useT } from "@/lib/i18n/provider";
import { saveAccount, type Account, type AccountPrefs } from "../../account-store";
import { SettingsSection } from "./settings-section";

export function LanguageSection() {
  const { settings } = useT().account;
  const locale = useLocale();
  const { change, pending } = useChangeLocale();
  return (
    <SettingsSection
      id="language"
      title={settings.language.title}
      subtitle={settings.language.subtitle}
    >
      <Field id="language-select" label={settings.language.label} className="max-w-72">
        <Select
          id="language-select"
          value={locale}
          disabled={pending}
          onChange={(event) => change(event.target.value as Locale)}
        >
          {LOCALES.map((code) => (
            <option key={code} value={code}>
              {settings.language[code]}
            </option>
          ))}
        </Select>
      </Field>
    </SettingsSection>
  );
}

/** Privacy and email preferences. Each switch saves at once; there is no button to press. */
export function PreferenceSections({ prefs }: { prefs: Account["prefs"] }) {
  const { settings } = useT().account;
  const set = (patch: Partial<AccountPrefs>) => saveAccount({ prefs: patch });
  return (
    <>
      <SettingsSection id="privacy" title={settings.privacy.title}>
        <CheckChoice
          label={settings.privacy.streakLabel}
          hint={settings.privacy.streakHint}
          checked={prefs.showStreak}
          onChange={(event) => set({ showStreak: event.target.checked })}
        />
      </SettingsSection>
      <SettingsSection
        id="notifications"
        title={settings.notifications.title}
        subtitle={settings.notifications.subtitle}
      >
        <div className="grid gap-4">
          <CheckChoice
            label={settings.notifications.comments}
            checked={prefs.emailComments}
            onChange={(event) => set({ emailComments: event.target.checked })}
          />
          <CheckChoice
            label={settings.notifications.projects}
            checked={prefs.emailProjects}
            onChange={(event) => set({ emailProjects: event.target.checked })}
          />
        </div>
      </SettingsSection>
    </>
  );
}
