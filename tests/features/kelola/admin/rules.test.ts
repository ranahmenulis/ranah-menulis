import { describe, expect, it } from "vitest";
import {
  accountChangeBlock,
  activeHolders,
  effectiveRoles,
  needsReason,
  roleChangeBlock,
} from "@/features/kelola/admin/role-rules";
import type { RoleGrant, Suspension } from "@/features/kelola/admin/role-store";

const grant = (userId: string, role: RoleGrant["role"]): RoleGrant => ({
  userId,
  role,
  grantedBy: "x",
  at: 0,
});
const base = {
  actorId: "aku",
  grants: [grant("ana", "super-admin"), grant("budi", "administrator"), grant("cici", "editor")],
  suspensions: [] as Suspension[],
};
const asSuper = { ...base, actorRoles: ["super-admin" as const] };
const asAdmin = { ...base, actorRoles: ["administrator" as const] };

describe("who may change roles", () => {
  it("refuses everyone who is not a platform admin", () => {
    const ctx = { ...base, actorRoles: ["editor" as const], targetId: "dedi" };
    expect(roleChangeBlock(ctx, "editor", "grant")).toBe("bukan-wewenang");
    expect(accountChangeBlock(ctx, "suspend")).toBe("bukan-wewenang");
  });

  it("lets only a Super Admin give or take the Administrator tier (AC-SA2)", () => {
    const ctx = { targetId: "dedi" };
    expect(roleChangeBlock({ ...asAdmin, ...ctx }, "administrator", "grant")).toBe(
      "hanya-super-admin",
    );
    expect(roleChangeBlock({ ...asAdmin, ...ctx }, "super-admin", "grant")).toBe(
      "hanya-super-admin",
    );
    expect(roleChangeBlock({ ...asSuper, ...ctx }, "administrator", "grant")).toBeNull();
  });

  it("lets an Administrator manage the other roles of people below the tier", () => {
    expect(roleChangeBlock({ ...asAdmin, targetId: "cici" }, "juri", "grant")).toBeNull();
    expect(roleChangeBlock({ ...asAdmin, targetId: "cici" }, "editor", "revoke")).toBeNull();
  });

  it("keeps an Administrator away from people who hold the tier", () => {
    expect(roleChangeBlock({ ...asAdmin, targetId: "budi" }, "editor", "grant")).toBe(
      "target-tingkat-administrator",
    );
    expect(accountChangeBlock({ ...asAdmin, targetId: "budi" }, "suspend")).toBe(
      "target-tingkat-administrator",
    );
    expect(roleChangeBlock({ ...asSuper, targetId: "budi" }, "editor", "grant")).toBeNull();
  });

  it("refuses giving a role already held and taking one not held", () => {
    expect(roleChangeBlock({ ...asAdmin, targetId: "cici" }, "editor", "grant")).toBe(
      "sudah-memegang",
    );
    expect(roleChangeBlock({ ...asAdmin, targetId: "cici" }, "juri", "revoke")).toBe(
      "tidak-memegang",
    );
  });

  it("does not let anyone give themselves the Administrator tier (AC-SA1)", () => {
    expect(roleChangeBlock({ ...asSuper, targetId: "aku" }, "administrator", "grant")).toBe(
      "diri-sendiri",
    );
    expect(roleChangeBlock({ ...asSuper, targetId: "aku" }, "super-admin", "grant")).toBe(
      "diri-sendiri",
    );
  });

  it("refuses to remove the last active Super Admin (AC-SA3)", () => {
    expect(roleChangeBlock({ ...asSuper, targetId: "ana" }, "super-admin", "revoke")).toBe(
      "super-admin-terakhir",
    );
    expect(accountChangeBlock({ ...asSuper, targetId: "ana" }, "suspend")).toBe(
      "super-admin-terakhir",
    );
    const two = { ...asSuper, grants: [...base.grants, grant("eka", "super-admin")] };
    expect(roleChangeBlock({ ...two, targetId: "ana" }, "super-admin", "revoke")).toBeNull();
  });

  it("does not count a suspended Super Admin as active", () => {
    const grants = [...base.grants, grant("eka", "super-admin")];
    const suspensions = [{ userId: "eka", by: "x", at: 0, reason: "r" }];
    const ctx = { ...asSuper, grants, suspensions, targetId: "ana" };
    expect(activeHolders(grants, suspensions, "super-admin")).toEqual(["ana"]);
    expect(roleChangeBlock(ctx, "super-admin", "revoke")).toBe("super-admin-terakhir");
  });

  it("suspends and restores only when it changes something, and never your own account", () => {
    expect(accountChangeBlock({ ...asAdmin, targetId: "cici" }, "suspend")).toBeNull();
    expect(accountChangeBlock({ ...asAdmin, targetId: "cici" }, "restore")).toBe(
      "tidak-ditangguhkan",
    );
    expect(accountChangeBlock({ ...asAdmin, targetId: "aku" }, "suspend")).toBe("diri-sendiri");
    const suspensions = [{ userId: "cici", by: "x", at: 0, reason: "r" }];
    const ctx = { ...asAdmin, suspensions, targetId: "cici" };
    expect(accountChangeBlock(ctx, "suspend")).toBe("sudah-ditangguhkan");
    expect(accountChangeBlock(ctx, "restore")).toBeNull();
  });
});

describe("reason and effective roles", () => {
  it("asks for a reason on the Administrator tier and on any removal", () => {
    expect(needsReason("editor", "grant")).toBe(false);
    expect(needsReason("administrator", "grant")).toBe(true);
    expect(needsReason("editor", "revoke")).toBe(true);
    expect(needsReason(null, "suspend")).toBe(true);
    expect(needsReason(null, "restore")).toBe(false);
  });

  it("merges the development roles with the stored ones, and is empty when suspended or signed out", () => {
    const grants = [grant("aku", "juri")];
    expect(effectiveRoles(["editor"], grants, [], "aku", false)).toEqual(["editor", "juri"]);
    expect(effectiveRoles([], [], [], "aku", false)).toEqual([]);
    expect(effectiveRoles(["editor"], grants, [], "aku", true)).toEqual([]);
    const suspensions = [{ userId: "aku", by: "x", at: 0, reason: "r" }];
    expect(effectiveRoles(["editor"], grants, suspensions, "aku", false)).toEqual([]);
  });
});

describe("taking your own tier away", () => {
  it("refuses revoking the Administrator tier from yourself", () => {
    const ctx = {
      ...asSuper,
      targetId: "aku",
      grants: [...base.grants, grant("aku", "administrator")],
    };
    expect(roleChangeBlock(ctx, "administrator", "revoke")).toBe("diri-sendiri");
    expect(
      roleChangeBlock(
        { ...ctx, grants: [...ctx.grants, grant("aku", "editor")] },
        "editor",
        "revoke",
      ),
    ).toBeNull();
  });
});
