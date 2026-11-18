import { createLocalChangeSignal } from "@/lib/local-change-signal";

export const { subscribe: onAssignmentsChanged, notify: notifyAssignmentsChanged } =
  createLocalChangeSignal("ranah:assignments-changed");
