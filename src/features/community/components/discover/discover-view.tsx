"use client";

import { useMemo, useState } from "react";
import { LitWindows } from "@/components/illustrations/community-art";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ErrorBanner, RetryButton } from "@/components/ui/states";
import { StickyChipBar } from "@/components/ui/sticky-chip-bar";
import { useT } from "@/lib/i18n/provider";
import { useViewer } from "@/lib/viewer";
import { SAVED_HREF } from "@/features/app-shell/nav";
import { useOwnProfileHref } from "@/features/account/use-own-profile-href";
import { editorPicks } from "../../curation/picks-store";
import {
  CATEGORY_CHIPS_VISIBLE,
  PAGE_SIZE,
  postsForCategory,
  visibleCategories,
} from "../../categories";
import { ME_ID } from "../../fixtures/authors";
import { GroupInvitations } from "../../groups/components/group-invitations";
import { writingGroups } from "../../groups/group-store";
import { useGroupReader } from "../../groups/group-viewer";
import { usePostActions } from "../../hooks/use-post-actions";
import { useCommunity, type CommunityData } from "../../hooks/use-community";
import { mark } from "../../storage/post-store";
import { postStore } from "../../storage/store";
import type { CategoryId } from "../../types";
import { CommunityFrame } from "../community-frame";
import { PageHero, type HeroStat } from "@/components/ui/page-hero";
import { DiscoverTile } from "./discover-tile";
import { DiscoverSkeleton } from "./discover-skeleton";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** The Tulisan hero's figures: new public writing this week and, when signed in, your own. */
export function discoverCounts(data: Pick<CommunityData, "posts" | "marks" | "now">) {
  const marked = (prefix: string) =>
    Object.entries(data.marks).filter(([key, on]) => on && key.startsWith(prefix)).length;
  return {
    recent: data.posts.filter(
      (p) => p.visibility === "publik" && p.publishedAt >= data.now - WEEK_MS,
    ).length,
    following: marked(mark.following("")),
    saved: marked(mark.saved("")),
    mine: data.posts.filter((p) => p.authorId === ME_ID && p.visibility === "publik").length,
  };
}

/**
 * Jelajahi (COM-09, DESIGN.md 6.8): sticky category chips, a masonry grid of tiles (two to four lanes,
 * wide photo tiles across two; `useRowSpan`), and a "Muat
 * lebih banyak" button instead of endless scrolling. Categories with nothing in them are not
 * listed. Dummy fixtures plus whatever was published on this device. It is the Tulisan tab of
 * Community; group invitations sit above the grid only when there are any.
 */
export function DiscoverView() {
  const t = useT().discover;
  const data = useCommunity(postStore);
  const guest = useViewer() === "tamu";
  const groups = writingGroups.use();
  const reader = useGroupReader();
  const actions = usePostActions(data, guest);
  const [picked, setPicked] = useState<CategoryId>("semua");
  const [shown, setShown] = useState({ id: "semua" as CategoryId, count: PAGE_SIZE });

  const ownProfile = useOwnProfileHref();
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

  const ready = data.status === "ready";
  const counts = discoverCounts(data);
  const stats: HeroStat[] = guest
    ? []
    : [
        { label: t.hero.following, value: counts.following },
        { label: t.hero.saved, value: counts.saved, href: SAVED_HREF },
        { label: t.hero.mine, value: counts.mine, href: ownProfile },
      ];

  return (
    <CommunityFrame>
      <PageHero
        titleId="community-title"
        title={t.title}
        body={t.hero.body}
        art={LitWindows}
        figure={{ value: ready ? counts.recent : null, label: t.hero.recent }}
        stats={ready ? stats : []}
      />

      <GroupInvitations groups={groups} reader={reader} />

      {data.status === "loading" && <DiscoverSkeleton />}

      {data.status === "error" && (
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>{t.loadError}</ErrorBanner>
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
          ) : null}

          <div className="grid @max-xl:rounded-2xl @max-xl:border @max-xl:border-line @max-xl:bg-surface @max-xl:px-4 @max-xl:shadow-card @xl:grid-flow-row-dense @xl:auto-rows-[4px] @xl:grid-cols-2 @xl:gap-x-6 @4xl:grid-cols-3 @[77.5rem]:grid-cols-4">
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

          <div className="grid justify-items-center pb-4">
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
    </CommunityFrame>
  );
}
