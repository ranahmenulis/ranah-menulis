"use client";

import { CheckChoice } from "@/components/ui/choice";
import {
  EVENT_INFO,
  GROUPS,
  eventsOf,
  type NotificationEvent,
  type NotificationPrefs,
} from "@/features/notifications/preferences";
import { useT } from "@/lib/i18n/provider";
import { saveAccount } from "../../account-store";
import { SettingsSection } from "./settings-section";

/**
 * Notifications the reader can turn off, per event and channel (PLT-11). Each switch saves at once.
 * A channel the PRD does not give an event has no switch, and what cannot be turned off is said in
 * one note instead of a list of locked switches.
 */
export function NotificationPreferences({ prefs }: { prefs: NotificationPrefs }) {
  const { notifications: copy } = useT().account.settings;
  const set = (event: NotificationEvent, channel: "app" | "email", value: boolean) =>
    saveAccount({ prefs: { notifications: { [event]: { [channel]: value } } } });

  return (
    <SettingsSection id="notifications" title={copy.title} subtitle={copy.subtitle}>
      <div className="grid gap-6">
        {GROUPS.map((group) => (
          <div key={group} className="grid gap-3">
            <h3 className="text-sm font-semibold">{copy.groups[group]}</h3>
            {eventsOf(group).map((event) => (
              <fieldset key={event} className="grid min-w-0 gap-2">
                <legend className="text-sm wrap-anywhere">{copy.events[event]}</legend>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {EVENT_INFO[event].app && (
                    <CheckChoice
                      label={copy.app}
                      checked={prefs[event].app}
                      onChange={(e) => set(event, "app", e.target.checked)}
                    />
                  )}
                  {EVENT_INFO[event].email && (
                    <CheckChoice
                      label={copy.email}
                      checked={prefs[event].email}
                      onChange={(e) => set(event, "email", e.target.checked)}
                    />
                  )}
                </div>
              </fieldset>
            ))}
          </div>
        ))}
        <div className="grid gap-1 border-t border-line pt-4">
          <h3 className="text-sm font-semibold">{copy.alwaysTitle}</h3>
          <p className="text-sm text-ink-muted">{copy.always}</p>
        </div>
      </div>
    </SettingsSection>
  );
}
