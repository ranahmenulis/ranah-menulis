"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { buildThreads, type Thread } from "../../comment-threads";
import { ME_ID } from "../../fixtures/authors";
import type { CommunityData } from "../../hooks/use-community";
import type { PostActions } from "../../hooks/use-post-actions";
import { authorOf } from "../../post-model";
import { mark } from "../../storage/post-store";
import type { Comment, Post, ReportReason } from "../../types";
import { CommentComposer } from "./comment-composer";
import { CommentItem, type CommentView } from "./comment-item";
import { ReportDialog } from "./report-dialog";

const FIRST_THREADS = 3;
const MORE_THREADS = 5;
const FIRST_REPLIES = 2;

type Props = {
  post: Post;
  data: CommunityData;
  guest: boolean;
  actions: PostActions;
};

/** The comment being answered. Replies always attach to its top-level comment (one level only). */
type Replying = { commentId: string; mention?: string } | null;

/** Comments and replies of a post (COM-05, DESIGN.md 6.9). Dummy comments plus your own, locally. */
export function CommentsSection({ post, data, guest, actions }: Props) {
  const toast = useToast();
  const threads = useMemo(() => buildThreads(data.comments, post.id), [data.comments, post.id]);
  const iAmPostAuthor = post.authorId === ME_ID;

  const [visibleThreads, setVisibleThreads] = useState(FIRST_THREADS);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [replying, setReplying] = useState<Replying>(null);
  const [reporting, setReporting] = useState<Comment | null>(null);
  const [deleting, setDeleting] = useState<Comment | null>(null);

  const viewOf = (c: Comment): CommentView =>
    data.marks[mark.hidden(c.id)]
      ? "hidden"
      : data.marks[mark.reported(c.id)]
        ? "reported"
        : "normal";

  async function flag(key: string, on: boolean, failure: string) {
    const ok = await data.toggle(key, !on);
    if (!ok) toast({ message: failure, tone: "error", key });
  }

  async function send(text: string, parentId: string | null, mention?: string) {
    const ok = await data.addComment({ postId: post.id, parentId, text, mention });
    if (ok && parentId) setReplying(null);
    if (!ok) toast({ message: "Komentar belum terkirim.", tone: "error", key: "comment" });
    return ok;
  }

  function startReply(thread: Thread, to: Comment) {
    if (actions.requireAccount("Masuk untuk membalas")) return;
    // Answering a reply stays in the same thread and names who it is aimed at.
    setReplying({
      commentId: to.id,
      mention: to.parentId ? authorOf(to.authorId).handle : undefined,
    });
  }

  function submitReport(reason: ReportReason) {
    void reason; // the reason is only collected for now; it goes to moderation with the backend
    if (reporting) void flag(mark.reported(reporting.id), true, "Laporan belum tersimpan.");
    setReporting(null);
    toast({ message: "Laporan terkirim. Terima kasih." });
  }

  function item(thread: Thread, c: Comment, reply: boolean) {
    const view = viewOf(c);
    // A comment you hid is invisible to everyone else; only the post's author sees the quiet row.
    if (view === "hidden" && !iAmPostAuthor) return null;
    return (
      <CommentItem
        key={c.id}
        comment={c}
        now={data.now}
        reply={reply}
        byPostAuthor={c.authorId === post.authorId}
        mine={c.authorId === ME_ID}
        iAmPostAuthor={iAmPostAuthor && !guest}
        view={view}
        onReply={() => startReply(thread, c)}
        onHide={() => void flag(mark.hidden(c.id), true, "Komentar belum tersembunyi.")}
        onShowAgain={() =>
          void flag(
            view === "hidden" ? mark.hidden(c.id) : mark.reported(c.id),
            false,
            "Belum tersimpan.",
          )
        }
        onReport={() => (actions.requireAccount("Masuk untuk melaporkan") ? null : setReporting(c))}
        onDelete={() => setDeleting(c)}
      >
        {replying?.commentId === c.id && (
          <div className="mt-3">
            <CommentComposer
              label={`Balas ${authorOf(c.authorId).name}`}
              placeholder={`Balas ${authorOf(c.authorId).name}`}
              initialText={replying.mention ? `@${replying.mention} ` : ""}
              primary={false}
              autoFocus
              onSubmit={(text) => send(text, thread.root.id, replying.mention)}
              onCancel={() => setReplying(null)}
            />
          </div>
        )}
      </CommentItem>
    );
  }

  const shown = threads.slice(0, visibleThreads);

  return (
    <section id="komentar" aria-label="Komentar" className="mt-14">
      <h2 className="mb-4 text-xl leading-7 font-semibold">
        Komentar{" "}
        <span className="text-base font-normal text-ink-muted tabular-nums">
          {data.comments.filter((c) => c.postId === post.id).length}
        </span>
      </h2>

      {guest ? (
        <div className="grid justify-items-start gap-3 border-b border-line py-6">
          <p className="font-serif text-lg leading-[26px] font-semibold">
            Masuk untuk ikut membalas.
          </p>
          <p className="text-sm text-ink-muted">
            Kamu bisa membaca semua komentar tanpa akun. Setelah masuk, kamu kembali ke tulisan ini.
          </p>
          <div className="flex items-center gap-2">
            <Button disabled title="Masuk tersedia setelah akun dibuka">
              Masuk
            </Button>
            <Button variant="text" disabled title="Masuk tersedia setelah akun dibuka">
              Daftar
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-b border-line pb-6">
          <CommentComposer
            label="Tulis komentar"
            placeholder={`Tulis komentar untuk ${authorOf(post.authorId).name.split(" ")[0]}`}
            primary
            onSubmit={(text) => send(text, null)}
          />
        </div>
      )}

      {threads.length === 0 ? (
        <p className="border-b border-line py-6 text-sm text-ink-muted">
          Belum ada komentar. Komentar pertama sering paling dibaca penulisnya.
        </p>
      ) : (
        <div>
          {shown.map((thread) => {
            const open = expanded.has(thread.root.id);
            const replies = open ? thread.replies : thread.replies.slice(0, FIRST_REPLIES);
            const rest = thread.replies.length - replies.length;
            return (
              <div key={thread.root.id}>
                {item(thread, thread.root, false)}
                {replies.map((r) => item(thread, r, true))}
                {rest > 0 && (
                  <Button
                    variant="text"
                    onClick={() => setExpanded(new Set(expanded).add(thread.root.id))}
                    className="ml-6 h-12 w-[calc(100%-1.5rem)] rounded-none border-b border-line text-ink!"
                  >
                    Lihat {rest} balasan lainnya
                  </Button>
                )}
              </div>
            );
          })}
          {threads.length > visibleThreads && (
            <Button
              variant="text"
              onClick={() => setVisibleThreads((n) => n + MORE_THREADS)}
              className="h-12 w-full rounded-none border-b border-line text-ink!"
            >
              Lihat komentar lainnya
            </Button>
          )}
        </div>
      )}

      <ReportDialog
        subject={reporting ? `komentar ${authorOf(reporting.authorId).name}` : null}
        onClose={() => setReporting(null)}
        onSubmit={submitReport}
      />
      <Dialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Hapus komentar ini?"
        description="Komentar hilang dari tulisan dan tidak bisa dikembalikan."
        actions={
          <>
            <Button variant="text" onClick={() => setDeleting(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleting)
                  void flag(mark.deleted(deleting.id), true, "Komentar belum terhapus.");
                setDeleting(null);
              }}
            >
              Hapus komentar
            </Button>
          </>
        }
      />
    </section>
  );
}
