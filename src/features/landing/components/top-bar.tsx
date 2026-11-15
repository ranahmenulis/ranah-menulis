"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/logo";
import { DisplayControls } from "@/components/ui/display-controls";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { Wrap } from "./layout";

type Mode = "top" | "scrolled-hero" | "scrolled" | "wait";

/**
 * Bilah atas landing. Menjaga tepat satu isian tinta per layar [usulan]:
 *  - tombol hero terlihat: tombol bilah sekunder, tanpa garis bawah
 *  - tombol hero sudah lewat: tombol bilah primer, garis rambut muncul
 *  - bagian daftar tunggu terlihat: tombolnya sendiri terisi, tombol bilah kembali sekunder
 * Berganti kelas seketika, tanpa gerak.
 */
export function TopBar() {
  const [mode, setMode] = useState<Mode>("top");
  const copy = useT().landing.topBar;

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
        "sticky top-0 z-10 border-b bg-canvas",
        mode === "top" ? "border-transparent" : "border-line",
      )}
    >
      <Wrap className="flex h-[52px] items-center gap-8 md:h-16">
        <Wordmark
          href="#"
          label={copy.logoLabel}
          height={32}
          className="[--logo-h:28px] md:[--logo-h:32px]"
        />
        <nav aria-label={copy.navLabel} className="ml-auto flex items-center gap-3 md:gap-7">
          <a
            href="#cara-kerja"
            className="lp-link hidden text-sm text-ink-muted hover:text-ink md:inline"
          >
            {copy.how}
          </a>
          <a
            href="#projects"
            className="lp-link hidden text-sm text-ink-muted hover:text-ink md:inline"
          >
            {copy.projects}
          </a>
          <a
            href="#tanya-jawab"
            className="lp-link hidden text-sm text-ink-muted hover:text-ink md:inline"
          >
            {copy.faq}
          </a>
          <ButtonLink
            href="#daftar"
            size="sm"
            className="lp-btn"
            variant={mode === "scrolled" ? "primary" : "secondary"}
          >
            <span className="sm:hidden">{copy.ctaShort}</span>
            <span className="max-sm:hidden">{copy.cta}</span>
          </ButtonLink>
          <DisplayControls />
        </nav>
      </Wrap>
    </header>
  );
}
