"use client";

import { BookCover } from "@/components/ui/book-cover";
import { useT } from "@/lib/i18n/provider";

/**
 * Marketplace, which comes after the MVP (PRD Q-39): the categories from the client's brief and
 * one listing. No price is shown, since none has been decided.
 */
export function MarketplacePreview() {
  const { ecosystem, doc } = useT().landing;
  const [first, ...rest] = ecosystem.marketplace.categories;
  return (
    <div className="grid gap-5 px-4 py-5 md:px-6">
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex h-8 items-center rounded-full bg-accent px-3 text-xs font-medium text-on-accent">
          {first}
        </span>
        {rest.map((c) => (
          <span
            key={c}
            className="inline-flex h-8 items-center rounded-full border border-line px-3 text-xs font-medium text-ink-muted"
          >
            {c}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-4 border-t border-line pt-5">
        <BookCover title={doc.title} width={48} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{doc.title}</p>
          <span className="text-xs text-ink-muted">{ecosystem.marketplace.listingMeta}</span>
        </div>
      </div>
    </div>
  );
}
