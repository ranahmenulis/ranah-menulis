"use client";

import { AuthorAvatar } from "../author-avatar";
import { EyeSlash, Flag, Trash } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatAgo } from "../../format-time";
import { AuthorLink } from "@/features/profile/author-link";
import { authorOf } from "../../post-model";
import type { Comment } from "../../types";
import { CommentText } from "./comment-text";

export type CommentView = "normal" | "hidden" | "reported";

type Props = {
  comment: Comment;
  now: number;
  /** One level of indent with a line on the left; replies never go deeper. */
  reply?: boolean;
  /** This comment was written by the post's author. */
  byPostAuthor: boolean;
  /** You wrote it. */
  mine: boolean;
  /** You wrote the post, so you may hide and delete what others said (BR-COM-03). */
  iAmPostAuthor: boolean;
  view: CommentView;
  onReply: () => void;
  onHide: () => void;
  onShowAgain: () => void;
  onReport: () => void;
  onDelete: () => void;
  /** The inline reply field, shown right under this comment while replying. */
  children?: ReactNode;
};

function menuFor(p: Props, t: Dictionary["post"]["comment"]): MenuEntry[] {
  const report: MenuEntry = {
    id: "report",
    label: t.report,
    icon: <Flag aria-hidden />,
    onSelect: p.onReport,
  };
  const remove: MenuEntry = {
    id: "delete",
    label: t.delete,
    icon: <Trash aria-hidden />,
    danger: true,
    onSelect: p.onDelete,
  };
  if (p.iAmPostAuthor && !p.mine) {
    return [
      {
        id: "hide",
        label: t.hide,
        icon: <EyeSlash aria-hidden />,
        onSelect: p.onHide,
      },
      report,
      { id: "sep", type: "separator" },
      remove,
    ];
  }
  return p.mine ? [remove] : [report];
}

/** A line saying a comment is out of sight, with the way to bring it back. */
function QuietRow({
  text,
  action,
  onAction,
}: {
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div
      role="status"
      className="flex items-center gap-3 border-b border-line py-4 text-sm text-ink-muted"
    >
      <span className="min-w-0 flex-1">{text}</span>
      <Button variant="text" size="sm" onClick={onAction} className="text-ink!">
        {action}
      </Button>
    </div>
  );
}

/** One comment or reply (COM-05). The ⋯ menu depends on who is looking. */
export function CommentItem(p: Props) {
  const { comment, now, reply, view } = p;
  const locale = useLocale();
  const t = useT().post.comment;
  const author = authorOf(comment.authorId);

  if (view === "hidden") {
    return <QuietRow text={t.hiddenText} action={t.hiddenAction} onAction={p.onShowAgain} />;
  }
  if (view === "reported") {
    return <QuietRow text={t.reportedText} action={t.reportedAction} onAction={p.onShowAgain} />;
  }

  return (
    <div
      className={cn(
        "relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line py-5",
        reply && "ml-6 border-l pl-4",
      )}
    >
      <AuthorAvatar author={author} size={32} />
      <div className="min-w-0 pr-8">
        <div className="flex flex-wrap items-center gap-x-2 text-[13px] leading-[18px] text-ink-muted">
          <AuthorLink handle={author.handle} className="text-sm font-medium">
            {author.name}
          </AuthorLink>
          {p.byPostAuthor && (
            <span className="border border-line px-1.5 text-xs text-ink-muted">{t.author}</span>
          )}
          <span>· {formatAgo(comment.createdAt, now, locale)}</span>
        </div>
        <CommentText text={comment.text} />
        <div className="mt-1.5">
          <Button variant="text" size="sm" onClick={p.onReply} className="text-[13px]!">
            {t.reply}
          </Button>
        </div>
        {p.children}
      </div>
      {/* Only the trigger is scaled: a transform on a wrapper would become the containing block of
          the menu's fixed bottom sheet on phones and squeeze it into this corner. */}
      <div className="absolute top-2.5 -right-2">
        <Menu
          label={format(t.moreFor, { name: author.name })}
          items={menuFor(p, t)}
          className="[&>button]:scale-90"
        />
      </div>
    </div>
  );
}
