/**
 * Where each feature of the legend shows in the Studio mockup, by its 1-based place in
 * `studio.features` (Text Formatter, Statistik, Target, Template, Counter, Reading Time).
 * Statistics and templates are not on this screen, so they have no marker.
 *
 * Kept out of the client `studio-mockup.tsx`: the server `writing-experience.tsx` reads it, and a
 * value imported from a "use client" module is only a client reference on the server.
 * globals.css ("Studio legend") names these numbers by hand; a test keeps them in step.
 */
export const MARKERS = { format: 1, target: 3, counter: 5, reading: 6 } as const;
