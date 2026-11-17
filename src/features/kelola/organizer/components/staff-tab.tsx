"use client";

import { useState } from "react";
import { CheckChoice } from "@/components/ui/choice";
import { Notice } from "@/components/ui/states";
import type { ProjectCategory } from "@/features/projects/types";
import {
  assigneesOf,
  setAssignees,
  staffRoleLabel,
  useStaffAssignments,
  type StaffRole,
} from "../../staff-assignments";
import { personLabel } from "../../admin/people";
import { activeHolders } from "../../admin/role-rules";
import { useRoleGrants, useSuspensions } from "../../admin/role-store";

/** Who works on a project of this category: Editors read work, Mentors teach, Judges score. */
export const staffRoleOf: Record<ProjectCategory, StaffRole> = {
  antologi: "editor",
  solo: "editor",
  kelas: "mentor",
  lomba: "juri",
};

/**
 * Assign people to the project (PRJ-03, Q-04). A change is saved at once and said in words. The
 * people are a fixed list until accounts exist; assignments end when the project is archived.
 */
export function StaffTab({
  slug,
  category,
  archived,
}: {
  slug: string;
  category: ProjectCategory;
  archived: boolean;
}) {
  const list = useStaffAssignments();
  const grants = useRoleGrants();
  const suspended = useSuspensions();
  const [said, setSaid] = useState("");
  const role = staffRoleOf[category];
  const current = assigneesOf(list, slug, role);
  // Who holds the role (given on the Admin screen), plus anyone already assigned so they can be released.
  const candidates = [...new Set([...activeHolders(grants, suspended, role), ...current])];

  function toggle(id: string, name: string, on: boolean) {
    const next = on ? [...current, id] : current.filter((c) => c !== id);
    setAssignees(slug, role, next);
    setSaid(on ? `${name} ditugaskan.` : `${name} tidak lagi ditugaskan.`);
  }

  return (
    <section aria-labelledby="penugasan-title" className="grid max-w-170 gap-4">
      <h2 id="penugasan-title" className="heading-md">
        {staffRoleLabel[role]} proyek ini
      </h2>
      {archived && <Notice>Proyek diarsipkan, jadi penugasannya sudah dicabut.</Notice>}
      <div role="group" aria-labelledby="penugasan-title" className="grid gap-3">
        {candidates.length === 0 && (
          <Notice>
            Belum ada yang memegang role {staffRoleLabel[role]}. Administrator memberinya di Admin.
          </Notice>
        )}
        {candidates.map((id) => (
          <CheckChoice
            key={id}
            label={personLabel(id)}
            checked={!archived && current.includes(id)}
            disabled={archived}
            onChange={(e) => toggle(id, personLabel(id), e.target.checked)}
          />
        ))}
      </div>
      <p role="status" className="min-h-5 text-sm">
        {said}
      </p>
      <p className="text-xs text-ink-muted">
        {current.length === 0
          ? `Belum ada ${staffRoleLabel[role]} yang ditugaskan.`
          : `${current.length} ${staffRoleLabel[role]} ditugaskan.`}
      </p>
    </section>
  );
}
