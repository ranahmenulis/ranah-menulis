"use client";

import { Article } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/ui/section-card";
import { useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorBanner, FeedItemSkeleton, RetryButton } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { NEW_POST_HREF } from "@/features/app-shell/nav";
import { ReasonDialog } from "@/features/kelola/components/reason-dialog";
import { format, useT } from "@/lib/i18n/provider";
import { useCommunity } from "../../hooks/use-community";
import { authorOf } from "../../post-model";
import type { PostStore } from "../../storage/post-store";
import { postStore } from "../../storage/store";
import type { GroupResult } from "../group-actions";
import { hideGroupPost } from "../group-content-actions";
import { groupIdOf } from "../group-model";

export function GroupPosts({
  groupId,
  manager,
  store = postStore,
  onResult,
}: {
  groupId: string;
  manager: boolean;
  store?: PostStore;
  onResult: (result: GroupResult, focus?: boolean) => void;
}) {
  const dict = useT();
  const t = dict.groups.posts;
  const data = useCommunity(store);
  const [ask, setAsk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const posts = data.posts
    .filter((post) => post.visibility === "grup" && groupIdOf(post) === groupId)
    .sort((a, b) => b.publishedAt - a.publishedAt);
  const close = () => setAsk(null);

  async function hide(reason: string) {
    if (!ask || busy) return;
    const opener = trigger.current;
    setBusy(true);
    const result = await hideGroupPost(groupId, ask, reason, store);
    setBusy(false);
    close();
    if (result.ok) onResult(result, true);
    else requestAnimationFrame(() => onResult(result, !opener?.isConnected));
  }

  return (
    <Section
      id="group-posts"
      title={t.title}
      icon={Article}
      className="gap-3"
      action={
        <ButtonLink href={NEW_POST_HREF} variant="secondary" size="sm">
          {t.write}
        </ButtonLink>
      }
    >
      {data.status === "loading" && <FeedItemSkeleton />}
      {data.status === "error" && (
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>{t.loadError}</ErrorBanner>
      )}
      {data.status === "ready" &&
        (posts.length ? (
          <ul className="divide-y divide-line">
            {posts.map((post) => (
              <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 text-sm wrap-anywhere">
                  <TextLink href={`/postingan/${encodeURIComponent(post.id)}`}>
                    {post.title}
                  </TextLink>
                  <p className="text-ink-muted">{authorOf(post.authorId).name}</p>
                </div>
                {manager && (
                  <Button
                    variant="text"
                    size="sm"
                    aria-label={format(t.hideAria, { title: post.title })}
                    onClick={(event) => {
                      trigger.current = event.currentTarget;
                      setAsk(post.id);
                    }}
                  >
                    {t.hide}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">{t.empty}</p>
        ))}
      {ask && manager && (
        <ReasonDialog
          title={t.hideTitle}
          confirmLabel={t.hide}
          hint={t.hideHint}
          emptyMessage={dict.groups.messages.reasonEmpty}
          busy={busy}
          onClose={close}
          onConfirm={(reason) => void hide(reason)}
        />
      )}
    </Section>
  );
}
