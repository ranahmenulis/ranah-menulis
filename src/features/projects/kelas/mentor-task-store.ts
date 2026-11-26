"use client";

import { useSyncExternalStore } from "react";
import {
  deleteRemoteMentorTask,
  loadRemoteMentorTasks,
  upsertRemoteMentorTask,
} from "../storage/remote/remote-project-maps";
import { noonOf, type MentorTask } from "./mentor-tasks";

const KEY = "ranah.mentorTasks";
const NONE: readonly MentorTask[] = [];

const listeners = new Set<() => void>();

/** Only set when localStorage refused a write, so the screen still reflects what was saved. */
let fallback: string | null = null;
let remoteTasks: readonly MentorTask[] | null = null;
let loadedRemote = false;

function ensureRemote() {
  if (loadedRemote) return;
  loadedRemote = true;
  void loadRemoteMentorTasks()
    .then((tasks) => {
      if (tasks === null) return;
      remoteTasks = tasks;
      listeners.forEach((l) => l());
    })
    .catch(() => {
      loadedRemote = false;
    });
}

function snapshot(): string | null {
  try {
    return fallback ?? window.localStorage.getItem(KEY);
  } catch {
    return fallback;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureRemote();
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
  if (remoteTasks !== null) return remoteTasks;
  const raw = snapshot();
  if (raw !== cached.raw) cached = { raw, tasks: parseTasks(raw) };
  return cached.tasks;
}

/** The tasks mentors wrote on this device. Same list on every call until something changes. */
export function useMentorTasks(): readonly MentorTask[] {
  return useSyncExternalStore(subscribe, readMentorTasks, () => NONE);
}

function write(tasks: readonly MentorTask[]) {
  if (remoteTasks !== null) {
    remoteTasks = tasks;
    listeners.forEach((l) => l());
    return;
  }
  const raw = JSON.stringify(tasks);
  try {
    window.localStorage.setItem(KEY, raw);
    fallback = null;
  } catch {
    fallback = raw;
  }
  listeners.forEach((l) => l());
}

export const addTask = (task: MentorTask) => {
  write([...readMentorTasks(), task]);
  if (remoteTasks !== null) void upsertRemoteMentorTask(task).catch(() => undefined);
};

export const updateTask = (id: string, change: (task: MentorTask) => MentorTask) => {
  let updated: MentorTask | null = null;
  write(
    readMentorTasks().map((t) => {
      if (t.id !== id) return t;
      updated = change(t);
      return updated;
    }),
  );
  if (remoteTasks !== null && updated) void upsertRemoteMentorTask(updated).catch(() => undefined);
};

export const removeTask = (id: string) => {
  write(readMentorTasks().filter((t) => t.id !== id));
  if (remoteTasks !== null) void deleteRemoteMentorTask(id).catch(() => undefined);
};
