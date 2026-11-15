import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SAVED_HREF } from "@/features/app-shell/nav";
import type { Author, Genre } from "@/features/community/types";
import type { ProfileFixture } from "../fixtures";
import { whereOf } from "../profile-model";

const number = new Intl.NumberFormat("id-ID");

type Props = {
  author: Author;
  profile: ProfileFixture;
  followers: number;
  following: number;
  genres: Genre[];
  own: boolean;
  isFollowing: boolean;
  onFollow: () => void;
};

/**
 * The right column of a profile (DESIGN.md 6.5), above the tabs on phones: avatar, counts, bio,
 * where from, genres, streak when the author shares it, and one button. Your own profile has no
 * Ikuti (COM-08); it offers editing instead, which waits for the account screens.
 */
export function ProfileIdentity(p: Props) {
  return (
    <aside
      aria-label={`Profil ${p.author.name}`}
      className="grid justify-items-start gap-3 py-5 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start lg:py-0"
    >
      <Avatar name={p.author.name} size={88} />
      <p className="text-sm">
        <b className="font-medium tabular-nums">{number.format(p.followers)}</b> pengikut ·{" "}
        <b className="font-medium tabular-nums">{number.format(p.following)}</b> mengikuti
      </p>
      {p.profile.bio && (
        <p className="text-sm leading-6 [overflow-wrap:anywhere] text-ink-read">{p.profile.bio}</p>
      )}
      <p className="text-sm [overflow-wrap:anywhere] text-ink-muted">{whereOf(p.author)}</p>
      {p.genres.length > 0 && <p className="text-sm text-ink-muted">{p.genres.join(" · ")}</p>}
      {p.profile.streak !== undefined && (
        <p className="text-sm tabular-nums">Streak {p.profile.streak} hari</p>
      )}

      {p.own ? (
        <>
          <Button variant="secondary" size="sm" disabled title="Segera">
            Ubah profil
          </Button>
          {/* Phones have no sidebar, so this is how Tersimpan is reached there. */}
          <Link
            href={SAVED_HREF}
            className="inline-flex min-h-11 items-center text-sm text-ink underline lg:hidden"
          >
            Tersimpan
          </Link>
        </>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          aria-pressed={p.isFollowing}
          onClick={p.onFollow}
          className="min-w-28 aria-pressed:bg-subtle"
        >
          {p.isFollowing ? "Mengikuti" : "Ikuti"}
        </Button>
      )}
    </aside>
  );
}
