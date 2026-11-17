"use client";

import { createLocalListStore } from "@/lib/local-list-store";
import type { ProjectCategory, ProjectFixture, Publication } from "./types";

export const projectCategories: readonly ProjectCategory[] = ["antologi", "solo", "kelas", "lomba"];
const PUBLICATIONS: readonly Publication[] = ["terbit", "draf", "arsip"];

const strings = (v: unknown) => Array.isArray(v) && v.every((x) => typeof x === "string");
const isMilestone = (m: unknown) =>
  typeof m === "object" &&
  m !== null &&
  typeof (m as { label?: unknown }).label === "string" &&
  Number.isFinite((m as { at?: unknown }).at);
const isFee = (f: unknown) =>
  typeof f === "object" && f !== null && Object.values(f).every((n) => Number.isFinite(n));

type Bag = Record<string, unknown>;
const isBag = (v: unknown): v is Bag => typeof v === "object" && v !== null;

const hasTerms = (t: unknown) => isBag(t) && typeof t.version === "string" && strings(t.special);
const hasDates = (a: unknown) =>
  isBag(a) &&
  Array.isArray(a.milestones) &&
  a.milestones.every(isMilestone) &&
  (a.closesAt === null || Number.isFinite(a.closesAt));

/** A project an Organizer wrote on this device (PRJ-03). It carries real dates in `absolute`. */
export const isStoredProject = (value: unknown): value is ProjectFixture => {
  if (!isBag(value)) return false;
  return (
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.summary === "string" &&
    projectCategories.includes(value.category as ProjectCategory) &&
    PUBLICATIONS.includes(value.publication as Publication) &&
    (value.timeZone === "WIB" || value.timeZone === "MYT") &&
    strings(value.about) &&
    strings(value.requirements) &&
    isFee(value.fee) &&
    hasTerms(value.terms) &&
    isBag(value.block) &&
    value.block.kind === value.category &&
    hasDates(value.absolute)
  );
};

/** localStorage `ranah.organizerProjects`; becomes a table with RLS when the backend exists. */
export const storedProjects = createLocalListStore<ProjectFixture>(
  "ranah.organizerProjects",
  isStoredProject,
);
