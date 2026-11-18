import type { Project } from "../types";
import { ProjectRow } from "./project-row";

/** "Unggulan" (PRD 17.5): the projects an Administrator marked, above the rest of the list. */
export function FeaturedBlock({
  featured,
  showsRest,
  now,
}: {
  featured: Project[];
  showsRest: boolean;
  now: number;
}) {
  if (featured.length === 0) return null;
  return (
    <section aria-labelledby="unggulan-title" className="mt-6">
      <h2 id="unggulan-title" className="heading-md">
        Unggulan
      </h2>
      <div className="grid gap-x-10 lg:grid-cols-2">
        {featured.map((project) => (
          <ProjectRow key={project.slug} project={project} now={now} />
        ))}
      </div>
      {showsRest && <h2 className="mt-8 heading-md">Semua proyek</h2>}
    </section>
  );
}
