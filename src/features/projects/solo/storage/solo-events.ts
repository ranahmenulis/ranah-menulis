const listeners = new Set<() => void>();

/** Runs `listener` whenever Solo progress changed on this device. Returns the way to stop. */
export function onSoloChanged(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Tells every screen that reads Solo progress to read it again (Next keeps earlier pages alive). */
export function notifySoloChanged() {
  listeners.forEach((listener) => listener());
}
