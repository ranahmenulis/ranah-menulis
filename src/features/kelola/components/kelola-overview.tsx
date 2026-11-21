"use client";

import type { PostStore } from "@/features/community/storage/post-store";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { areasFor, type AreaInfo } from "../access";
import {
  useAdminBand,
  useEditorBand,
  useJudgeBand,
  useMentorBand,
  useOrganizerBand,
} from "../use-band-work";
import { RoleBandLink } from "./role-band";

type Stores = { submissions?: SubmissionStore; assignments?: AssignmentStore; posts?: PostStore };
type BandProps = { area: AreaInfo; index: number; stores: Stores };

const link = (area: AreaInfo, index: number) => ({
  area: area.id,
  label: area.label,
  summary: area.summary,
  href: area.href,
  index,
});

// One component per area, so each loads only its own data and only for areas the viewer holds.
function EditorBand({ area, index, stores }: BandProps) {
  return <RoleBandLink {...link(area, index)} work={useEditorBand(stores.submissions)} />;
}
function JudgeBand({ area, index, stores }: BandProps) {
  return <RoleBandLink {...link(area, index)} work={useJudgeBand(stores.submissions)} />;
}
function MentorBand({ area, index, stores }: BandProps) {
  return <RoleBandLink {...link(area, index)} work={useMentorBand(stores.assignments)} />;
}
function OrganizerBand({ area, index, stores }: BandProps) {
  return <RoleBandLink {...link(area, index)} work={useOrganizerBand(stores.submissions)} />;
}
function AdminBand({ area, index, stores }: BandProps) {
  const { work, people } = useAdminBand(stores.posts);
  return <RoleBandLink {...link(area, index)} work={work} people={people} />;
}

const BANDS = {
  editor: EditorBand,
  juri: JudgeBand,
  mentor: MentorBand,
  organizer: OrganizerBand,
  admin: AdminBand,
};

/**
 * /kelola: one short band per area the viewer can open (DESIGN.md 7.8), each with its number of
 * work. The frame has already refused everyone else.
 */
export function KelolaOverview(stores: Stores = {}) {
  const areas = areasFor(useEffectiveRoles());
  return (
    <section aria-labelledby="kelola-title" className="grid gap-6">
      <div className="grid gap-1">
        <h1 id="kelola-title" className="heading-lg">
          Kelola
        </h1>
        <p className="text-sm text-ink-muted">Ruang kerja untuk setiap peran yang kamu pegang.</p>
      </div>
      <ul className="grid gap-3 xl:grid-cols-2">
        {areas.map((area, i) => {
          const Band = BANDS[area.id];
          return (
            <li key={area.id} className="grid">
              <Band area={area} index={i} stores={stores} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
