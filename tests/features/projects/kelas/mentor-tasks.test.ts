import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  assignmentNotifications,
  newTaskNotifications,
} from "@/features/projects/kelas/assignment-notifications";
import { classProgress, resolveClass } from "@/features/projects/kelas/class-model";
import { classFixtures } from "@/features/projects/kelas/fixtures/all";
import {
  addTask,
  parseTasks,
  removeTask,
  updateTask,
} from "@/features/projects/kelas/mentor-task-store";
import {
  canDeleteTask,
  dueAtOf,
  moduleOf,
  newTask,
  paragraphsOf,
  validateTask,
  type MentorTask,
} from "@/features/projects/kelas/mentor-tasks";
import { NOW, project, registration } from "../helpers";
import { CERPEN, DAY, handedIn } from "./helpers";

const ok = {
  title: "Surat untuk tokohmu",
  instructions: "Tulis satu surat.",
  dueDate: "2026-11-30",
};
const ctx = { zone: "WIB" as const, now: NOW };

function task(over: Partial<MentorTask> = {}): MentorTask {
  return { id: "mt-1", slug: CERPEN, createdAt: NOW, ...ok, ...over };
}

describe("dueAtOf", () => {
  it("is the last moment of that day in the project's zone", () => {
    expect(new Date(dueAtOf("2026-11-30", "WIB")!).toISOString()).toBe("2026-11-30T16:59:59.999Z");
    expect(new Date(dueAtOf("2026-11-30", "MYT")!).toISOString()).toBe("2026-11-30T15:59:59.999Z");
  });

  it("refuses text that is not a real calendar day", () => {
    for (const bad of ["", "30-11-2026", "2026-02-30", "2026-13-01", "besok"]) {
      expect(dueAtOf(bad, "WIB")).toBeNull();
    }
  });
});

describe("validateTask", () => {
  it("accepts a complete task with a coming deadline", () => {
    expect(validateTask(ok, ctx)).toEqual({});
  });

  it("names every rule that fails, none dropped", () => {
    const errors = validateTask({ title: "  ", instructions: "", dueDate: "" }, ctx);
    expect(Object.keys(errors).sort()).toEqual(["dueDate", "instructions", "title"]);
  });

  it("refuses too long text", () => {
    expect(validateTask({ ...ok, title: "x".repeat(121) }, ctx).title).toMatch(/120/);
    expect(validateTask({ ...ok, instructions: "x".repeat(5001) }, ctx).instructions).toMatch(
      /5\.000/,
    );
  });

  it("refuses a day already behind us, unless an edit keeps the saved day", () => {
    const past = { ...ok, dueDate: "2026-11-10" };
    expect(validateTask(past, ctx).dueDate).toMatch(/sudah lewat/);
    expect(validateTask(past, { ...ctx, current: "2026-11-10" })).toEqual({});
  });

  it("lets a task fall due today, since the day is not over", () => {
    expect(validateTask({ ...ok, dueDate: "2026-11-16" }, ctx)).toEqual({});
  });
});

describe("tasks as class content", () => {
  it("splits instructions into paragraphs on blank lines", () => {
    expect(paragraphsOf("Satu.\n\n  Dua.\n \nTiga.\n")).toEqual(["Satu.", "Dua.", "Tiga."]);
  });

  it("becomes a module with no materials, marked as written by a mentor", () => {
    const added = moduleOf(task(), "WIB")!;
    expect(added.custom).toBe(true);
    expect(added.materials).toEqual([]);
    expect(added.assignment.id).toBe("mt-1");
    expect(added.assignment.module).toBe("Tugas tambahan");
  });

  it("is skipped when its date cannot be read, instead of breaking the class", () => {
    expect(moduleOf(task({ dueDate: "rusak" }), "WIB")).toBeNull();
  });

  it("is added after the curriculum, only to its own class, and counts in progress", () => {
    const fixture = classFixtures.find((c) => c.slug === CERPEN)!;
    const plain = resolveClass(fixture, project(CERPEN))!;
    const withTasks = resolveClass(fixture, project(CERPEN), [
      task(),
      task({ id: "mt-2", slug: "kelas-lain" }),
    ])!;
    expect(withTasks.modules).toHaveLength(plain.modules.length + 1);
    expect(withTasks.modules.at(-1)?.assignment.id).toBe("mt-1");
    expect(classProgress(withTasks, new Set(), []).total).toBe(
      classProgress(plain, new Set(), []).total + 1,
    );
  });

  it("keeps a task that already has hand-ins", () => {
    expect(canDeleteTask(task(), [])).toBe(true);
    expect(canDeleteTask(task(), [handedIn({ assignmentId: "mt-1" })])).toBe(false);
    expect(canDeleteTask(task(), [handedIn({ assignmentId: "tugas-1" })])).toBe(true);
  });

  it("is written trimmed, with an id of its own", () => {
    const a = newTask({ ...ok, title: "  Judul  " }, CERPEN, NOW);
    const b = newTask(ok, CERPEN, NOW);
    expect(a.title).toBe("Judul");
    expect(a.id).not.toBe(b.id);
    expect(a.id.startsWith("mt-")).toBe(true);
  });
});

describe("the task store", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("drops malformed entries instead of breaking a page", () => {
    const raw = JSON.stringify([task(), { id: 5 }, "x", null]);
    expect(parseTasks(raw)).toHaveLength(1);
    expect(parseTasks("bukan json")).toEqual([]);
    expect(parseTasks('{"a":1}')).toEqual([]);
    expect(parseTasks(null)).toEqual([]);
  });

  it("adds, changes and removes a task", () => {
    addTask(task());
    addTask(task({ id: "mt-2" }));
    updateTask("mt-1", (t) => ({ ...t, title: "Baru" }));
    expect(parseTasks(localStorage.getItem("ranah.mentorTasks")).map((t) => t.title)).toEqual([
      "Baru",
      ok.title,
    ]);
    removeTask("mt-1");
    expect(parseTasks(localStorage.getItem("ranah.mentorTasks")).map((t) => t.id)).toEqual([
      "mt-2",
    ]);
  });
});

describe("notifications for tasks", () => {
  const registered = (at: number) => ({
    [CERPEN]: registration(CERPEN, { registeredAt: at }),
  });

  it("tells a registered participant about a task written after they joined", () => {
    const [n] = newTaskNotifications([task({ createdAt: NOW })], registered(NOW - DAY));
    expect(n.text).toMatch(/Mentor menambahkan tugas “Surat untuk tokohmu”/);
    expect(n.href).toBe(`/projects/${CERPEN}/tugas/mt-1`);
    expect(n.id).toBe("tugas-baru-mt-1");
  });

  it("says nothing about tasks older than the registration, or without an active one", () => {
    expect(
      newTaskNotifications([task({ createdAt: NOW - 2 * DAY })], registered(NOW - DAY)),
    ).toEqual([]);
    expect(newTaskNotifications([task()], {})).toEqual([]);
    const waiting = { [CERPEN]: registration(CERPEN, { status: "menunggu-pembayaran" as const }) };
    expect(newTaskNotifications([task()], waiting)).toEqual([]);
  });

  it("names a mentor-written task in the decision notifications too", () => {
    const work = handedIn({
      assignmentId: "mt-1",
      status: "selesai",
      statusLog: [
        { status: "dikumpulkan", at: NOW, by: "peserta" },
        { status: "selesai", at: NOW + 1, by: "mentor" },
      ],
    });
    expect(assignmentNotifications([work], undefined, undefined, [task()])[0].text).toMatch(
      /Surat untuk tokohmu/,
    );
    expect(assignmentNotifications([work])).toEqual([]);
  });
});
