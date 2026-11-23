"use client";

import { LockKey } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import type { Account } from "../../account-store";
import { ChangePasswordDialog } from "./change-password-dialog";
import { SettingRow, SettingRows } from "./setting-row";
import { SettingsSection } from "./settings-section";

export function SecuritySection({ account }: { account: Account }) {
  const { settings } = useT().account;
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const changed = account.passwordChangedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(
        new Date(account.passwordChangedAt),
      )
    : null;
  return (
    <SettingsSection
      id="security"
      icon={LockKey}
      title={settings.security.title}
      subtitle={settings.security.subtitle}
    >
      <SettingRows>
        <SettingRow
          label={settings.security.password}
          hint={
            changed
              ? format(settings.security.lastChanged, { date: changed })
              : settings.security.neverChanged
          }
        >
          <Button variant="secondary" onClick={() => setOpen(true)}>
            {settings.security.change}
          </Button>
        </SettingRow>
      </SettingRows>
      {open && <ChangePasswordDialog onClose={() => setOpen(false)} />}
    </SettingsSection>
  );
}
