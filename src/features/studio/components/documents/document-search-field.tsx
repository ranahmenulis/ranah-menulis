"use client";

import { useId, type Ref } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { Field, Input } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";

export function DocumentSearchField({
  value,
  inputRef,
  onChange,
  onClear,
}: {
  value: string;
  inputRef: Ref<HTMLInputElement>;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  const id = useId();
  return (
    <Field id={id} label="Cari judul atau isi" className="mt-4 sm:max-w-sm">
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          type="search"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pr-12 [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <IconButton
            label="Hapus kata kunci"
            onClick={onClear}
            className="absolute inset-y-0 right-0"
          >
            <X size={18} aria-hidden />
          </IconButton>
        )}
      </div>
    </Field>
  );
}
