"use client";

import { Check, Copy, Minus, Plus } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Tabs } from "@/components/ui/tabs";
import { kits, prompts } from "../help-content";

const COPIED_MS = 2000;

function PromptList() {
  const [copied, setCopied] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy(index: number) {
    try {
      await navigator.clipboard.writeText(prompts[index]);
    } catch {
      return; // Clipboard unavailable (insecure context): the text stays selectable.
    }
    setCopied(index);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), COPIED_MS);
  }

  return (
    <>
      <p className="border-b border-line px-4 py-3.5 text-sm text-ink-muted md:px-5 md:py-4">
        Pancingan untuk memulai saat buntu. Salin, lalu jawab dengan kata-katamu sendiri.
      </p>
      {prompts.map((text, i) => (
        <div
          key={text}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 border-b border-line px-4 py-4 md:px-5"
        >
          <p className="font-serif text-base leading-[26px]">{text}</p>
          <Button
            variant="text"
            size="sm"
            onClick={() => copy(i)}
            aria-label={copied === i ? "Prompt tersalin" : "Salin prompt"}
            className={copied === i ? "text-ink" : undefined}
          >
            {copied === i ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
            {copied === i ? "Tersalin" : "Salin"}
          </Button>
        </div>
      ))}
    </>
  );
}

function KitList() {
  return (
    <>
      <p className="border-b border-line px-4 py-3.5 text-sm text-ink-muted md:px-5 md:py-4">
        Bahan kecil untuk kalimat berikutnya. Pilih satu bagian.
      </p>
      {kits.map((kit) => (
        <details key={kit.name} className="group border-b border-line">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 text-sm md:px-5 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 flex-1">{kit.name}</span>
            <span className="text-xs text-ink-muted">{kit.hint}</span>
            <Plus size={16} aria-hidden className="shrink-0 text-ink-muted group-open:hidden" />
            <Minus
              size={16}
              aria-hidden
              className="hidden shrink-0 text-ink-muted group-open:block"
            />
          </summary>
          <ul className="grid gap-3 px-4 pb-4 md:px-5">
            {kit.entries.map((entry) => (
              <li key={entry} className="font-serif text-base leading-[26px]">
                {entry}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </>
  );
}

/** Writing help: inspiration kit and copyable prompts (STD-11). Drawer on desktop, sheet on phones. */
export function HelpDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState("prompt");
  return (
    <Drawer open={open} onClose={onClose} title="Bantuan menulis" closeLabel="Tutup bantuan">
      <Tabs
        label="Jenis bantuan"
        value={tab}
        onValueChange={setTab}
        className="mx-4 md:mx-5"
        items={[
          { id: "kit", label: "Kit inspirasi" },
          { id: "prompt", label: "Prompt" },
        ]}
      />
      <div role="tabpanel" aria-labelledby={`tab-${tab}`} className="min-h-0 flex-1 overflow-auto">
        {tab === "prompt" ? <PromptList /> : <KitList />}
      </div>
    </Drawer>
  );
}
