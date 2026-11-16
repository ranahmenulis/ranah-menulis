import type { SubmissionVersion } from "../submission-types";

/**
 * Class content (PRD 10.6: KLS-01, KLS-02, KLS-03). Everything here is a sample [konfirmasi]:
 * the real curriculum, schedule and assignments are written by the mentor (6g).
 */

export type ClassMaterial = {
  /** Unique within the class. Progress is kept by this id. */
  id: string;
  title: string;
  minutes: number;
  body: string[];
  /** A recording or reading kept on an outside service (Q-26: the platform does not host video). */
  url?: string;
};

/** Fixture form: days after the class started, so a dummy class never goes stale. */
export type ClassFixture = {
  slug: string;
  sessions: {
    id: string;
    title: string;
    /** Days after the day the class started (0 = that day). */
    day: number;
    /** "19.00", in the project's time zone. */
    time: string;
    minutes: number;
    /** Meeting link on an outside service [konfirmasi Q-26]. */
    link: string;
  }[];
  modules: {
    title: string;
    materials: ClassMaterial[];
    assignment: { id: string; title: string; instructions: string[]; dueDay: number };
  }[];
};

export type ClassSession = {
  id: string;
  title: string;
  at: number;
  minutes: number;
  link: string;
};

export type ClassAssignment = {
  id: string;
  title: string;
  /** The module it ends. */
  module: string;
  instructions: string[];
  /** End of its day in the project's zone [usulan, like every deadline here]. */
  dueAt: number;
};

/** Resolved form used by screens: absolute times. */
export type ClassContent = {
  slug: string;
  /** First millisecond of the day the class started. */
  startsAt: number;
  sessions: ClassSession[];
  modules: { title: string; materials: ClassMaterial[]; assignment: ClassAssignment }[];
};

/** What the mentor decided; "dikumpulkan" is the state before a decision (and after a resubmission). */
export type AssignmentStatus = "dikumpulkan" | "perlu-perbaikan" | "selesai";

/** Where the text came from: a frozen Studio document, or typed straight into the form. */
export type AssignmentSource = "studio" | "teks";

export type AssignmentChange = {
  status: AssignmentStatus;
  at: number;
  by: "peserta" | "mentor";
  /** The mentor's feedback on a decision. */
  reason?: string;
};

/**
 * An assignment handed in on this device. Becomes a database row when the backend exists. Not a
 * `Submission`: it has no genre, no limit of works and no review by an editor (KLS-03).
 */
export type AssignmentSubmission = {
  id: string;
  slug: string;
  assignmentId: string;
  source: AssignmentSource;
  /** The Studio document it came from; `null` for typed text. */
  docId: string | null;
  docTitle: string;
  status: AssignmentStatus;
  /** Handed in after the deadline [usulan, Q-27]: accepted, and marked. */
  late: boolean;
  submittedAt: number;
  versions: SubmissionVersion[];
  statusLog: AssignmentChange[];
};

/** The reader's view of one assignment. `terkunci`: the class has not started. */
export type AssignmentState =
  "terkunci" | "belum-dikumpulkan" | "terlambat" | "dikumpulkan" | "perlu-perbaikan" | "selesai";
