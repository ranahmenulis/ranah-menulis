import { format, useT } from "@/lib/i18n/provider";
import { Notice } from "@/components/ui/states";
import type { AssignmentSubmission, ClassContent } from "@/features/projects/kelas/types";
import type { Project, Registration } from "@/features/projects/types";
import { rosterRows } from "../mentor-queue";

const th = "h-11 px-3 text-left text-xs font-medium text-ink-muted first:pl-0";
const td = "px-3 py-2 align-middle first:pl-0 tabular-nums";

/** Participants and how far each one is. Counts only: the passing rule is not decided (Q-27). */
export function RosterTab({
  project,
  content,
  submissions,
  registration,
  now,
}: {
  project: Project;
  content: ClassContent;
  submissions: AssignmentSubmission[];
  registration: Registration | undefined;
  now: number;
}) {
  const t = useT().kelolaMentor.roster;
  const rows = rosterRows(content, submissions, registration, now);
  const taken = project.quota?.taken;
  return (
    <div className="grid gap-4">
      {rows.length === 0 ? (
        <p className="text-sm text-ink-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table aria-label={t.tableLabel} className="w-full min-w-136 border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className={th}>
                  {t.participant}
                </th>
                <th scope="col" className={`${th} text-right`}>
                  {t.done}
                </th>
                <th scope="col" className={`${th} text-right`}>
                  {t.repair}
                </th>
                <th scope="col" className={`${th} text-right`}>
                  {t.waiting}
                </th>
                <th scope="col" className={`${th} text-right`}>
                  {t.overdue}
                </th>
                <th scope="col" className={`${th} text-right`}>
                  {t.notYet}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} className="min-h-11 border-b border-line">
                  <td className={`${td} font-medium wrap-anywhere`}>{row.name}</td>
                  <td className={`${td} text-right`}>
                    {format(t.doneOf, { done: String(row.selesai), total: String(row.total) })}
                  </td>
                  <td className={`${td} text-right`}>{row.perbaikan}</td>
                  <td className={`${td} text-right`}>{row.menunggu}</td>
                  <td className={`${td} text-right`}>{row.terlambat}</td>
                  <td className={`${td} text-right`}>{row.belum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Notice>
        {format(t.notice, {
          taken: taken !== undefined ? format(t.taken, { n: String(taken) }) : "",
        })}
      </Notice>
    </div>
  );
}
