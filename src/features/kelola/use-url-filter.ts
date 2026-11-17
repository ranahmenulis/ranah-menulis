"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * A filter kept in the address (`?param=`) so a view can be linked. The address is the source of
 * truth: Next keeps the previous page mounted, so the value is read again whenever it changes.
 * `change` updates the value and the address at once, without a navigation.
 */
export function useUrlFilter<T>(
  param: string,
  parse: (raw: string | null) => T,
  hrefOf: (value: T) => string,
): [T, (next: T) => void] {
  const asked = useSearchParams()?.get(param) ?? null;
  const [value, setValue] = useState(() => parse(asked));
  const [seen, setSeen] = useState(asked);
  if (seen !== asked) {
    setSeen(asked);
    setValue(parse(asked));
  }
  function change(next: T) {
    setValue(next);
    window.history.replaceState(null, "", hrefOf(next));
  }
  return [value, change];
}
