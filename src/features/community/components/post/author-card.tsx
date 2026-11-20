"use client";

import { AuthorAvatar } from "../author-avatar";
import { Button } from "@/components/ui/button";
import { AuthorLink } from "@/features/profile/author-link";
import { profileOf, whereOf } from "@/features/profile/profile-model";
import type { Author } from "../../types";

type Props = {
  author: Author;
  showFollow: boolean;
  following: boolean;
  onFollow: (author: Author) => void;
};

/** "Ditulis oleh": the author at the end of the text, with their bio and a follow button. */
export function AuthorCard({ author, showFollow, following, onFollow }: Props) {
  const { bio } = profileOf(author.id);
  const where = whereOf(author);
  return (
    <section aria-label="Tentang penulis" className="mt-12 border-t border-line pt-8">
      <p className="mb-4 text-[13px] leading-[18px] text-ink-muted">Ditulis oleh</p>
      <div className="flex items-start gap-4">
        <AuthorAvatar author={author} size={56} />
        <div className="grid min-w-0 flex-1 gap-1">
          <AuthorLink handle={author.handle} className="text-base font-semibold">
            {author.name}
          </AuthorLink>
          <p className="text-xs text-ink-muted">{where}</p>
          {bio && <p className="mt-1 text-sm leading-6 text-ink-muted">{bio}</p>}
        </div>
        {showFollow && (
          <Button
            variant="secondary"
            size="sm"
            aria-pressed={following}
            onClick={() => onFollow(author)}
          >
            {following ? "Mengikuti" : "Ikuti"}
          </Button>
        )}
      </div>
    </section>
  );
}
