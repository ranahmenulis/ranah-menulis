import { platformSettings } from "@/lib/platform-settings";
import { isPlatformAdmin } from "@/lib/roles";
import { appendAudit } from "../../audit/audit-log";
import { ME_ID } from "../../identity";
import { readEffectiveRoles } from "../../use-effective-roles";
import { done, refuse, type AdminResult } from "../admin-actions";
import { LINK_CODES, validateCommunityLink } from "./settings-model";

const REF = "setting:communityLink";

/** Roles are read now, at the click. The address itself is not copied into the log. */
export function saveCommunityLink(text: string): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) return refuse("settingsNotAllowed");
  const problem = validateCommunityLink(text);
  if (problem) return refuse(...LINK_CODES[problem]);
  appendAudit([{ action: "setting.communityLink.set", actorId: ME_ID, ref: REF }]);
  platformSettings.write([{ communityLink: text.trim() }]);
  return done("linkSaved");
}

export function clearCommunityLink(): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) return refuse("settingsNotAllowed");
  if (platformSettings.read().length === 0) {
    return refuse("linkNotSet");
  }
  appendAudit([{ action: "setting.communityLink.clear", actorId: ME_ID, ref: REF }]);
  platformSettings.write([]);
  return done("linkCleared");
}
