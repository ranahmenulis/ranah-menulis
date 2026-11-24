"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { STUDIO_HREF } from "@/features/app-shell/nav";
import { useT } from "@/lib/i18n/provider";
import { useDocumentSummaryList } from "../../hooks/use-document-list";
import { studioStore } from "../../storage/store";
import { buildWorks, findWork, workHref } from "../../works";
import { ListFeedback } from "../documents/list-feedback";
import type { Pending } from "../documents/pending";
import { PendingDialogs } from "../documents/pending-dialogs";
import { WorkChapters } from "./work-chapters";
import { WorkFrame, type WorkTab } from "./work-frame";
import { WorkSummary } from "./work-summary";

/**
 * One work's page. The id may be a loose document, a book, or a chapter (which lands on its
 * book). While the list loads or fails, and when nothing matches, the page says so and keeps a
 * way back to the list.
 */
export function WorkPage({ id, tab }: { id: string; tab: WorkTab }) {
  const t = useT().studioWork;
  const router = useRouter();
  const list = useDocumentSummaryList(studioStore);
  const [pending, setPending] = useState<Pending | null>(null);
  const works = useMemo(() => buildWorks(list.docs, list.folders), [list.docs, list.folders]);
  const found = list.status === "ready" ? findWork(works, id) : null;
  const redirectTo = found?.redirect ? workHref(found.work, tab) : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (list.status !== "ready" || redirectTo) {
    return (
      <main className="mx-auto max-w-260 px-4 pt-24 md:px-6">
        <ListFeedback
          status={list.status === "error" ? "error" : "loading"}
          onRetry={list.reload}
        />
      </main>
    );
  }
  if (!found) {
    return (
      <main className="mx-auto max-w-260 px-4 pt-24 md:px-6">
        <EmptyState
          action={
            <ButtonLink href={STUDIO_HREF} variant="secondary">
              {t.toList}
            </ButtonLink>
          }
        >
          <span role="status">
            {t.missing} {t.missingNote}
          </span>
        </EmptyState>
      </main>
    );
  }
  const { work } = found;
  return (
    <WorkFrame work={work} tab={tab}>
      {tab === "ringkasan" ? (
        <WorkSummary work={work} list={list} onPending={setPending} />
      ) : (
        <WorkChapters work={work} list={list} />
      )}
      <PendingDialogs pending={pending} list={list} onClose={() => setPending(null)} />
    </WorkFrame>
  );
}
