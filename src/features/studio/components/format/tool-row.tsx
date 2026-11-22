import type { ReactNode } from "react";

/** The strip under the editor bar that holds the format toolbar and the view mode switch. */
export function ToolRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-none items-center justify-center gap-2 border-b border-line bg-canvas px-4 py-1.5 md:py-2">
      {children}
    </div>
  );
}
