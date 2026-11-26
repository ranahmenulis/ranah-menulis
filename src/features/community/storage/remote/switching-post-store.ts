import type { PostStore } from "../post-store";

/**
 * Picks the account store when a session is active and the device store otherwise, per call.
 */
export function createSwitchingPostStore(
  device: () => PostStore,
  account: () => Promise<PostStore | null>,
): PostStore {
  const active = async () => (await account()) ?? device();
  return {
    listPosts: async () => (await active()).listPosts(),
    getPost: async (id) => (await active()).getPost(id),
    putPost: async (post) => (await active()).putPost(post),
    deletePost: async (id) => (await active()).deletePost(id),
    listComments: async () => (await active()).listComments(),
    putComment: async (comment) => (await active()).putComment(comment),
    listMarks: async () => (await active()).listMarks(),
    setMark: async (key, value) => (await active()).setMark(key, value),
  };
}
