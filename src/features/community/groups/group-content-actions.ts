import { personById } from "@/features/kelola/admin/people";
import { validateReason } from "@/features/kelola/reason";
import { isArchivedDocument } from "@/features/studio/document-archive";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { studioStore } from "@/features/studio/storage/store";
import { resolveFixturePosts } from "../post-model";
import { toPost, type PostStore } from "../storage/post-store";
import { postStore } from "../storage/store";
import { changeGroup, doneGroup, refuseGroup, saveGroupChange } from "./group-actions";
import { activeGroupPost, canManageGroup, memberOf } from "./group-model";
import { writingGroups } from "./group-store";
import { readGroupReader } from "./group-viewer";

export async function shareProgress(
  id: string,
  preview: { id: string; version: number },
  store: Pick<DocumentStore, "get"> = studioStore,
) {
  const group = writingGroups.read().find((item) => item.id === id);
  const originalMembership = group && memberOf(group, readGroupReader());
  if (!originalMembership) return refuseGroup("membersOnly");

  let doc;
  try {
    doc = await store.get(preview.id);
  } catch {
    return refuseGroup("docReadFailed");
  }
  if (doc && isArchivedDocument(doc)) return refuseGroup("archived");
  if (
    !doc ||
    doc.deletedAt ||
    doc.version !== preview.version ||
    !Number.isSafeInteger(doc.wordCount) ||
    doc.wordCount <= 0 ||
    typeof doc.title !== "string"
  ) {
    return refuseGroup("docChanged");
  }
  const { title, wordCount } = doc;
  return changeGroup(id, (group, groups, { authorId }) => {
    const membership = memberOf(group, authorId);
    const author = personById(authorId);
    if (!membership || !author || membership.membershipId !== originalMembership.membershipId) {
      return refuseGroup("membershipChanged");
    }
    const progress = {
      id: crypto.randomUUID(),
      authorId,
      membershipId: membership.membershipId,
      username: author.handle,
      title,
      words: wordCount,
    };
    saveGroupChange(groups, { ...group, progress: [progress, ...group.progress] }, authorId);
    return doneGroup("progressShared");
  });
}

export async function hideGroupPost(
  id: string,
  postId: string,
  reason: string,
  store: PostStore = postStore,
) {
  if (validateReason(reason, true)) return refuseGroup("hideReasonRequired");
  let post;
  try {
    const stored = await store.getPost(postId);
    post = stored ? toPost(stored) : resolveFixturePosts(0).find((item) => item.id === postId);
  } catch {
    return refuseGroup("postReadFailed");
  }
  const content = post;
  return changeGroup(id, (group, groups, { authorId, platform }) => {
    if (!canManageGroup(group, authorId, platform)) return refuseGroup("accessDenied");
    if (!content || !activeGroupPost(content, group) || group.hiddenPosts.includes(postId)) {
      return refuseGroup("postUnavailable");
    }
    saveGroupChange(groups, { ...group, hiddenPosts: [...group.hiddenPosts, postId] }, authorId, {
      action: "group.post.hide",
      ref: `post:${postId}`,
      targetId: content.authorId,
      reason: reason.trim(),
    });
    return doneGroup("postHidden");
  });
}
