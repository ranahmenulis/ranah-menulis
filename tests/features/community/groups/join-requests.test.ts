import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { ME_ID } from "@/features/kelola/identity";
import { joinByCode, removeGroupMember } from "@/features/community/groups/group-actions";
import { COASTAL_GROUP_ID, memberOf } from "@/features/community/groups/group-model";
import { writingGroups } from "@/features/community/groups/group-store";
import { answerJoinRequest } from "@/features/community/groups/join-requests";

const group = (id: string) => writingGroups.read().find((g) => g.id === id)!;
const reset = () => {
  sessionStorage.clear();
  writingGroups.reset();
  auditLog.reset();
};
beforeEach(reset);
afterEach(reset);

// The reader leaves the private circle, then asks to come back through its code.
function ask() {
  removeGroupMember(COASTAL_GROUP_ID, ME_ID);
  return joinByCode(group(COASTAL_GROUP_ID).code);
}

describe("join requests on a private circle", () => {
  it("turns a valid code into a request, once", () => {
    expect(ask()).toMatchObject({ ok: true, code: "requestSent" });
    joinByCode(group(COASTAL_GROUP_ID).code);
    expect(group(COASTAL_GROUP_ID).requests).toHaveLength(1);
    expect(memberOf(group(COASTAL_GROUP_ID), ME_ID)).toBeUndefined();
  });

  it("is answered by a platform admin: accept adds a member and audits it", () => {
    ask();
    sessionStorage.setItem("rm-roles", "administrator");
    expect(answerJoinRequest(COASTAL_GROUP_ID, ME_ID, true).code).toBe("requestAccepted");
    expect(memberOf(group(COASTAL_GROUP_ID), ME_ID)).toBeDefined();
    expect(group(COASTAL_GROUP_ID).requests).toEqual([]);
    expect(auditLog.read().some((e) => e.action === "group.request.accept")).toBe(true);
  });

  it("decline removes the request without adding anyone", () => {
    ask();
    sessionStorage.setItem("rm-roles", "administrator");
    expect(answerJoinRequest(COASTAL_GROUP_ID, ME_ID, false).code).toBe("requestDeclined");
    expect(memberOf(group(COASTAL_GROUP_ID), ME_ID)).toBeUndefined();
    expect(auditLog.read().some((e) => e.action === "group.request.decline")).toBe(true);
  });

  it("refuses a request that is gone, and a reader who may not manage the circle", () => {
    sessionStorage.setItem("rm-roles", "administrator");
    expect(answerJoinRequest(COASTAL_GROUP_ID, "nur-aisyah", true).code).toBe("requestGone");
    sessionStorage.clear();
    ask();
    expect(answerJoinRequest(COASTAL_GROUP_ID, ME_ID, true).code).toBe("blocked");
  });
});
