import { isFollowing } from "@/features/community/feed";
import { ME_ID, authors } from "@/features/community/fixtures/authors";
import type { Marks } from "@/features/community/storage/post-store";
import {
  GENRES,
  type Author,
  type Country,
  type Genre,
  type Post,
} from "@/features/community/types";
import { profiles, type ProfileFixture } from "./fixtures";

export const COUNTRY_LABEL: Record<Country, string> = { ID: "Indonesia", MY: "Malaysia" };

const EMPTY: ProfileFixture = { bio: "", followers: 0, following: 0 };

export const profileOf = (authorId: string): ProfileFixture => profiles[authorId] ?? EMPTY;

/** "Kuala Lumpur, Malaysia" or just "Indonesia". */
export const whereOf = (author: Author) =>
  [author.place, COUNTRY_LABEL[author.country]].filter(Boolean).join(", ");

/** The genres an author has published in, in the app's fixed order. */
export function genresOf(posts: readonly Post[]): Genre[] {
  const used = new Set(posts.map((p) => p.genre));
  return GENRES.filter((g) => used.has(g));
}

/**
 * What a public profile lists: the author's Publik posts, newest first. Group posts are never part
 * of a profile, not even your own, because a profile is what a stranger sees.
 */
export function publicWorks(posts: readonly Post[], authorId: string): Post[] {
  return posts
    .filter((p) => p.authorId === authorId && p.visibility === "publik")
    .sort((a, b) => b.publishedAt - a.publishedAt || a.id.localeCompare(b.id));
}

/** Followers shown: the stored count plus the reader, when the reader follows this author. */
export const followerCount = (authorId: string, marks: Marks) =>
  profileOf(authorId).followers + (authorId !== ME_ID && isFollowing(marks, authorId) ? 1 : 0);

/** The reader's own "following" follows their marks; everyone else's is the stored number. */
export function followingCount(authorId: string, marks: Marks): number {
  if (authorId !== ME_ID) return profileOf(authorId).following;
  return authors.filter((a) => a.id !== ME_ID && isFollowing(marks, a.id)).length;
}
