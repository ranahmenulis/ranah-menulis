"use client";

import { PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ErrorBanner, RetryButton } from "@/components/ui/states";
import { useViewer } from "@/lib/viewer";
import { NEW_POST_HREF } from "@/features/app-shell/nav";
import { PAGE_SIZE, categoryById, postsForCategory, visibleCategories } from "../../categories";
import { usePostActions } from "../../hooks/use-post-actions";
import { useCommunity } from "../../hooks/use-community";
import { mark } from "../../storage/post-store";
import { postStore } from "../../storage/store";
import type { CategoryId } from "../../types";
import { DiscoverTile } from "./discover-tile";
import { DiscoverSkeleton } from "./discover-skeleton";

/**
 * Jelajahi (COM-09, DESIGN.md 6.8): sticky category chips, a masonry grid of tiles, and a "Muat
 * lebih banyak" button instead of endless scrolling. Categories with nothing in them are not
 * listed. Dummy fixtures plus whatever was published on this device.
 */
export function DiscoverView() {
  const data = useCommunity(postStore);
  const guest = useViewer() === "tamu";
  const actions = usePostActions(data, guest);
  const [picked, setPicked] = useState<CategoryId>("semua");
  const [shown, setShown] = useState({ id: "semua" as CategoryId, count: PAGE_SIZE });

  const categories = useMemo(() => visibleCategories(data.posts), [data.posts]);
  const current = categories.find((c) => c.id === picked) ?? categories[0];
  const list = useMemo(
    () => (current ? postsForCategory(current.id, data.posts) : []),
    [current, data.posts],
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
    <div className="@container mx-auto max-w-260">
      <div className="flex items-center gap-4">
        <h1 className="text-[22px] leading-[30px] font-semibold md:text-[28px] md:leading-9">
          Jelajahi
        </h1>
        {!guest && (
          <ButtonLink href={NEW_POST_HREF} variant="text" className="ml-auto">
            <PencilSimpleLine size={20} aria-hidden />
            Tulis postingan
          </ButtonLink>
        )}
      </div>

      {data.status === "loading" && <DiscoverSkeleton />}

      {data.status === "error" && (
        <ErrorBanner className="mt-6" action={<RetryButton onClick={data.reload} />}>
          Jelajahi gagal dimuat. Feed di Beranda dan tulisan yang kamu simpan tetap bisa dibuka.
        </ErrorBanner>
      )}

      {data.status === "ready" && current && (
        <>
          {/* The fade mask sits on the inner row so the sticky bar itself stays opaque. */}
          <div className="sticky top-[calc(3.25rem+var(--safe-top))] z-20 -mx-4 mt-2 border-b border-line bg-canvas md:top-[calc(3.5rem+var(--safe-top))] md:-mx-0">
            <div
              role="toolbar"
              aria-label="Kategori"
              className="scroll-edge-fade flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-3 md:px-0 md:py-4 [&::-webkit-scrollbar]:hidden"
            >
              {categories.map((c) => (
                <Chip
                  key={c.id}
                  pressed={c.id === current.id}
                  onClick={() => setPicked(c.id)}
                  className="shrink-0"
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>

          <p className="mt-3 mb-4 text-sm text-ink-muted md:mt-4 md:mb-6">
            {categoryById(current.id)?.description}
          </p>

          <div className="@xl:columns-2 @xl:gap-x-6 @4xl:columns-3">
            {visible.map((post) => (
              <DiscoverTile
                key={post.id}
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
                Muat lebih banyak
              </Button>
            ) : (
              <p className="text-[13px] leading-[18px] text-ink-muted">
                Itu semua tulisan di kategori ini.
              </p>
            )}
          </div>
        </>
      )}

      {actions.guestDialog}
    </div>
  );
}
