"use client";

import { useEffect, useState } from "react";
import { sharedDocumentIds } from "../post-model";
import type { PostStore } from "../storage/post-store";

const NONE: ReadonlySet<string> = new Set();

/**
 * Ids of Studio documents that were shared as a published post. The tag is a hint, not data the
 * author depends on, so a failed read just shows no tags.
 */
export function useSharedDocumentIds(store: PostStore): ReadonlySet<string> {
  const [ids, setIds] = useState<ReadonlySet<string>>(NONE);

  useEffect(() => {
    let cancelled = false;
    store
      .listPosts()
      .then((posts) => !cancelled && setIds(sharedDocumentIds(posts)))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [store]);

  return ids;
}
