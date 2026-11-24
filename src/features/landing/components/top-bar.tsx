"use client";

import { List } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { LanguageMenu } from "@/components/ui/language-menu";
import { Menu } from "@/components/ui/menu";
import { Wordmark } from "@/components/ui/logo";
import { usePreferenceEntries } from "@/components/ui/preferences-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { Wrap } from "./layout";

type Mode = "top" | "scrolled-hero" | "scrolled" | "wait";

/**
 * Bilah atas landing. Menjaga tepat satu isian tinta per layar [usulan]:
 *  - tombol hero terlihat: tombol bilah sekunder, tanpa garis bawah
 *  - tombol hero sudah lewat: tombol bilah primer, garis rambut muncul
 *  - bagian daftar tunggu terlihat: tombolnya sendiri terisi, tombol bilah kembali sekunder
 * Berganti kelas seketika, tanpa gerak. Di puncak halaman bilah ini bening, jadi langit hero
 * terlihat di belakangnya.
 */
export function TopBar() {
  const [mode, setMode] = useState<Mode>("top");
  const copy = useT().landing.topBar;
  const menuRef = useRef<HTMLDivElement>(null);
  const preferences = usePreferenceEntries(menuRef);
  const sections = [
    ["ekosistem", copy.ecosystem],
    ["studio", copy.studio],
    ["penerbitan", copy.publishing],
    ["tanya-jawab", copy.faq],
  ] as const;

  useEffect(() => {
    function update() {
      const cta = document.getElementById("hero-cta");
      const wait = document.getElementById("daftar");
      const heroOut = cta ? cta.getBoundingClientRect().bottom < 64 : false;
      let waitIn = false;
      if (wait) {
        const r = wait.getBoundingClientRect();
        waitIn = r.top < window.innerHeight && r.bottom > 64;
      }
      const scrolled = window.scrollY > 8;
      setMode(
        heroOut && waitIn ? "wait" : heroOut ? "scrolled" : scrolled ? "scrolled-hero" : "top",
      );
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-10 border-b pt-(--safe-top)",
        mode === "top"
          ? "border-transparent bg-transparent"
          : "border-line bg-canvas/85 backdrop-blur-md",
      )}
    >
      <Wrap className="flex h-[52px] items-center gap-8 md:h-16">
        <Wordmark
          href="#"
          label={copy.logoLabel}
          height={32}
          className="[--logo-h:28px] md:[--logo-h:32px]"
        />
        <nav aria-label={copy.navLabel} className="ml-auto flex items-center gap-2 md:gap-7">
          {sections.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="lp-link hidden text-sm font-medium text-ink-muted hover:text-ink md:inline"
            >
              {label}
            </a>
          ))}
          {/* 44px tall on touch widths (client: comfortable touch areas). */}
          <ButtonLink
            href="#daftar"
            size="sm"
            className="lp-btn max-md:h-11"
            variant={mode === "scrolled" ? "primary" : "secondary"}
          >
            {copy.cta}
          </ButtonLink>
          <div className="flex items-center max-md:hidden">
            <LanguageMenu />
            <ThemeToggle />
          </div>
          {/* Narrow screens (client, 24 Nov 2026): the section links, theme, and language all
              live in one hamburger, so the bar holds only the logo, one button, and the menu. */}
          <div ref={menuRef} className="md:hidden">
            <Menu
              label={copy.menu}
              icon={<List size={24} aria-hidden />}
              items={[
                ...sections.map(([id, label]) => ({
                  id,
                  label,
                  onSelect: () => {
                    window.location.hash = id;
                  },
                })),
                { type: "separator" as const, id: "sections-sep" },
                ...preferences,
              ]}
            />
          </div>
        </nav>
      </Wrap>
    </header>
  );
}
