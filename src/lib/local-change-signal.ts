/** Invalidate IndexedDB readers in this tab and other tabs without storing the signal. */
export function createLocalChangeSignal(name: string) {
  const listeners = new Set<() => void>();
  let channel: BroadcastChannel | undefined;
  const announce = () => listeners.forEach((listener) => listener());

  function connect() {
    if (
      !channel &&
      typeof window !== "undefined" &&
      typeof window.BroadcastChannel === "function"
    ) {
      channel = new window.BroadcastChannel(name);
      channel.addEventListener("message", announce);
    }
    return channel;
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      connect();
      return () => {
        listeners.delete(listener);
      };
    },
    notify() {
      announce();
      connect()?.postMessage(null);
    },
  };
}
