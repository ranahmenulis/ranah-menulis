import { platformSettings } from "@/lib/platform-settings";
import { isPlatformAdmin } from "@/lib/roles";
import { appendAudit } from "../../audit/audit-log";
import { ME_ID } from "../../identity";
import { readEffectiveRoles } from "../../use-effective-roles";
import type { AdminResult } from "../admin-actions";
import { linkMessage, validateCommunityLink } from "./settings-model";

const REF = "setting:communityLink";
const NOT_ALLOWED = "Hanya Administrator dan Super Admin yang bisa mengubah pengaturan ini.";

/** Roles are read now, at the click. The address itself is not copied into the log. */
export function saveCommunityLink(text: string): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) return { ok: false, message: NOT_ALLOWED };
  const problem = validateCommunityLink(text);
  if (problem) return { ok: false, message: linkMessage[problem] };
  appendAudit([{ action: "setting.communityLink.set", actorId: ME_ID, ref: REF }]);
  platformSettings.write([{ communityLink: text.trim() }]);
  return { ok: true, message: "Tautan komunitas disimpan." };
}

export function clearCommunityLink(): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) return { ok: false, message: NOT_ALLOWED };
  if (platformSettings.read().length === 0) {
    return { ok: false, message: "Tautan komunitas memang belum diatur." };
  }
  appendAudit([{ action: "setting.communityLink.clear", actorId: ME_ID, ref: REF }]);
  platformSettings.write([]);
  return { ok: true, message: "Tautan komunitas dihapus. Bagian itu tidak lagi tampil." };
}
