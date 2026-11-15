"use client";

import { PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { DISCOVER_HREF, NEW_POST_HREF } from "@/features/app-shell/nav";
import { feedFor } from "@/features/community/feed";
import { useCommunity } from "@/features/community/hooks/use-community";
import { usePostActions } from "@/features/community/hooks/use-post-actions";
import { mark } from "@/features/community/storage/post-store";
import { postStore } from "@/features/community/storage/store";
import { useStreakData } from "@/features/studio/hooks/use-streak-data";
import { parseDay } from "@/features/studio/streak";
import { capitalizeFirst } from "@/features/studio/streak-copy";
import { studioStore } from "@/features/studio/storage/store";
import { followed } from "./fixtures";
import { FeedItem } from "./feed-item";
import { FollowRow } from "./follow-row";
import { FirstSteps } from "./steps";
import { TodayBlock } from "./today-block";

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/**
 * Beranda (PLT-10, DESIGN.md 6.2): "Hari ini" lines, then the feed. The feed is Community's dummy
 * posts plus what was published on this device; the non-writing rows of "Hari ini" are dummy until
 * Projects exists.
 */
export function HomeView() {
  const data = useStreakData(studioStore);
  const community = useCommunity(postStore);
  const actions = usePostActions(community, false);
  const router = useRouter();

  const entries = useMemo(
    () => feedFor(community.posts, community.marks),
    [community.posts, community.marks],
  );
  const commentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of community.comments) counts.set(c.postId, (counts.get(c.postId) ?? 0) + 1);
    return counts;
  }, [community.comments]);

  const ready = data.status === "ready";
  const isNew = ready && data.lastDocument === null && data.target === null;

  return (
    <div className="max-w-182">
      <div className="flex min-h-5 items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          {data.today && capitalizeFirst(dateFormat.format(parseDay(data.today)))}
        </p>
        <ButtonLink href={NEW_POST_HREF} variant="text" size="sm" className="-my-2">
          <PencilSimpleLine size={20} aria-hidden />
          Tulis postingan
        </ButtonLink>
      </div>
      <h1 className="mt-1 mb-4 heading-lg">Hari ini</h1>

      {isNew && (
        <FirstSteps hasTarget={data.target !== null} hasDocument={data.lastDocument !== null} />
      )}
      <TodayBlock data={data} showDummy={ready && !isNew} />

      {ready && !isNew && <FollowRow items={followed} />}

      <Tabs
        label="Feed"
        value="mengikuti"
        className="mt-8 md:mt-10"
        onValueChange={(id) => id === "jelajahi" && router.push(DISCOVER_HREF)}
        items={[
          { id: "mengikuti", label: "Mengikuti" },
          { id: "jelajahi", label: "Jelajahi" },
        ]}
      />

      {isNew ? (
        <div className="grid justify-items-start gap-3 py-12">
          <p className="font-serif text-xl leading-7 font-semibold">
            Kamu belum mengikuti siapa pun.
          </p>
          <p className="max-w-110 text-sm text-ink-muted">
            Jelajahi tulisan dari penulis di Indonesia dan Malaysia, lalu ikuti yang suaranya ingin
            kamu baca lagi.
          </p>
          <ButtonLink href={DISCOVER_HREF} variant="secondary">
            Buka Jelajahi
          </ButtonLink>
        </div>
      ) : (
        ready &&
        community.status === "ready" &&
        entries.map((post) => (
          <FeedItem
            key={post.id}
            post={post}
            now={community.now}
            comments={commentCounts.get(post.id) ?? 0}
            appreciated={community.marks[mark.appreciated(post.id)] ?? false}
            saved={community.marks[mark.saved(post.id)] ?? false}
            onAppreciate={() => actions.appreciate(post.id)}
            onSave={() => actions.save(post.id)}
          />
        ))
      )}
    </div>
  );
}
