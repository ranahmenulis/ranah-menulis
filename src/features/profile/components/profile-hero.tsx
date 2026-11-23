import { Flame } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ProfileShelf } from "@/components/illustrations/personal-art";
import { Button, ButtonLink } from "@/components/ui/button";
import { heroArtClass, heroCardClass } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { HeroBanner } from "@/components/ui/page-hero";
import { cn } from "@/lib/cn";
import { format, useT } from "@/lib/i18n/provider";
import { SETTINGS_HREF } from "@/features/account/redirect";
import { SAVED_HREF } from "@/features/app-shell/nav";
import { AuthorAvatar } from "@/features/community/components/author-avatar";
import type { Author } from "@/features/community/types";

type Props = {
  author: Author;
  /** Public works, the same list as the Karya tab. */
  works: number;
  followers: number;
  following: number;
  /** Days, only when the author shares the streak (private by default). */
  streak?: number;
  own: boolean;
  isFollowing: boolean;
  onFollow: () => void;
};

/**
 * The top of a profile (DESIGN.md 6.5, 7.10): a full hero card with the avatar, the name in serif,
 * three rolling counts and one button, and the writer's shelf at the right (one spine per public
 * work). Your own profile has no Ikuti (COM-08); it offers editing in Settings instead.
 */
export function ProfileHero(p: Props) {
  const t = useT().profile;
  return (
    <header
      aria-labelledby="profile-title"
      className={cn(heroCardClass, "grid gap-5 lg:col-span-2")}
    >
      <ProfileShelf works={p.works} className={cn(heroArtClass, "max-md:hidden")} />
      <HeroBanner art={(a) => <ProfileShelf works={p.works} {...a} />} className="h-16 md:hidden" />

      <div className="flex min-w-0 items-center gap-4 md:gap-5">
        <AuthorAvatar author={p.author} size={88} className="shrink-0 max-md:size-16" />
        <div className="min-w-0">
          <h1
            id="profile-title"
            className="rm-rise-in font-serif text-[30px] leading-[1.15] [overflow-wrap:anywhere] [--i:-3] md:text-[44px]"
          >
            {p.author.name}
          </h1>
          <p className="text-sm [overflow-wrap:anywhere] text-ink-muted">@{p.author.handle}</p>
        </div>
      </div>

      <dl className="flex max-w-md flex-wrap gap-x-8 gap-y-2">
        {(
          [
            [t.counts.works, p.works],
            [t.counts.followers, p.followers],
            [t.counts.following, p.following],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="grid gap-0.5">
            <dt className="order-2 text-xs text-ink-muted">{label}</dt>
            <dd className="order-1 text-[28px] leading-8 font-bold tracking-tight tabular-nums md:text-[32px] md:leading-9">
              <CountUp value={value} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-3">
        {p.own ? (
          <>
            <ButtonLink href={SETTINGS_HREF} variant="secondary" size="sm">
              {t.editProfile}
            </ButtonLink>
            {/* Phones have no sidebar, so this is how Tersimpan is reached there. */}
            <Link
              href={SAVED_HREF}
              className="inline-flex min-h-11 items-center text-sm text-ink underline lg:hidden"
            >
              {t.saved}
            </Link>
          </>
        ) : (
          <Button
            variant={p.isFollowing ? "secondary" : "primary"}
            size="sm"
            aria-pressed={p.isFollowing}
            onClick={p.onFollow}
            className="min-w-28"
          >
            {p.isFollowing ? t.following : t.follow}
          </Button>
        )}
        {p.streak !== undefined && (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-accent-subtle px-3 py-1 text-sm text-accent-ink tabular-nums">
            <Flame size={16} weight="fill" aria-hidden />
            {format(t.streak, { days: String(p.streak) })}
          </p>
        )}
      </div>
    </header>
  );
}
