"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { useViewer } from "@/lib/viewer";
import { ME_ID } from "@/features/community/fixtures/authors";
import { useCommunity } from "@/features/community/hooks/use-community";
import { usePostActions } from "@/features/community/hooks/use-post-actions";
import { authorByHandle, commentCounts } from "@/features/community/post-model";
import { mark } from "@/features/community/storage/post-store";
import { postStore } from "@/features/community/storage/store";
import { FeedItem } from "@/features/home/feed-item";
import { followerCount, followingCount, genresOf, profileOf, publicWorks } from "../profile-model";
import { ProfileIdentity } from "./profile-identity";
import { ProfileError, ProfileGone, ProfileSkeleton } from "./profile-states";
import { AboutTab, ProjectsTab, WorksEmpty } from "./profile-tabs-content";

const TABS = [
  { id: "karya", label: "Karya" },
  { id: "tentang", label: "Tentang" },
  { id: "proyek", label: "Proyek" },
];

/**
 * Public author profile (COM-10, DESIGN.md 6.5): name, tabs Karya · Tentang · Proyek, and the
 * identity column. Anyone can read it; following needs an account. It lists Publik posts only.
 */
export function ProfileView({ handle }: { handle: string }) {
  const data = useCommunity(postStore);
  const guest = useViewer() === "tamu";
  const actions = usePostActions(data, guest);
  const [tab, setTab] = useState("karya");

  // Usernames are lowercase, so /penulis/HafizRahman reaches the same profile.
  const author = authorByHandle(handle.toLowerCase());
  const works = useMemo(
    () => (author ? publicWorks(data.posts, author.id) : []),
    [author, data.posts],
  );
  const counts = useMemo(() => commentCounts(data.comments), [data.comments]);

  if (!author) return <ProfileGone />;
  if (data.status === "loading") return <ProfileSkeleton />;
  if (data.status === "error") return <ProfileError onRetry={data.reload} />;

  const own = author.id === ME_ID;
  const genres = genresOf(works);
  const profile = profileOf(author.id);

  return (
    <div className="mx-auto grid max-w-274 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-x-12">
      <header className="lg:col-start-1 lg:row-start-1">
        <h1 className="heading-lg [overflow-wrap:anywhere]">{author.name}</h1>
        <p className="text-sm [overflow-wrap:anywhere] text-ink-muted">@{author.handle}</p>
      </header>

      <ProfileIdentity
        author={author}
        profile={profile}
        followers={followerCount(author.id, data.marks)}
        following={followingCount(author.id, data.marks)}
        genres={genres}
        own={own}
        isFollowing={data.following(author.id)}
        onFollow={() => actions.follow(author.id, author.name)}
      />

      <Tabs
        label={`Isi profil ${author.name}`}
        value={tab}
        onValueChange={setTab}
        items={TABS}
        className="lg:col-start-1 lg:row-start-2"
      />

      <div className="min-w-0 lg:col-start-1 lg:row-start-3">
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
      </div>
      {actions.guestDialog}
    </div>
  );
}
