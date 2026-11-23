"use client";

import { Avatar } from "@/components/ui/avatar";
import { useAccount } from "@/features/account/account-store";
import { useT } from "@/lib/i18n/provider";
import { hasDropCap, PostText, ScopeLine } from "../post/post-article";
import type { Genre, PostBlock, PostImage, PostKind } from "../../types";
import { PostFigure } from "../post/post-figure";

type Props = {
  title: string;
  kind: PostKind;
  genre: Genre | "";
  blocks: PostBlock[];
  image: PostImage | null;
  sourceTitle: string | null;
  groupOnly: boolean;
};

/** The post exactly as a reader sees it, in the same typography as the post page (STD-10). */
export function PreviewPanel({ title, kind, genre, blocks, image, sourceTitle, groupOnly }: Props) {
  const { profile } = useAccount();
  const dict = useT();
  const t = dict.compose.preview;
  const labels = dict.community.labels;
  const mark = `${labels[kind]}${genre ? ` · ${labels.genres[genre]}` : ""}`;
  return (
    <section aria-label={t.label}>
      <h2 className="mb-3 text-sm font-medium">{t.label}</h2>
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card md:p-6">
        <p className="mb-3 text-[13px] leading-[18px] text-ink-muted">{mark}</p>
        <p className="mb-4 font-serif text-[26px] leading-8 font-semibold wrap-anywhere text-ink-read">
          {title.trim() || <span className="text-ink-faint">{t.untitled}</span>}
        </p>
        <div className="mb-1 flex items-center gap-2 text-sm">
          <Avatar name={profile.name} src={profile.avatar} size={32} />
          {profile.name}
        </div>
        <ScopeLine kind={kind} sourceTitle={sourceTitle} groupOnly={groupOnly} />
        {image && <PostFigure image={image} bleed={false} />}
        <div className="pt-4 text-[17px] [&_.read-body]:text-[17px]! [&_.read-body]:leading-7!">
          {blocks.length > 0 ? (
            <PostText blocks={blocks} kind={kind} dropCap={hasDropCap(genre || "Esai")} />
          ) : (
            <p className="text-sm text-ink-muted">{t.empty}</p>
          )}
        </div>
      </div>
    </section>
  );
}
