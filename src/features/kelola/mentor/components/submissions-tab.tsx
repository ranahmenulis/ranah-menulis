"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/states";
import { DUMMY_USER } from "@/features/app-shell/nav";
import { StatusTugas } from "@/features/projects/kelas/components/status-tugas";
import type { ClassContent, AssignmentSubmission } from "@/features/projects/kelas/types";
import { sentAtText } from "@/features/projects/submission-text";
import { handInHref } from "../area-hrefs";
import {
  MENTOR_FILTERS,
  applyMentorFilter,
  countMentorFilters,
  mentorEmptyText,
  mentorFilterQuery,
  mentorRows,
  parseMentorFilter,
  type MentorFilter,
} from "../mentor-queue";

const th = "h-11 px-3 text-left text-xs font-medium text-ink-muted first:pl-0";
const td = "px-3 py-2 align-middle first:pl-0 max-sm:block max-sm:px-0 max-sm:py-0.5";

/**
 * Hand-ins of the class by status. The filter lives in the address (`?status=`), so it can be
 * linked; it opens on "Perlu dinilai".
 */
export function SubmissionsTab({
  content,
  submissions,
  statusParam,
  tab,
}: {
  content: ClassContent;
  submissions: AssignmentSubmission[];
  statusParam: string | null;
  tab: string;
}) {
  // The address is the source of truth (see ProjectsView): Next keeps the previous page mounted.
  const [filter, setFilter] = useState(() => parseMentorFilter(statusParam));
  const [seen, setSeen] = useState(statusParam);
  if (seen !== statusParam) {
    setSeen(statusParam);
    setFilter(parseMentorFilter(statusParam));
  }
  function change(next: MentorFilter) {
    setFilter(next);
    window.history.replaceState(null, "", `${window.location.pathname}${mentorFilterQuery(next)}`);
  }

  const all = useMemo(() => mentorRows(content, submissions), [content, submissions]);
  const counts = useMemo(() => countMentorFilters(all), [all]);
  const shown = useMemo(() => applyMentorFilter(all, filter), [all, filter]);
  const label = MENTOR_FILTERS.find((f) => f.id === filter)?.label ?? tab;

  return (
    <div className="grid gap-5">
      <div role="group" aria-label="Saring pengumpulan" className="flex flex-wrap gap-2">
        {MENTOR_FILTERS.map((f) => (
          <Chip key={f.id} pressed={f.id === filter} onClick={() => change(f.id)}>
            {f.label} <span className="ml-1.5 tabular-nums">{counts[f.id]}</span>
          </Chip>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState
          action={
            filter !== "semua" && all.length > 0 ? (
              <Button variant="text" onClick={() => change("semua")}>
                Lihat semua pengumpulan
              </Button>
            ) : undefined
          }
        >
          {mentorEmptyText[filter]}
        </EmptyState>
      ) : (
        <table aria-label={label} className="w-full border-collapse text-sm max-sm:block">
          <thead className="max-sm:sr-only">
            <tr className="border-b border-line">
              <th scope="col" className={th}>
                Tugas
              </th>
              <th scope="col" className={th}>
                Peserta
              </th>
              <th scope="col" className={th}>
                Status
              </th>
              <th scope="col" className={th}>
                Menunggu sejak
              </th>
              <th scope="col" className={th}>
                Versi
              </th>
            </tr>
          </thead>
          <tbody className="max-sm:block">
            {shown.map((row) => (
              <tr
                key={row.id}
                className="min-h-11 border-b border-line max-sm:grid max-sm:gap-0.5 max-sm:py-3"
              >
                <td className={`${td} min-w-0 sm:max-w-72`}>
                  <Link
                    href={handInHref(content.slug, row.id)}
                    className="block font-medium wrap-anywhere text-ink no-underline hover:underline"
                  >
                    {row.title}
                  </Link>
                </td>
                <td className={`${td} wrap-anywhere`}>{DUMMY_USER.name}</td>
                <td className={td}>
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <StatusTugas state={row.status} />
                    {row.late && <span className="text-xs text-ink-muted">Terlambat</span>}
                  </span>
                </td>
                <td className={`${td} text-ink-muted`}>
                  <span className="sm:hidden">Menunggu sejak </span>
                  {sentAtText(row.since)}
                </td>
                <td className={`${td} text-ink-muted tabular-nums`}>
                  <span className="sm:hidden">Versi </span>
                  {row.versions}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
