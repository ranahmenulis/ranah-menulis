import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Notice } from "@/components/ui/states";
import { useT } from "@/lib/i18n/provider";
import { NEW_POST_HREF } from "@/features/app-shell/nav";
import type { Author, Genre } from "@/features/community/types";
import type { ProfileFixture } from "../fixtures";
import { whereOf } from "../profile-model";

/** Tentang: the bio at reading size and the plain facts. Yours also says what is public. */
export function AboutTab({
  author,
  profile,
  genres,
  own,
}: {
  author: Author;
  profile: ProfileFixture;
  genres: Genre[];
  own: boolean;
}) {
  const t = useT().profile.about;
  const facts: [string, string][] = [
    [t.username, `@${author.handle}`],
    [t.origin, whereOf(author)],
    ...(genres.length > 0 ? [[t.genre, genres.join(" · ")] as [string, string]] : []),
  ];
  return (
    <div className="grid gap-6 py-6">
      {profile.bio ? (
        <p className="font-serif text-lg leading-7 [overflow-wrap:anywhere] text-ink-read">
          {profile.bio}
        </p>
      ) : (
        <p className="text-sm text-ink-muted">{t.noBio}</p>
      )}
      <dl className="grid gap-3 text-sm">
        {facts.map(([term, value]) => (
          <div key={term} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4">
            <dt className="text-ink-muted">{term}</dt>
            <dd className="[overflow-wrap:anywhere]">{value}</dd>
          </div>
        ))}
      </dl>
      {own && <Notice>{t.ownNotice}</Notice>}
    </div>
  );
}

/** Proyek: results shown here come from Projects (R4) and only with the author's consent. */
export function ProjectsTab({ own }: { own: boolean }) {
  const t = useT().profile.projects;
  return <EmptyState className="py-6">{own ? t.own : t.other}</EmptyState>;
}

export function WorksEmpty({ own }: { own: boolean }) {
  const t = useT().profile.works;
  return (
    <EmptyState
      className="py-6"
      art="wildRose"
      action={
        own ? (
          <ButtonLink href={NEW_POST_HREF} variant="secondary">
            {t.write}
          </ButtonLink>
        ) : undefined
      }
    >
      {own ? t.own : t.other}
    </EmptyState>
  );
}
