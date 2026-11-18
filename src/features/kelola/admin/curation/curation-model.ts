import { authorOf } from "@/features/community/post-model";
import type { EditorPick } from "@/features/community/curation/picks-store";
import type { Post } from "@/features/community/types";
import type { FeaturedProject } from "@/features/projects/featured-store";
import type { ProjectFixture } from "@/features/projects/types";

/** Candidates shown at a time while adding; the search narrows them. */
export const CANDIDATE_LIMIT = 8;

export type PickRow = { postId: string; title: string; author: string; shown: boolean };

/**
 * The picks as rows, in their order. A pick whose post is no longer public (hidden, deleted, made
 * private) stays in the list marked "not shown", so nothing leaves the list without a click.
 */
export function pickRows(picks: readonly EditorPick[], posts: readonly Post[]): PickRow[] {
  const byId = new Map(posts.map((p) => [p.id, p]));
  return picks.map((pick) => {
    const post = byId.get(pick.postId);
    const shown = post?.visibility === "publik";
    return {
      postId: pick.postId,
      title: post?.title ?? pick.title ?? "Tulisan tidak tersedia",
      author: post ? authorOf(post.authorId).name : "",
      shown: shown === true,
    };
  });
}

/** Public posts that are not picked yet, newest first, narrowed by a title or author search. */
export function candidates(
  posts: readonly Post[],
  picks: readonly EditorPick[],
  query: string,
): Post[] {
  const taken = new Set(picks.map((p) => p.postId));
  const needle = query.trim().toLowerCase();
  return posts
    .filter((p) => p.visibility === "publik" && !taken.has(p.id))
    .filter(
      (p) =>
        needle === "" ||
        p.title.toLowerCase().includes(needle) ||
        authorOf(p.authorId).name.toLowerCase().includes(needle),
    )
    .sort((a, b) => b.publishedAt - a.publishedAt || a.id.localeCompare(b.id))
    .slice(0, CANDIDATE_LIMIT);
}

/** The list with the item at `index` swapped with its neighbour; the same list at an edge. */
export function moveItem<T>(list: readonly T[], index: number, direction: -1 | 1): T[] {
  const to = index + direction;
  if (index < 0 || index >= list.length || to < 0 || to >= list.length) return [...list];
  const next = [...list];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

export type FeaturedRow = { slug: string; title: string; featured: boolean };

/** Published projects with the marked ones first, in the order they were marked. */
export function featuredRows(
  catalog: readonly ProjectFixture[],
  featured: readonly FeaturedProject[],
): FeaturedRow[] {
  const published = catalog.filter((p) => p.publication === "terbit");
  const marked = featured.flatMap((f) => {
    const project = published.find((p) => p.slug === f.slug);
    return project ? [{ slug: project.slug, title: project.title, featured: true }] : [];
  });
  const rest = published
    .filter((p) => !featured.some((f) => f.slug === p.slug))
    .map((p) => ({ slug: p.slug, title: p.title, featured: false }));
  return [...marked, ...rest];
}
