"use client";

import { useT } from "@/lib/i18n/provider";
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

function useLink({ area, index }: BandProps) {
  const text = useT().kelolaShared.areas[area.id];
  return { area: area.id, label: text.label, summary: text.summary, href: area.href, index };
}

// One component per area, so each loads only its own data and only for areas the viewer holds.
function EditorBand(props: BandProps) {
  return <RoleBandLink {...useLink(props)} work={useEditorBand(props.stores.submissions)} />;
}
function JudgeBand(props: BandProps) {
  return <RoleBandLink {...useLink(props)} work={useJudgeBand(props.stores.submissions)} />;
}
function MentorBand(props: BandProps) {
  return <RoleBandLink {...useLink(props)} work={useMentorBand(props.stores.assignments)} />;
}
function OrganizerBand(props: BandProps) {
  return <RoleBandLink {...useLink(props)} work={useOrganizerBand(props.stores.submissions)} />;
}
function AdminBand(props: BandProps) {
  const { work, people } = useAdminBand(props.stores.posts);
  return <RoleBandLink {...useLink(props)} work={work} people={people} />;
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
  const t = useT().kelolaShared.overview;
  const areas = areasFor(useEffectiveRoles());
  return (
    <section aria-labelledby="kelola-title" className="grid gap-6">
      <div className="grid gap-1">
        <h1 id="kelola-title" className="heading-lg">
          {t.title}
        </h1>
        <p className="text-sm text-ink-muted">{t.subtitle}</p>
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
