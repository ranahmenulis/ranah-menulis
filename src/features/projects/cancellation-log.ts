import { createLocalListStore } from "@/lib/local-list-store";

/** One cancelled registration, kept so the status is recorded (PRJ-06). Append-only. */
export type Cancellation = {
  slug: string;
  registeredAt: number;
  cancelledAt: number;
  packageName?: string;
};

function isCancellation(value: unknown): value is Cancellation {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.slug === "string" &&
    Number.isFinite(c.registeredAt) &&
    Number.isFinite(c.cancelledAt) &&
    (c.packageName === undefined || typeof c.packageName === "string")
  );
}

export const cancellationLog = createLocalListStore<Cancellation>(
  "ranah.registrationCancellations",
  isCancellation,
);
