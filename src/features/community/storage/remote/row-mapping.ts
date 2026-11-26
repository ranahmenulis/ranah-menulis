import { ME_ID } from "../../fixtures/authors";
import type {
  Author,
  Comment,
  Genre,
  PostBlock,
  PostImage,
  PostKind,
  Visibility,
} from "../../types";
import type { Marks, StoredPost } from "../post-store";

export type PostRow = {
  id: string;
  author_id: string;
  status: "draft" | "published";
  title: string;
  kind: PostKind;
  genre: Genre | null;
  blocks: PostBlock[];
  source_title: string | null;
  source_doc_id: string | null;
  visibility: Visibility | null;
  group_id: string | null;
  group_membership_id: string | null;
  image: PostImage | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  text: string;
  mention: string | null;
  hidden_by_author: boolean;
  deleted_at: string | null;
  created_at: string;
};

export type ProfileSummaryRow = {
  id: string;
  display_name: string | null;
  username: string | null;
  country: string | null;
};

export type PostCountsRow = {
  post_id: string;
  appreciations: number;
  saves: number;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID.test(value);

const SAFE_DATA_IMAGE = /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/i;
const SAFE_STORAGE_IMAGE = /^https:\/\/[^/]+\/storage\/v1\/object\/public\/community-images\//;

export function safePostImage(raw: PostImage | null): PostImage | null {
  if (!raw || typeof raw.src !== "string") return null;
  const { src } = raw;
  if (
    src.startsWith("/community/photos/") ||
    SAFE_STORAGE_IMAGE.test(src) ||
    SAFE_DATA_IMAGE.test(src)
  ) {
    return raw;
  }
  return null;
}

export function authorFromProfile(row: ProfileSummaryRow): Author {
  const name = row.display_name?.trim() || row.username?.trim() || "Penulis";
  const handle = row.username?.trim() || row.id.slice(0, 8);
  return {
    id: row.id,
    name,
    handle,
    country: row.country === "MY" ? "MY" : "ID",
  };
}

export function postFromRow(
  row: PostRow,
  currentUserId: string,
  counts?: { appreciations: number; saves: number },
  meId = ME_ID,
): StoredPost {
  const isOwn = row.author_id === currentUserId;
  const image = safePostImage(row.image);
  return {
    id: row.id,
    authorId: isOwn ? meId : row.author_id,
    status: row.status,
    title: row.title,
    kind: row.kind,
    genre: row.genre,
    blocks: Array.isArray(row.blocks) ? row.blocks : [],
    sourceTitle: row.source_title,
    sourceDocId: row.source_doc_id,
    visibility: row.visibility,
    ...(image ? { image } : {}),
    ...(row.group_id ? { groupId: row.group_id } : {}),
    ...(row.group_membership_id ? { groupMembershipId: row.group_membership_id } : {}),
    updatedAt: Date.parse(row.updated_at),
    ...(row.published_at ? { publishedAt: Date.parse(row.published_at) } : {}),
    ...(counts ? { appreciations: Number(counts.appreciations), saves: Number(counts.saves) } : {}),
  };
}

export function postToRow(post: StoredPost, userId: string): Omit<PostRow, "created_at"> {
  return {
    id: post.id,
    author_id: userId,
    status: post.status,
    title: post.title,
    kind: post.kind,
    genre: post.genre,
    blocks: post.blocks,
    source_title: post.sourceTitle,
    source_doc_id: post.sourceDocId && isUuid(post.sourceDocId) ? post.sourceDocId : null,
    visibility: post.visibility,
    group_id: post.groupId && isUuid(post.groupId) ? post.groupId : null,
    group_membership_id: post.groupMembershipId ?? null,
    image: post.image ?? null,
    updated_at: new Date(post.updatedAt).toISOString(),
    published_at: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
  };
}

export function commentFromRow(row: CommentRow, currentUserId: string, meId = ME_ID): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id === currentUserId ? meId : row.author_id,
    parentId: row.parent_id,
    text: row.text,
    createdAt: Date.parse(row.created_at),
    ...(row.mention ? { mention: row.mention } : {}),
  };
}

export function marksFromRows(rows: readonly { key: string }[]): Marks {
  const out: Marks = {};
  for (const row of rows) out[row.key] = true;
  return out;
}
