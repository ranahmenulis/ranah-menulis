import { accountSession } from "@/features/studio/storage/store";
import { ME_ID } from "@/features/community/fixtures/authors";
import { isUuid } from "@/features/community/storage/remote/row-mapping";
import type { RemoteListSync } from "@/lib/local-list-store";
import type { PlatformSettings } from "@/lib/platform-settings";
import type { BugLogEntry, BugReport } from "@/features/support/bug-report-model";

export const bugReportsRemoteSync: RemoteListSync<BugReport> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("bug_reports")
      .select("*")
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id as string,
      category: r.category as BugReport["category"],
      description: r.description as string,
      ...(r.steps ? { steps: r.steps as string } : {}),
      ...(r.context ? { context: r.context as BugReport["context"] } : {}),
      reporterId: r.reporter_id === session.userId ? ME_ID : (r.reporter_id as string),
      at: Date.parse(r.created_at as string),
    }));
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    for (const r of next.slice(prev.length)) {
      if (!isUuid(r.id)) continue;
      await session.client.from("bug_reports").insert({
        id: r.id,
        reporter_id: session.userId,
        category: r.category,
        description: r.description,
        steps: r.steps ?? null,
        context: r.context ?? null,
      });
    }
  },
};

export const bugReportLogRemoteSync: RemoteListSync<BugLogEntry> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("bug_report_log")
      .select("*")
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => ({
      reportId: r.report_id as string,
      status: r.status as BugLogEntry["status"],
      by: r.actor_id === session.userId ? ME_ID : (r.actor_id as string),
      at: Date.parse(r.created_at as string),
      ...(r.note ? { note: r.note as string } : {}),
    }));
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    for (const e of next.slice(prev.length)) {
      if (!isUuid(e.reportId)) continue;
      await session.client.from("bug_report_log").insert({
        report_id: e.reportId,
        status: e.status,
        actor_id: session.userId,
        note: e.note ?? null,
      });
    }
  },
};

export const platformSettingsRemoteSync: RemoteListSync<PlatformSettings> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("platform_settings")
      .select("value")
      .eq("key", "community_link")
      .maybeSingle();
    if (error || !data) return [];
    const link = (data.value as { communityLink?: unknown } | null)?.communityLink;
    return typeof link === "string" && link ? [{ communityLink: link }] : [];
  },
  async save(next) {
    const session = await accountSession();
    if (!session) return;
    if (next.length === 0) {
      await session.client.from("platform_settings").delete().eq("key", "community_link");
    } else {
      await session.client.from("platform_settings").upsert(
        {
          key: "community_link",
          value: { communityLink: next[0].communityLink },
          updated_by: session.userId,
        },
        { onConflict: "key" },
      );
    }
  },
};
