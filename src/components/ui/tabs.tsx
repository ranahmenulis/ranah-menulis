"use client";

import Link from "next/link";
import { useRef } from "react";
import { cn } from "@/lib/cn";

export type TabItem = { id: string; label: string; href?: string };

const bar =
  "flex gap-6 overflow-x-auto overflow-y-hidden shadow-[inset_0_-1px_0_var(--line)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const tab =
  "shrink-0 cursor-pointer whitespace-nowrap py-3 text-sm no-underline";
// Garis digambar dengan box-shadow inset, bukan border bermargin negatif, supaya bilah yang
// bisa digulir tidak memunculkan scrollbar vertikal.
const active = "text-ink shadow-[inset_0_-1px_0_var(--line-strong)]";
const idle = "text-ink-muted hover:text-ink";

type TabsProps = {
  items: TabItem[];
  value: string;
  onValueChange?: (id: string) => void;
  label: string;
  className?: string;
};

/**
 * Tab untuk berpindah tampilan di satu halaman. Bila item punya href, bilah menjadi navigasi
 * (aria-current) dan berpindah lewat tautan; selain itu role=tablist dengan panah kiri/kanan.
 */
export function Tabs({ items, value, onValueChange, label, className }: TabsProps) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const isNav = items.every((i) => i.href);

  if (isNav) {
    return (
      <nav aria-label={label} className={cn(bar, className)}>
        {items.map((i) => (
          <Link
            key={i.id}
            href={i.href!}
            aria-current={i.id === value ? "page" : undefined}
            className={cn(tab, i.id === value ? active : idle)}
          >
            {i.label}
          </Link>
        ))}
      </nav>
    );
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + items.length) % items.length;
    refs.current[next]?.focus();
    onValueChange?.(items[next].id);
  }

  return (
    <div role="tablist" aria-label={label} className={cn(bar, className)}>
      {items.map((i, index) => {
        const selected = i.id === value;
        return (
          <button
            key={i.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${i.id}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange?.(i.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(tab, "border-0 bg-transparent", selected ? active : idle)}
          >
            {i.label}
          </button>
        );
      })}
    </div>
  );
}
