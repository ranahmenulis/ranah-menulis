/**
 * Which preview loop may play on its own: below the hero, two loops never run on one screen
 * (design-taste-frontend, motion.md). Each preview reports how much of it is visible; the one
 * most in view (at least MIN_RATIO) is active. The others hold their final picture and play only
 * while the pointer rests on them.
 */

const MIN_RATIO = 0.6;

const ratios = new Map<string, number>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function reportRatio(id: string, ratio: number): void {
  ratios.set(id, ratio);
  notify();
}

export function forgetLoop(id: string): void {
  ratios.delete(id);
  notify();
}

export function activeLoop(): string | null {
  let best: string | null = null;
  let max = MIN_RATIO;
  for (const [id, ratio] of ratios) {
    if (ratio >= max) {
      max = ratio;
      best = id;
    }
  }
  return best;
}

export function subscribeLoops(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Test helper: empties the registry between tests. */
export function resetLoops(): void {
  ratios.clear();
  notify();
}
