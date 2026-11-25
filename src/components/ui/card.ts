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

/**
 * Where a hero landscape sits (sky illustrations, like the Streak hero): the full right side,
 * fading out toward the text on the left.
 */
export const heroSceneClass =
  "absolute inset-y-0 right-0 -z-10 h-full w-[72%] [mask-image:linear-gradient(to_right,transparent,#000_45%)] md:w-[58%]";

/**
 * A list-screen hero scene (PageHero), placed like the Streak scene: behind the text at the right.
 * Its box has exactly the drawing's 400:220 frame, so nothing is cropped (a sliced landscape cut
 * off the moon and the doorsteps), and it fades out toward the text. On tablets it shrinks a
 * little; on phones it sits small at the bottom right, behind the text.
 */
export const heroStripClass =
  "absolute right-0 -z-10 aspect-[400/220] [mask-image:linear-gradient(to_right,transparent,#000_40%)] bottom-0 h-[42%] md:h-[85%] lg:h-full";
