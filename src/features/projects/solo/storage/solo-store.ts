import type { SoloProgress } from "../types";

export type AddResult = "ok" | "duplicate";
export type UpdateResult = "ok" | "missing" | "rejected";

/** Computes the next version of one row from its current one. `null` refuses the change. */
export type Change = (current: SoloProgress) => SoloProgress | null;

/** Where Solo progress lives. Today: this device. Screens only see this interface. */
export interface SoloStore {
  list(): Promise<SoloProgress[]>;
  /** Stores a new row unless one with the same id exists (checked and written together). */
  add(row: SoloProgress): Promise<AddResult>;
  /** Reads, changes and writes one row in one transaction. */
  update(id: string, change: Change): Promise<UpdateResult>;
}
