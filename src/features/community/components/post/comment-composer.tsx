"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { DUMMY_USER } from "@/features/app-shell/nav";

type Props = {
  /** Visible to screen readers only; the field itself shows a placeholder. */
  label: string;
  placeholder: string;
  initialText?: string;
  /** The single ink button of the page is the top-level one; a reply uses the outline button. */
  primary: boolean;
  autoFocus?: boolean;
  onSubmit: (text: string) => Promise<boolean>;
  onCancel?: () => void;
};

/** Field + send button for a comment or a reply. The text stays when sending fails. */
export function CommentComposer({
  label,
  placeholder,
  initialText = "",
  primary,
  autoFocus,
  onSubmit,
  onCancel,
}: Props) {
  const [text, setText] = useState(initialText);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const empty = text.trim().length === 0;

  async function send() {
    if (empty || sending) return;
    setSending(true);
    setFailed(false);
    const ok = await onSubmit(text.trim());
    setSending(false);
    if (ok) setText("");
    else setFailed(true);
  }

  return (
    <form
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        void send();
      }}
    >
      <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3">
        <Avatar name={DUMMY_USER.name} size={32} />
        <label className="contents">
          <span className="sr-only">{label}</span>
          <Input
            type="text"
            value={text}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-invalid={failed || undefined}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onCancel?.()}
          />
        </label>
        <div className="flex items-center gap-1">
          {onCancel && (
            <Button variant="text" size="sm" onClick={onCancel}>
              Batal
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            variant={primary ? "primary" : "secondary"}
            disabled={empty}
            loading={sending}
          >
            Kirim
          </Button>
        </div>
      </div>
      {failed && (
        <p role="alert" className="pl-11 text-sm text-danger">
          Komentar belum terkirim. Tulisanmu masih di sini; coba kirim lagi.
        </p>
      )}
    </form>
  );
}
