"use client";

import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { DisplayControls } from "@/components/ui/display-controls";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { useHydrated } from "../hooks/use-hydrated";
import { AUTH_SCENES, CORNER_ENGRAVING, type AuthArtName } from "../auth-art";

const step = (i: number) => ({ "--i": i }) as CSSProperties;
const mask = (src: string): CSSProperties => ({
  maskImage: `url(${src})`,
  WebkitMaskImage: `url(${src})`,
});

/**
 * An engraving cut out of its paper, kept as it is (dark ink on light paper) on both themes: only
 * the paper outside its silhouette is transparent (user, tahap J).
 */
export function Engraving({
  art,
  className,
  style,
}: {
  art: AuthArtName;
  className?: string;
  style?: CSSProperties;
}) {
  const { cutout } = AUTH_SCENES[art];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a fixed local plate, no optimiser needed
    <img
      src={cutout.src}
      width={cutout.width}
      height={cutout.height}
      alt=""
      aria-hidden
      data-auth-cutout
      className={cn("pointer-events-none block h-auto drop-shadow-md", className)}
      style={style}
    />
  );
}

/** The faint mangrove in the bottom corner of the form half, from lg. */
export function CornerEngraving() {
  return (
    <span
      aria-hidden
      className="rm-auth-mask pointer-events-none absolute bottom-8 left-6 hidden w-[clamp(5.5rem,8vw,7rem)] bg-ink opacity-30 lg:block"
      style={{
        aspectRatio: `${CORNER_ENGRAVING.width} / ${CORNER_ENGRAVING.height}`,
        ...mask(CORNER_ENGRAVING.ink),
      }}
    />
  );
}

function Painting({ art, className }: { art: AuthArtName; className?: string }) {
  const { painting } = AUTH_SCENES[art];
  return (
    <div className={cn("overflow-hidden bg-subtle", className)}>
      {/* Decorative: the form says what the screen is for. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed local plate, no optimiser needed */}
      <img
        src={painting.src}
        width={painting.width}
        height={painting.height}
        alt=""
        fetchPriority="high"
        className="rm-auth-paint size-full object-cover"
        style={{ objectPosition: painting.focus }}
      />
    </div>
  );
}

type AsideSlot = HTMLElement | null;
const AsideContext = createContext<AsideSlot>(null);

/**
 * A screen's own card over the painting (sign in: a sample of Studio; sign up: what the account
 * opens; onboarding: the profile as it is typed). Rendered into the frame's slot; screens that give
 * none get the frame's serif line. Only from lg, and decorative.
 */
export function AuthAside({ children }: { children: ReactNode }) {
  const slot = useContext(AsideContext);
  // Only after hydration: the slot already holds the server's default line, so a portal rendered
  // while hydrating would not match the HTML.
  const hydrated = useHydrated();
  return slot && hydrated ? createPortal(<div data-aside>{children}</div>, slot) : null;
}

/**
 * From lg: the right half, fixed while the form scrolls. Painting, the display controls in a pill
 * at the top, the cut-out crossing the seam, and the screen's card at the bottom.
 */
export function AuthScenePanel({
  art,
  onSlot,
}: {
  art: AuthArtName;
  onSlot: (slot: AsideSlot) => void;
}) {
  const { plate, brand } = useT().account;
  return (
    <div className="sticky top-0 hidden h-dvh lg:block" data-auth-art={art}>
      <Painting art={art} className="absolute inset-0" />
      <div className="absolute top-[calc(1.25rem+var(--safe-top))] right-5 z-10 flex rounded-full border border-line bg-surface/90 px-1 shadow-card backdrop-blur">
        <DisplayControls />
      </div>
      <Engraving
        art={art}
        className="rm-rise-in absolute top-[7%] left-0 z-10 w-[clamp(7.5rem,11vw,11rem)] -translate-x-1/2"
        style={step(0)}
      />
      <div
        ref={onSlot}
        aria-hidden
        className="absolute right-8 bottom-8 left-8 z-10 grid justify-items-start [&:has([data-aside])_[data-aside-default]]:hidden"
      >
        <p
          data-aside-default
          className="rm-rise-in max-w-[26rem] rounded-2xl border border-line bg-surface/90 px-6 py-5 font-serif text-[22px] leading-8 text-balance text-ink italic shadow-card backdrop-blur"
          style={step(2)}
        >
          {plate[art].line}
          <span className="mt-2 block font-sans text-xs text-ink-muted not-italic">{brand}</span>
        </p>
      </div>
    </div>
  );
}

/** Below lg: a band of the painting under the bar; the form sheet overlaps its lower edge. */
export function AuthSceneBand({ art }: { art: AuthArtName }) {
  return (
    <div aria-hidden data-auth-art={art} className="lg:hidden">
      <Painting art={art} className="h-[32dvh] min-h-44" />
    </div>
  );
}

/** Gives the screens the slot their card is rendered into (set by `AuthScenePanel`). */
export function AuthAsideSlot({
  children,
}: {
  children: (onSlot: (slot: AsideSlot) => void) => ReactNode;
}) {
  const [slot, setSlot] = useState<AsideSlot>(null);
  return <AsideContext.Provider value={slot}>{children(setSlot)}</AsideContext.Provider>;
}
