"use client";

import { Warning } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { SettingsSection } from "./settings-section";

/**
 * Zona bahaya (SEC-16). The only red on the page, and the red button exists only inside the
 * confirmation. What happens to published work and to books is undecided (Q-34), so the text makes
 * no promise about it.
 */
export function DangerSection() {
  const { settings } = useT().account;
  const [open, setOpen] = useState(false);
  return (
    <SettingsSection id="danger" title={settings.danger.title} danger>
      <div className="grid justify-items-start gap-3 border border-danger p-5">
        <p className="flex items-center gap-2 text-base font-semibold text-danger">
          <Warning size={20} aria-hidden />
          {settings.danger.heading}
        </p>
        <p className="text-sm text-ink-read">{settings.danger.body}</p>
        <Button variant="danger-text" onClick={() => setOpen(true)} className="-ml-1">
          {settings.danger.action}
        </Button>
      </div>
      {open && <DeleteAccountDialog onClose={() => setOpen(false)} />}
    </SettingsSection>
  );
}
