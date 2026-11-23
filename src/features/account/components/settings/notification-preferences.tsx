"use client";

import { Bell } from "@phosphor-icons/react/dist/ssr";
import { useId } from "react";
import { CheckMark } from "@/components/ui/choice";
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

type Channel = "app" | "email";

const grid =
  "grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] items-center gap-x-2 sm:grid-cols-[minmax(0,1fr)_6rem_6rem]";

/** One checkbox in a channel column; its name is the channel, the row group names the event. */
function Cell({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer justify-center py-1">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="sr-only">{label}</span>
      <CheckMark
        checked={checked}
        className="peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
      />
    </label>
  );
}

function Row({
  event,
  prefs,
  set,
}: {
  event: NotificationEvent;
  prefs: NotificationPrefs;
  set: (event: NotificationEvent, channel: Channel, value: boolean) => void;
}) {
  const { notifications: copy } = useT().account.settings;
  const nameId = useId();
  const cell = (channel: Channel, label: string) =>
    EVENT_INFO[event][channel] ? (
      <Cell
        label={label}
        checked={prefs[event][channel]}
        onChange={(value) => set(event, channel, value)}
      />
    ) : (
      <span className="text-center text-sm text-ink-muted" title={copy.unavailable}>
        <span aria-hidden>–</span>
        <span className="sr-only">
          {label}: {copy.unavailable}
        </span>
      </span>
    );
  return (
    <div
      role="group"
      aria-labelledby={nameId}
      className={`${grid} border-t border-line py-2.5 first:border-t-0`}
    >
      <span id={nameId} className="text-sm wrap-anywhere text-ink">
        {copy.events[event]}
      </span>
      {cell("app", copy.app)}
      {cell("email", copy.email)}
    </div>
  );
}

/**
 * Notifications the reader can turn off, per event and channel (PLT-11), as a table: one row per
 * event, one column per channel. Each box saves at once. A channel the PRD does not give an event
 * shows a dash, and what cannot be turned off is said in one note instead of a list of locked boxes.
 */
export function NotificationPreferences({ prefs }: { prefs: NotificationPrefs }) {
  const { notifications: copy } = useT().account.settings;
  const set = (event: NotificationEvent, channel: Channel, value: boolean) =>
    saveAccount({ prefs: { notifications: { [event]: { [channel]: value } } } });

  return (
    <SettingsSection id="notifications" icon={Bell} title={copy.title} subtitle={copy.subtitle}>
      <div className="grid gap-5">
        <div
          aria-hidden
          className={`${grid} rounded-lg bg-subtle px-3 py-2 text-xs font-medium text-ink-muted`}
        >
          <span>{copy.colEvent}</span>
          <span className="text-center">{copy.colApp}</span>
          <span className="text-center">{copy.colEmail}</span>
        </div>
        {GROUPS.map((group) => (
          <section key={group} aria-label={copy.groups[group]} className="grid px-3">
            <h3 className="pb-1 text-sm font-semibold text-accent-ink">{copy.groups[group]}</h3>
            {eventsOf(group).map((event) => (
              <Row key={event} event={event} prefs={prefs} set={set} />
            ))}
          </section>
        ))}
        <div className="grid gap-1 rounded-lg bg-subtle px-3 py-3">
          <h3 className="text-sm font-semibold">{copy.alwaysTitle}</h3>
          <p className="text-sm text-ink-muted">{copy.always}</p>
        </div>
      </div>
    </SettingsSection>
  );
}
