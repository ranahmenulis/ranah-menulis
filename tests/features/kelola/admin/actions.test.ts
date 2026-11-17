import { beforeEach, describe, expect, it } from "vitest";
import {
  grantRole,
  restoreUser,
  revokeRole,
  suspendUser,
} from "@/features/kelola/admin/admin-actions";
import { roleGrants, suspensions, SEED_GRANTS } from "@/features/kelola/admin/role-store";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { ME_ID, canonicalId, isSelf } from "@/features/kelola/identity";
import {
  SEED_ASSIGNMENTS,
  assigneesOf,
  isAssignedToSelf,
  setAssignees,
  staffAssignments,
} from "@/features/kelola/staff-assignments";
import { readEffectiveRoles } from "@/features/kelola/use-effective-roles";

const SLUG = "antologi-pulang-ke-pesisir";
const as = (roles: string) => sessionStorage.setItem("rm-roles", roles);

beforeEach(() => {
  sessionStorage.clear();
  roleGrants.reset();
  suspensions.reset();
  auditLog.reset();
  staffAssignments.reset();
});

describe("giving and taking roles", () => {
  it("refuses a Administrator giving the Administrator role, and writes nothing (AC-SA2)", () => {
    as("administrator");
    const result = grantRole("laras", "administrator", "alasan");
    expect(result.ok).toBe(false);
    expect(roleGrants.read()).toEqual(SEED_GRANTS);
    expect(auditLog.read()).toHaveLength(0);
  });

  it("lets a Super Admin give it, and logs who, to whom and when", () => {
    as("super-admin");
    expect(grantRole("laras", "administrator", "Tim baru").ok).toBe(true);
    expect(roleGrants.read().some((g) => g.userId === "laras" && g.role === "administrator")).toBe(
      true,
    );
    expect(auditLog.read()).toMatchObject([
      { action: "role.grant", actorId: ME_ID, targetId: "laras", role: "administrator" },
    ]);
    expect(auditLog.read()[0].at).toBeGreaterThan(0);
  });

  it("asks for a reason on the Administrator tier but not on an Editor", () => {
    as("super-admin");
    expect(grantRole("laras", "administrator").ok).toBe(false);
    expect(grantRole("laras", "editor").ok).toBe(true);
  });

  it("refuses everyone who is not a platform admin, and anyone signed out", () => {
    as("editor");
    expect(grantRole("laras", "editor").ok).toBe(false);
    sessionStorage.clear();
    expect(grantRole("laras", "editor").ok).toBe(false);
  });

  it("refuses to take the last Super Admin, then allows it once there are two (AC-SA3)", () => {
    as("super-admin");
    expect(revokeRole("nur-aisyah", "super-admin", "Selesai").ok).toBe(false);
    expect(grantRole("laras", "super-admin", "Cadangan").ok).toBe(true);
    expect(revokeRole("nur-aisyah", "super-admin", "Selesai").ok).toBe(true);
    expect(suspendUser("laras", "Uji").ok).toBe(false);
  });

  it("requires a reason to revoke, and takes the person's assignments with the role", () => {
    as("administrator");
    setAssignees(SLUG, "editor", ["hafiz-rahman"]);
    auditLog.reset();
    expect(revokeRole("hafiz-rahman", "editor", "").ok).toBe(false);
    const result = revokeRole("hafiz-rahman", "editor", "Pindah tugas");
    expect(result).toMatchObject({ ok: true });
    expect(result.message).toContain("1 penugasan");
    expect(assigneesOf(staffAssignments.read(), SLUG, "editor")).not.toContain("hafiz-rahman");
    expect(auditLog.read().map((e) => e.action)).toEqual(["role.revoke", "staff.unassign"]);
    expect(auditLog.read()[1]).toMatchObject({ slug: SLUG, targetId: "hafiz-rahman" });
  });

  it("does not let you give yourself the Administrator tier", () => {
    as("super-admin");
    expect(grantRole(ME_ID, "administrator", "Aku").ok).toBe(false);
  });

  it("reports an unknown person", () => {
    as("super-admin");
    expect(grantRole("tidak-ada", "editor")).toMatchObject({ ok: false });
  });
});

describe("suspending accounts", () => {
  it("needs a reason, marks the person, and can be undone", () => {
    as("administrator");
    expect(suspendUser("hafiz-rahman", "").ok).toBe(false);
    expect(suspendUser("hafiz-rahman", "Laporan berulang").ok).toBe(true);
    expect(suspensions.read()).toHaveLength(1);
    expect(restoreUser("hafiz-rahman").ok).toBe(true);
    expect(suspensions.read()).toHaveLength(0);
    expect(auditLog.read().map((e) => e.action)).toEqual(["account.suspend", "account.restore"]);
  });

  it("will not suspend your own account", () => {
    as("super-admin");
    expect(suspendUser(ME_ID, "Uji").ok).toBe(false);
  });

  it("ends the roles of the signed-in account while it is suspended", () => {
    roleGrants.write([...SEED_GRANTS, { userId: ME_ID, role: "editor", grantedBy: "x", at: 1 }]);
    expect(readEffectiveRoles()).toEqual(["editor"]);
    suspensions.write([{ userId: ME_ID, by: "x", at: 1, reason: "r" }]);
    expect(readEffectiveRoles()).toEqual([]);
  });
});

describe("the dummy account across the old and new ids", () => {
  it("reads the old per-role ids as the account", () => {
    expect(canonicalId("editor-kamu")).toBe(ME_ID);
    expect(canonicalId("hafiz-rahman")).toBe("hafiz-rahman");
    expect(isSelf("juri-kamu")).toBe(true);
    staffAssignments.write([{ slug: SLUG, role: "editor", staffId: "editor-kamu" }]);
    expect(isAssignedToSelf(staffAssignments.read(), SLUG, "editor")).toBe(true);
    expect(assigneesOf(staffAssignments.read(), SLUG, "editor")).toEqual([ME_ID]);
  });

  it("seeds the first assignments on the account", () => {
    expect(SEED_ASSIGNMENTS.every((a) => a.staffId === ME_ID)).toBe(true);
  });

  it("logs a change of assignment with the project", () => {
    setAssignees("proyek-uji", "editor", ["hafiz-rahman"]);
    setAssignees("proyek-uji", "editor", []);
    expect(auditLog.read().map((e) => [e.action, e.targetId, e.slug])).toEqual([
      ["staff.assign", "hafiz-rahman", "proyek-uji"],
      ["staff.unassign", "hafiz-rahman", "proyek-uji"],
    ]);
  });
});
