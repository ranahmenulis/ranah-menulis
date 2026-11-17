"use client";

import { useCallback, useState } from "react";

export type SidePanel = "help" | "versions";

/**
 * Which side panel of the editor is open. Help and version history share the same place on the
 * right, so opening one closes the other and the page makes room for only one.
 */
export function useSidePanel() {
  const [panel, setPanel] = useState<SidePanel | null>(null);
  const openHelp = useCallback(() => setPanel("help"), []);
  const openVersions = useCallback(() => setPanel("versions"), []);
  const toggleHelp = useCallback(() => setPanel((p) => (p === "help" ? null : "help")), []);
  const close = useCallback(() => setPanel(null), []);
  return { panel, openHelp, openVersions, toggleHelp, close };
}
