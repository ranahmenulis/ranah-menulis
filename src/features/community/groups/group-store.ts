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

function isGroup(value: unknown): value is WritingGroup {
  if (!record(value) || !strings(value, ["id", "name", "description", "code"])) return false;
  return (
    (value.visibility === "publik" || value.visibility === "privat") &&
    Array.isArray(value.members) &&
    value.members.every(
      (row) =>
        record(row) && strings(row, ["authorId", "membershipId"]) && typeof row.admin === "boolean",
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
    value.hiddenPosts.every((id) => typeof id === "string")
  );
}

export const writingGroups = createLocalListStore("ranah.writingGroups", isGroup, groupSeeds);
