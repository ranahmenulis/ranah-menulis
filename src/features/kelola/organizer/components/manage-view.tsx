"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { BackShell } from "../../components/back-shell";
import { MANAGE_TABS, ORGANIZER_HREF, manageHref, parseManageTab } from "../area-hrefs";
import { allowedActions, statusLabel } from "../project-status";
import { useOrganizerProject } from "../use-organizer-data";
import { takesPayment } from "../payment-rows";
import { ParticipantsTab, WorksTab } from "./people-tabs";
import { PaymentsTab } from "./payments-tab";
import { ProjectForm } from "./project-form";
import { StaffTab } from "./staff-tab";
import { StatusActions } from "./status-actions";

const BACK = { href: ORGANIZER_HREF, label: "Proyek" };

/** One project for its Organizer: the project itself, who is assigned, who joined, what was sent. */
export function ManageView({ slug, store }: { slug: string; store?: SubmissionStore }) {
  const data = useOrganizerProject(slug, { store });
  const router = useRouter();
  const tab = parseManageTab(useSearchParams()?.get("tab"));

  if (data.status === "error") {
    return (
      <BackShell back={BACK}>
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>
          Proyek belum bisa dibuka karena data di perangkat ini tidak terbaca.
        </ErrorBanner>
      </BackShell>
    );
  }
  if (data.status === "loading") {
    return (
      <div role="status" aria-label="Memuat proyek" className="mx-auto grid max-w-170 gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }
  if (data.status === "gone" || data.status === "blocked") {
    return (
      <BackShell back={BACK}>
        <h1 className="heading-lg">
          {data.status === "gone" ? "Proyek ini tidak ditemukan." : "Proyek ini bukan milikmu."}
        </h1>
        <Notice>
          {data.status === "gone"
            ? "Alamatnya mungkin salah, atau draf ini sudah dihapus."
            : "Organizer hanya mengelola proyeknya sendiri."}
        </Notice>
        <ButtonLink href={ORGANIZER_HREF} variant="secondary" className="justify-self-start">
          Kembali ke daftar proyek
        </ButtonLink>
      </BackShell>
    );
  }

  const { row, works, registration, rawRegistration, fixture, now } = data;
  const { project } = row;
  return (
    <BackShell back={BACK}>
      <header className="grid gap-1">
        <h1 className="heading-lg wrap-anywhere">{project.title}</h1>
        <p className="text-sm text-ink-muted">{statusLabel[row.status]}</p>
      </header>
      <Tabs
        label="Bagian proyek"
        value={tab}
        items={MANAGE_TABS.filter((t) => t.id !== "pembayaran" || takesPayment(project)).map(
          (t) => ({ ...t, href: manageHref(slug, t.id) }),
        )}
      />
      {tab === "proyek" &&
        (fixture ? (
          <div className="grid gap-6">
            <StatusActions
              slug={slug}
              actions={allowedActions(row.status, row.registrants)}
              onDeleted={() => router.push(ORGANIZER_HREF)}
            />
            {row.status === "arsip" ? (
              <Notice>Proyek ini diarsipkan dan tidak bisa diubah lagi.</Notice>
            ) : (
              <ProjectForm fixture={fixture} registrants={row.registrants} />
            )}
          </div>
        ) : (
          <Notice>
            Ini proyek contoh dan tidak bisa diubah. Penugasan, peserta, dan kiriman tetap bisa
            dibuka.
          </Notice>
        ))}
      {tab === "penugasan" && (
        <StaffTab slug={slug} category={project.category} archived={row.status === "arsip"} />
      )}
      {tab === "peserta" && (
        <ParticipantsTab project={project} registration={registration} now={now} />
      )}
      {tab === "pembayaran" && (
        <PaymentsTab project={project} registration={rawRegistration} now={now} />
      )}
      {tab === "kiriman" && <WorksTab project={project} works={works} />}
    </BackShell>
  );
}
