"use client";

import { useT } from "@/lib/i18n/provider";
import { MySkeleton } from "../../components/my-states";

/** The loading state in the reader's language, for the route's Suspense fallback. */
export function ResultsSkeleton() {
  return <MySkeleton label={useT().projectsContest.loading} />;
}
