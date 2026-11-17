"use client";

import { BackShell } from "../../components/back-shell";
import { ORGANIZER_HREF } from "../area-hrefs";
import { ProjectForm } from "./project-form";

/** A new project always starts as a draft, so nothing is shown to anyone until it is published. */
export function NewProjectView() {
  return (
    <BackShell back={{ href: ORGANIZER_HREF, label: "Proyek" }}>
      <header className="grid gap-1">
        <h1 className="heading-lg">Proyek baru</h1>
        <p className="text-sm text-ink-muted">Disimpan sebagai draf. Terbitkan setelah siap.</p>
      </header>
      <ProjectForm registrants={0} />
    </BackShell>
  );
}
