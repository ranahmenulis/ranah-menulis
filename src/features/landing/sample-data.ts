// Sample data for the landing's app previews (client, 24 Nov 2026: the landing shows the app's own
// components). Times are fixed, never read from the clock, so the server and the browser render
// the same thing. The project and the posts are the app's own fixtures.
import { resolveFixturePosts } from "@/features/community/post-model";
import type { Post } from "@/features/community/types";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import type { MyProject } from "@/features/projects/my-projects";
import { resolveProjects } from "@/features/projects/project-model";
import type { Submission } from "@/features/projects/submission-types";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import { addDays } from "@/features/studio/streak";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** 24 November 2026, 08.00 WIB. */
export const SAMPLE_NOW = Date.UTC(2026, 10, 24, 1, 0);

/** The zone sample dates are shown in, so the server and every browser render the same text. */
export const SAMPLE_ZONE = "Asia/Jakarta";
export const SAMPLE_TODAY = "2026-11-24";
export const SAMPLE_TARGET = 500;
export const SAMPLE_TODAY_WORDS = 320;

/** Twelve days met before today, today at 320 of 500: the streak is still open. */
function streakWords(): Map<string, number> {
  const words = new Map<string, number>();
  for (let i = 1; i <= 12; i++) words.set(addDays(SAMPLE_TODAY, -i), 520 + ((i * 137) % 400));
  words.set(SAMPLE_TODAY, SAMPLE_TODAY_WORDS);
  return words;
}

export const sampleStreak: StreakData = {
  status: "ready",
  today: SAMPLE_TODAY,
  nowMs: SAMPLE_NOW,
  history: [],
  words: streakWords(),
  changes: [{ from: "2026-01-01", value: SAMPLE_TARGET }],
  target: SAMPLE_TARGET,
  todayWords: SAMPLE_TODAY_WORDS,
  summary: {
    current: 12,
    longest: { length: 21, start: "2026-09-01", end: "2026-09-21" },
    last: { length: 12, start: addDays(SAMPLE_TODAY, -12), end: addDays(SAMPLE_TODAY, -1) },
  },
  lastDocument: null,
  reload: () => {},
  setTarget: () => {},
};

/** Three manuscripts in the Studio Naskah table. */
export const sampleWorks = [
  {
    id: "nenek-jambu-air",
    title: "Yang Ditunggu Nenek di Bawah Jambu Air",
    kind: "cerpen",
    wordCount: 1240,
    tags: ["keluarga"],
    updatedAt: SAMPLE_NOW - 2 * HOUR,
    createdAt: SAMPLE_NOW - 21 * DAY,
  },
  {
    id: "dua-puluh-menit",
    title: "Dua Puluh Menit Sebelum Subuh",
    kind: "esai",
    wordCount: 860,
    tags: ["pagi"],
    updatedAt: SAMPLE_NOW - 1 * DAY,
    createdAt: SAMPLE_NOW - 34 * DAY,
  },
  {
    id: "toples-kerupuk",
    title: "Toples Kerupuk",
    kind: "cerpen",
    wordCount: 2105,
    tags: ["antologi", "masa kecil"],
    updatedAt: SAMPLE_NOW - 3 * DAY,
    createdAt: SAMPLE_NOW - 40 * DAY,
  },
] as const;

const ANTHOLOGY = "antologi-surat-yang-tidak-pernah-terkirim";

/** One anthology you joined, with one accepted work in its second version. */
export function sampleMyProject(): MyProject {
  const project = resolveProjects(projectFixtures, SAMPLE_NOW).find((p) => p.slug === ANTHOLOGY);
  if (!project) throw new Error(`Missing project fixture ${ANTHOLOGY}`);
  const sentAt = SAMPLE_NOW - 21 * DAY;
  const version = (n: number, words: number, at: number) => ({
    version: n,
    content: { type: "doc" },
    wordCount: words,
    hash: "",
    frozenAt: at,
  });
  const work: Submission = {
    id: "contoh-toples-kerupuk",
    slug: ANTHOLOGY,
    title: "Toples Kerupuk",
    genre: "Cerpen",
    note: "",
    originalityAgreedAt: sentAt,
    docId: "toples-kerupuk",
    docTitle: "Toples Kerupuk",
    status: "diterima",
    statusLog: [
      { status: "terkirim", at: sentAt, by: "peserta" },
      { status: "diterima", at: SAMPLE_NOW - 2 * DAY, by: "editor" },
    ],
    versions: [version(1, 1980, sentAt), version(2, 2105, SAMPLE_NOW - 9 * DAY)],
    submittedAt: sentAt,
  };
  return {
    project,
    registration: {
      slug: ANTHOLOGY,
      registeredAt: sentAt - 3 * DAY,
      agreedAt: sentAt - 3 * DAY,
      termsVersion: "v1",
      status: "terdaftar",
    },
    works: [work],
    needsRevision: [],
    lastActivity: SAMPLE_NOW - 2 * DAY,
  };
}

/** One catalog project per publishing path, in the landing's order: anthology, solo, class, contest. */
const PATH_PROJECTS = [
  ANTHOLOGY,
  "solo-penerbitan-buku-sendiri",
  "kelas-cerpen-untuk-pemula",
  "lomba-cerpen-hujan-2026",
];

export function samplePathProjects() {
  return PATH_PROJECTS.map((slug) => {
    const fixture = projectFixtures.find((p) => p.slug === slug);
    if (!fixture) throw new Error(`Missing project fixture ${slug}`);
    return { slug, category: fixture.category, title: fixture.title };
  });
}

const POSTS = ["bahasa-untuk-memarahi-adik", "pasar-malam-selepas-hujan"];

/** Two posts by other writers from the Community fixtures, as the Beranda feed shows them. */
export function samplePosts(): Post[] {
  const all = resolveFixturePosts(SAMPLE_NOW);
  return POSTS.map((id) => all.find((p) => p.id === id)).filter((p): p is Post => !!p);
}
