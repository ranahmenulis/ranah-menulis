"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/field";
import { useFormat } from "@/lib/i18n/use-format";
import { format, useT } from "@/lib/i18n/provider";
import {
  DEFAULT_LAYOUT,
  LAYOUT_LINE_SPACINGS,
  MARGIN_MAX_MM,
  MARGIN_MIN_MM,
  MARGIN_STEP_MM,
  sameLayout,
  type DocumentLayout,
} from "../document-layout";

const MARGINS = Array.from(
  { length: (MARGIN_MAX_MM - MARGIN_MIN_MM) / MARGIN_STEP_MM + 1 },
  (_, i) => MARGIN_MIN_MM + i * MARGIN_STEP_MM,
);

type Props = {
  open: boolean;
  onClose: () => void;
  layout: DocumentLayout;
  onChange: (next: DocumentLayout) => void;
};

/**
 * Page layout of one document: margin and line spacing. Font and size live in the format toolbar.
 * A change applies at once (the writer sees it behind the dialog), so there is nothing to confirm.
 */
export function PageLayoutDialog({ open, onClose, layout, onChange }: Props) {
  const t = useT().studioLayout;
  const fmt = useFormat();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      swipeToDismiss
      title={t.pageLayout.title}
      description={t.pageLayout.description}
      actions={
        <>
          <Button
            variant="text"
            disabled={sameLayout(layout, DEFAULT_LAYOUT)}
            onClick={() => onChange(DEFAULT_LAYOUT)}
          >
            {t.pageLayout.reset}
          </Button>
          <Button onClick={onClose}>{t.pageLayout.done}</Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field id="layout-margin" label={t.pageLayout.margin}>
          <Select
            id="layout-margin"
            value={String(layout.marginMm)}
            onChange={(e) => onChange({ ...layout, marginMm: Number(e.target.value) })}
          >
            {MARGINS.map((n) => (
              <option key={n} value={n}>
                {format(t.pageLayout.marginOption, { n: String(n) })}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="layout-spacing" label={t.pageLayout.lineSpacing}>
          <Select
            id="layout-spacing"
            value={String(layout.lineSpacing)}
            onChange={(e) =>
              onChange({
                ...layout,
                lineSpacing: Number(e.target.value) as DocumentLayout["lineSpacing"],
              })
            }
          >
            {LAYOUT_LINE_SPACINGS.map((n) => (
              <option key={n} value={n}>
                {fmt.number(n)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Dialog>
  );
}
