"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Chip } from "@/components/ui/chip";
import { Field, Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { useT } from "@/lib/i18n/provider";
import { MANAGER_ROLES } from "@/lib/roles";
import { ADMIN_HREF, userHref } from "../area-hrefs";
import { useAdminUsers } from "../use-admin-data";
import { filterUsers, parseRoleFilter, usersQuery, type RoleFilter } from "../user-model";

/**
 * Admin: users and roles (PLT-05). Search and the role filter live in the address so a view can be
 * linked. Who may change what is decided on the person's own screen.
 */
export function UsersView() {
  const copy = useT().kelolaAdmin;
  const t = copy.users;
  const rows = useAdminUsers();
  const params = useSearchParams();
  const askedRole = params?.get("peran") ?? null;
  // The text is only read from the address when the screen opens: while typing, the address lags
  // behind the box and would overwrite fast keystrokes. The role filter is one click, so it syncs.
  const [q, setQ] = useState(() => params?.get("q") ?? "");
  const [role, setRole] = useState<RoleFilter>(() => parseRoleFilter(askedRole));
  const [seen, setSeen] = useState(askedRole);
  // The address is the source of truth for the role: Next keeps the previous page mounted.
  if (seen !== askedRole) {
    setSeen(askedRole);
    setRole(parseRoleFilter(askedRole));
  }
  function change(nextQ: string, nextRole: RoleFilter) {
    setQ(nextQ);
    setRole(nextRole);
    window.history.replaceState(null, "", `${ADMIN_HREF}${usersQuery(nextQ, nextRole)}`);
  }

  const shown = useMemo(() => filterUsers(rows, q, role), [rows, q, role]);

  return (
    <section aria-labelledby="pengguna-title" className="grid gap-5">
      <div className="grid gap-1">
        <h1 id="pengguna-title" className="heading-lg">
          {t.title}
        </h1>
        <p className="text-sm text-ink-muted">{t.intro}</p>
      </div>
      <Field id="cari-pengguna" label={t.searchLabel}>
        <Input
          id="cari-pengguna"
          type="search"
          value={q}
          placeholder={t.searchPlaceholder}
          onChange={(e) => change(e.target.value, role)}
        />
      </Field>
      <div role="group" aria-label={t.filterLabel} className="flex flex-wrap gap-2">
        <Chip pressed={role === "semua"} onClick={() => change(q, "semua")}>
          {t.all}
        </Chip>
        {MANAGER_ROLES.map((r) => (
          <Chip key={r} pressed={role === r} onClick={() => change(q, r)}>
            {copy.roles[r]}
          </Chip>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState>{t.none}</EmptyState>
      ) : (
        <ul aria-label={t.listLabel} className="border-t border-line">
          {shown.map((u) => (
            <li key={u.id} className="border-b border-line">
              <Link
                href={userHref(u.id)}
                className="grid gap-0.5 py-3 no-underline hover:bg-subtle"
              >
                <span className="font-medium wrap-anywhere text-ink">
                  {u.name}
                  {u.suspended && (
                    <span className="font-normal text-ink-muted"> · {t.suspendedTag}</span>
                  )}
                </span>
                <span className="text-xs text-ink-muted">
                  @{u.handle} ·{" "}
                  {u.roles.length === 0 ? t.noRole : u.roles.map((r) => copy.roles[r]).join(", ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
