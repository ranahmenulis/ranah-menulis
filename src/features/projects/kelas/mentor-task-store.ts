"use client";

import { useSyncExternalStore } from "react";
import { noonOf, type MentorTask } from "./mentor-tasks";

const KEY = "ranah.mentorTasks";
const NONE: readonly MentorTask[] = [];

const listeners = new Set<() => void>();

/** Only set when localStorage refused a write, so the screen still reflects what was saved. */
let fallback: string | null = null;

function snapshot(): string | null {
  try {
    return fallback ?? window.localStorage.getItem(KEY);
  } catch {
    return fallback;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => (e.key === KEY || e.key === null) && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const isTask = (value: unknown): value is MentorTask => {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.slug === "string" &&
    typeof t.title === "string" &&
    typeof t.instructions === "string" &&
    typeof t.dueDate === "string" &&
    noonOf(t.dueDate) !== null &&
    Number.isFinite(t.createdAt)
  );
};

/** Anything that is not a well-formed task is dropped, so old or edited data cannot break a page. */
export function parseTasks(raw: string | null): readonly MentorTask[] {
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return NONE;
    const tasks = parsed.filter(isTask);
    return tasks.length === 0 ? NONE : tasks;
  } catch {
    return NONE;
  }
}

let cached: { raw: string | null; tasks: readonly MentorTask[] } = { raw: null, tasks: NONE };

export function readMentorTasks(): readonly MentorTask[] {
  const raw = snapshot();
  if (raw !== cached.raw) cached = { raw, tasks: parseTasks(raw) };
  return cached.tasks;
}

/** The tasks mentors wrote on this device. Same list on every call until something changes. */
export function useMentorTasks(): readonly MentorTask[] {
  return useSyncExternalStore(subscribe, readMentorTasks, () => NONE);
}

function write(tasks: readonly MentorTask[]) {
  const raw = JSON.stringify(tasks);
  try {
    window.localStorage.setItem(KEY, raw);
    fallback = null;
  } catch {
    fallback = raw;
  }
  listeners.forEach((l) => l());
}

export const addTask = (task: MentorTask) => write([...readMentorTasks(), task]);

export const updateTask = (id: string, change: (task: MentorTask) => MentorTask) =>
  write(readMentorTasks().map((t) => (t.id === id ? change(t) : t)));

export const removeTask = (id: string) => write(readMentorTasks().filter((t) => t.id !== id));
