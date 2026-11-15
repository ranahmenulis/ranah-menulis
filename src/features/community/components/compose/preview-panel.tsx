import { Avatar } from "@/components/ui/avatar";
import { DUMMY_USER } from "@/features/app-shell/nav";
import { PostText, ScopeLine } from "../post/post-article";
import type { Genre, PostBlock, PostKind } from "../../types";

type Props = {
  title: string;
  kind: PostKind;
  genre: Genre | "";
  blocks: PostBlock[];
  sourceTitle: string | null;
};

/** The post exactly as a reader sees it, in the same typography as the post page (STD-10). */
export function PreviewPanel({ title, kind, genre, blocks, sourceTitle }: Props) {
  const mark = `${kind === "prolog" ? "Prolog" : "Cuplikan"}${genre ? ` · ${genre}` : ""}`;
  return (
    <section aria-label="Pratinjau untuk pembaca">
      <h2 className="mb-3 text-sm font-medium">Pratinjau untuk pembaca</h2>
      <div className="border border-line p-5">
        <p className="mb-3 text-[13px] leading-[18px] text-ink-muted">{mark}</p>
        <p className="mb-4 font-serif text-[26px] leading-8 font-semibold wrap-anywhere text-ink-read">
          {title.trim() || <span className="text-ink-faint">Tanpa judul</span>}
        </p>
        <div className="mb-1 flex items-center gap-2 text-sm">
          <Avatar name={DUMMY_USER.name} size={32} />
          {DUMMY_USER.name}
        </div>
        <ScopeLine kind={kind} sourceTitle={sourceTitle} />
        <div className="pt-4 text-[17px] [&_.read-body]:text-[17px]! [&_.read-body]:leading-7!">
          {blocks.length > 0 ? (
            <PostText blocks={blocks} kind={kind} />
          ) : (
            <p className="text-sm text-ink-muted">
              Teks yang kamu pilih atau tulis tampil di sini.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
