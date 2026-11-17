import type { JSONContent } from "@tiptap/react";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { resolveProjects } from "@/features/projects/project-model";
import type { Submission } from "@/features/projects/submission-types";
import type { Project, Registration } from "@/features/projects/types";

export const NOW = Date.UTC(2026, 10, 16, 5, 0, 0);

export function project(slug: string, now = NOW): Project {
  const found = resolveProjects(projectFixtures, now).find((p) => p.slug === slug);
  if (!found) throw new Error(`no fixture ${slug}`);
  return found;
}

/** A Tiptap document with exactly `words` words in one paragraph. */
export function textOf(words: number): JSONContent {
  return {
    type: "doc",
    content:
      words === 0
        ? [{ type: "paragraph" }]
        : [
            {
              type: "paragraph",
              content: [{ type: "text", text: Array(words).fill("kata").join(" ") }],
            },
          ],
  };
}

export function registration(slug: string, over: Partial<Registration> = {}): Registration {
  // A registration that waits for payment is judged against the real clock by the screens (its
  // seat is held for a day), so it is made "just now"; the others keep the fixed test time.
  const at = over.status === "menunggu-pembayaran" ? Date.now() - 1000 : NOW - 1000;
  return {
    slug,
    registeredAt: at,
    agreedAt: at,
    termsVersion: "2026-11-contoh",
    status: "terdaftar",
    ...over,
  };
}

export function submission(over: Partial<Submission> = {}): Submission {
  return {
    id: "s1",
    slug: "lomba-esai-literasi-remaja",
    title: "Buku yang Mengubahku",
    genre: "Esai",
    note: "",
    originalityAgreedAt: NOW,
    docId: "d1",
    docTitle: "Esai",
    status: "terkirim",
    statusLog: [{ status: "terkirim", at: NOW, by: "sistem" }],
    versions: [{ version: 1, content: textOf(5), wordCount: 5, hash: "h", frozenAt: NOW }],
    submittedAt: NOW,
    ...over,
  };
}
