import Link from "next/link";
import { AuthorAvatar } from "@/features/community/components/author-avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { SETTINGS_HREF } from "@/features/account/redirect";
import { SAVED_HREF } from "@/features/app-shell/nav";
import type { Author, Genre } from "@/features/community/types";
import type { ProfileFixture } from "../fixtures";
import { whereOf } from "../profile-model";

type Props = {
  author: Author;
  profile: ProfileFixture;
  /** Public works, the same list as the Karya tab. */
  works: number;
  followers: number;
  following: number;
  genres: Genre[];
  own: boolean;
  isFollowing: boolean;
  onFollow: () => void;
};

/**
 * The right column of a profile (DESIGN.md 6.5), above the tabs on phones: avatar, three rolling counts, bio,
 * where from, genres, streak when the author shares it, and one button. Your own profile has no
 * Ikuti (COM-08); it offers editing in Settings instead.
 */
export function ProfileIdentity(p: Props) {
  return (
    <aside
      aria-label={`Profil ${p.author.name}`}
      className="grid justify-items-start gap-3 py-5 lg:sticky lg:top-[calc(6rem+var(--safe-top))] lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start lg:py-0"
    >
      <AuthorAvatar author={p.author} size={88} />
      <dl className="grid w-full grid-cols-3 border-y border-line py-3">
        {(
          [
            ["karya", p.works],
            ["pengikut", p.followers],
            ["mengikuti", p.following],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="grid gap-0.5">
            <dt className="order-2 text-xs text-ink-muted">{label}</dt>
            <dd className="order-1 font-serif text-[28px] leading-none font-light tabular-nums">
              <CountUp value={value} />
            </dd>
          </div>
        ))}
      </dl>
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
          <ButtonLink href={SETTINGS_HREF} variant="secondary" size="sm">
            Ubah profil
          </ButtonLink>
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
