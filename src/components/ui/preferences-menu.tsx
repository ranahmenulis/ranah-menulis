"use client";

import { SlidersHorizontal } from "@phosphor-icons/react/dist/ssr";
import { LOCALES } from "@/lib/i18n/config";
import { useChangeLocale, useLocale, useT } from "@/lib/i18n/provider";
import { useRef } from "react";
import { originOf, THEMES } from "@/lib/theme/theme";
import { useTheme } from "@/lib/theme/use-theme";
import { Menu, type MenuEntry } from "./menu";

/** One button for narrow bars: appearance and language together in a single menu. */
export function PreferencesMenu({ className }: { className?: string }) {
  const { common } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const { change } = useChangeLocale();
  const [theme, setTheme] = useTheme();
  const items: MenuEntry[] = [
    ...THEMES.map((code) => ({
      id: `theme-${code}`,
      label: common.theme[code],
      hint: code === theme ? common.language.active : undefined,
      onSelect: () => {
        const trigger = ref.current?.querySelector("button");
        setTheme(code, trigger ? originOf(trigger) : undefined);
      },
    })),
    { type: "separator", id: "sep" },
    ...LOCALES.map((code) => ({
      id: `lang-${code}`,
      label: common.language.names[code],
      hint: code === locale ? common.language.active : undefined,
      onSelect: () => change(code),
    })),
  ];
  return (
    <div ref={ref} className={className}>
      <Menu
        label={common.preferences.label}
        icon={<SlidersHorizontal size={22} aria-hidden />}
        items={items}
      />
    </div>
  );
}
