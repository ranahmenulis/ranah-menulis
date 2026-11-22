"use client";

import { useT } from "@/lib/i18n/provider";
import { postLabel } from "../post-model";
import type { PostCore } from "../types";

/** `postLabel` bound to the interface language. */
export function usePostLabel() {
  const labels = useT().community.labels;
  return (post: Pick<PostCore, "kind" | "genre">) => postLabel(post, labels);
}
