"use client";

import { useState, type ComponentProps } from "react";
import { useViewer } from "@/lib/viewer";
import { projectState } from "../project-model";
import { isExpired } from "../payment-model";
import { newRegistration } from "../registration-model";
import { saveRegistration, useRegistrations } from "../registration-store";
import { useProjects } from "../use-projects";
import type { ProjectFixture } from "../types";
import { CancelledNotice } from "./cancel-registration";
import { RegisterForm } from "./register-form";
import {
  RegisterBlocked,
  RegisterShell,
  RegisterSkeleton,
  RegisterStatus,
} from "./register-states";
import { ProjectGone } from "./projects-states";

type Props = {
  slug: string;
  /** Replaces the dummy catalog in tests. */
  source?: ProjectFixture[];
  /** Replace the device's stores in tests. */
  stores?: ComponentProps<typeof RegisterStatus>["stores"];
};

/**
 * Pendaftaran (PRJ-02, PRD 17.5). Which screen you get depends on who you are and on the project:
 * your own registration first, then why you cannot register (guest, full, closed), else the form.
 * A draft or unknown address is "not found" like on the detail page.
 */
export function RegisterView({ slug, source, stores }: Props) {
  const data = useProjects(source);
  const guest = useViewer() === "tamu";
  const registrations = useRegistrations();
  const [justNow, setJustNow] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  // Set when the project turned out to be closed or full at the moment of submitting.
  const [late, setLate] = useState<"kuota-penuh" | "ditutup" | null>(null);

  if (data.status === "loading") return <RegisterSkeleton />;

  const project = data.projects.find((p) => p.slug === slug && p.publication === "terbit");
  if (!project) return <ProjectGone />;

  const state = late ?? projectState(project, data.now);
  // A registration whose payment hold ran out no longer counts: the form is offered again.
  const own = guest ? undefined : registrations[slug];
  const registration = own && !isExpired(own, data.now) ? own : undefined;

  if (registration) {
    return (
      <RegisterStatus
        project={project}
        registration={registration}
        justNow={justNow}
        onCancelled={() => setCancelled(true)}
        stores={stores}
      />
    );
  }
  if (guest) {
    return (
      <RegisterBlocked project={project} signIn>
        Masuk untuk mendaftar ke proyek ini.
      </RegisterBlocked>
    );
  }
  if (state === "kuota-penuh") {
    return <RegisterBlocked project={project}>Kuota proyek ini sudah penuh.</RegisterBlocked>;
  }
  if (state === "ditutup") {
    return (
      <RegisterBlocked project={project}>Pendaftaran proyek ini sudah ditutup.</RegisterBlocked>
    );
  }

  return (
    <RegisterShell project={project}>
      {cancelled && <CancelledNotice />}
      <RegisterForm
        project={project}
        state={state}
        onSubmit={(packageName) => {
          // The clock was read when the page opened; check again before saving.
          const now = Date.now();
          const current = projectState(project, now);
          if (current === "kuota-penuh" || current === "ditutup") {
            setLate(current);
            return;
          }
          saveRegistration(newRegistration(project, now, packageName));
          setCancelled(false);
          setJustNow(true);
        }}
      />
    </RegisterShell>
  );
}
