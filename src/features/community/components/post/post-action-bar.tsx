"use client";

import {
  BookmarkSimple,
  ChatCircle,
  Flag,
  Heart,
  Link as LinkIcon,
  ShareNetwork,
} from "@phosphor-icons/react/dist/ssr";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import { cn } from "@/lib/cn";

type Props = {
  appreciations: number;
  comments: number;
  appreciated: boolean;
  saved: boolean;
  onAppreciate: () => void;
  onSave: () => void;
  onShare: () => void;
  onCopyLink: () => void;
  onReport: () => void;
};

/** Press feedback on the icon only; the button keeps its opacity press state [usulan]. */
const pressIcon = "transition-transform duration-120 ease-(--ease-out) group-active:scale-90";

/** "Salin tautan" and "Laporkan tulisan" (COM-04). There is no reshare (Fase 2). */
function postMenu({ onCopyLink, onReport }: Pick<Props, "onCopyLink" | "onReport">): MenuEntry[] {
  return [
    { id: "copy", label: "Salin tautan", icon: <LinkIcon aria-hidden />, onSelect: onCopyLink },
    { id: "sep", type: "separator" },
    { id: "report", label: "Laporkan tulisan", icon: <Flag aria-hidden />, onSelect: onReport },
  ];
}

function Actions({
  appreciations,
  comments,
  appreciated,
  saved,
  onAppreciate,
  onSave,
  onShare,
  compact,
}: Props & { compact: boolean }): ReactNode {
  // Bumped only when the heart is switched on, so it pops for that moment and never on load.
  const [pops, setPops] = useState(0);
  const count = (n: number) => <span className="tabular-nums">{n.toLocaleString("id-ID")}</span>;
  const text = (label: string) => (compact ? null : label);
  return (
    <>
      <Button
        variant="text"
        aria-pressed={appreciated}
        aria-label={`Apresiasi ${appreciations}`}
        onClick={() => {
          if (!appreciated) setPops((n) => n + 1);
          onAppreciate();
        }}
        className={cn("group gap-1.5! px-2.5! font-normal!", appreciated && "text-ink!")}
      >
        <Heart
          key={pops}
          size={20}
          weight={appreciated ? "fill" : "regular"}
          aria-hidden
          className={cn(pressIcon, appreciated && pops > 0 && "rm-heart-pop")}
        />
        {text("Apresiasi ")}
        {count(appreciations)}
      </Button>
      <a
        href="#komentar"
        aria-label={`Komentar ${comments}`}
        className="inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-sm text-ink-muted no-underline hover:text-ink"
      >
        <ChatCircle size={20} aria-hidden />
        {text("Komentar ")}
        {count(comments)}
      </a>
      <Button variant="text" onClick={onShare} className="gap-1.5! px-2.5! font-normal!">
        <ShareNetwork size={20} aria-hidden />
        Bagikan
      </Button>
      <Button
        variant="text"
        aria-pressed={saved}
        onClick={onSave}
        className={cn("group ml-auto gap-1.5! px-2.5! font-normal!", saved && "text-ink!")}
      >
        <BookmarkSimple
          size={20}
          weight={saved ? "fill" : "regular"}
          aria-hidden
          className={pressIcon}
        />
        {saved ? "Tersimpan" : "Simpan"}
      </Button>
    </>
  );
}

/** Desktop and tablet action bar under the text (DESIGN.md 6.9 #1). */
export function PostActionBar(props: Props) {
  return (
    <div
      role="toolbar"
      aria-label="Aksi tulisan"
      className="mt-8 flex items-center gap-1 border-y border-line py-2 max-md:hidden"
    >
      <Actions {...props} compact={false} />
      <Menu label="Lainnya" items={postMenu(props)} />
    </div>
  );
}

/** Phones: sticky at the bottom in place of the navigation bar [usulan]. */
export function PostMobileBar(props: Props) {
  return (
    <div
      role="toolbar"
      aria-label="Aksi tulisan"
      className="fixed inset-x-0 bottom-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-bottom))] items-center gap-0.5 border-t border-line bg-canvas px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <Actions {...props} compact />
      <Menu label="Lainnya" items={postMenu(props)} />
    </div>
  );
}
