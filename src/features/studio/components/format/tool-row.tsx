import type { ReactNode } from "react";

/**
 * The strip under the editor bar that holds the format toolbar and the view mode switch. From md
 * up it has no edge of its own: the toolbar floats as a pill over the desk, above the sheet. On a
 * phone the writing area is the surface, so the strip is too, with a hairline under it.
 */
export function ToolRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-none items-center justify-center gap-2 border-b border-line bg-surface px-3 py-1.5 md:border-b-0 md:bg-canvas md:px-4 md:pt-3 md:pb-0">
      {children}
    </div>
  );
}
