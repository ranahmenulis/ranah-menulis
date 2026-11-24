"use client";

import type { RefObject } from "react";
import { Field, Input, Select, describedBy } from "@/components/ui/field";
import { format, useT } from "@/lib/i18n/provider";
import { challengeEnd, isDay } from "../board-model";
import type { GroupInput, WritingGroup } from "../group-model";

/** Type and start day of a circle: chosen when it is created, only shown as fixed afterwards. */
export function KindFields({
  group,
  input,
  onChange,
  ids,
  startRef,
  error,
}: {
  group?: WritingGroup;
  input: GroupInput;
  onChange: (input: GroupInput) => void;
  ids: { kind: string; start: string };
  startRef: RefObject<HTMLInputElement | null>;
  error?: string;
}) {
  const dict = useT().groups;
  const t = dict.dialogs;
  const setInput = onChange;
  const kindId = ids.kind;
  const startId = ids.start;
  const start = startRef;
  const startError = error;
  return (
    <>
      {group ? (
        <p className="text-sm text-ink-muted">
          {dict.hero.kinds[group.kind ?? "permanent"]}. {t.kindLocked}
        </p>
      ) : (
        <>
          <Field id={kindId} label={t.kindLabel}>
            <Select
              id={kindId}
              value={input.kind}
              onChange={(event) =>
                setInput({
                  ...input,
                  kind: event.target.value === "challenge" ? "challenge" : "permanent",
                })
              }
            >
              <option value="permanent">{t.kindPermanent}</option>
              <option value="challenge">{t.kindChallenge}</option>
            </Select>
          </Field>
          {input.kind === "challenge" && (
            <Field
              id={startId}
              label={t.startLabel}
              hint={
                input.startsOn && isDay(input.startsOn)
                  ? format(t.endsHint, { end: challengeEnd(input.startsOn) })
                  : undefined
              }
              error={startError}
            >
              <Input
                id={startId}
                ref={start}
                type="date"
                value={input.startsOn ?? ""}
                onChange={(event) => setInput({ ...input, startsOn: event.target.value })}
                aria-invalid={Boolean(startError)}
                aria-describedby={describedBy(startId, {
                  hint: Boolean(input.startsOn),
                  error: startError,
                })}
              />
            </Field>
          )}
        </>
      )}
    </>
  );
}
