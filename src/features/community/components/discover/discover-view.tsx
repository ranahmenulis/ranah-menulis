"use client";

import { PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ErrorBanner, RetryButton } from "@/components/ui/states";
import { StickyChipBar } from "@/components/ui/sticky-chip-bar";
import { useT } from "@/lib/i18n/provider";
import { useViewer } from "@/lib/viewer";
import { NEW_POST_HREF } from "@/features/app-shell/nav";
import { editorPicks } from "../../curation/picks-store";
import {
  CATEGORY_CHIPS_VISIBLE,
  PAGE_SIZE,
  postsForCategory,
  visibleCategories,
} from "../../categories";
import { usePostActions } from "../../hooks/use-post-actions";
import { useCommunity } from "../../hooks/use-community";
import { mark } from "../../storage/post-store";
import { postStore } from "../../storage/store";
import type { CategoryId } from "../../types";
import { CommunityLinks } from "./community-links";
import { DiscoverTile } from "./discover-tile";
import { DiscoverSkeleton } from "./discover-skeleton";

/**
 * Jelajahi (COM-09, DESIGN.md 6.8): sticky category chips, a masonry grid of tiles (two to four lanes,
 * wide photo tiles across two; `useRowSpan`), and a "Muat
 * lebih banyak" button instead of endless scrolling. Categories with nothing in them are not
 * listed. Dummy fixtures plus whatever was published on this device.
 */
export function DiscoverView() {
  const t = useT().discover;
  const data = useCommunity(postStore);
  const guest = useViewer() === "tamu";
  const actions = usePostActions(data, guest);
  const [picked, setPicked] = useState<CategoryId>("semua");
  const [shown, setShown] = useState({ id: "semua" as CategoryId, count: PAGE_SIZE });

  const picks = editorPicks.use();
  const editorIds = useMemo(() => picks.map((p) => p.postId), [picks]);
  const categories = useMemo(
    () => visibleCategories(data.posts, editorIds),
    [data.posts, editorIds],
  );
  const current = categories.find((c) => c.id === picked) ?? categories[0];
  const list = useMemo(
    () => (current ? postsForCategory(current.id, data.posts, editorIds) : []),
    [current, data.posts, editorIds],
  );
  const commentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of data.comments) counts.set(c.postId, (counts.get(c.postId) ?? 0) + 1);
    return counts;
  }, [data.comments]);

  const count = shown.id === current?.id ? shown.count : PAGE_SIZE;
  const visible = list.slice(0, count);
  const hasMore = list.length > count;

  return (
    <div className="@container mx-auto max-w-320">
      <div className="flex items-center gap-4">
        <h1 className="text-[22px] leading-[30px] font-semibold md:text-[28px] md:leading-9">
          {t.title}
        </h1>
        {!guest && (
          <ButtonLink href={NEW_POST_HREF} variant="text" className="ml-auto">
            <PencilSimpleLine size={20} aria-hidden />
            {t.write}
          </ButtonLink>
        )}
      </div>

      <CommunityLinks />

      {data.status === "loading" && <DiscoverSkeleton />}

      {data.status === "error" && (
        <ErrorBanner className="mt-6" action={<RetryButton onClick={data.reload} />}>
          {t.loadError}
        </ErrorBanner>
      )}

      {data.status === "ready" && current && (
        <>
          {CATEGORY_CHIPS_VISIBLE ? (
            <>
              <StickyChipBar label={t.categoryLabel}>
                {categories.map((c) => (
                  <Chip
                    key={c.id}
                    pressed={c.id === current.id}
                    onClick={() => setPicked(c.id)}
                    className="shrink-0"
                  >
                    {t.categories[c.id].label}
                  </Chip>
                ))}
              </StickyChipBar>

              <p className="mt-3 mb-4 text-sm text-ink-muted md:mt-4 md:mb-6">
                {t.categories[current.id].description}
              </p>
            </>
          ) : (
            <div className="mb-4 md:mb-6" />
          )}

          <div className="grid @xl:grid-flow-row-dense @xl:auto-rows-[4px] @xl:grid-cols-2 @xl:gap-x-6 @4xl:grid-cols-3 @[77.5rem]:grid-cols-4">
            {visible.map((post, index) => (
              <DiscoverTile
                key={post.id}
                index={index}
                post={post}
                comments={commentCounts.get(post.id) ?? 0}
                saved={data.marks[mark.saved(post.id)] ?? false}
                onSave={() => actions.save(post.id)}
              />
            ))}
          </div>

          <div className="grid justify-items-center py-4 @max-xl:px-0 @max-xl:py-6">
            {hasMore ? (
              <Button
                variant="secondary"
                onClick={() => setShown({ id: current.id, count: count + PAGE_SIZE })}
              >
                {t.loadMore}
              </Button>
            ) : (
              <p className="text-[13px] leading-[18px] text-ink-muted">
                {CATEGORY_CHIPS_VISIBLE ? t.doneCategory : t.doneAll}
              </p>
            )}
          </div>
        </>
      )}

      {actions.guestDialog}
    </div>
  );
}
