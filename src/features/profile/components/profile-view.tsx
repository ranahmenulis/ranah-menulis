"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";
import { format, useT } from "@/lib/i18n/provider";
import { useViewer } from "@/lib/viewer";
import { useAccount } from "@/features/account/account-store";
import { showsSampleWorld } from "@/features/account/own-identity";
import { ME_ID } from "@/features/community/fixtures/authors";
import { useCommunity } from "@/features/community/hooks/use-community";
import { usePostActions } from "@/features/community/hooks/use-post-actions";
import { authorByHandle, commentCounts } from "@/features/community/post-model";
import { mark } from "@/features/community/storage/post-store";
import { postStore } from "@/features/community/storage/store";
import { FeedList, feedCardClass } from "@/features/home/feed-card";
import { FeedItem } from "@/features/home/feed-item";
import { followerCount, followingCount, genresOf, profileOf, publicWorks } from "../profile-model";
import { ProfileHero } from "./profile-hero";
import { ProfileIdentity } from "./profile-identity";
import { ProfileError, ProfileGone, ProfileSkeleton } from "./profile-states";
import { AboutTab, ProjectsTab, WorksEmpty } from "./profile-tabs-content";

/**
 * Public author profile (COM-10, DESIGN.md 6.5): name, tabs Karya · Tentang · Proyek, and the
 * identity column. Anyone can read it; following needs an account. It lists Publik posts only.
 */
export function ProfileView({ handle }: { handle: string }) {
  const t = useT().profile;
  const data = useCommunity(postStore);
  const guest = useViewer() === "tamu";
  const actions = usePostActions(data, guest);
  const [tab, setTab] = useState("karya");

  // Usernames are lowercase, so /penulis/HafizRahman reaches the same profile.
  const account = useAccount();
  const author = authorByHandle(handle.toLowerCase(), account);
  const works = useMemo(
    () => (author ? publicWorks(data.posts, author.id) : []),
    [author, data.posts],
  );
  const counts = useMemo(() => commentCounts(data.comments), [data.comments]);

  if (!author) return <ProfileGone />;
  if (data.status === "loading") return <ProfileSkeleton />;
  if (data.status === "error") return <ProfileError onRetry={data.reload} />;

  const own = author.id === ME_ID;
  // A registered account has the bio it wrote and no followers yet, not the dummy reader's.
  const fresh = own && !showsSampleWorld(account);
  const genres = genresOf(works);
  const profile = fresh
    ? { bio: account.profile.bio, followers: 0, following: 0 }
    : profileOf(author.id);

  return (
    <div className="mx-auto grid w-full max-w-320 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <ProfileHero
        author={author}
        works={works.length}
        followers={fresh ? 0 : followerCount(author.id, data.marks)}
        following={followingCount(author.id, data.marks)}
        streak={profile.streak}
        own={own}
        isFollowing={data.following(author.id)}
        onFollow={() => actions.follow(author.id, author.name)}
      />

      <div className={cn(feedCardClass, "min-w-0 lg:col-start-1")}>
        <Tabs
          label={format(t.tabsLabel, { name: author.name })}
          value={tab}
          onValueChange={setTab}
          items={[
            { id: "karya", label: t.tabs.karya },
            { id: "tentang", label: t.tabs.tentang },
            { id: "proyek", label: t.tabs.proyek },
          ]}
          className="px-5 pt-1 md:px-6"
        />
        <FeedList className="pb-1">
          {tab === "karya" &&
            (works.length === 0 ? (
              <WorksEmpty own={own} />
            ) : (
              works.map((post) => (
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
              ))
            ))}
          {tab === "tentang" && (
            <AboutTab author={author} profile={profile} genres={genres} own={own} />
          )}
          {tab === "proyek" && <ProjectsTab own={own} />}
        </FeedList>
      </div>

      <ProfileIdentity
        author={author}
        profile={profile}
        genres={genres}
        className="max-lg:hidden lg:col-start-2 lg:row-start-2"
      />
      {actions.guestDialog}
    </div>
  );
}
