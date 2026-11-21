import type { ReactNode } from "react";

/**
 * Row of filter chips that sticks under the top bar (DESIGN.md 6.8) and scrolls sideways when it
 * does not fit. The fade mask sits on the inner row so the sticky bar itself stays opaque. `end`
 * holds controls that must not scroll away or be clipped (menus that open a panel): on the right
 * from md, on their own row under the chips on phones.
 */
export function StickyChipBar({
  label,
  children,
  end,
}: {
  label: string;
  children: ReactNode;
  end?: ReactNode;
}) {
  return (
    <div className="sticky top-[calc(3.25rem+var(--safe-top))] z-20 -mx-4 mt-2 flex flex-wrap items-center border-b border-line bg-canvas md:top-[calc(3.5rem+var(--safe-top))] md:mx-0 md:flex-nowrap md:gap-4">
      <div
        role="toolbar"
        aria-label={label}
        className="scroll-edge-fade flex min-w-0 basis-full [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-3 md:flex-1 md:basis-auto md:px-0 md:py-4 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {end && <div className="flex shrink-0 gap-2 px-4 pb-3 md:p-0">{end}</div>}
    </div>
  );
}
