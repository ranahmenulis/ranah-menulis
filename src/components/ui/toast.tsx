"use client";

import { X } from "@phosphor-icons/react/dist/ssr";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";

export type ToastInput = {
  message: string;
  /** At most one action, shown as an underlined text button. */
  action?: { label: string; onSelect: () => void };
  /** Errors stay until closed or repeated; everything else leaves after 4s (DESIGN.md 7.1). */
  tone?: "status" | "error";
  /** Repeating a toast with the same key replaces the old one instead of stacking. */
  key?: string;
};

type ToastEntry = ToastInput & { id: number; leaving: boolean };

const ToastContext = createContext<((input: ToastInput) => void) | null>(null);

const LIFETIME_MS = 4000;
const EXIT_MS = 150;
const MAX_VISIBLE = 3;

/** Call `toast({ message })` from any client component below <ToastProvider>. Never for save state. */
export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used inside <ToastProvider>");
  return toast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ToastEntry[]>([]);
  const counter = useRef(0);
  const notices = useT().common.notifications;

  const remove = useCallback((id: number) => {
    setEntries((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => setEntries((list) => list.filter((t) => t.id !== id)), EXIT_MS);
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = ++counter.current;
    setEntries((list) => {
      const rest = input.key ? list.filter((t) => t.key !== input.key) : list;
      return [...rest, { ...input, id, leaving: false }].slice(-MAX_VISIBLE);
    });
  }, []);

  return (
    <ToastContext value={toast}>
      {children}
      <div
        role="region"
        aria-label={notices}
        className={cn(
          "pointer-events-none fixed z-[60] grid justify-items-start gap-2",
          "inset-x-4 bottom-[var(--toast-offset,1rem)] md:right-auto md:left-4",
        )}
      >
        {entries.map((entry) => (
          <ToastItem key={entry.id} entry={entry} onClose={remove} />
        ))}
      </div>
    </ToastContext>
  );
}

function ToastItem({ entry, onClose }: { entry: ToastEntry; onClose: (id: number) => void }) {
  const { id, message, action, tone = "status", leaving } = entry;
  const closeNotice = useT().common.closeNotification;
  const [paused, setPaused] = useState(false);
  const isError = tone === "error";

  // Pauses while hovered or focused so the action can be reached (WCAG 2.2.1).
  useEffect(() => {
    if (isError || paused || leaving) return;
    const timer = window.setTimeout(() => onClose(id), LIFETIME_MS);
    return () => window.clearTimeout(timer);
  }, [id, isError, paused, leaving, onClose]);

  return (
    <div
      role={isError ? "alert" : "status"}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        "pointer-events-auto flex max-w-105 items-center gap-4 rounded-xl bg-ink px-4 py-3 text-sm text-on-ink",
        "transition-[opacity,translate] duration-200 ease-out starting:translate-y-2 starting:opacity-0",
        leaving && "translate-y-2 opacity-0 duration-150",
      )}
    >
      <span className="min-w-0 flex-1">{message}</span>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onSelect();
            onClose(id);
          }}
          className="shrink-0 cursor-pointer font-medium underline underline-offset-3"
        >
          {action.label}
        </button>
      )}
      {isError && (
        <button
          type="button"
          aria-label={closeNotice}
          onClick={() => onClose(id)}
          className="-mr-1 shrink-0 cursor-pointer"
        >
          <X size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}
