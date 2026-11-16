import type { ReactNode } from "react";

/**
 * Row of filter chips that sticks under the top bar (DESIGN.md 6.8) and scrolls sideways when it
 * does not fit. The fade mask sits on the inner row so the sticky bar itself stays opaque.
 */
export function StickyChipBar({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="sticky top-[calc(3.25rem+var(--safe-top))] z-20 -mx-4 mt-2 border-b border-line bg-canvas md:top-[calc(3.5rem+var(--safe-top))] md:mx-0">
      <div
        role="toolbar"
        aria-label={label}
        className="scroll-edge-fade flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-3 md:px-0 md:py-4 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
