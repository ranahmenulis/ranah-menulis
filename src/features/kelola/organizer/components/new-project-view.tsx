"use client";

import { useT } from "@/lib/i18n/provider";
import { BackShell } from "../../components/back-shell";
import { ORGANIZER_HREF } from "../area-hrefs";
import { ProjectForm } from "./project-form";

/** A new project always starts as a draft, so nothing is shown to anyone until it is published. */
export function NewProjectView() {
  const t = useT().kelolaOrganizer;
  return (
    <BackShell back={{ href: ORGANIZER_HREF, label: t.back }}>
      <header className="grid gap-1">
        <h1 className="heading-lg">{t.newProject.title}</h1>
        <p className="text-sm text-ink-muted">{t.newProject.description}</p>
      </header>
      <ProjectForm registrants={0} />
    </BackShell>
  );
}
