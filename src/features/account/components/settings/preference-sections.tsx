"use client";

import { Eye, Translate } from "@phosphor-icons/react/dist/ssr";
import { Select } from "@/components/ui/field";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { useChangeLocale, useLocale, useT } from "@/lib/i18n/provider";
import { saveAccount, type Account, type AccountPrefs } from "../../account-store";
import { NotificationPreferences } from "./notification-preferences";
import { SettingRow, SettingRows } from "./setting-row";
import { SettingsSection } from "./settings-section";
import { Switch } from "./switch";

export function LanguageSection() {
  const { settings } = useT().account;
  const locale = useLocale();
  const { change, pending } = useChangeLocale();
  return (
    <SettingsSection
      id="language"
      icon={Translate}
      title={settings.language.title}
      subtitle={settings.language.subtitle}
    >
      <SettingRows>
        <SettingRow label={settings.language.label} labelFor="language-select">
          <Select
            className="sm:w-64"
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
        </SettingRow>
      </SettingRows>
    </SettingsSection>
  );
}

/** Privacy and email preferences. Each switch saves at once; there is no button to press. */
export function PreferenceSections({ prefs }: { prefs: Account["prefs"] }) {
  const { settings } = useT().account;
  const set = (patch: Partial<AccountPrefs>) => saveAccount({ prefs: patch });
  return (
    <>
      <SettingsSection id="privacy" icon={Eye} title={settings.privacy.title}>
        <SettingRows>
          <SettingRow label={settings.privacy.streakLabel} hint={settings.privacy.streakHint}>
            <Switch
              label={settings.privacy.streakLabel}
              checked={prefs.showStreak}
              onChange={(checked) => set({ showStreak: checked })}
            />
          </SettingRow>
        </SettingRows>
      </SettingsSection>
      <NotificationPreferences prefs={prefs.notifications} />
    </>
  );
}
