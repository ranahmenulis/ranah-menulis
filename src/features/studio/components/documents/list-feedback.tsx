"use client";

import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { useT } from "@/lib/i18n/provider";

export function ListSkeleton() {
  const t = useT().studioDocuments;
  return (
    <div
      role="status"
      aria-label={t.list.loading}
      className="animate-[rm-appear_0s_300ms_forwards] opacity-0"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[20px_minmax(0,1fr)] gap-x-3 border-b border-line py-5"
        >
          <Skeleton className="size-5" />
          <div className="grid gap-2.5">
            <Skeleton className="h-4" style={{ width: `${70 - i * 6}%` }} />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListFeedback({
  status,
  onRetry,
}: {
  status: "loading" | "error";
  onRetry: () => void;
}) {
  const t = useT().studioDocuments;
  if (status === "loading") return <ListSkeleton />;
  return (
    <div className="mt-6 grid gap-3">
      <ErrorBanner action={<RetryButton onClick={onRetry} />}>{t.list.loadFailed}</ErrorBanner>
      <p className="text-xs text-ink-muted">{t.list.loadFailedNote}</p>
    </div>
  );
}
