import type {
  EventSettings,
  EventSprint,
  WritingEvent,
} from "@/features/community/events/event-model";
import type { TimeZoneName } from "@/features/projects/types";
import { MAX_SPRINT_MINUTES, parseMinutes } from "@/features/studio/sprint";

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

function textIssues(fields: Pick<EventInput, "title" | "description" | "rules">) {
  const errors: FormIssues = {};
  for (const [key, max] of Object.entries(EVENT_TEXT_LIMITS)) {
    const field = key as keyof typeof fields;
    if (!fields[field]) errors[field] = "Isi bidang ini.";
    else if (fields[field].length > max) errors[field] = `Maksimal ${max} karakter.`;
  }
  return errors;
}

function parseSprint(
  input: EventInput,
  start: number | null,
  end: number | null,
  errors: FormIssues,
) {
  if (!input.sprintStart && !input.sprintMinutes) return null;
  const sprintStart = timestamp(input.sprintStart, input.zone);
  const minutes = parseMinutes(input.sprintMinutes);
  if (sprintStart === null) errors.sprintStart = "Isi tanggal dan jam mulai sprint yang valid.";
  if (minutes === null) errors.sprintMinutes = `Isi durasi 1–${MAX_SPRINT_MINUTES} menit.`;
  if (sprintStart === null || minutes === null) return null;
  const sprint = { startsAt: sprintStart, endsAt: sprintStart + minutes * 60_000 };
  if ((start !== null && sprint.startsAt < start) || (end !== null && sprint.endsAt > end)) {
    errors.sprintStart = "Seluruh sesi sprint harus berada di dalam jadwal event.";
  }
  return sprint;
}

export function buildEvent(input: EventInput): EventBuild {
  const fields = {
    title: input.title.trim(),
    description: input.description.trim(),
    rules: input.rules.trim(),
  };
  const errors = textIssues(fields);
  if (input.zone !== "WIB" && input.zone !== "MYT") {
    return { ok: false, errors: { ...errors, zone: "Pilih zona waktu." } };
  }
  const start = timestamp(input.start, input.zone);
  const end = timestamp(input.end, input.zone);
  const target = positiveInteger(input.target.trim());
  const capacity = positiveInteger(input.capacity.trim());
  if (start === null) errors.start = "Isi tanggal dan jam mulai yang valid.";
  if (end === null || (start !== null && end <= start))
    errors.end = "Pilih waktu setelah event dimulai.";
  if (target === null) errors.target = "Isi target dengan bilangan bulat positif.";
  if (input.capacity.trim() && capacity === null)
    errors.capacity = "Isi kuota dengan bilangan bulat positif.";
  const sprint = parseSprint(input, start, end, errors);
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
) {
  if (!event) return settings.endsAt <= now ? "Pilih waktu selesai yang belum lewat." : null;
  const taken = event.participants.length;
  if (settings.capacity !== null && settings.capacity < taken)
    return `Kuota paling sedikit ${taken} peserta.`;
  // [usulan] Participants keep their original event window and word target.
  if (
    event.scheduleLocked &&
    (event.startsAt !== settings.startsAt ||
      event.endsAt !== settings.endsAt ||
      event.zone !== settings.zone ||
      event.target !== settings.target)
  ) {
    return "Jadwal, zona waktu, dan target kata terkunci setelah ada peserta.";
  }
  if (
    event.sprint &&
    now >= event.sprint.startsAt &&
    (event.zone !== settings.zone || !sameSprint(event.sprint, settings.sprint))
  ) {
    return "Jadwal sprint dan zona waktu terkunci setelah sesi mulai.";
  }
  return null;
}
