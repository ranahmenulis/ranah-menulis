import { Plus } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/ui/avatar";
import type { Followed } from "./fixtures";

/**
 * Phones only: authors and groups you follow, scrolling sideways, with an ink dot when there is
 * new work (DESIGN.md 2.1). The last entry leads to Jelajahi.
 */
export function FollowRow({ items }: { items: Followed[] }) {
  return (
    <ul
      aria-label="Penulis dan grup yang kamu ikuti"
      className="-mx-4 flex [scrollbar-width:none] gap-4 overflow-x-auto px-4 pt-4 pb-1 md:hidden [&::-webkit-scrollbar]:hidden"
    >
      {items.map((f) => (
        <li key={f.name} className="grid w-16 shrink-0 justify-items-center gap-1.5">
          <span className="relative">
            <Avatar name={f.name} size={56} />
            {f.fresh && (
              <i
                role="img"
                aria-label="Ada karya baru"
                className="absolute top-0 right-0 size-2 rounded-full bg-ink ring-2 ring-canvas"
              />
            )}
          </span>
          <span className="line-clamp-2 text-center text-xs">{f.name}</span>
        </li>
      ))}
      <li className="grid w-16 shrink-0 justify-items-center gap-1.5 text-ink-muted">
        <span className="grid size-14 place-items-center rounded-full border border-line">
          <Plus size={20} aria-hidden />
        </span>
        <span className="text-xs" aria-disabled="true">
          Temukan
        </span>
      </li>
    </ul>
  );
}
