"use client";

import { Switch } from "@/features/account/components/settings/switch";
import { useT } from "@/lib/i18n/provider";
import { setBoardOptIn } from "../board-actions";
import type { GroupResult } from "../group-actions";
import { memberOf, type WritingGroup } from "../group-model";

/** The member's own switch for the leaderboard: off unless turned on, changeable at any time. */
export function BoardToggle({
  group,
  reader,
  today,
  onResult,
}: {
  group: WritingGroup;
  reader: string;
  today: string;
  onResult: (result: GroupResult) => void;
}) {
  const t = useT().groups.stats;
  const on = memberOf(group, reader)?.board === true;
  return (
    <div className="mt-1 flex flex-col gap-1.5 border-t border-line pt-3">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium">{t.boardLabel}</span>
        <Switch
          label={t.boardLabel}
          checked={on}
          onChange={(next) => onResult(setBoardOptIn(group.id, next, today))}
        />
      </div>
      <p className="text-xs text-ink-muted">{t.boardHint}</p>
    </div>
  );
}
