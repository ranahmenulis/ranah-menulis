import { Skeleton } from "@/components/ui/states";

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
  return (
    <div
      role="status"
      aria-label="Memuat Jelajahi"
      className="animate-[rm-appear_0s_300ms_forwards] opacity-0"
    >
      <div className="flex gap-2 border-b border-line py-4">
        {[120, 104, 112, 136, 96].map((w) => (
          <Skeleton key={w} className="h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>
      <Skeleton className="mt-4 mb-6 h-3.5 w-80 max-w-full" />
      <div className="@xl:columns-2 @xl:gap-x-6 @4xl:columns-3">
        {TILES.map((tile, i) => (
          <div
            key={i}
            className="mb-6 grid break-inside-avoid gap-2.5 border border-line p-5 @max-xl:mb-0 @max-xl:border-0 @max-xl:border-b @max-xl:px-0"
          >
            {tile.image && <Skeleton className="aspect-3/2 w-full @max-xl:hidden" />}
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
