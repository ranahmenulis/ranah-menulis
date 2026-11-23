"use client";

import Link from "next/link";
import { useRef } from "react";
import { cn } from "@/lib/cn";

export type TabItem = { id: string; label: string; href?: string };

const bar =
  "flex gap-6 overflow-x-auto overflow-y-hidden shadow-[inset_0_-1px_0_var(--line)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const tab = "shrink-0 cursor-pointer whitespace-nowrap py-3 text-sm no-underline";
// Garis digambar dengan box-shadow inset, bukan border bermargin negatif, supaya bilah yang
// bisa digulir tidak memunculkan scrollbar vertikal.
const active = "font-medium text-ink shadow-[inset_0_-2px_0_var(--accent-ink)]";
const idle = "text-ink-muted hover:text-ink";

// Pill look (DESIGN.md 7.1): a row of chips, the selected one filled with the accent.
const pillBar = "flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const pillTab =
  "inline-flex h-8 shrink-0 cursor-pointer items-center rounded-full px-4 text-sm whitespace-nowrap no-underline";
const pillActive = "bg-accent font-medium text-on-accent";
const pillIdle = "bg-subtle text-ink hover:bg-line";

type TabsProps = {
  items: TabItem[];
  value: string;
  onValueChange?: (id: string) => void;
  label: string;
  className?: string;
  /** "line" underlines the selected tab; "pill" fills it like a chip. */
  variant?: "line" | "pill";
};

/**
 * Tab untuk berpindah tampilan di satu halaman. Bila item punya href, bilah menjadi navigasi
 * (aria-current) dan berpindah lewat tautan; selain itu role=tablist dengan panah kiri/kanan.
 */
export function Tabs({
  items,
  value,
  onValueChange,
  label,
  className,
  variant = "line",
}: TabsProps) {
  const pill = variant === "pill";
  const barClass = pill ? pillBar : bar;
  const look = (selected: boolean) =>
    pill ? cn(pillTab, selected ? pillActive : pillIdle) : cn(tab, selected ? active : idle);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const isNav = items.every((i) => i.href);

  if (isNav) {
    return (
      <nav aria-label={label} className={cn(barClass, className)}>
        {items.map((i) => (
          <Link
            key={i.id}
            href={i.href!}
            aria-current={i.id === value ? "page" : undefined}
            className={look(i.id === value)}
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
    <div role="tablist" aria-label={label} className={cn(barClass, className)}>
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
            className={cn(pill ? "" : "border-0 bg-transparent", look(selected))}
          >
            {i.label}
          </button>
        );
      })}
    </div>
  );
}
