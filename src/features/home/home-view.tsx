"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { Tabs } from "@/components/ui/tabs";
import { useAccount } from "@/features/account/account-store";
import { DISCOVER_HREF } from "@/features/app-shell/nav";
import { feedFor } from "@/features/community/feed";
import { groupHref, groupsFor } from "@/features/community/groups/group-model";
import { writingGroups } from "@/features/community/groups/group-store";
import { useGroupReader } from "@/features/community/groups/group-viewer";
import { useCommunity } from "@/features/community/hooks/use-community";
import { usePostActions } from "@/features/community/hooks/use-post-actions";
import { mark } from "@/features/community/storage/post-store";
import { postStore } from "@/features/community/storage/store";
import { profileHref } from "@/features/profile/profile-href";
import { useStreakData } from "@/features/studio/hooks/use-streak-data";
import { studioStore } from "@/features/studio/storage/store";
import { cn } from "@/lib/cn";
import { EmptyFeed } from "./empty-feed";
import { useFirstStepsDismissed } from "./first-steps-store";
import { followed } from "./fixtures";
import { FeedList, feedCardClass } from "./feed-card";
import { FeedItem } from "./feed-item";
import { FollowRow } from "./follow-row";
import { HomeRail } from "./home-rail";
import { TodayCard } from "./today-block";
import { greetingSentence } from "./week-summary";

/**
 * Beranda (PLT-10, DESIGN.md 6.2). Three columns like Medium: the app sidebar, a centered column
 * with a greeting, the one thing to do now, and the feed, then a side column from xl (HomeRail).
 * Below xl the side column follows the feed (as in Medium, the feed comes first on a phone). The feed is Community's dummy posts
 * plus what was published on this device.
 */
export function HomeView() {
  const t = useT().home;
  const locale = useLocale();
  const data = useStreakData(studioStore);
  const community = useCommunity(postStore);
  const actions = usePostActions(community, false);
  const router = useRouter();
  const groups = writingGroups.use();
  const reader = useGroupReader();

  const entries = useMemo(
    () => feedFor(community.posts, community.marks, groups, reader),
    [community.posts, community.marks, groups, reader],
  );
  const commentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of community.comments) counts.set(c.postId, (counts.get(c.postId) ?? 0) + 1);
    return counts;
  }, [community.comments]);

  const ready = data.status === "ready";
  const isNew = ready && data.lastDocument === null && data.target === null;
  const dismissed = useFirstStepsDismissed();
  const showSteps = isNew && !dismissed;
  const firstName = useAccount().profile.name.trim().split(/\s+/)[0];
  const sentence = greetingSentence(data, t.week, locale);

  return (
    <div className="mx-auto grid max-w-182 xl:-mx-12 xl:-my-10 xl:min-h-[calc(100dvh-3.5rem-var(--safe-top))] xl:max-w-none xl:grid-cols-[minmax(0,1fr)_clamp(20rem,24vw,28rem)] xl:grid-rows-[auto_1fr]">
      <div className="min-w-0 xl:w-full xl:max-w-194 xl:justify-self-center xl:px-12 xl:pt-10">
        <h1 id="beranda-title" tabIndex={-1} className="heading-lg outline-none">
          {firstName ? format(t.greeting, { name: firstName }) : t.greetingAnon}
        </h1>
        {sentence && <p className="mt-2 text-sm text-ink-muted">{sentence}</p>}
        <div className="mt-6">
          <TodayCard data={data} showSteps={showSteps} />
        </div>
        {ready && !isNew && (
          <FollowRow
            items={[
              ...followed.map((item) => ({ ...item, href: profileHref(item.handle) })),
              ...groupsFor(groups, reader).map((group) => ({
                name: group.name,
                fresh: false,
                href: groupHref(group.id),
              })),
            ]}
          />
        )}
      </div>

      <div className="min-w-0 xl:w-full xl:max-w-194 xl:justify-self-center xl:px-12 xl:pb-10">
        <div className={cn(feedCardClass, "mt-6 xl:mt-8")}>
          <Tabs
            label={t.feed.label}
            value="mengikuti"
            className="px-5 pt-1"
            onValueChange={(id) => id === "jelajahi" && router.push(DISCOVER_HREF)}
            items={[
              { id: "mengikuti", label: t.feed.following },
              { id: "jelajahi", label: t.feed.community },
            ]}
          />

          {isNew ? (
            <EmptyFeed nowMs={data.nowMs} />
          ) : (
            <FeedList>
              {ready &&
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
                ))}
            </FeedList>
          )}
        </div>
      </div>

      <aside
        aria-label={t.aside}
        className="mt-6 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:mt-0 xl:py-10 xl:pr-6 xl:pl-2"
      >
        <HomeRail data={data} showProgress={!showSteps} showProjects={ready && !isNew} />
      </aside>
    </div>
  );
}
