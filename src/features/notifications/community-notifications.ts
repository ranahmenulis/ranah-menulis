import { canRead } from "@/features/community/feed";
import type { EditorPick } from "@/features/community/curation/picks-store";
import type { WritingGroup } from "@/features/community/groups/group-model";
import { resolveFixtureComments, resolveFixturePosts } from "@/features/community/post-model";
import type {
  ModerationEntry,
  Report,
  ReportKind,
} from "@/features/community/moderation/report-store";
import { contentState, removedIds } from "@/features/community/moderation/removed";
import { mark, toPost, type PostStore } from "@/features/community/storage/post-store";
import type { Post } from "@/features/community/types";
import { buildCases, caseHref, caseKey } from "@/features/kelola/admin/moderation/moderation-model";
import { isSelf } from "@/features/kelola/identity";
import { isPlatformAdmin, type ManagerRole } from "@/lib/roles";
import { notificationFixtures } from "./fixtures";
import type { Notification } from "./types";

const fixturePosts = new Map(resolveFixturePosts(0).map((post) => [post.id, post]));
const fixtureComments = resolveFixtureComments(0);
const postHref = (id: string) => `/postingan/${encodeURIComponent(id)}`;
const fixturePostsByHref = new Map(
  [...fixturePosts.values()].map((post) => [postHref(post.id), post]),
);

export function visibleFixtureNotifications(
  groups: readonly WritingGroup[],
  reader: string | null,
  entries: readonly ModerationEntry[],
) {
  const removed = removedIds(entries).posts;
  return notificationFixtures.filter(({ href }) => {
    const post = fixturePostsByHref.get(href ?? "");
    return !post || (!removed.has(post.id) && canRead(post, groups, reader));
  });
}

export function reportNotifications(
  reports: readonly Report[],
  entries: readonly ModerationEntry[],
  roles: readonly ManagerRole[],
): Notification[] {
  if (!isPlatformAdmin(roles)) return [];
  return buildCases(reports, entries).flatMap((row) => {
    if (row.status !== "baru") return [];
    const content = row.kind === "post" ? "tulisan" : "komentar";
    return [
      {
        id: `mod-report:${caseKey(row.kind, row.targetId)}:${row.since}`,
        kind: "community",
        actorId: null,
        others: 0,
        agoMs: 0,
        at: row.since,
        text: `Ada laporan baru untuk satu ${content}.`,
        href: caseHref(row.kind, row.targetId),
        target: { kind: "report" },
      },
    ];
  });
}

export async function readNotificationPost(store: PostStore, id: string): Promise<Post | null> {
  const fixture = fixturePosts.get(id);
  if (fixture) return fixture;
  const stored = await store.getPost(id);
  return stored ? toPost(stored) : null;
}

export function pickNotification(
  pick: EditorPick,
  post: Post | null,
  entries: readonly ModerationEntry[],
): Notification[] {
  if (pick.at <= 0 || !post || post.id !== pick.postId || !isSelf(post.authorId)) return [];
  if (post.visibility !== "publik" || contentState(entries, "post", post.id) !== "tampil")
    return [];
  return [
    {
      id: `editor-pick:${post.id}:${pick.at}`,
      kind: "community",
      actorId: null,
      others: 0,
      agoMs: 0,
      at: pick.at,
      text: `Tulisanmu “${post.title}” dipilih untuk Editor’s Picks.`,
      href: postHref(post.id),
      target: { kind: "pick", postId: post.id },
    },
  ];
}

export function activeHides(entries: readonly ModerationEntry[]) {
  const lastHide = new Map<string, ModerationEntry>();
  const removed = removedIds(entries);
  for (const entry of entries) {
    if (entry.decision === "sembunyikan") {
      lastHide.set(caseKey(entry.kind, entry.targetId), entry);
    }
  }
  return [...lastHide.values()].filter(
    ({ kind, targetId }) =>
      (kind === "post" ? removed.posts : removed.comments).has(targetId) &&
      contentState(entries, kind, targetId) === "disembunyikan",
  );
}

const fixtureOwner = (kind: ReportKind, id: string) =>
  kind === "post"
    ? fixturePosts.get(id)?.authorId
    : fixtureComments.find((comment) => comment.id === id)?.authorId;

async function ownHiddenComments(store: PostStore, ids: readonly string[]) {
  if (ids.length === 0) return new Set<string>();
  const [comments, marks] = await Promise.all([store.listComments(), store.listMarks()]);
  return new Set(
    [...fixtureComments, ...comments]
      .filter(
        (comment) =>
          ids.includes(comment.id) && isSelf(comment.authorId) && !marks[mark.deleted(comment.id)],
      )
      .map((comment) => comment.id),
  );
}

export async function hiddenNotifications(
  store: PostStore,
  entries: readonly ModerationEntry[],
): Promise<Notification[]> {
  const candidates = activeHides(entries).filter(({ kind, targetId }) => {
    const owner = fixtureOwner(kind, targetId);
    return owner === undefined || isSelf(owner);
  });
  const comments = await ownHiddenComments(
    store,
    candidates.filter((entry) => entry.kind === "comment").map((entry) => entry.targetId),
  );
  const notifications = await Promise.all(
    candidates.map(async ({ kind, targetId, at }) => {
      const post = kind === "post" ? await readNotificationPost(store, targetId) : null;
      if (!(kind === "comment" ? comments.has(targetId) : post && isSelf(post.authorId))) return [];
      return [
        {
          id: `mod-hidden:${caseKey(kind, targetId)}:${at}`,
          kind: "community" as const,
          actorId: null,
          others: 0,
          agoMs: 0,
          at,
          href: null,
          text:
            kind === "post"
              ? "Tulisanmu disembunyikan oleh moderator."
              : "Komentarmu disembunyikan oleh moderator.",
        },
      ];
    }),
  );
  return notifications.flat();
}
