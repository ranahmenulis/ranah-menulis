"use client";

import { useRef, type ReactNode } from "react";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { ACCEPT, type UploadKind } from "@/lib/files/validate-upload";

type Props = {
  kind: UploadKind;
  /** Accessible name of the hidden input; the button's own text is `children`. */
  label: string;
  onPick: (file: File) => void;
  children: ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  id?: string;
};

/**
 * A button that opens the file picker. The real input is hidden and out of the tab order; the
 * button is the control, so keyboard and screen readers use it like any other button.
 */
export function FilePickButton({
  kind,
  label,
  onPick,
  children,
  variant = "secondary",
  disabled,
  id,
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept={ACCEPT[kind]}
        aria-label={label}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onPick(file);
        }}
      />
      <Button
        id={id}
        variant={variant}
        size="sm"
        disabled={disabled}
        onClick={() => input.current?.click()}
      >
        {children}
      </Button>
    </>
  );
}
