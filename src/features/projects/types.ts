/** Projects (PRD 8.4, BR-PRJ-01): exactly four categories. A new one needs the founder's approval. */
export type ProjectCategory = "antologi" | "solo" | "kelas" | "lomba";

/**
 * Drafts are never shown to the public (PRJ-01). An archived project (BR-PRJ-07) is hidden like a
 * draft, and every screen that only serves published projects drops its assignments with it (Q-04).
 */
export type Publication = "terbit" | "draf" | "arsip";

/** [konfirmasi] Project time zone is set by the Organizer and always shown (BR-PRJ-04, Q-29). */
export type TimeZoneName = "WIB" | "MYT";

/**
 * Fees per currency in the smallest unit (BR-PRJ-10): rupiah and sen. IDR and MYR are set
 * separately, never converted. An empty object means free. All amounts in fixtures are samples
 * [konfirmasi, Q-19, Q-30].
 */
export type Money = { idr?: number; myr?: number };

/**
 * What a project accepts when a participant sends work (PRD 10.5 step 4). `null` on a project that
 * takes no submissions: Kelas Menulis collects assignments (KLS-03), which is 6f-5. Values come from
 * the manuscript rules written in `requirements` and are samples [konfirmasi, Q-28, Q-31].
 */
export type SubmissionRules = { minWords: number; maxWords: number; maxWorks: number };

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

/**
 * What a participant agrees to before registering (BR-PRJ-02). `version` is stored with the
 * registration. `special` lists project-specific terms; the base statements are the same for every
 * project. All of it is sample text [konfirmasi Q-21: the real terms need legal review].
 */
export type ProjectTerms = { version: string; special: string[] };

/**
 * An optional poster an Organizer uploaded. `fileId` points into the file store; `alt` describes
 * the poster for readers who cannot see it (a poster usually carries text). Without one the
 * generated cover (`cover-model.ts`) is used.
 */
export type ProjectPoster = { fileId: string; alt: string };

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
  submission: SubmissionRules | null;
  /** [usulan] Team members only in the MVP (Q-31). */
  organizer: string;
  /** Who manages it (BR-PRJ-06); absent on the sample projects, which belong to the team. */
  ownerId?: string;
  /** When the Organizer last changed the terms after the first publication (PRJ-03). */
  termsUpdatedAt?: number;
  timeZone: TimeZoneName;
  fee: Money;
  /** `null` = no quota (open-ended services such as Solo). */
  quota: { total: number; taken: number } | null;
  terms: ProjectTerms;
  block: CategoryBlock;
  poster?: ProjectPoster;
};

/**
 * Fixture form: times are offsets from the moment the page opens, so a dummy project never goes
 * stale (same idea as Community's "berapa lama lalu"). `closesInMs` is the registration deadline;
 * `null` means it is open all year.
 */
export type ProjectFixture = ProjectBase & {
  closesInMs: number | null;
  milestones: { label: string; inMs: number }[];
  /**
   * A project an Organizer wrote has real dates, not offsets. When present these win over
   * `closesInMs` and `milestones`, so every reader of the catalog keeps taking `ProjectFixture`s.
   */
  absolute?: { closesAt: number | null; milestones: { label: string; at: number }[] };
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

/** `menunggu-pembayaran` until payment is confirmed (a hold that ran out is derived from time, see `payment-model.ts`); free projects register straight away. */
export type RegistrationStatus = "menunggu-pembayaran" | "terdaftar";

/** A registration kept on this device. Becomes a database row when the backend exists. */
export type Registration = {
  slug: string;
  registeredAt: number;
  /** When the terms were accepted, and which version (BR-PRJ-02). */
  agreedAt: number;
  termsVersion: string;
  /** Solo only: the package chosen at registration. */
  packageName?: string;
  status: RegistrationStatus;
  /** When payment was confirmed; set only by `confirmPayment`. */
  paidAt?: number;
  /** Who confirmed it: "sistem" for the QRIS webhook, "organizer" for a person (PLT-07). */
  paidBy?: "sistem" | "organizer";
};

export type RegistrationMap = Record<string, Registration>;
