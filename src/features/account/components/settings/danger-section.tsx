"use client";

import { Warning } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { SettingRow, SettingRows } from "./setting-row";
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
    <SettingsSection id="danger" title={settings.danger.title} icon={Warning} danger>
      <SettingRows>
        <SettingRow label={settings.danger.heading} hint={settings.danger.body}>
          <Button variant="danger-text" onClick={() => setOpen(true)}>
            {settings.danger.action}
          </Button>
        </SettingRow>
      </SettingRows>
      {open && <DeleteAccountDialog onClose={() => setOpen(false)} />}
    </SettingsSection>
  );
}
