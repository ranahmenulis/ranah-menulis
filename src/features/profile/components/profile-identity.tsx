import { IdentificationCard } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/ui/section-card";
import { cn } from "@/lib/cn";
import { format, useT } from "@/lib/i18n/provider";
import type { Author, Genre } from "@/features/community/types";
import type { ProfileFixture } from "../fixtures";
import { whereOf } from "../profile-model";

type Props = {
  author: Author;
  profile: ProfileFixture;
  genres: Genre[];
  className?: string;
};

/**
 * The right column of a profile (DESIGN.md 6.5) from lg: a card with the bio, where from and the
 * genres. Phones skip it: the Tentang tab says the same, and the hero carries the rest.
 */
export function ProfileIdentity(p: Props) {
  const t = useT().profile;
  return (
    <aside
      aria-label={format(t.aside, { name: p.author.name })}
      className={cn("lg:sticky lg:top-[calc(6rem+var(--safe-top))] lg:self-start", p.className)}
    >
      <Section title={t.tabs.tentang} icon={IdentificationCard} id="profile-about-title">
        <div className="grid gap-2">
          {p.profile.bio && (
            <p className="text-sm leading-6 [overflow-wrap:anywhere] text-ink-read">
              {p.profile.bio}
            </p>
          )}
          <p className="text-sm [overflow-wrap:anywhere] text-ink-muted">{whereOf(p.author)}</p>
          {p.genres.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label={t.about.genre}>
              {p.genres.map((genre) => (
                <li
                  key={genre}
                  className="rounded-full bg-accent-subtle px-2.5 py-0.5 text-xs text-accent-ink"
                >
                  {genre}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    </aside>
  );
}
