/*
 * Card looks after the client's Streak reference (DESIGN.md 4.5, 7.10). `cardClass` is the plain
 * card; `heroCardClass` is the anchor card at the top of a screen, with a soft accent gradient,
 * meant to hold one illustration from src/components/illustrations at its right.
 */
export const cardClass = "rounded-2xl border border-line bg-surface p-5 shadow-card md:p-6";

export const heroCardClass =
  "relative isolate overflow-hidden rounded-2xl border border-line bg-surface bg-linear-to-br from-surface from-40% to-accent-subtle p-5 text-ink shadow-card md:p-8";

/** Where the hero illustration sits: bottom right, behind the text. */
export const heroArtClass = "absolute right-0 bottom-0 -z-10 h-[78%] w-auto max-w-[62%]";
