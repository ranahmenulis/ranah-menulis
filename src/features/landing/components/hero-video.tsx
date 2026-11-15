"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";
import { useLocale, useT } from "@/lib/i18n/provider";
import type { Theme } from "@/lib/theme/theme";
import { useTheme } from "@/lib/theme/use-theme";
import { useMotionAllowed } from "../motion/motion-env";

/**
 * Hero video (docs/desain/landing/Brief Video Hero.md): a muted loop rendered from the app's own
 * components in the Motion-Graphics-Code repo. Files live in public/landing/hero/<locale>/, as
 * `16x10-*` from md up and `4x5-*` below, each in light and dark, with a WebP poster.
 *
 * The posters are the server HTML and the whole picture without script or under reduced motion.
 * The video mounts only with landing motion on, plays while the hero is in view, and fades in over
 * the poster once it actually plays. A pause control is required: it runs longer than 5 s.
 */

const BASE = "/landing/hero";
const WIDE_QUERY = "(min-width: 48rem)";

/** Only the English cut is rendered so far; Indonesian visitors see it too until `id` exists. */
const VIDEO_LOCALE: Record<Locale, string> = { id: "en", en: "en" };

export function heroVideoPaths(locale: Locale, theme: Theme, wide: boolean) {
  const base = `${BASE}/${VIDEO_LOCALE[locale]}/${wide ? "16x10" : "4x5"}-${theme}`;
  return { video: `${base}.mp4`, poster: `${base}.webp` };
}

function subscribeWide(callback: () => void) {
  const media = window.matchMedia?.(WIDE_QUERY);
  media?.addEventListener("change", callback);
  return () => media?.removeEventListener("change", callback);
}

/** Whether the md layout applies; `null` on the server and during hydration. */
function useWide(): boolean | null {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia?.(WIDE_QUERY).matches ?? false,
    () => null,
  );
}

function Poster({ locale, theme }: { locale: Locale; theme: Theme }) {
  const wide = heroVideoPaths(locale, theme, true).poster;
  const narrow = heroVideoPaths(locale, theme, false).poster;
  return (
    <picture className={theme === "light" ? "logo-on-light" : "logo-on-dark"}>
      <source media={WIDE_QUERY} srcSet={wide} width={1600} height={1000} />
      <img
        src={narrow}
        alt=""
        width={1080}
        height={1350}
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover"
      />
    </picture>
  );
}

export function HeroVideo({ label }: { label: string }) {
  const { previews } = useT().landing;
  const locale = useLocale();
  const [theme] = useTheme();
  const wide = useWide();
  const motion = useMotionAllowed();

  const frame = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [readySrc, setReadySrc] = useState<string | null>(null);

  const src = wide === null ? null : heroVideoPaths(locale, theme, wide).video;
  const show = motion && src !== null;

  useEffect(() => {
    const node = frame.current;
    if (!show || !node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, [show]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (inView && !paused) {
      // Autoplay can still be refused (data saver, browser policy): the poster then stays.
      element.play()?.catch(() => {});
    } else {
      element.pause();
    }
  }, [inView, paused, src]);

  return (
    <div className="relative mt-14 md:col-span-12 md:mt-24">
      <figure
        ref={frame}
        role="img"
        aria-label={label}
        className="relative m-0 aspect-[4/5] overflow-hidden border border-line bg-subtle md:aspect-[16/10]"
      >
        <Poster locale={locale} theme="light" />
        <Poster locale={locale} theme="dark" />
        {show && (
          <video
            key={src}
            ref={video}
            src={src}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            onPlaying={() => setReadySrc(src)}
            data-ready={readySrc === src || undefined}
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 ease-out data-ready:opacity-100"
          />
        )}
      </figure>
      {show && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? previews.play : previews.pause}
          className={cn(
            "absolute top-full right-0 mt-1 grid size-11 cursor-pointer place-items-center text-ink-muted",
            "transition-colors duration-120 hover:text-ink",
          )}
        >
          <span className="grid size-8 place-items-center rounded-full border border-line bg-canvas">
            {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
          </span>
        </button>
      )}
    </div>
  );
}
