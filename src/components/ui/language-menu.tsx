"use client";

import { Translate } from "@phosphor-icons/react/dist/ssr";
import { LOCALES } from "@/lib/i18n/config";
import { useChangeLocale, useLocale, useT } from "@/lib/i18n/provider";
import { Menu, type MenuEntry } from "./menu";

/** Language button: a menu with every supported language, the current one marked. */
export function LanguageMenu({ className }: { className?: string }) {
  const { language } = useT().common;
  const locale = useLocale();
  const { change } = useChangeLocale();
  const items: MenuEntry[] = LOCALES.map((code) => ({
    id: `lang-${code}`,
    label: language.names[code],
    hint: code === locale ? language.active : undefined,
    onSelect: () => change(code),
  }));
  return (
    <Menu
      label={language.label}
      icon={<Translate size={22} aria-hidden />}
      items={items}
      className={className}
    />
  );
}
