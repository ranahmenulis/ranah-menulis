import { accountSession } from "@/features/studio/storage/store";
import { ME_ID } from "@/features/community/fixtures/authors";
import { isUuid } from "@/features/community/storage/remote/row-mapping";
import type { RemoteListSync } from "@/lib/local-list-store";
import type { Cancellation } from "../../cancellation-log";
import type { FeaturedProject } from "../../featured-store";
import type { Testimonial, TestimonialDecision } from "../../kelas/testimonial-model";
import type { ContestResults } from "../../lomba/types";
import type { ProjectFixture } from "../../types";

export const projectsRemoteSync: RemoteListSync<ProjectFixture> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => ({
      slug: r.slug as string,
      category: r.category as ProjectFixture["category"],
      publication: r.publication as ProjectFixture["publication"],
      title: r.title as string,
      summary: (r.summary as string) ?? "",
      about: Array.isArray(r.about) ? (r.about as string[]) : [],
      requirements: Array.isArray(r.requirements) ? (r.requirements as string[]) : [],
      submission: (r.submission_rules as ProjectFixture["submission"]) ?? null,
      organizer: (r.organizer_name as string) ?? "",
      ownerId: r.owner_id === session.userId ? ME_ID : (r.owner_id as string),
      ...(r.terms_updated_at ? { termsUpdatedAt: Date.parse(r.terms_updated_at as string) } : {}),
      timeZone: (r.time_zone as ProjectFixture["timeZone"]) ?? "WIB",
      fee: (r.fee as ProjectFixture["fee"]) ?? {},
      quota: r.quota_total ? { total: Number(r.quota_total), taken: 0 } : null,
      terms: (r.terms as ProjectFixture["terms"]) ?? { version: "v1", special: [] },
      block: r.block as ProjectFixture["block"],
      ...(r.poster ? { poster: r.poster as ProjectFixture["poster"] } : {}),
      closesInMs: null,
      milestones: [],
      absolute: {
        closesAt: r.closes_at ? Date.parse(r.closes_at as string) : null,
        milestones: Array.isArray(r.milestones)
          ? (r.milestones as { label: string; at: number }[])
          : [],
      },
    }));
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    const nextSlugs = new Set(next.map((p) => p.slug));
    for (const p of next) {
      await session.client.from("projects").upsert(
        {
          slug: p.slug,
          category: p.category,
          publication: p.publication,
          title: p.title,
          summary: p.summary,
          about: p.about,
          requirements: p.requirements,
          submission_rules: p.submission,
          organizer_name: p.organizer,
          owner_id: session.userId,
          terms_updated_at: p.termsUpdatedAt ? new Date(p.termsUpdatedAt).toISOString() : null,
          time_zone: p.timeZone,
          fee: p.fee,
          quota_total: p.quota?.total ?? null,
          terms: p.terms,
          block: p.block,
          poster: p.poster ?? null,
          closes_at: p.absolute?.closesAt ? new Date(p.absolute.closesAt).toISOString() : null,
          milestones: p.absolute?.milestones ?? [],
        },
        { onConflict: "slug" },
      );
    }
    for (const old of prev) {
      if (!nextSlugs.has(old.slug)) {
        await session.client.from("projects").delete().eq("slug", old.slug);
      }
    }
  },
};

export const featuredRemoteSync: RemoteListSync<FeaturedProject> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("featured_projects")
      .select("slug,featured_at")
      .order("position", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => ({ slug: r.slug as string, at: Date.parse(r.featured_at as string) }));
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    const nextSlugs = new Set(next.map((f) => f.slug));
    for (let i = 0; i < next.length; i++) {
      await session.client.from("featured_projects").upsert(
        {
          slug: next[i].slug,
          position: i,
          featured_by: session.userId,
          featured_at: new Date(next[i].at).toISOString(),
        },
        { onConflict: "slug" },
      );
    }
    for (const old of prev) {
      if (!nextSlugs.has(old.slug)) {
        await session.client.from("featured_projects").delete().eq("slug", old.slug);
      }
    }
  },
};

export const cancellationsRemoteSync: RemoteListSync<Cancellation> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("registration_cancellations")
      .select("slug,registered_at,cancelled_at,package_name")
      .eq("user_id", session.userId)
      .order("cancelled_at", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => ({
      slug: r.slug as string,
      registeredAt: Date.parse(r.registered_at as string),
      cancelledAt: Date.parse(r.cancelled_at as string),
      ...(r.package_name ? { packageName: r.package_name as string } : {}),
    }));
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    for (const c of next.slice(prev.length)) {
      await session.client.from("registration_cancellations").insert({
        slug: c.slug,
        user_id: session.userId,
        registered_at: new Date(c.registeredAt).toISOString(),
        cancelled_at: new Date(c.cancelledAt).toISOString(),
        package_name: c.packageName ?? null,
      });
    }
  },
};

export const testimonialsRemoteSync: RemoteListSync<Testimonial> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("class_testimonials")
      .select("*")
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id as string,
      slug: r.slug as string,
      authorId: r.author_id === session.userId ? ME_ID : (r.author_id as string),
      name: (r.display_name as string) ?? "",
      text: r.text as string,
      showName: Boolean(r.show_name),
      createdAt: Date.parse(r.created_at as string),
      updatedAt: Date.parse(r.updated_at as string),
    }));
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    const nextIds = new Set(next.map((t) => t.id));
    for (const t of next) {
      if (!isUuid(t.id) || t.authorId !== ME_ID) continue;
      await session.client.from("class_testimonials").upsert(
        {
          id: t.id,
          slug: t.slug,
          author_id: session.userId,
          display_name: t.name,
          text: t.text,
          show_name: t.showName,
        },
        { onConflict: "id" },
      );
    }
    for (const old of prev) {
      if (!nextIds.has(old.id) && isUuid(old.id) && old.authorId === ME_ID) {
        await session.client.from("class_testimonials").delete().eq("id", old.id);
      }
    }
  },
};

export const testimonialDecisionsRemoteSync: RemoteListSync<TestimonialDecision> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client
      .from("testimonial_decisions")
      .select("testimonial_id,state,decided_by,reason,created_at")
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => ({
      testimonialId: r.testimonial_id as string,
      state: r.state as TestimonialDecision["state"],
      by: r.decided_by === session.userId ? ME_ID : (r.decided_by as string),
      at: Date.parse(r.created_at as string),
      ...(r.reason ? { reason: r.reason as string } : {}),
    }));
  },
  async save(next, prev) {
    const session = await accountSession();
    if (!session) return;
    for (const d of next.slice(prev.length)) {
      if (!isUuid(d.testimonialId)) continue;
      await session.client.from("testimonial_decisions").insert({
        testimonial_id: d.testimonialId,
        slug: "",
        state: d.state,
        decided_by: session.userId,
        reason: d.reason ?? null,
      });
    }
  },
};

export const contestResultsRemoteSync: RemoteListSync<ContestResults> = {
  async load() {
    const session = await accountSession();
    if (!session) return null;
    const { data, error } = await session.client.from("contest_results").select("*");
    if (error || !data) return [];
    return data.map((r) => ({
      slug: r.slug as string,
      finalists: Array.isArray(r.finalists) ? (r.finalists as ContestResults["finalists"]) : [],
      winners: Array.isArray(r.winners) ? (r.winners as ContestResults["winners"]) : [],
    }));
  },
  async save(next) {
    const session = await accountSession();
    if (!session) return;
    for (const r of next) {
      await session.client.from("contest_results").upsert(
        {
          slug: r.slug,
          finalists: r.finalists,
          winners: r.winners,
          updated_by: session.userId,
        },
        { onConflict: "slug" },
      );
    }
  },
};
