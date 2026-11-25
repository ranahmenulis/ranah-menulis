"use client";

import { FeedItem } from "@/features/home/feed-item";
import { FeedList, feedCardClass } from "@/features/home/feed-card";
import { MyProjectGroup } from "@/features/projects/components/my-project-group";
import { documentMeta } from "@/features/studio/components/documents/document-text";
import { DocumentMark } from "@/features/studio/components/documents/document-mark";
import { StreakHero } from "@/features/studio/components/streak/streak-hero";
import { WorksTable, type TableRow } from "@/features/studio/components/works/works-table";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import {
  SAMPLE_NOW,
  SAMPLE_ZONE,
  sampleMyProject,
  samplePosts,
  sampleStreak,
  sampleWorks,
} from "../sample-data";

const noop = () => {};

/*
 * The ecosystem previews (client, 24 Nov 2026): each one is the app's own component with sample
 * data, so the landing shows exactly what a writer will see. The caller wraps them in `inert`,
 * since their links and buttons lead into an app that is not open yet.
 */

/** Studio: the Naskah table with three manuscripts, in its list card. */
export function StudioWorksPreview() {
  const t = useT().studioDocuments;
  const locale = useLocale();
  const rows: TableRow[] = sampleWorks.map((work) => ({
    key: work.id,
    type: "document",
    title: work.title,
    mark: <DocumentMark page={{ id: work.id, kind: work.kind, wordCount: work.wordCount }} />,
    meta: documentMeta(
      t,
      locale,
      "changed",
      work.wordCount,
      work.updatedAt,
      SAMPLE_NOW,
      SAMPLE_ZONE,
    ),
    sub: "",
    words: work.wordCount,
    genre: work.kind,
    tags: [...work.tags],
    badges: [],
    updatedAt: work.updatedAt,
    createdAt: work.createdAt,
    menuLabel: format(t.menu.documentLabel, { name: work.title }),
    menu: [],
  }));
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <WorksTable
        rows={rows}
        sort={{ key: "updated", dir: "desc" }}
        onSort={noop}
        now={SAMPLE_NOW}
        timeZone={SAMPLE_ZONE}
      />
    </div>
  );
}

/** Streak: the top of the Streak tab, twelve days in a row and today's ring at 320 of 500. */
export function StreakAppPreview() {
  return <StreakHero data={sampleStreak} reachedToday={false} />;
}

/** Project: one anthology from "Proyek saya", with an accepted work. */
export function ProjectAppPreview() {
  return <MyProjectGroup row={sampleMyProject()} />;
}

/** Community: two posts in the feed card, as Beranda shows them. */
export function CommunityAppPreview() {
  return (
    <div className={feedCardClass}>
      <FeedList>
        {samplePosts().map((post) => (
          <FeedItem
            key={post.id}
            post={post}
            now={SAMPLE_NOW}
            comments={post.id === "bahasa-untuk-memarahi-adik" ? 14 : 6}
            appreciated={false}
            saved={false}
            onAppreciate={noop}
            onSave={noop}
          />
        ))}
      </FeedList>
    </div>
  );
}
