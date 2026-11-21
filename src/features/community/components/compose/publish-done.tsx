"use client";

import type { CSSProperties } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { DISCOVER_HREF, HOME_HREF, STUDIO_HREF } from "@/features/app-shell/nav";
import { postLabel, wordsOf } from "../../post-model";
import type { StoredPost } from "../../storage/post-store";

const VISIBILITY = { publik: "Publik", grup: "Grup" } as const;

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Success without confetti: one sentence, a summary, and where to go next (DESIGN.md 7.3). It rises
 * in like the milestone screens (7.7) and the summary's rules are drawn from the left; still under
 * reduced motion.
 */
export function PublishDone({ post }: { post: StoredPost }) {
  const toast = useToast();
  const href = `/postingan/${post.id}`;
  const label = post.genre ? postLabel({ kind: post.kind, genre: post.genre }) : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${href}`);
      toast({ message: "Tautan disalin.", key: "copy" });
    } catch {
      toast({ message: "Tautan belum bisa disalin.", tone: "error", key: "copy" });
    }
  }

  return (
    <div role="status" className="mx-auto grid max-w-170 justify-items-start gap-4 py-12 md:py-18">
      <h1
        style={step(-3)}
        className="rm-rise-in font-serif text-[28px] leading-9 font-semibold md:text-[32px] md:leading-10"
      >
        Postinganmu sudah terbit.
      </h1>
      <p className="rm-rise-in max-w-140 text-base text-ink-muted" style={step(-2)}>
        {post.visibility === "grup"
          ? `Anggota ${post.groupName} bisa membacanya.`
          : "Siapa pun bisa membacanya di Community."}
        {post.sourceTitle && ` Dokumen “${post.sourceTitle}” tetap pribadi di Studio.`}
      </p>
      <div className="rm-rise-in relative grid w-full gap-1 py-5" style={step(-1)}>
        <span
          aria-hidden
          className="rm-page-line absolute inset-x-0 top-0 h-px bg-line"
          style={step(3)}
        />
        <span
          aria-hidden
          className="rm-page-line absolute inset-x-0 bottom-0 h-px bg-line"
          style={step(5)}
        />
        <span className="text-[13px] leading-[18px] text-ink-muted">
          {label} · {post.visibility ? VISIBILITY[post.visibility] : ""} ·{" "}
          {wordsOf(post.blocks).toLocaleString("id-ID")} kata
        </span>
        <b className="font-serif text-xl leading-7 font-semibold wrap-anywhere">{post.title}</b>
      </div>
      <div className="rm-rise-in flex flex-wrap items-center gap-2" style={step(0)}>
        <ButtonLink href={href}>Lihat postingan</ButtonLink>
        <Button variant="secondary" onClick={() => void copy()}>
          Salin tautan
        </Button>
      </div>
      <nav
        aria-label="Kembali ke"
        className="rm-rise-in flex flex-wrap items-center gap-x-2"
        style={step(1)}
      >
        <ButtonLink href={HOME_HREF} variant="text" className="px-0!">
          Kembali ke Beranda
        </ButtonLink>
        {post.sourceDocId && (
          <ButtonLink href={STUDIO_HREF} variant="text" className="px-0!">
            Kembali ke Studio
          </ButtonLink>
        )}
        <ButtonLink href={DISCOVER_HREF} variant="text" className="px-0!">
          Kembali ke Community
        </ButtonLink>
      </nav>
    </div>
  );
}
