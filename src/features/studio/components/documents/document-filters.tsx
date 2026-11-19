"use client";

import { useSearchParams } from "next/navigation";
import { useId, useMemo, type Ref } from "react";
import { Field, Select } from "@/components/ui/field";
import {
  DOCUMENT_KINDS,
  parseKind,
  parseTag,
  type DocumentFilters,
} from "../../document-classification";

export function useDocumentFilters() {
  const params = useSearchParams();
  const rawTag = params.get("tag");
  const kind = parseKind(params.get("jenis"));
  const tag = parseTag(rawTag);
  const filters = useMemo(() => ({ kind, tag }), [kind, tag]);
  const tabParam = params.get("tab");
  const tab = tabParam === "arsip" || tabParam === "sampah" ? tabParam : "semua";

  function changeFilters(
    changes: Partial<Record<"jenis" | "tag" | "tab" | "folder", string>>,
    history: "pushState" | "replaceState" = "replaceState",
  ) {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(changes)) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history[history](null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  const requestedFolder = tab === "semua" ? params.get("folder") : null;
  return { filters, rawTag, changeFilters, tab, requestedFolder };
}

export function DocumentFilterFields({
  filters,
  rawTag,
  tags,
  kindRef,
  onChange,
}: {
  filters: DocumentFilters;
  rawTag: string | null;
  tags: [string, string][];
  kindRef: Ref<HTMLSelectElement>;
  onChange: ReturnType<typeof useDocumentFilters>["changeFilters"];
}) {
  const id = useId();
  const missingTag = tags.some(([key]) => key === filters.tag) ? null : filters.tag;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-sm">
      <Field id={`${id}-kind`} label="Jenis dokumen">
        <Select
          id={`${id}-kind`}
          ref={kindRef}
          value={filters.kind ?? ""}
          onChange={(event) => onChange({ jenis: event.target.value })}
        >
          <option value="">Semua jenis</option>
          {Object.entries(DOCUMENT_KINDS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field id={`${id}-tag`} label="Tag">
        <Select
          id={`${id}-tag`}
          value={filters.tag ?? ""}
          onChange={(event) => {
            const label = tags.find(([key]) => key === event.target.value)?.[1];
            onChange({ tag: label ?? "" });
          }}
        >
          <option value="">Semua tag</option>
          {tags.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
          {missingTag && <option value={missingTag}>{rawTag?.trim()}</option>}
        </Select>
      </Field>
    </div>
  );
}
