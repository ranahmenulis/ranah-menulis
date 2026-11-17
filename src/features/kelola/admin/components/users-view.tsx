"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Chip } from "@/components/ui/chip";
import { Field, Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { MANAGER_ROLES, roleLabel } from "@/lib/roles";
import { ADMIN_HREF, userHref } from "../area-hrefs";
import { useAdminUsers } from "../use-admin-data";
import { filterUsers, parseRoleFilter, usersQuery, type RoleFilter } from "../user-model";

/**
 * Admin: users and roles (PLT-05). Search and the role filter live in the address so a view can be
 * linked. Who may change what is decided on the person's own screen.
 */
export function UsersView() {
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
          Pengguna dan role
        </h1>
        <p className="text-sm text-ink-muted">
          Beri atau cabut role, dan tangguhkan akun. Setiap perubahan dicatat.
        </p>
      </div>
      <Field id="cari-pengguna" label="Cari pengguna">
        <Input
          id="cari-pengguna"
          type="search"
          value={q}
          placeholder="Nama atau nama pengguna"
          onChange={(e) => change(e.target.value, role)}
        />
      </Field>
      <div role="group" aria-label="Saring menurut role" className="flex flex-wrap gap-2">
        <Chip pressed={role === "semua"} onClick={() => change(q, "semua")}>
          Semua
        </Chip>
        {MANAGER_ROLES.map((r) => (
          <Chip key={r} pressed={role === r} onClick={() => change(q, r)}>
            {roleLabel[r]}
          </Chip>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState>Tidak ada pengguna yang cocok.</EmptyState>
      ) : (
        <ul aria-label="Pengguna" className="border-t border-line">
          {shown.map((u) => (
            <li key={u.id} className="border-b border-line">
              <Link
                href={userHref(u.id)}
                className="grid gap-0.5 py-3 no-underline hover:bg-subtle"
              >
                <span className="font-medium wrap-anywhere text-ink">
                  {u.name}
                  {u.suspended && (
                    <span className="font-normal text-ink-muted"> · Ditangguhkan</span>
                  )}
                </span>
                <span className="text-xs text-ink-muted">
                  @{u.handle} ·{" "}
                  {u.roles.length === 0
                    ? "Tanpa role"
                    : u.roles.map((r) => roleLabel[r]).join(", ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
