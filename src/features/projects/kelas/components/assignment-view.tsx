"use client";

import { Notice } from "@/components/ui/states";
import { useDocumentList } from "@/features/studio/hooks/use-document-list";
import { isActiveDocument } from "@/features/studio/document-archive";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { studioStore } from "@/features/studio/storage/store";
import { MyError, MyShell, MySkeleton } from "../../components/my-states";
import { ProjectGone } from "../../components/projects-states";
import type { ProjectFixture } from "../../types";
import { dashboardHref } from "../class-model";
import { useClass } from "../hooks/use-class";
import type { AssignmentStore } from "../storage/assignment-store";
import { assignmentStore } from "../storage/store";
import type { ClassFixture } from "../types";
import { AssignmentPage } from "./assignment-page";
import { backToProject, ClassBlocked } from "./class-states";

type Props = {
  slug: string;
  /** The assignment's id within the class (`tugas-1`). */
  id: string;
  /** Replace the dummy catalog, the class content and the device stores in tests. */
  source?: ProjectFixture[];
  classes?: ClassFixture[];
  store?: AssignmentStore;
  documents?: DocumentStore;
};

/**
 * Halaman tugas (KLS-03). Which screen you get depends on who you are, like the dashboard: the same
 * reasons it cannot open, then the assignment, or "not found" for an id the class does not have.
 */
export function AssignmentView({
  slug,
  id,
  source,
  classes,
  store = assignmentStore,
  documents = studioStore,
}: Props) {
  const data = useClass(slug, { source, classes, store });
  const list = useDocumentList(documents);

  if (data.status === "loading") return <MySkeleton label="Memuat tugas" />;
  if (data.status === "gone") return <ProjectGone />;
  // Why it cannot open comes first: a failed read of the Studio documents says nothing about that.
  if (data.status === "blocked") return <ClassBlocked project={data.project} block={data.block} />;
  if (list.status === "loading") return <MySkeleton label="Memuat tugas" />;
  if (data.status === "error" || list.status === "error") {
    return (
      <MyError
        back={backToProject(slug)}
        onRetry={() => {
          if (data.status === "error") data.reload();
          list.reload();
        }}
      >
        Tugas belum bisa dibuka. Data di perangkat ini tidak terbaca.
      </MyError>
    );
  }

  const row = data.rows.find((r) => r.assignment.id === id);
  if (!row) {
    return (
      <MyShell back={{ href: dashboardHref(slug), label: "Dasbor kelas" }}>
        <Notice>Tugas ini tidak ditemukan di kelas ini.</Notice>
      </MyShell>
    );
  }
  const docs = list.status === "ready" ? list.docs : [];
  return (
    <AssignmentPage
      data={data}
      row={row}
      docs={docs.filter(isActiveDocument).sort((a, b) => b.updatedAt - a.updatedAt)}
      store={store}
      documents={documents}
    />
  );
}
