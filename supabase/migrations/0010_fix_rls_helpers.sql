-- 0010: Fix RLS policy evaluation for anon SELECT policies and security-definer slug-match checks.

-- 1. Helper functions referenced by public SELECT policies must be executable by `anon`
-- (they still return false whenever auth.uid() is null or p_user <> auth.uid() for non-admins).
grant execute on function
  public.is_suspended(uuid),
  public.has_staff_role(text, uuid),
  public.is_project_owner(text, uuid),
  public.can_manage_project(text, uuid),
  public.is_assigned_staff(text, text, uuid),
  public.is_registered_participant(text, uuid),
  public.has_group_invite(uuid, uuid)
  to anon, authenticated;

-- 2. Security-definer boolean checks for parent slug matching so judges/staff without direct
-- SELECT on `project_submissions` can still pass the cross-slug guard in RLS.
create or replace function public.submission_matches_slug(p_submission uuid, p_slug text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.project_submissions
    where id = p_submission and slug = p_slug
  );
$$;

create or replace function public.testimonial_matches_slug(p_testimonial uuid, p_slug text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.class_testimonials
    where id = p_testimonial and slug = p_slug
  );
$$;

grant execute on function public.submission_matches_slug(uuid, text) to authenticated;
grant execute on function public.testimonial_matches_slug(uuid, text) to authenticated;

drop policy if exists jury_scores_insert on public.jury_scores;
create policy jury_scores_insert on public.jury_scores
  for insert to authenticated
  with check (
    judge_id = (select auth.uid())
    and (public.is_assigned_staff(slug, 'juri') or public.is_admin())
    and not public.is_judging_closed(slug)
    and public.submission_matches_slug(submission_id, slug)
  );

drop policy if exists jury_scores_update on public.jury_scores;
create policy jury_scores_update on public.jury_scores
  for update to authenticated
  using (
    judge_id = (select auth.uid())
    and (public.is_assigned_staff(slug, 'juri') or public.is_admin())
    and not public.is_judging_closed(slug)
    and public.submission_matches_slug(submission_id, slug)
  )
  with check (
    judge_id = (select auth.uid())
    and (public.is_assigned_staff(slug, 'juri') or public.is_admin())
    and not public.is_judging_closed(slug)
    and public.submission_matches_slug(submission_id, slug)
  );

drop policy if exists solo_progress_insert on public.solo_progress;
create policy solo_progress_insert on public.solo_progress
  for insert to authenticated
  with check (
    public.submission_matches_slug(submission_id, slug)
    and (
      public.can_manage_project(slug)
      or exists (
        select 1 from public.project_submissions s
        where s.id = submission_id and s.author_id = (select auth.uid())
      )
    )
  );

drop policy if exists solo_progress_update on public.solo_progress;
create policy solo_progress_update on public.solo_progress
  for update to authenticated
  using (
    public.submission_matches_slug(submission_id, slug)
    and (
      public.can_manage_project(slug)
      or exists (
        select 1 from public.project_submissions s
        where s.id = submission_id and s.author_id = (select auth.uid())
      )
    )
  )
  with check (
    public.submission_matches_slug(submission_id, slug)
    and (
      public.can_manage_project(slug)
      or exists (
        select 1 from public.project_submissions s
        where s.id = submission_id and s.author_id = (select auth.uid())
      )
    )
  );

drop policy if exists testimonial_decisions_insert on public.testimonial_decisions;
create policy testimonial_decisions_insert on public.testimonial_decisions
  for insert to authenticated
  with check (
    decided_by = (select auth.uid())
    and public.can_manage_project(slug)
    and public.testimonial_matches_slug(testimonial_id, slug)
  );
