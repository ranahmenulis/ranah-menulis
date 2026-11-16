import { describe, expect, it } from "vitest";
import { contestNotifications } from "@/features/projects/lomba/contest-notifications";
import { fixtures } from "./notification-helpers";
import { NOW, registration } from "../helpers";

describe("contestNotifications", () => {
  const { finished, open, noFinalists } = fixtures;

  it("announces the finalists and the winners of a contest the reader joined, newest first", () => {
    const out = contestNotifications({
      projects: [finished],
      registrations: { [finished.slug]: registration(finished.slug) },
      overrides: {},
      now: NOW,
    });
    expect(out.map((n) => n.text)).toEqual([
      "Pemenang Lomba Cerita Mini Pesisir 2026 sudah diumumkan.",
      "Finalis Lomba Cerita Mini Pesisir 2026 sudah diumumkan.",
    ]);
    expect(out[0]).toMatchObject({
      kind: "project",
      href: `/projects/${finished.slug}/hasil`,
    });
    expect(out[0].at).toBeGreaterThan(out[1].at!);
  });

  it("says nothing about a contest the reader did not join, or one that announced nothing", () => {
    expect(
      contestNotifications({ projects: [finished], registrations: {}, overrides: {}, now: NOW }),
    ).toEqual([]);
    expect(
      contestNotifications({
        projects: [open],
        registrations: { [open.slug]: registration(open.slug) },
        overrides: {},
        now: NOW,
      }),
    ).toEqual([]);
  });

  it("follows a panel that pushed a contest on, and names the reader's own work", () => {
    const out = contestNotifications({
      projects: [open],
      registrations: { [open.slug]: registration(open.slug) },
      overrides: { [open.slug]: { stage: "finalis", times: { finalis: NOW + 5 }, mine: true } },
      now: NOW,
      ownWorks: { [open.slug]: "Hujan di Atap" },
    });
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("Karyamu “Hujan di Atap” masuk finalis di Lomba Cerpen Hujan 2026.");
    expect(out[0].at).toBe(NOW + 5);
  });

  it("dates each announcement by when it was pushed, not by the latest push", () => {
    const out = contestNotifications({
      projects: [open],
      registrations: { [open.slug]: registration(open.slug) },
      overrides: {
        [open.slug]: { stage: "pemenang", times: { finalis: NOW + 5, pemenang: NOW + 9 } },
      },
      now: NOW,
    });
    expect(out.map((n) => [n.text.split(" ")[0], n.at])).toEqual([
      ["Pemenang", NOW + 9],
      ["Finalis", NOW + 5],
    ]);
  });

  it("counts only a confirmed registration as having joined", () => {
    const waiting = registration(finished.slug, { status: "menunggu-pembayaran" });
    expect(
      contestNotifications({
        projects: [finished],
        registrations: { [finished.slug]: waiting },
        overrides: {},
        now: NOW,
      }),
    ).toEqual([]);
  });

  it("does not announce finalists for a contest that has no finalist step", () => {
    const esai = noFinalists;
    const out = contestNotifications({
      projects: [esai],
      registrations: { [esai.slug]: registration(esai.slug) },
      overrides: {},
      now: NOW + 40 * 86_400_000,
    });
    expect(out.map((n) => n.text)).toEqual([`Pemenang ${esai.title} sudah diumumkan.`]);
  });

  it("gives each announcement one stable id", () => {
    const input = {
      projects: [finished],
      registrations: { [finished.slug]: registration(finished.slug) },
      overrides: {},
      now: NOW,
    };
    expect(contestNotifications(input).map((n) => n.id)).toEqual(
      contestNotifications(input).map((n) => n.id),
    );
    expect(new Set(contestNotifications(input).map((n) => n.id)).size).toBe(2);
  });
});
