"use client";

import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorBanner, FeedItemSkeleton, RetryButton } from "@/components/ui/states";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/i18n/format";
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

/**
 * Tersimpan (COM-06, DESIGN.md 6.6): the posts you saved, as a feed list. Private to the reader.
 * A post you take off stays on the page until you leave it, so a slip can be undone by saving it
 * again; the count follows what is saved right now.
 */
export function SavedView() {
  const t = useT();
  const c = t.saved;
  const locale = useLocale();
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
      <h1 className="heading-lg">{c.title}</h1>
      {guest ? (
        <EmptyState className="mt-4" action={<SignInButton>{t.shell.guest.signIn}</SignInButton>}>
          {c.signInPrompt}
        </EmptyState>
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-muted">
            {data.status === "ready" &&
              saved.length > 0 &&
              format(saved.length === 1 ? c.countOne : c.count, {
                count: formatNumber(saved.length, locale),
              })}
            {c.privacy}
          </p>

          {data.status === "loading" && (
            <div
              role="status"
              aria-label={c.loading}
              className="mt-4 animate-[rm-appear_0s_300ms_forwards] opacity-0"
            >
              {[0, 1, 2].map((i) => (
                <FeedItemSkeleton key={i} />
              ))}
            </div>
          )}

          {data.status === "error" && (
            <ErrorBanner className="mt-6" action={<RetryButton onClick={data.reload} />}>
              {c.loadError}
            </ErrorBanner>
          )}

          {empty && (
            <EmptyState
              className="mt-4"
              art="library"
              action={
                <ButtonLink href={DISCOVER_HREF} variant="secondary">
                  {c.openCommunity}
                </ButtonLink>
              }
            >
              {c.empty}
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
                    <p className="text-sm text-ink-muted">{c.gone}</p>
                    <Button
                      variant="text"
                      size="sm"
                      className="shrink-0 text-ink"
                      onClick={() => actions.save(id)}
                    >
                      {c.remove}
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
