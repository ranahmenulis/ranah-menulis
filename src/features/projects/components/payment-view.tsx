"use client";

import { useViewer } from "@/lib/viewer";
import { isFreeMoney, projectState } from "../project-model";
import { payableIdr, paymentState } from "../payment-model";
import { registrationFee } from "../registration-model";
import { useRegistrations } from "../registration-store";
import { useProjects } from "../use-projects";
import type { ProjectFixture } from "../types";
import { PayDone, PayExpired, PayWaiting } from "./payment-states";
import { ProjectGone } from "./projects-states";
import { RegisterBlocked, RegisterSkeleton } from "./register-states";

/**
 * Pembayaran QRIS (PLT-07, PRD 17.5 "Pendaftaran"). Needs your own registration of a paid
 * project: without one, a free project, or a price only in ringgit (MYR comes in Fase 2) it says so
 * and leaves a way back. The status of the registration decides the rest: waiting, paid, expired.
 */
export function PaymentView({ slug, source }: { slug: string; source?: ProjectFixture[] }) {
  const data = useProjects(source);
  const guest = useViewer() === "tamu";
  const registrations = useRegistrations();

  if (data.status === "loading") return <RegisterSkeleton />;
  const project = data.projects.find((p) => p.slug === slug && p.publication === "terbit");
  if (!project) return <ProjectGone />;

  const registration = guest ? undefined : registrations[slug];
  if (guest) {
    return (
      <RegisterBlocked project={project} signIn>
        Masuk untuk membayar pendaftaranmu.
      </RegisterBlocked>
    );
  }
  if (!registration) {
    return (
      <RegisterBlocked project={project}>
        Kamu belum mendaftar ke proyek ini, jadi belum ada yang perlu dibayar.
      </RegisterBlocked>
    );
  }

  const fee = registrationFee(project, registration.packageName);
  if (isFreeMoney(fee)) {
    return (
      <RegisterBlocked project={project}>Proyek ini gratis; tidak ada pembayaran.</RegisterBlocked>
    );
  }
  const state = paymentState(registration, data.now);
  if (state === "lunas") return <PayDone project={project} registration={registration} />;
  if (state === "kedaluwarsa") {
    const open = projectState(project, data.now);
    return <PayExpired project={project} canRetry={open !== "ditutup" && open !== "kuota-penuh"} />;
  }
  const amount = payableIdr(fee);
  if (amount === null) {
    return (
      <RegisterBlocked project={project}>
        Pembayaran dalam ringgit (MYR) menyusul; saat ini QRIS hanya untuk rupiah. Pendaftaranmu
        tercatat.
      </RegisterBlocked>
    );
  }
  return (
    <PayWaiting project={project} registration={registration} amount={amount} now={data.now} />
  );
}
