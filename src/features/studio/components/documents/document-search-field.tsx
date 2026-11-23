"use client";

import { useId, type Ref } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { Field, Input } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { useT } from "@/lib/i18n/provider";

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
  const t = useT().studioDocuments.searchField;
  return (
    <Field
      id={id}
      label={t.label}
      className="mt-4 sm:max-w-md lg:max-w-none lg:flex-1 [&>label]:sr-only"
    >
      <div className="relative">
        <MagnifyingGlass
          size={20}
          aria-hidden
          className="pointer-events-none absolute top-3 left-3 text-ink-muted"
        />
        <Input
          id={id}
          ref={inputRef}
          type="search"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t.placeholder}
          className="pr-12 pl-10 [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <IconButton label={t.clear} onClick={onClear} className="absolute inset-y-0 right-0">
            <X size={18} aria-hidden />
          </IconButton>
        )}
      </div>
    </Field>
  );
}
