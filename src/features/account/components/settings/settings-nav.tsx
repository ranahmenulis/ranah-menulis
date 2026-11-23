"use client";

import {
  Bell,
  Eye,
  LockKey,
  PenNib,
  Translate,
  User,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";

type Item = { id: string; icon: Icon; label: string; danger?: boolean };

/**
 * The section menu beside the Settings cards from lg (sticky). Each entry jumps to its card; the
 * card in view is marked with `aria-current`. `footer` holds Keluar.
 */
export function SettingsNav({ footer }: { footer?: ReactNode }) {
  const { settings } = useT().account;
  const items: Item[] = [
    { id: "personal", icon: User, label: settings.personal.title },
    { id: "language", icon: Translate, label: settings.language.title },
    { id: "writing", icon: PenNib, label: settings.writing.title },
    { id: "privacy", icon: Eye, label: settings.privacy.title },
    { id: "notifications", icon: Bell, label: settings.notifications.title },
    { id: "security", icon: LockKey, label: settings.security.title },
    { id: "danger", icon: Warning, label: settings.danger.title, danger: true },
  ];
  const [active, choose] = useActiveSection(items.map((item) => item.id));

  return (
    <nav
      aria-label={settings.nav}
      className="sticky top-[calc(5rem+var(--safe-top))] hidden content-start gap-1 self-start lg:grid"
    >
      <ul className="grid gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={() => choose(item.id)}
              aria-current={active === item.id ? "true" : undefined}
              className={cn(
                "flex min-h-10 items-center gap-2.5 rounded-full px-3 text-sm no-underline transition-colors",
                "text-ink-soft hover:bg-subtle hover:text-ink",
                "aria-[current]:bg-accent-subtle aria-[current]:font-medium aria-[current]:text-accent-ink",
                item.danger && "text-danger hover:text-danger",
              )}
            >
              <item.icon size={18} aria-hidden />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      {footer && <div className="mt-3 border-t border-line pt-3">{footer}</div>}
    </nav>
  );
}

/** The id of the section nearest the top of the screen, read while scrolling, and its setter. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const lockedUntil = useRef(0);
  const key = ids.join(",");
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const sections = key
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        if (Date.now() < lockedUntil.current) return;
        const first = sections.find((section) => visible.get(section.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-80px 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [key]);
  // A clicked entry is marked at once and the observer waits while the page scrolls there: the
  // last cards cannot reach the observed band, and the scroll passes the cards in between.
  const choose = (id: string) => {
    lockedUntil.current = Date.now() + 1200;
    setActive(id);
  };
  return [active, choose] as const;
}
