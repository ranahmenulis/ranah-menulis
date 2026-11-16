const listeners = new Set<() => void>();

/** Runs `listener` whenever assignments changed on this device. Returns the way to stop. */
export function onAssignmentsChanged(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Tells every screen that reads assignments to read them again. Next keeps earlier pages alive
 * behind the current one, so without this the dashboard would still show the old state after a
 * hand-in (same lesson as the submission store).
 */
export function notifyAssignmentsChanged() {
  listeners.forEach((listener) => listener());
}
