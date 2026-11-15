"use client";

import { Desktop, Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { format, useT } from "@/lib/i18n/provider";
import { nextTheme, type Theme } from "@/lib/theme/theme";
import { useTheme } from "@/lib/theme/use-theme";
import { IconButton } from "./icon-button";

const icons = { system: Desktop, light: Sun, dark: Moon } satisfies Record<Theme, unknown>;

/** Cycles Ikuti sistem → Terang → Gelap. The icon shows the current mode. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme: labels } = useT().common;
  const [theme, setTheme] = useTheme();
  const next = nextTheme(theme);
  const Icon = icons[theme];
  return (
    <IconButton
      label={format(labels.cycle, { current: labels[theme], next: labels[next] })}
      onClick={() => setTheme(next)}
      className={className}
    >
      <Icon size={22} aria-hidden />
    </IconButton>
  );
}
