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
  const rows = rosterRows(content, submissions, registration, now);
  const taken = project.quota?.taken;
  return (
    <div className="grid gap-4">
      {rows.length === 0 ? (
        <p className="text-sm text-ink-muted">Belum ada peserta terdaftar di perangkat ini.</p>
      ) : (
        <div className="overflow-x-auto">
          <table aria-label="Peserta" className="w-full min-w-136 border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className={th}>
                  Peserta
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Selesai
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Perlu perbaikan
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Menunggu dinilai
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Lewat tenggat
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Belum
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} className="min-h-11 border-b border-line">
                  <td className={`${td} font-medium wrap-anywhere`}>{row.name}</td>
                  <td className={`${td} text-right`}>
                    {row.selesai} dari {row.total}
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
        Hanya peserta yang mendaftar di perangkat ini yang terlihat
        {taken !== undefined ? `; proyek mencatat ${taken} peserta` : ""}. Syarat kelulusan belum
        ditetapkan, jadi belum ada keputusan lulus.
      </Notice>
    </div>
  );
}
