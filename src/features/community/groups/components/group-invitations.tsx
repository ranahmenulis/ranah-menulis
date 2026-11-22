"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { useActionStatus } from "@/features/kelola/admin/use-action-status";
import { authorOf } from "../../post-model";
import { declineInvite, joinGroup } from "../group-actions";
import { groupMessage } from "../group-messages";
import { groupHref, memberOf, type WritingGroup } from "../group-model";

export function GroupInvitations({
  groups,
  reader,
  variant = "page",
}: {
  groups: readonly WritingGroup[];
  reader: string | null;
  /** "rail" matches the sections of the Beranda side column. */
  variant?: "page" | "rail";
}) {
  const dict = useT().groups;
  const t = dict.invitations;
  const locale = useLocale();
  const { message, statusRef, show } = useActionStatus();
  const [joinedId, setJoinedId] = useState("");
  const joined = groups.find((group) => group.id === joinedId && memberOf(group, reader));
  const invitations = groups.flatMap((group) => {
    const invite = group.invites.find((item) => item.authorId === reader);
    return invite ? [{ group, by: authorOf(invite.by).name }] : [];
  });
  if (!invitations.length && !message) return null;

  return (
    <section
      className={cn(
        "grid gap-2 border-t",
        variant === "rail"
          ? "border-line-strong py-5 first:border-t-0 first:pt-0"
          : "border-line py-4",
      )}
      aria-label={t.label}
    >
      {invitations.length > 0 && (
        <h2 className={variant === "rail" ? "text-sm font-semibold" : "heading-md"}>{t.label}</h2>
      )}
      <p ref={statusRef} role="status" tabIndex={-1} className="text-sm outline-none empty:sr-only">
        {message}
      </p>
      {invitations.length > 0 && (
        <ul className="grid gap-3">
          {invitations.map(({ group, by }) => (
            <li
              key={group.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
            >
              <p className="min-w-0 text-sm wrap-anywhere">
                {format(t.text, { by, group: group.name })}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const result = joinGroup(group.id, { type: "invite" });
                    if (result.ok) setJoinedId(group.id);
                    show(groupMessage(result.code, dict.messages, locale), true);
                  }}
                >
                  {t.accept}
                </Button>
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => {
                    const result = declineInvite(group.id);
                    show(groupMessage(result.code, dict.messages, locale), true);
                  }}
                >
                  {t.decline}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {joined && (
        <TextLink href={groupHref(joined.id)} className="text-sm">
          {joined.name}
        </TextLink>
      )}
    </section>
  );
}
