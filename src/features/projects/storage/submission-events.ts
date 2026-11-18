import { createLocalChangeSignal } from "@/lib/local-change-signal";

export const { subscribe: onSubmissionsChanged, notify: notifySubmissionsChanged } =
  createLocalChangeSignal("ranah:submissions-changed");
