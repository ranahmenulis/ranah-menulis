import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Notice } from "@/components/ui/states";
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
  const facts: [string, string][] = [
    ["Nama pengguna", `@${author.handle}`],
    ["Asal", whereOf(author)],
    ...(genres.length > 0 ? [["Genre", genres.join(" · ")] as [string, string]] : []),
  ];
  return (
    <div className="grid gap-6 py-6">
      {profile.bio ? (
        <p className="font-serif text-lg leading-7 [overflow-wrap:anywhere] text-ink-read">
          {profile.bio}
        </p>
      ) : (
        <p className="text-sm text-ink-muted">Belum ada keterangan tentang penulis ini.</p>
      )}
      <dl className="grid gap-3 text-sm">
        {facts.map(([term, value]) => (
          <div key={term} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4">
            <dt className="text-ink-muted">{term}</dt>
            <dd className="[overflow-wrap:anywhere]">{value}</dd>
          </div>
        ))}
      </dl>
      {own && (
        <Notice>
          Yang tampil di profil publik hanya tulisanmu yang berstatus Publik. Streak dan proyek baru
          tampil bila kamu mengizinkannya.
        </Notice>
      )}
    </div>
  );
}

/** Proyek: results shown here come from Projects (R4) and only with the author's consent. */
export function ProjectsTab({ own }: { own: boolean }) {
  return (
    <EmptyState className="py-6">
      {own ? "Belum ada proyek yang kamu tampilkan." : "Belum ada proyek yang ditampilkan."}
    </EmptyState>
  );
}

export function WorksEmpty({ own }: { own: boolean }) {
  return (
    <EmptyState
      className="py-6"
      action={
        own ? (
          <ButtonLink href={NEW_POST_HREF} variant="secondary">
            Tulis postingan
          </ButtonLink>
        ) : undefined
      }
    >
      {own ? "Kamu belum membagikan tulisan secara publik." : "Belum ada tulisan publik di sini."}
    </EmptyState>
  );
}
