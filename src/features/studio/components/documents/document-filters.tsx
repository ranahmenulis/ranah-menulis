"use client";

import { useSearchParams } from "next/navigation";
import { useId, useMemo, type Ref } from "react";
import { Field, Select } from "@/components/ui/field";
import { useT } from "@/lib/i18n/provider";
import { parseKind, parseTag, type DocumentFilters } from "../../document-classification";

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
  const t = useT().studioDocuments;
  const missingTag = tags.some(([key]) => key === filters.tag) ? null : filters.tag;

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-md lg:w-md lg:shrink-0 [&_label]:sr-only">
      <Field id={`${id}-kind`} label={t.filters.kind}>
        <Select
          id={`${id}-kind`}
          ref={kindRef}
          value={filters.kind ?? ""}
          onChange={(event) => onChange({ jenis: event.target.value })}
        >
          <option value="">{t.filters.allKinds}</option>
          {Object.entries(t.kinds).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field id={`${id}-tag`} label={t.filters.tag}>
        <Select
          id={`${id}-tag`}
          value={filters.tag ?? ""}
          onChange={(event) => {
            const label = tags.find(([key]) => key === event.target.value)?.[1];
            onChange({ tag: label ?? "" });
          }}
        >
          <option value="">{t.filters.allTags}</option>
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
