"use client";

import { useEffect } from "react";
import { materialAnchor } from "../continue-model";

const PREFIX = materialAnchor("");

/**
 * Opens and focuses the material named by the address (`#materi-<id>`), which is where "Lanjutkan"
 * leads (KLS-05). Next shows cached pages again without a reload, so this reads the address when
 * the materials appear, not once per page. Needs the materials to be drawn (`enabled`).
 */
export function useMaterialFocus(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id.startsWith(PREFIX)) return;
      const element = document.getElementById(id);
      if (!(element instanceof HTMLDetailsElement)) return;
      element.open = true;
      element.scrollIntoView({ block: "start" });
      element.querySelector("summary")?.focus({ preventScroll: true });
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [enabled]);
}
