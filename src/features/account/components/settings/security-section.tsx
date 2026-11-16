"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import type { Account } from "../../account-store";
import { ChangePasswordDialog } from "./change-password-dialog";
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
      title={settings.security.title}
      subtitle={settings.security.subtitle}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="grid gap-0.5 text-sm">
          <p className="font-medium">{settings.security.password}</p>
          <p className="text-ink-muted">
            {changed
              ? format(settings.security.lastChanged, { date: changed })
              : settings.security.neverChanged}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          {settings.security.change}
        </Button>
      </div>
      {open && <ChangePasswordDialog onClose={() => setOpen(false)} />}
    </SettingsSection>
  );
}
