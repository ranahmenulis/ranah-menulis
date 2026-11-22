"use client";

import { Skeleton as Base } from "@/components/ui/states";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";

/** Bars sit on the `subtle` tile, so they take the line color to stay visible. */
const Skeleton = ({ className, ...props }: ComponentProps<"div">) => (
  <Base className={cn("@xl:bg-line", className)} {...props} />
);

const TILES = [
  { image: false, long: true },
  { image: true, long: false },
  { image: false, long: false },
  { image: false, long: true },
  { image: false, long: false },
  { image: true, long: false },
];

/** Chips and tiles in their real shape. Invisible for the first 300ms so quick loads never flash. */
export function DiscoverSkeleton() {
  const label = useT().discover.loading;
  return (
    <div
      role="status"
      aria-label={label}
      className="animate-[rm-appear_0s_300ms_forwards] opacity-0"
    >
      <div className="flex gap-2 border-b border-line py-4">
        {[120, 104, 112, 136, 96].map((w) => (
          <Skeleton key={w} className="h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>
      <Skeleton className="mt-4 mb-6 h-3.5 w-80 max-w-full" />
      <div className="@xl:columns-2 @xl:gap-x-6 @4xl:columns-3 @[77.5rem]:columns-4">
        {TILES.map((tile, i) => (
          <div
            key={i}
            className="mb-6 grid break-inside-avoid gap-2.5 p-5 @max-xl:mb-0 @max-xl:border-b @max-xl:border-line @max-xl:px-0 @xl:bg-subtle"
          >
            {tile.image && <Skeleton className="aspect-4/3 w-full @max-xl:hidden @xl:bg-line" />}
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3 w-30" />
            </div>
            <Skeleton className="h-5 w-[70%]" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[92%]" />
            {tile.long && (
              <>
                <Skeleton className="h-3 w-[80%]" />
                <Skeleton className="h-3 w-[64%]" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
