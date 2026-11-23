import type { Locale } from "@/lib/i18n/config";
import { fill } from "@/features/studio/copy/fill";
import type {
  EventSettings,
  EventSprint,
  WritingEvent,
} from "@/features/community/events/event-model";
import type { TimeZoneName } from "@/features/projects/types";
import { MAX_SPRINT_MINUTES, parseMinutes } from "@/features/studio/sprint";
import { eventsCopy } from "./copy";

export type EventInput = {
  title: string;
  description: string;
  rules: string;
  zone: TimeZoneName;
  start: string;
  end: string;
  target: string;
  capacity: string;
  sprintStart: string;
  sprintMinutes: string;
};

// [usulan] Text limits for the local event form.
const EVENT_TEXT_LIMITS = { title: 80, description: 1000, rules: 1500 } as const;
const localOffset = { WIB: 7, MYT: 8 };

function localInput(time: number, zone: TimeZoneName) {
  return new Date(time + localOffset[zone] * 3_600_000).toISOString().slice(0, 16);
}

function timestamp(input: string, zone: TimeZoneName) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) return null;
  const time = Date.parse(`${input}+0${localOffset[zone]}:00`);
  return time >= 0 && localInput(time, zone) === input ? time : null;
}

export function inputOf(event?: WritingEvent): EventInput {
  if (!event)
    return {
      title: "",
      description: "",
      rules: "",
      zone: "WIB",
      start: "",
      end: "",
      target: "",
      capacity: "",
      sprintStart: "",
      sprintMinutes: "",
    };
  const { zone, sprint } = event;
  return {
    title: event.title,
    description: event.description,
    rules: event.rules,
    zone,
    start: localInput(event.startsAt, zone),
    end: localInput(event.endsAt, zone),
    target: String(event.target),
    capacity: event.capacity === null ? "" : String(event.capacity),
    sprintStart: sprint ? localInput(sprint.startsAt, zone) : "",
    sprintMinutes: sprint ? String((sprint.endsAt - sprint.startsAt) / 60_000) : "",
  };
}

export type FormIssues = Partial<Record<keyof EventInput, string>>;
export type EventBuild = { ok: true; settings: EventSettings } | { ok: false; errors: FormIssues };

function positiveInteger(input: string) {
  const value = Number(input);
  return /^\d+$/.test(input) && Number.isSafeInteger(value) && value > 0 ? value : null;
}

function textIssues(fields: Pick<EventInput, "title" | "description" | "rules">, locale: Locale) {
  const t = eventsCopy(locale).issues;
  const errors: FormIssues = {};
  for (const [key, max] of Object.entries(EVENT_TEXT_LIMITS)) {
    const field = key as keyof typeof fields;
    if (!fields[field]) errors[field] = t.required;
    else if (fields[field].length > max) errors[field] = fill(t.max, { max: String(max) });
  }
  return errors;
}

function parseSprint(
  input: EventInput,
  start: number | null,
  end: number | null,
  errors: FormIssues,
  locale: Locale,
) {
  const t = eventsCopy(locale).issues;
  if (!input.sprintStart && !input.sprintMinutes) return null;
  const sprintStart = timestamp(input.sprintStart, input.zone);
  const minutes = parseMinutes(input.sprintMinutes);
  if (sprintStart === null) errors.sprintStart = t.sprintStart;
  if (minutes === null)
    errors.sprintMinutes = fill(t.sprintMinutes, { max: String(MAX_SPRINT_MINUTES) });
  if (sprintStart === null || minutes === null) return null;
  const sprint = { startsAt: sprintStart, endsAt: sprintStart + minutes * 60_000 };
  if ((start !== null && sprint.startsAt < start) || (end !== null && sprint.endsAt > end)) {
    errors.sprintStart = t.sprintWithin;
  }
  return sprint;
}

export function buildEvent(input: EventInput, locale: Locale = "id"): EventBuild {
  const t = eventsCopy(locale).issues;
  const fields = {
    title: input.title.trim(),
    description: input.description.trim(),
    rules: input.rules.trim(),
  };
  const errors = textIssues(fields, locale);
  if (input.zone !== "WIB" && input.zone !== "MYT") {
    return { ok: false, errors: { ...errors, zone: t.zone } };
  }
  const start = timestamp(input.start, input.zone);
  const end = timestamp(input.end, input.zone);
  const target = positiveInteger(input.target.trim());
  const capacity = positiveInteger(input.capacity.trim());
  if (start === null) errors.start = t.start;
  if (end === null || (start !== null && end <= start)) errors.end = t.end;
  if (target === null) errors.target = t.target;
  if (input.capacity.trim() && capacity === null) errors.capacity = t.capacity;
  const sprint = parseSprint(input, start, end, errors, locale);
  if (start === null || end === null || target === null || Object.keys(errors).length) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    settings: {
      ...fields,
      zone: input.zone,
      startsAt: start,
      endsAt: end,
      target,
      capacity,
      sprint,
    },
  };
}

function sameSprint(left: EventSprint | null, right: EventSprint | null) {
  return left?.startsAt === right?.startsAt && left?.endsAt === right?.endsAt;
}

export function settingsBlock(
  settings: EventSettings,
  event: WritingEvent | undefined,
  now: number,
  locale: Locale = "id",
) {
  const t = eventsCopy(locale).blocks;
  if (!event) return settings.endsAt <= now ? t.endPast : null;
  const taken = event.participants.length;
  if (settings.capacity !== null && settings.capacity < taken)
    return fill(t.capacity, { taken: String(taken) });
  // [usulan] Participants keep their original event window and word target.
  if (
    event.scheduleLocked &&
    (event.startsAt !== settings.startsAt ||
      event.endsAt !== settings.endsAt ||
      event.zone !== settings.zone ||
      event.target !== settings.target)
  ) {
    return t.scheduleLocked;
  }
  if (
    event.sprint &&
    now >= event.sprint.startsAt &&
    (event.zone !== settings.zone || !sameSprint(event.sprint, settings.sprint))
  ) {
    return t.sprintLocked;
  }
  return null;
}
