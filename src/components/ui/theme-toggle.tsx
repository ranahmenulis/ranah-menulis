"use client";

import { Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { format, useT } from "@/lib/i18n/provider";
import { nextTheme, originOf } from "@/lib/theme/theme";
import { useTheme } from "@/lib/theme/use-theme";
import { IconButton } from "./icon-button";

// Both icons sit in the same cell. The one leaving turns half a turn and shrinks away while the one
// arriving turns in from the other side, so the icon reads as one shape changing into the other.
const layer =
  "col-start-1 row-start-1 transition-[opacity,transform] duration-[700ms] ease-(--ease-out) motion-reduce:transition-none";
const hidden = "scale-0 opacity-0";

/** Flips between Terang and Gelap. The icon on screen shows the current mode and morphs on change. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme: labels } = useT().common;
  const [theme, setTheme] = useTheme();
  const next = nextTheme(theme);
  const dark = theme === "dark";
  return (
    <IconButton
      label={format(labels.cycle, { current: labels[theme], next: labels[next] })}
      onClick={(e) => setTheme(next, originOf(e.currentTarget))}
      className={className}
    >
      <span className="grid place-items-center">
        <Sun
          size={22}
          aria-hidden
          className={cn(layer, dark ? cn(hidden, "rotate-180") : "rotate-0")}
        />
        <Moon
          size={22}
          aria-hidden
          className={cn(layer, dark ? "rotate-0" : cn(hidden, "-rotate-180"))}
        />
      </span>
    </IconButton>
  );
}
