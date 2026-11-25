"use client";

import { User } from "@phosphor-icons/react/dist/ssr";
import { Button, ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useOwnProfileHref } from "../../use-own-profile-href";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { saveAccount, type Account } from "../../account-store";
import { useProfileForm } from "../../hooks/use-profile-form";
import { cleanProfile } from "../../profile-validation";
import { normalizeUsername } from "../../validation";
import { ProfileFields } from "../profile-fields";
import { SettingsHead } from "./settings-head";
import { SettingsSection } from "./settings-section";

/** "November 2026". The date is read as UTC so the month does not shift with the reader's zone. */
function memberSince(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/**
 * Informasi pribadi (PLT-02): the profile form, the email (read-only; changing it is not in the
 * PRD), and when the account was made. Starts from the saved profile; the page waits for it.
 */
export function PersonalSection({ account }: { account: Account }) {
  const ownProfile = useOwnProfileHref();
  const t = useT().account;
  const locale = useLocale();
  const toast = useToast();
  const form = useProfileForm(account.profile, account.profile.username);
  const zoneChanged = form.values.timeZone !== account.profile.timeZone;

  return (
    <>
      <SettingsHead
        profile={account.profile}
        form={form}
        email={account.email}
        memberSince={format(t.settings.personal.memberSince, {
          date: memberSince(account.memberSince, locale),
        })}
      />
      <SettingsSection
        id="personal"
        icon={User}
        title={t.settings.personal.title}
        subtitle={t.settings.personal.subtitle}
      >
        <form
          noValidate
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.validate()) return;
            const kept = saveAccount({ profile: cleanProfile(form.values, normalizeUsername) });
            toast(
              kept
                ? { message: t.settings.personal.saved, key: "settings-saved" }
                : { message: t.settings.personal.failed, tone: "error", key: "settings-saved" },
            );
          }}
        >
          <ProfileFields form={form} ownUsername={account.profile.username} photo={false} columns />

          {zoneChanged && <Notice>{t.settings.zone.warning}</Notice>}

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
            <ButtonLink href={ownProfile} variant="text">
              {t.settings.personal.viewProfile}
            </ButtonLink>
            <Button type="submit">{t.settings.personal.save}</Button>
          </div>
        </form>
      </SettingsSection>
    </>
  );
}
