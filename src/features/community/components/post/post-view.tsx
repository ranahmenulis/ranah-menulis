"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useViewer } from "@/lib/viewer";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { formatAbsolute } from "../../format-time";
import { ME_ID } from "../../fixtures/authors";
import { useCommunity } from "../../hooks/use-community";
import { usePostActions } from "../../hooks/use-post-actions";
import { authorOf, relatedPosts } from "../../post-model";
import { mark } from "../../storage/post-store";
import { postStore } from "../../storage/store";
import { CommentsSection } from "./comments-section";
import { PostActionBar, PostMobileBar } from "./post-action-bar";
import { AuthorCard } from "./author-card";
import { PostArticle } from "./post-article";
import { GuestAside, PostError, PostGone, PostSkeleton } from "./post-states";
import { RelatedPosts } from "./related-posts";
import { fileReport } from "../../moderation/report-store";
import { ReportDialog } from "./report-dialog";

/**
 * A post with its replies (COM-04..06, DESIGN.md 6.9): one 680px column, then the comments, then
 * related reading. Readable without an account; anything that needs one asks to sign in.
 */
export function PostView({ postId }: { postId: string }) {
  const locale = useLocale();
  const t = useT().post;
  const data = useCommunity(postStore);
  const guest = useViewer() === "tamu";
  const actions = usePostActions(data, guest);
  const toast = useToast();
  const [reportingPost, setReportingPost] = useState(false);

  const post = data.posts.find((p) => p.id === postId) ?? null;
  const commentCount = data.comments.filter((c) => c.postId === postId).length;
  const related = useMemo(
    () =>
      post
        ? relatedPosts(
            post,
            data.posts.filter((p) => p.visibility === "publik"),
          )
        : [],
    [post, data.posts],
  );

  const moreFromAuthor = useMemo(
    () =>
      post
        ? data.posts
            .filter(
              (p) => p.authorId === post.authorId && p.id !== post.id && p.visibility === "publik",
            )
            .sort((a, b) => b.publishedAt - a.publishedAt)
            .slice(0, 3)
        : [],
    [post, data.posts],
  );

  if (data.status === "loading") return <PostSkeleton />;
  if (data.status === "error") return <PostError onRetry={data.reload} />;
  if (!post) return <PostGone />;

  const author = authorOf(post.authorId);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ message: t.linkCopied, key: "copy" });
    } catch {
      toast({ message: t.linkFailed, tone: "error", key: "copy" });
    }
  }

  async function share() {
    // The native share sheet when the browser has one; otherwise the same as copying the link.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: post?.title, url: window.location.href });
      } catch {
        // Closing the sheet is not a failure.
      }
      return;
    }
    await copyLink();
  }

  const bar = {
    appreciations: post.appreciations,
    comments: commentCount,
    appreciated: data.marks[mark.appreciated(post.id)] ?? false,
    saved: data.marks[mark.saved(post.id)] ?? false,
    onAppreciate: () => actions.appreciate(post.id),
    onSave: () => actions.save(post.id),
    onShare: () => void share(),
    onCopyLink: () => void copyLink(),
    onReport: () => {
      if (!actions.requireAccount(t.comments.askReport)) setReportingPost(true);
    },
  };

  return (
    <div className="mx-auto flex max-w-266 justify-center gap-16 md:pt-4">
      <div className="w-full max-w-170 min-w-0">
        <PostArticle
          post={post}
          now={data.now}
          showFollow={post.authorId !== ME_ID}
          following={data.following(post.authorId)}
          onFollow={(a) => actions.follow(a.id, a.name)}
        />
        <PostActionBar {...bar} />
        <p className="mt-3 text-xs text-ink-muted">
          {format(t.meta, {
            appreciations: post.appreciations.toLocaleString(locale === "en" ? "en-US" : "id-ID"),
            comments: String(commentCount),
            time: formatAbsolute(post.publishedAt, data.now, locale),
          })}
        </p>
        <AuthorCard
          author={author}
          showFollow={post.authorId !== ME_ID}
          following={data.following(post.authorId)}
          onFollow={(a) => actions.follow(a.id, a.name)}
        />
        <CommentsSection post={post} data={data} guest={guest} actions={actions} />
        <RelatedPosts
          posts={moreFromAuthor}
          title={format(t.related.moreFrom, { name: author.name })}
        />
        <RelatedPosts posts={related.filter((p) => !moreFromAuthor.some((m) => m.id === p.id))} />
      </div>

      {guest && <GuestAside authorName={author.name} />}
      <PostMobileBar {...bar} />

      <ReportDialog
        subject={reportingPost ? t.report.subjectPost : null}
        onClose={() => setReportingPost(false)}
        onSubmit={(reason) => {
          fileReport("post", postId, ME_ID, reason);
          setReportingPost(false);
          toast({ message: t.comments.reportSent });
        }}
      />
      {actions.guestDialog}
    </div>
  );
}
