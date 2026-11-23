"use client";

import { useLocale, useT } from "@/lib/i18n/provider";
import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { editorPicks } from "@/features/community/curation/picks-store";
import { useCommunity } from "@/features/community/hooks/use-community";
import type { PostStore } from "@/features/community/storage/post-store";
import { postStore } from "@/features/community/storage/store";
import { featuredProjects } from "@/features/projects/featured-store";
import { useCatalog } from "@/features/projects/use-catalog";
import { adminMessage } from "../copy/admin-copy";
import { useActionStatus } from "../use-action-status";
import { FeaturedSection } from "./featured-section";
import { PicksSection } from "./picks-section";

/** Admin: curation (PLT-05, PRD 17.5). Editor's Picks and featured projects, both by hand. */
export function CurationView({ store = postStore }: { store?: PostStore }) {
  const t = useT().kelolaAdmin.curation;
  const locale = useLocale();
  const community = useCommunity(store);
  const picks = editorPicks.use();
  const featured = featuredProjects.use();
  const catalog = useCatalog();
  const { message, statusRef, show } = useActionStatus();

  return (
    <div className="grid gap-8">
      <div className="grid gap-1">
        <h1 id="kurasi-title" className="heading-lg">
          {t.title}
        </h1>
        <p className="text-sm text-ink-muted">{t.intro}</p>
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
        <ErrorBanner action={<RetryButton onClick={community.reload} />}>{t.loadError}</ErrorBanner>
      ) : community.status === "loading" ? (
        <div role="status" aria-label={t.loading} className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <PicksSection
          picks={picks}
          posts={community.posts}
          report={(r, focus) => show(adminMessage(r, locale), focus)}
        />
      )}
      <FeaturedSection
        catalog={catalog}
        featured={featured}
        report={(r) => show(adminMessage(r, locale))}
      />
    </div>
  );
}
