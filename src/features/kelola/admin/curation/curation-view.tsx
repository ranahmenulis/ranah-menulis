"use client";

import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { editorPicks } from "@/features/community/curation/picks-store";
import { useCommunity } from "@/features/community/hooks/use-community";
import type { PostStore } from "@/features/community/storage/post-store";
import { postStore } from "@/features/community/storage/store";
import { featuredProjects } from "@/features/projects/featured-store";
import { useCatalog } from "@/features/projects/use-catalog";
import { useActionStatus } from "../use-action-status";
import { FeaturedSection } from "./featured-section";
import { PicksSection } from "./picks-section";

/** Admin: curation (PLT-05, PRD 17.5). Editor's Picks and featured projects, both by hand. */
export function CurationView({ store = postStore }: { store?: PostStore }) {
  const community = useCommunity(store);
  const picks = editorPicks.use();
  const featured = featuredProjects.use();
  const catalog = useCatalog();
  const { message, statusRef, show } = useActionStatus();

  return (
    <div className="grid gap-8">
      <div className="grid gap-1">
        <h1 id="kurasi-title" className="heading-lg">
          Kurasi
        </h1>
        <p className="text-sm text-ink-muted">
          Pilihan tim untuk Jelajahi dan Projects. Setiap perubahan dicatat.
        </p>
      </div>
      <p
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className="min-h-5 text-sm font-medium text-ink outline-none"
      >
        {message}
      </p>
      {community.status === "error" ? (
        <ErrorBanner action={<RetryButton onClick={community.reload} />}>
          Tulisan belum bisa dibuka karena data di perangkat ini tidak terbaca.
        </ErrorBanner>
      ) : community.status === "loading" ? (
        <div role="status" aria-label="Memuat kurasi" className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <PicksSection
          picks={picks}
          posts={community.posts}
          report={(r, focus) => show(r.message, focus)}
        />
      )}
      <FeaturedSection catalog={catalog} featured={featured} report={(r) => show(r.message)} />
    </div>
  );
}
