/** Projects (PRD 8.4, BR-PRJ-01): exactly four categories. A new one needs the founder's approval. */
export type ProjectCategory = "antologi" | "solo" | "kelas" | "lomba";

/** Drafts are never shown to the public (PRJ-01). */
export type Publication = "terbit" | "draf";

/** [konfirmasi] Project time zone is set by the Organizer and always shown (BR-PRJ-04, Q-29). */
export type TimeZoneName = "WIB" | "MYT";

/**
 * Fees per currency in the smallest unit (BR-PRJ-10): rupiah and sen. IDR and MYR are set
 * separately, never converted. An empty object means free. All amounts in fixtures are samples
 * [konfirmasi, Q-19, Q-30].
 */
export type Money = { idr?: number; myr?: number };

export type SoloPackage = { name: string; fee: Money; includes: string[] };

/** The one read-only block that differs per category (PRD 10.6: SOL-01, KLS-01, LMB-01). */
export type CategoryBlock =
  | { kind: "antologi"; theme: string; stages: string[] }
  | { kind: "solo"; packages: SoloPackage[] }
  | {
      kind: "kelas";
      teacher: { name: string; bio: string };
      modules: { title: string; meetings: number }[];
    }
  | {
      kind: "lomba";
      criteria: { name: string; weight: number }[];
      prizes: string[];
      anonymous: boolean;
    };

type ProjectBase = {
  slug: string;
  category: ProjectCategory;
  publication: Publication;
  title: string;
  /** One line for the catalog row. */
  summary: string;
  /** Paragraphs for "Tentang proyek". */
  about: string[];
  /** Manuscript rules shown before registering: word limit, works per participant, genre. */
  requirements: string[];
  /** [usulan] Team members only in the MVP (Q-31). */
  organizer: string;
  timeZone: TimeZoneName;
  fee: Money;
  /** `null` = no quota (open-ended services such as Solo). */
  quota: { total: number; taken: number } | null;
  block: CategoryBlock;
};

/**
 * Fixture form: times are offsets from the moment the page opens, so a dummy project never goes
 * stale (same idea as Community's "berapa lama lalu"). `closesInMs` is the registration deadline;
 * `null` means it is open all year.
 */
export type ProjectFixture = ProjectBase & {
  closesInMs: number | null;
  milestones: { label: string; inMs: number }[];
};

/** Resolved form used by screens: absolute timestamps. */
export type Project = ProjectBase & {
  closesAt: number | null;
  milestones: { label: string; at: number }[];
};

/** Derived, never stored. Kuota penuh and Ditutup both mean registration is not possible. */
export type ProjectState = "buka" | "segera-tutup" | "kuota-penuh" | "ditutup";

export type CategoryFilter = "semua" | ProjectCategory;
export type StateFilter = "semua" | "buka" | "segera-tutup" | "ditutup";
export type FeeFilter = "semua" | "gratis" | "berbayar";
export type Filters = { category: CategoryFilter; state: StateFilter; fee: FeeFilter };
