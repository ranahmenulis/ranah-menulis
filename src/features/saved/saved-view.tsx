"use client";

import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorBanner, FeedItemSkeleton, RetryButton } from "@/components/ui/states";
import { useViewer } from "@/lib/viewer";
import { SignInButton } from "@/features/account/components/auth-buttons";
import { DISCOVER_HREF } from "@/features/app-shell/nav";
import { useCommunity } from "@/features/community/hooks/use-community";
import { writingGroups } from "@/features/community/groups/group-store";
import { useGroupReader } from "@/features/community/groups/group-viewer";
import { usePostActions } from "@/features/community/hooks/use-post-actions";
import { mark } from "@/features/community/storage/post-store";
import { commentCounts } from "@/features/community/post-model";
import { postStore } from "@/features/community/storage/store";
import { FeedItem } from "@/features/home/feed-item";
import { savedPostIds, splitSaved } from "./saved-list";

const number = new Intl.NumberFormat("id-ID");

/**
 * Tersimpan (COM-06, DESIGN.md 6.6): the posts you saved, as a feed list. Private to the reader.
 * A post you take off stays on the page until you leave it, so a slip can be undone by saving it
 * again; the count follows what is saved right now.
 */
export function SavedView() {
  const guest = useViewer() === "tamu";
  const data = useCommunity(postStore);
  const groups = writingGroups.use();
  const reader = useGroupReader();
  const actions = usePostActions(data, guest);

  const saved = savedPostIds(data.marks);
  const [kept, setKept] = useState<ReadonlySet<string>>(new Set());
  if (saved.some((id) => !kept.has(id))) setKept(new Set([...kept, ...saved]));

  const { available, unavailable } = useMemo(
    () => splitSaved([...kept], data.posts, groups, reader),
    [kept, data.posts, groups, reader],
  );
  const counts = useMemo(() => commentCounts(data.comments), [data.comments]);

  const empty = data.status === "ready" && kept.size === 0;

  return (
    <div className="max-w-182">
      <h1 className="heading-lg">Tersimpan</h1>
      {guest ? (
        <EmptyState className="mt-4" action={<SignInButton>Masuk</SignInButton>}>
          Masuk untuk melihat tulisan yang kamu simpan.
        </EmptyState>
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-muted">
            {data.status === "ready" &&
              saved.length > 0 &&
              `${number.format(saved.length)} tulisan · `}
            Hanya kamu yang bisa melihat daftar ini.
          </p>

          {data.status === "loading" && (
            <div
              role="status"
              aria-label="Memuat Tersimpan"
              className="mt-4 animate-[rm-appear_0s_300ms_forwards] opacity-0"
            >
              {[0, 1, 2].map((i) => (
                <FeedItemSkeleton key={i} />
              ))}
            </div>
          )}

          {data.status === "error" && (
            <ErrorBanner className="mt-6" action={<RetryButton onClick={data.reload} />}>
              Tulisan tersimpan gagal dimuat. Dokumen di Studio tidak terpengaruh.
            </ErrorBanner>
          )}

          {empty && (
            <EmptyState
              className="mt-4"
              action={
                <ButtonLink href={DISCOVER_HREF} variant="secondary">
                  Buka Community
                </ButtonLink>
              }
            >
              Belum ada tulisan yang kamu simpan.
            </EmptyState>
          )}

          {data.status === "ready" && (
            <div className="mt-2">
              {available.map((post) => (
                <FeedItem
                  key={post.id}
                  post={post}
                  now={data.now}
                  comments={counts.get(post.id) ?? 0}
                  appreciated={data.marks[mark.appreciated(post.id)] ?? false}
                  saved={data.marks[mark.saved(post.id)] ?? false}
                  onAppreciate={() => actions.appreciate(post.id)}
                  onSave={() => actions.save(post.id)}
                />
              ))}
              {unavailable
                .filter((id) => data.marks[mark.saved(id)])
                .map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-4 border-b border-line py-6"
                  >
                    <p className="text-sm text-ink-muted">Tulisan ini sudah tidak tersedia.</p>
                    <Button
                      variant="text"
                      size="sm"
                      className="shrink-0 text-ink"
                      onClick={() => actions.save(id)}
                    >
                      Hapus dari Tersimpan
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
      {actions.guestDialog}
    </div>
  );
}
