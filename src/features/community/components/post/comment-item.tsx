"use client";

import { EyeSlash, Flag, Trash } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import { cn } from "@/lib/cn";
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

function menuFor(p: Props): MenuEntry[] {
  const report: MenuEntry = {
    id: "report",
    label: "Laporkan",
    icon: <Flag aria-hidden />,
    onSelect: p.onReport,
  };
  const remove: MenuEntry = {
    id: "delete",
    label: "Hapus komentar",
    icon: <Trash aria-hidden />,
    danger: true,
    onSelect: p.onDelete,
  };
  if (p.iAmPostAuthor && !p.mine) {
    return [
      {
        id: "hide",
        label: "Sembunyikan komentar",
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
  const author = authorOf(comment.authorId);

  if (view === "hidden") {
    return (
      <QuietRow
        text="Kamu menyembunyikan satu komentar. Pembaca lain tidak melihatnya."
        action="Tampilkan lagi"
        onAction={p.onShowAgain}
      />
    );
  }
  if (view === "reported") {
    return (
      <QuietRow
        text="Kamu melaporkan komentar ini. Komentar disembunyikan dari tampilanmu selama ditinjau."
        action="Tampilkan"
        onAction={p.onShowAgain}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line py-5",
        reply && "ml-6 border-l pl-4",
      )}
    >
      <Avatar name={author.name} size={32} />
      <div className="min-w-0 pr-8">
        <div className="flex flex-wrap items-center gap-x-2 text-[13px] leading-[18px] text-ink-muted">
          <AuthorLink handle={author.handle} className="text-sm font-medium">
            {author.name}
          </AuthorLink>
          {p.byPostAuthor && (
            <span className="border border-line px-1.5 text-xs text-ink-muted">Penulis</span>
          )}
          <span>· {formatAgo(comment.createdAt, now)}</span>
        </div>
        <CommentText text={comment.text} />
        <div className="mt-1.5">
          <Button variant="text" size="sm" onClick={p.onReply} className="text-[13px]!">
            Balas
          </Button>
        </div>
        {p.children}
      </div>
      <div className="absolute top-2.5 -right-2 scale-90">
        <Menu label={`Lainnya untuk komentar ${author.name}`} items={menuFor(p)} />
      </div>
    </div>
  );
}
