import type { Comment } from "../types";
import type { Marks, PostStore, StoredPost } from "./post-store";

/** In-memory store with the same behaviour as the IndexedDB one. Used by tests. */
export function createMemoryPostStore(): PostStore {
  const posts = new Map<string, StoredPost>();
  const comments = new Map<string, Comment>();
  const marks: Marks = {};

  return {
    async listPosts() {
      return [...posts.values()];
    },
    async getPost(id) {
      return posts.get(id) ?? null;
    },
    async putPost(post) {
      posts.set(post.id, post);
    },
    async deletePost(id) {
      posts.delete(id);
    },
    async listComments() {
      return [...comments.values()];
    },
    async putComment(comment) {
      comments.set(comment.id, comment);
    },
    async listMarks() {
      return { ...marks };
    },
    async setMark(key, value) {
      marks[key] = value;
    },
  };
}
