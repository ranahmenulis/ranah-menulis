"use client";

import { useRef, useState } from "react";

/**
 * The line that says what an action did (`role="status"`). `focus` moves the reader there, for an
 * action whose button is gone afterwards (a removed row); leave it off when the button stays.
 */
export function useActionStatus() {
  const [message, setMessage] = useState("");
  const statusRef = useRef<HTMLParagraphElement>(null);
  function show(text: string, focus = false) {
    setMessage(text);
    if (focus) requestAnimationFrame(() => statusRef.current?.focus());
  }
  return { message, statusRef, show };
}
