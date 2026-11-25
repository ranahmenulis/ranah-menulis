"use client";

import { Button } from "@/components/ui/button";
import { personLabel } from "@/features/kelola/admin/people";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import type { GroupResult } from "@/features/community/groups/group-actions";
import type { WritingGroup } from "@/features/community/groups/group-model";
import { answerJoinRequest } from "@/features/community/groups/join-requests";

/** Pending requests to join a private circle, each with Accept and Decline for the Circle Admin. */
export function JoinRequestList({
  group,
  onResult,
}: {
  group: WritingGroup;
  onResult: (result: GroupResult, focus?: boolean) => void;
}) {
  const t = useT().groups.manage;
  const locale = useLocale();
  const requests = group.requests ?? [];
  if (requests.length === 0) return null;
  return (
    <div className="grid gap-1">
      <p className="text-sm font-medium">{t.requestsTitle}</p>
      <ul className="divide-y divide-line border-y border-line">
        {requests.map((request) => {
          const name = personLabel(request.authorId, locale);
          return (
            <li
              key={request.authorId}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <p className="min-w-0 text-sm wrap-anywhere">{name}</p>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label={format(t.requestAcceptAria, { name })}
                  onClick={() =>
                    onResult(answerJoinRequest(group.id, request.authorId, true), true)
                  }
                >
                  {t.requestAccept}
                </Button>
                <Button
                  variant="danger-text"
                  size="sm"
                  aria-label={format(t.requestDeclineAria, { name })}
                  onClick={() =>
                    onResult(answerJoinRequest(group.id, request.authorId, false), true)
                  }
                >
                  {t.requestDecline}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
