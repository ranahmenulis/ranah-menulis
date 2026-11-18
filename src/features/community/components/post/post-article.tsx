"use client";

import { Globe, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDay } from "../../format-time";
import { AuthorLink } from "@/features/profile/author-link";
import { authorOf, postLabel } from "../../post-model";
import type { Author, Post, PostBlock, PostKind } from "../../types";

const END: Record<PostKind, string> = { prolog: "Akhir prolog.", cuplikan: "Akhir cuplikan." };

/** The public text itself, in reading typography (DESIGN.md 4.2). Used by the post and by previews. */
export function PostText({ blocks, kind }: { blocks: PostBlock[]; kind: PostKind }) {
  return (
    <>
      <div className="grid gap-[1.1em]">
        {blocks.map((block, i) =>
          block.type === "quote" ? (
            <blockquote
              key={i}
              className="border-l-3 border-line-strong pl-5 read-body whitespace-pre-line text-ink-read italic"
            >
              {block.text}
            </blockquote>
          ) : block.type === "heading" ? (
            <h2 key={i} className="mt-4 read-h2 text-ink-read">
              {block.text}
            </h2>
          ) : (
            <p key={i} className="read-body whitespace-pre-line text-ink-read">
              {block.text}
            </p>
          ),
        )}
      </div>
      <p className="mt-3 text-[13px] leading-[18px] text-ink-muted">{END[kind]}</p>
    </>
  );
}

/** "Prolog dari: <judul karya> · hanya bagian ini yang publik" (COM-01, STD-10). */
export function ScopeLine({
  kind,
  sourceTitle,
  groupOnly = false,
}: {
  kind: PostKind;
  sourceTitle: string | null;
  groupOnly?: boolean;
}) {
  const Icon = groupOnly ? UsersThree : Globe;
  const name = kind === "prolog" ? "Prolog" : "Cuplikan";
  return (
    <p className="flex items-start gap-2.5 border-b border-line py-3 text-sm text-ink-muted">
      <Icon size={16} aria-hidden className="mt-0.5 shrink-0" />
      <span>
        {sourceTitle ? (
          <>
            {name} dari: <b className="font-medium text-ink">{sourceTitle}</b>
          </>
        ) : (
          name
        )}{" "}
        · hanya bagian ini yang {groupOnly ? "dibagikan ke grup" : "publik"}
      </span>
    </p>
  );
}

type Props = {
  post: Post;
  now: number;
  /** Hidden for your own post: you do not follow yourself. */
  showFollow: boolean;
  following: boolean;
  onFollow: (author: Author) => void;
};

/** Mark, title, byline, scope line, text: everything above the action bar of a post. */
export function PostArticle({ post, now, showFollow, following, onFollow }: Props) {
  const author = authorOf(post.authorId);
  const updated = post.updatedAt !== undefined && post.updatedAt - post.publishedAt > 60_000;

  return (
    <article>
      <p className="mb-4 text-[13px] leading-[18px] text-ink-muted">{postLabel(post)}</p>
      <h1 className="mb-6 read-title text-ink-read">{post.title}</h1>

      <div className="mb-0 flex items-center gap-3 border-t border-line py-5">
        <Avatar name={author.name} size={44} />
        <div className="grid min-w-0 gap-0.5">
          <span className="flex min-w-0 items-center gap-1 text-[15px] leading-[22px] font-medium">
            <AuthorLink handle={author.handle} className="truncate">
              {author.name}
            </AuthorLink>
            {showFollow && (
              <>
                <span aria-hidden className="text-ink-muted">
                  ·
                </span>
                <Button
                  variant="text"
                  size="sm"
                  aria-pressed={following}
                  onClick={() => onFollow(author)}
                  className="text-ink!"
                >
                  {following ? "Mengikuti" : "Ikuti"}
                </Button>
              </>
            )}
          </span>
          <span className="text-xs text-ink-muted">
            @{author.handle}
            {post.groupName && <> · di {post.groupName}</>} · Diterbitkan{" "}
            {formatDay(post.publishedAt, now)}
            {updated && <> · diperbarui {formatDay(post.updatedAt!, now)}</>}
          </span>
        </div>
      </div>

      <ScopeLine
        kind={post.kind}
        sourceTitle={post.sourceTitle}
        groupOnly={post.visibility === "grup"}
      />
      <div className="mt-8">
        <PostText blocks={post.blocks} kind={post.kind} />
      </div>
    </article>
  );
}
