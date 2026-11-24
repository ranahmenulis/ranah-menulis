"use client";

import { createLocalListStore } from "@/lib/local-list-store";
import { ME_ID } from "../fixtures/authors";
import {
  COASTAL_GROUP_ID,
  COASTAL_GROUP_NAME,
  initialMembership,
  type GroupMember,
  type WritingGroup,
} from "./group-model";

const coastalMember = (authorId: string, admin = false): GroupMember => ({
  authorId,
  membershipId: initialMembership(authorId),
  admin,
});

export const groupSeeds: readonly WritingGroup[] = [
  {
    id: COASTAL_GROUP_ID,
    name: COASTAL_GROUP_NAME,
    description: "Tempat berbagi cuplikan cerita tentang kota dan kehidupan di pesisir.",
    visibility: "privat",
    code: "PESISIR26",
    members: [coastalMember("hafiz-rahman", true), coastalMember(ME_ID)],
    invites: [],
    progress: [],
    hiddenPosts: [],
  },
  {
    id: "ruang-cerpen",
    name: "Ruang Cerpen",
    description: "Ruang untuk saling membaca cuplikan cerpen yang sedang dikerjakan.",
    visibility: "publik",
    code: "CERPEN26",
    members: [{ authorId: "hafiz-rahman", membershipId: "cerpen:hafiz-rahman", admin: true }],
    invites: [{ authorId: ME_ID, by: "hafiz-rahman" }],
    progress: [],
    hiddenPosts: [],
  },
];

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function strings(row: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => typeof row[key] === "string");
}

const isDay = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
const isCount = (value: unknown) =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const optional = (value: unknown, check: (v: unknown) => boolean) =>
  value === undefined || check(value);
const rows = (value: unknown, check: (row: Record<string, unknown>) => boolean) =>
  Array.isArray(value) && value.every((row) => record(row) && check(row));

/** The leaderboard fields: absent on older circles, and well-formed when present. */
function hasValidBoard(value: Record<string, unknown>) {
  return (
    optional(value.kind, (v) => v === "permanent" || v === "challenge") &&
    optional(value.startsOn, isDay) &&
    optional(value.endsOn, isDay) &&
    optional(value.requests, (v) =>
      rows(v, (r) => typeof r.authorId === "string" && Number.isFinite(r.at)),
    ) &&
    optional(value.words, (v) =>
      rows(v, (r) => strings(r, ["authorId", "membershipId"]) && isDay(r.day) && isCount(r.words)),
    ) &&
    optional(value.finalBoard, (v) =>
      rows(
        v,
        (r) =>
          (r.authorId === null || typeof r.authorId === "string") &&
          typeof r.name === "string" &&
          isCount(r.words) &&
          isCount(r.rank),
      ),
    )
  );
}

function isGroup(value: unknown): value is WritingGroup {
  if (!record(value) || !strings(value, ["id", "name", "description", "code"])) return false;
  return (
    (value.visibility === "publik" || value.visibility === "privat") &&
    Array.isArray(value.members) &&
    value.members.every(
      (row) =>
        record(row) &&
        strings(row, ["authorId", "membershipId"]) &&
        typeof row.admin === "boolean" &&
        optional(row.board, (v) => typeof v === "boolean") &&
        optional(row.boardSince, isDay),
    ) &&
    Array.isArray(value.invites) &&
    value.invites.every((row) => record(row) && strings(row, ["authorId", "by"])) &&
    Array.isArray(value.progress) &&
    value.progress.every(
      (row) =>
        record(row) &&
        strings(row, ["id", "authorId", "membershipId", "username", "title"]) &&
        typeof row.words === "number" &&
        Number.isSafeInteger(row.words) &&
        row.words >= 0,
    ) &&
    Array.isArray(value.hiddenPosts) &&
    value.hiddenPosts.every((id) => typeof id === "string") &&
    hasValidBoard(value)
  );
}

export const writingGroups = createLocalListStore("ranah.writingGroups", isGroup, groupSeeds);
