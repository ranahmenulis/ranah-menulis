-- 0007: Projects & Kelola (Fase 4a): staff roles, account suspensions, staff assignments,
-- projects, featured projects, registrations, cancellations, payment events, submissions,
-- mentor tasks, class assignments & progress, testimonials, Solo progress, jury scores &
-- judging log, contest stages & results, bug reports, platform settings, and Storage buckets
-- (`project-posters`, `project-files`).

-- ============ Management Staff Roles & Account Suspensions ============
create table public.staff_roles (
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null check (role in ('organizer', 'editor', 'mentor', 'juri')),
  granted_by  uuid references auth.users (id) on delete set null,
  reason      text check (reason is null or char_length(reason) <= 1000),
  granted_at  timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.account_suspensions (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  suspended_by  uuid references auth.users (id) on delete set null,
  reason        text not null check (char_length(reason) between 1 and 1000),
  suspended_at  timestamptz not null default now()
);

-- ============ Projects & Featured ============
create table public.projects (
  slug             text primary key check (slug ~ '^[a-z0-9][a-z0-9-]{1,120}$'),
  category         text not null check (category in ('antologi', 'solo', 'kelas', 'lomba')),
  publication      text not null check (publication in ('terbit', 'draf', 'arsip')),
  title            text not null check (char_length(title) between 1 and 160),
  summary          text not null default '' check (char_length(summary) <= 400),
  about            jsonb not null default '[]' check (jsonb_typeof(about) = 'array'),
  requirements     jsonb not null default '[]' check (jsonb_typeof(requirements) = 'array'),
  submission_rules jsonb check (submission_rules is null or jsonb_typeof(submission_rules) = 'object'),
  organizer_name   text not null default '' check (char_length(organizer_name) <= 120),
  owner_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  terms_updated_at timestamptz,
  time_zone        text not null default 'WIB' check (time_zone in ('WIB', 'MYT')),
  fee              jsonb not null default '{}' check (jsonb_typeof(fee) = 'object'),
  quota_total      integer check (quota_total is null or quota_total between 1 and 100000),
  terms            jsonb not null default '{"version":"v1","special":[]}' check (jsonb_typeof(terms) = 'object'),
  block            jsonb not null check (jsonb_typeof(block) = 'object'),
  poster           jsonb check (poster is null or jsonb_typeof(poster) = 'object'),
  closes_at        timestamptz,
  milestones       jsonb not null default '[]' check (jsonb_typeof(milestones) = 'array'),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index projects_owner on public.projects (owner_id);
create index projects_pub on public.projects (publication, category);

create trigger projects_touch
  before update on public.projects
  for each row execute function public.touch_updated_at();

create table public.featured_projects (
  slug         text primary key check (char_length(slug) between 1 and 120),
  position     integer not null default 0,
  featured_by  uuid references auth.users (id) on delete set null,
  featured_at  timestamptz not null default now()
);

-- ============ Project Staff Assignments ============
create table public.staff_assignments (
  project_slug text not null check (char_length(project_slug) between 1 and 120),
  role         text not null check (role in ('editor', 'mentor', 'juri')),
  staff_id     uuid not null references auth.users (id) on delete cascade,
  assigned_by  uuid references auth.users (id) on delete set null,
  assigned_at  timestamptz not null default now(),
  primary key (project_slug, role, staff_id)
);

create index staff_assignments_staff on public.staff_assignments (staff_id, role);

-- ============ Registrations, Cancellations & Payment Events ============
create table public.project_registrations (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null check (char_length(slug) between 1 and 120),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status          text not null check (status in ('menunggu-pembayaran', 'terdaftar')),
  package_name    text check (package_name is null or char_length(package_name) <= 120),
  terms_version   text not null check (char_length(terms_version) between 1 and 40),
  agreed_at       timestamptz not null default now(),
  registered_at   timestamptz not null default now(),
  paid_at         timestamptz,
  paid_by         text check (paid_by is null or paid_by in ('sistem', 'organizer')),
  amount_idr      integer check (amount_idr is null or amount_idr >= 0),
  unique_amount   integer check (unique_amount is null or unique_amount >= 0),
  paymentgt_id    text unique,
  qris_string     text,
  qris_expires_at timestamptz,
  unique (slug, user_id)
);

create index project_registrations_slug on public.project_registrations (slug, status);
create index project_registrations_user on public.project_registrations (user_id);

create table public.registration_cancellations (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null check (char_length(slug) between 1 and 120),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  registered_at timestamptz not null,
  cancelled_at  timestamptz not null default now(),
  package_name  text check (package_name is null or char_length(package_name) <= 120)
);

create table public.payment_events (
  id              bigint generated always as identity primary key,
  registration_id uuid references public.project_registrations (id) on delete set null,
  provider        text not null default 'paymentgt',
  event_type      text not null,
  amount          integer,
  tx_id           text,
  payload         jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

-- ============ Project Submissions (Antologi, Solo, Lomba) ============
create table public.project_submissions (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null check (char_length(slug) between 1 and 120),
  author_id             uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title                 text not null check (char_length(title) between 1 and 120),
  genre                 text not null check (char_length(genre) between 1 and 80),
  note                  text not null default '' check (char_length(note) <= 500),
  synopsis              text check (synopsis is null or char_length(synopsis) <= 1500),
  package_name          text check (package_name is null or char_length(package_name) <= 120),
  originality_agreed_at timestamptz not null default now(),
  doc_id                text not null check (char_length(doc_id) between 1 and 200),
  doc_title             text not null default '' check (char_length(doc_title) <= 200),
  status                text not null check (status in ('terkirim', 'ditinjau', 'perlu-revisi', 'revisi-terkirim', 'diterima', 'ditolak', 'ditarik')),
  status_log            jsonb not null default '[]' check (jsonb_typeof(status_log) = 'array'),
  versions              jsonb not null default '[]' check (jsonb_typeof(versions) = 'array'),
  submitted_at          timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index project_submissions_slug on public.project_submissions (slug, status);
create index project_submissions_author on public.project_submissions (author_id);

create trigger project_submissions_touch
  before update on public.project_submissions
  for each row execute function public.touch_updated_at();

-- ============ Kelas Menulis ============
create table public.mentor_tasks (
  id           text primary key check (char_length(id) between 1 and 120),
  slug         text not null check (char_length(slug) between 1 and 120),
  title        text not null check (char_length(title) between 1 and 160),
  instructions text not null check (char_length(instructions) between 1 and 4000),
  due_date     date not null,
  created_by   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now()
);

create index mentor_tasks_slug on public.mentor_tasks (slug);

create table public.class_assignments (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null check (char_length(slug) between 1 and 120),
  assignment_id text not null check (char_length(assignment_id) between 1 and 120),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  source        text not null check (source in ('studio', 'teks')),
  doc_id        text,
  doc_title     text not null default '' check (char_length(doc_title) <= 200),
  status        text not null check (status in ('dikumpulkan', 'perlu-perbaikan', 'selesai')),
  late          boolean not null default false,
  submitted_at  timestamptz not null default now(),
  versions      jsonb not null default '[]' check (jsonb_typeof(versions) = 'array'),
  status_log    jsonb not null default '[]' check (jsonb_typeof(status_log) = 'array'),
  updated_at    timestamptz not null default now(),
  unique (slug, assignment_id, user_id)
);

create index class_assignments_slug on public.class_assignments (slug, status);

create trigger class_assignments_touch
  before update on public.class_assignments
  for each row execute function public.touch_updated_at();

create table public.class_material_progress (
  slug         text not null check (char_length(slug) between 1 and 120),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  material_id  text not null check (char_length(material_id) between 1 and 120),
  completed_at timestamptz not null default now(),
  primary key (slug, user_id, material_id)
);

create table public.class_testimonials (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null check (char_length(slug) between 1 and 120),
  author_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 120),
  text         text not null check (char_length(text) between 1 and 300),
  show_name    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (slug, author_id)
);

create trigger class_testimonials_touch
  before update on public.class_testimonials
  for each row execute function public.touch_updated_at();

create table public.testimonial_decisions (
  id             bigint generated always as identity primary key,
  testimonial_id uuid not null references public.class_testimonials (id) on delete cascade,
  slug           text not null check (char_length(slug) between 1 and 120),
  state          text not null check (state in ('disembunyikan', 'dipulihkan')),
  decided_by     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reason         text check (reason is null or char_length(reason) <= 1000),
  created_at     timestamptz not null default now()
);

-- ============ Solo Publishing Progress ============
create table public.solo_progress (
  submission_id uuid primary key references public.project_submissions (id) on delete cascade,
  slug          text not null check (char_length(slug) between 1 and 120),
  log           jsonb not null default '[]' check (jsonb_typeof(log) = 'array'),
  files         jsonb not null default '[]' check (jsonb_typeof(files) = 'array'),
  updated_at    timestamptz not null default now()
);

create trigger solo_progress_touch
  before update on public.solo_progress
  for each row execute function public.touch_updated_at();

-- ============ Contest Judging & Results ============
create table public.judging_log (
  id         bigint generated always as identity primary key,
  slug       text not null check (char_length(slug) between 1 and 120),
  state      text not null check (state in ('ditutup', 'dibuka')),
  note       text check (note is null or char_length(note) <= 1000),
  actor_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index judging_log_slug on public.judging_log (slug, created_at desc);

create table public.jury_scores (
  submission_id uuid not null references public.project_submissions (id) on delete cascade,
  slug          text not null check (char_length(slug) between 1 and 120),
  judge_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  scores        jsonb not null default '{}' check (jsonb_typeof(scores) = 'object'),
  note          text not null default '' check (char_length(note) <= 1000),
  scored_at     timestamptz not null default now(),
  primary key (submission_id, judge_id)
);

create index jury_scores_slug on public.jury_scores (slug);

create table public.contest_stages (
  slug       text primary key check (char_length(slug) between 1 and 120),
  stage      text not null check (stage in ('terbuka', 'dinilai', 'finalis', 'pemenang')),
  times      jsonb not null default '{}' check (jsonb_typeof(times) = 'object'),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.contest_results (
  slug       text primary key check (char_length(slug) between 1 and 120),
  finalists  jsonb not null default '[]' check (jsonb_typeof(finalists) = 'array'),
  winners    jsonb not null default '[]' check (jsonb_typeof(winners) = 'array'),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

-- ============ Bug Reports & Platform Settings ============
create table public.bug_reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category    text not null check (category in ('save', 'display', 'feature', 'other')),
  description text not null check (char_length(description) between 1 and 1000),
  steps       text check (steps is null or char_length(steps) <= 600),
  context     jsonb check (context is null or jsonb_typeof(context) = 'object'),
  created_at  timestamptz not null default now()
);

create table public.bug_report_log (
  id         bigint generated always as identity primary key,
  report_id  uuid not null references public.bug_reports (id) on delete cascade,
  status     text not null check (status in ('diproses', 'selesai')),
  actor_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  note       text check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now()
);

create table public.platform_settings (
  key        text primary key check (char_length(key) between 1 and 80),
  value      jsonb not null default '{}',
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

-- ============ Helper Functions (security definer) ============
create function public.is_suspended(p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.account_suspensions
    where user_id = coalesce(p_user, (select auth.uid()))
  );
$$;

create function public.has_staff_role(p_role text, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select not public.is_suspended(coalesce(p_user, (select auth.uid())))
    and exists (
      select 1 from public.staff_roles
      where user_id = coalesce(p_user, (select auth.uid())) and role = p_role
    );
$$;

create function public.is_project_owner(p_slug text, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.projects
    where slug = p_slug and owner_id = coalesce(p_user, (select auth.uid()))
  );
$$;

create function public.can_manage_project(p_slug text, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (public.is_admin() and not public.is_suspended(coalesce(p_user, (select auth.uid()))))
    or (
      public.has_staff_role('organizer', p_user)
      and (
        public.is_project_owner(p_slug, p_user)
        or not exists (select 1 from public.projects where slug = p_slug)
      )
    );
$$;

create function public.is_assigned_staff(p_slug text, p_role text, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.has_staff_role(p_role, p_user)
    and exists (
      select 1 from public.staff_assignments
      where project_slug = p_slug
        and role = p_role
        and staff_id = coalesce(p_user, (select auth.uid()))
    );
$$;

create function public.is_registered_participant(p_slug text, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.project_registrations
    where slug = p_slug
      and user_id = coalesce(p_user, (select auth.uid()))
      and status = 'terdaftar'
  );
$$;

create function public.is_judging_closed(p_slug text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (
      select state = 'ditutup'
      from public.judging_log
      where slug = p_slug
      order by id desc
      limit 1
    ),
    false
  );
$$;

create function public.is_testimonial_hidden(p_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (
      select state = 'disembunyikan'
      from public.testimonial_decisions
      where testimonial_id = p_id
      order by id desc
      limit 1
    ),
    false
  );
$$;

-- ============ Privileged RPCs (role & suspension management, anonymous jury view) ============
create function public.grant_staff_role(p_target uuid, p_role text, p_reason text default null)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
begin
  if not public.is_admin() or public.is_suspended(v_actor) then
    raise exception 'akses ditolak' using errcode = '42501';
  end if;
  if p_role not in ('organizer', 'editor', 'mentor', 'juri') then
    raise exception 'role tidak valid' using errcode = '22023';
  end if;
  insert into public.staff_roles (user_id, role, granted_by, reason)
    values (p_target, p_role, v_actor, nullif(trim(coalesce(p_reason, '')), ''))
    on conflict (user_id, role) do nothing;
  insert into public.audit_log (actor_id, action, target_type, target_id, detail)
    values (v_actor, 'role.grant', 'user', p_target::text,
      jsonb_build_object('role', p_role, 'reason', nullif(trim(coalesce(p_reason, '')), '')));
end;
$$;

create function public.revoke_staff_role(p_target uuid, p_role text, p_reason text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
begin
  if not public.is_admin() or public.is_suspended(v_actor) then
    raise exception 'akses ditolak' using errcode = '42501';
  end if;
  if p_role not in ('organizer', 'editor', 'mentor', 'juri') then
    raise exception 'role tidak valid' using errcode = '22023';
  end if;
  if char_length(trim(coalesce(p_reason, ''))) = 0 then
    raise exception 'alasan wajib diisi' using errcode = '23514';
  end if;
  delete from public.staff_roles where user_id = p_target and role = p_role;
  if p_role in ('editor', 'mentor', 'juri') then
    delete from public.staff_assignments where staff_id = p_target and role = p_role;
  end if;
  insert into public.audit_log (actor_id, action, target_type, target_id, detail)
    values (v_actor, 'role.revoke', 'user', p_target::text,
      jsonb_build_object('role', p_role, 'reason', trim(p_reason)));
end;
$$;

create function public.suspend_account(p_target uuid, p_reason text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_target_admin boolean;
  v_target_super boolean;
  v_active_supers integer;
begin
  if not public.is_admin() or public.is_suspended(v_actor) then
    raise exception 'akses ditolak' using errcode = '42501';
  end if;
  if p_target = v_actor then
    raise exception 'tidak dapat menangguhkan akun sendiri' using errcode = '23514';
  end if;
  if char_length(trim(coalesce(p_reason, ''))) = 0 then
    raise exception 'alasan wajib diisi' using errcode = '23514';
  end if;
  select exists (select 1 from public.platform_roles where user_id = p_target) into v_target_admin;
  if v_target_admin and not public.has_platform_role('super_admin') then
    raise exception 'hanya Super Admin yang dapat menangguhkan tingkat Administrator' using errcode = '42501';
  end if;
  select exists (select 1 from public.platform_roles where user_id = p_target and role = 'super_admin') into v_target_super;
  if v_target_super then
    select count(*) into v_active_supers
      from public.platform_roles pr
      where pr.role = 'super_admin'
        and not exists (select 1 from public.account_suspensions s where s.user_id = pr.user_id);
    if v_active_supers <= 1 then
      raise exception 'tidak dapat menangguhkan Super Admin aktif terakhir' using errcode = '23514';
    end if;
  end if;
  insert into public.account_suspensions (user_id, suspended_by, reason)
    values (p_target, v_actor, trim(p_reason))
    on conflict (user_id) do nothing;
  insert into public.audit_log (actor_id, action, target_type, target_id, detail)
    values (v_actor, 'account.suspend', 'user', p_target::text, jsonb_build_object('reason', trim(p_reason)));
end;
$$;

create function public.restore_account(p_target uuid, p_reason text default null)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_target_admin boolean;
begin
  if not public.is_admin() or public.is_suspended(v_actor) then
    raise exception 'akses ditolak' using errcode = '42501';
  end if;
  select exists (select 1 from public.platform_roles where user_id = p_target) into v_target_admin;
  if v_target_admin and not public.has_platform_role('super_admin') then
    raise exception 'hanya Super Admin yang dapat memulihkan tingkat Administrator' using errcode = '42501';
  end if;
  delete from public.account_suspensions where user_id = p_target;
  insert into public.audit_log (actor_id, action, target_type, target_id, detail)
    values (v_actor, 'account.restore', 'user', p_target::text,
      jsonb_build_object('reason', nullif(trim(coalesce(p_reason, '')), '')));
end;
$$;

-- Anonymous-safe jury view RPC: judges never receive author_id or participant note (BR-PRJ-08, AC-27).
create function public.jury_submissions(p_slug text)
returns table (
  id uuid,
  slug text,
  title text,
  genre text,
  status text,
  versions jsonb,
  submitted_at timestamptz
)
language sql stable security definer set search_path = ''
as $$
  select s.id, s.slug, s.title, s.genre, s.status, s.versions, s.submitted_at
  from public.project_submissions s
  where s.slug = p_slug
    and s.status <> 'ditarik'
    and (
      public.is_assigned_staff(p_slug, 'juri')
      or public.can_manage_project(p_slug)
    );
$$;

-- ============ Enable RLS ============
alter table public.staff_roles                enable row level security;
alter table public.account_suspensions        enable row level security;
alter table public.projects                   enable row level security;
alter table public.featured_projects          enable row level security;
alter table public.staff_assignments          enable row level security;
alter table public.project_registrations      enable row level security;
alter table public.registration_cancellations enable row level security;
alter table public.payment_events             enable row level security;
alter table public.project_submissions        enable row level security;
alter table public.mentor_tasks               enable row level security;
alter table public.class_assignments          enable row level security;
alter table public.class_material_progress    enable row level security;
alter table public.class_testimonials         enable row level security;
alter table public.testimonial_decisions      enable row level security;
alter table public.solo_progress              enable row level security;
alter table public.judging_log                enable row level security;
alter table public.jury_scores                enable row level security;
alter table public.contest_stages             enable row level security;
alter table public.contest_results            enable row level security;
alter table public.bug_reports                enable row level security;
alter table public.bug_report_log             enable row level security;
alter table public.platform_settings          enable row level security;

-- ============ RLS Policies ============
-- staff_roles & account_suspensions (read-only for clients; writes via RPCs)
create policy staff_roles_select on public.staff_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin() or public.has_staff_role('organizer'));

create policy account_suspensions_select on public.account_suspensions
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin() or public.has_staff_role('organizer'));

-- projects
create policy projects_select on public.projects
  for select using (
    publication = 'terbit'
    or owner_id = (select auth.uid())
    or public.is_admin()
    or public.is_assigned_staff(slug, 'editor')
    or public.is_assigned_staff(slug, 'mentor')
    or public.is_assigned_staff(slug, 'juri')
  );
create policy projects_insert on public.projects
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and (public.has_staff_role('organizer') or public.is_admin())
  );
create policy projects_update on public.projects
  for update to authenticated
  using (public.can_manage_project(slug))
  with check (public.can_manage_project(slug));
create policy projects_delete on public.projects
  for delete to authenticated
  using (publication = 'draf' and public.can_manage_project(slug));

-- featured_projects
create policy featured_projects_select on public.featured_projects
  for select using (true);
create policy featured_projects_write on public.featured_projects
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- staff_assignments
create policy staff_assignments_select on public.staff_assignments
  for select to authenticated
  using (staff_id = (select auth.uid()) or public.is_admin() or public.has_staff_role('organizer'));
create policy staff_assignments_insert on public.staff_assignments
  for insert to authenticated
  with check (public.can_manage_project(project_slug));
create policy staff_assignments_delete on public.staff_assignments
  for delete to authenticated
  using (public.can_manage_project(project_slug));

-- project_registrations
create policy project_registrations_select on public.project_registrations
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.can_manage_project(slug)
    or public.is_assigned_staff(slug, 'mentor')
  );
create policy project_registrations_insert on public.project_registrations
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy project_registrations_update on public.project_registrations
  for update to authenticated
  using (user_id = (select auth.uid()) or public.can_manage_project(slug))
  with check (user_id = (select auth.uid()) or public.can_manage_project(slug));
create policy project_registrations_delete on public.project_registrations
  for delete to authenticated
  using (
    (user_id = (select auth.uid()) and (amount_idr is null or amount_idr = 0))
    or public.can_manage_project(slug)
  );

-- registration_cancellations (append-only)
create policy registration_cancellations_select on public.registration_cancellations
  for select to authenticated
  using (user_id = (select auth.uid()) or public.can_manage_project(slug));
create policy registration_cancellations_insert on public.registration_cancellations
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- payment_events (Admin read-only; service role inserts from webhook)
create policy payment_events_select on public.payment_events
  for select to authenticated using (public.is_admin());

-- project_submissions (Juri uses jury_submissions() RPC instead of direct select)
create policy project_submissions_select on public.project_submissions
  for select to authenticated
  using (
    author_id = (select auth.uid())
    or public.can_manage_project(slug)
    or public.is_assigned_staff(slug, 'editor')
  );
create policy project_submissions_insert on public.project_submissions
  for insert to authenticated
  with check (author_id = (select auth.uid()));
create policy project_submissions_update on public.project_submissions
  for update to authenticated
  using (
    author_id = (select auth.uid())
    or public.can_manage_project(slug)
    or public.is_assigned_staff(slug, 'editor')
  )
  with check (
    author_id = (select auth.uid())
    or public.can_manage_project(slug)
    or public.is_assigned_staff(slug, 'editor')
  );

-- mentor_tasks
create policy mentor_tasks_select on public.mentor_tasks
  for select to authenticated
  using (
    public.is_registered_participant(slug)
    or public.is_assigned_staff(slug, 'mentor')
    or public.can_manage_project(slug)
  );
create policy mentor_tasks_insert on public.mentor_tasks
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (public.is_assigned_staff(slug, 'mentor') or public.can_manage_project(slug))
  );
create policy mentor_tasks_update on public.mentor_tasks
  for update to authenticated
  using (public.is_assigned_staff(slug, 'mentor') or public.can_manage_project(slug))
  with check (public.is_assigned_staff(slug, 'mentor') or public.can_manage_project(slug));
create policy mentor_tasks_delete on public.mentor_tasks
  for delete to authenticated
  using (public.is_assigned_staff(slug, 'mentor') or public.can_manage_project(slug));

-- class_assignments
create policy class_assignments_select on public.class_assignments
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_assigned_staff(slug, 'mentor')
    or public.can_manage_project(slug)
  );
create policy class_assignments_insert on public.class_assignments
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy class_assignments_update on public.class_assignments
  for update to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_assigned_staff(slug, 'mentor')
    or public.can_manage_project(slug)
  )
  with check (
    user_id = (select auth.uid())
    or public.is_assigned_staff(slug, 'mentor')
    or public.can_manage_project(slug)
  );

-- class_material_progress
create policy class_material_progress_select on public.class_material_progress
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_assigned_staff(slug, 'mentor')
    or public.can_manage_project(slug)
  );
create policy class_material_progress_insert on public.class_material_progress
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy class_material_progress_delete on public.class_material_progress
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- class_testimonials & testimonial_decisions
create policy class_testimonials_select on public.class_testimonials
  for select using (
    author_id = (select auth.uid())
    or public.can_manage_project(slug)
    or not public.is_testimonial_hidden(id)
  );
create policy class_testimonials_insert on public.class_testimonials
  for insert to authenticated
  with check (author_id = (select auth.uid()));
create policy class_testimonials_update on public.class_testimonials
  for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));
create policy class_testimonials_delete on public.class_testimonials
  for delete to authenticated
  using (author_id = (select auth.uid()));

create policy testimonial_decisions_select on public.testimonial_decisions
  for select to authenticated
  using (public.can_manage_project(slug));
create policy testimonial_decisions_insert on public.testimonial_decisions
  for insert to authenticated
  with check (decided_by = (select auth.uid()) and public.can_manage_project(slug));

-- solo_progress
create policy solo_progress_select on public.solo_progress
  for select to authenticated
  using (
    exists (
      select 1 from public.project_submissions s
      where s.id = submission_id and s.author_id = (select auth.uid())
    )
    or public.can_manage_project(slug)
  );
create policy solo_progress_insert on public.solo_progress
  for insert to authenticated
  with check (
    exists (
      select 1 from public.project_submissions s
      where s.id = submission_id and s.author_id = (select auth.uid())
    )
    or public.can_manage_project(slug)
  );
create policy solo_progress_update on public.solo_progress
  for update to authenticated
  using (
    exists (
      select 1 from public.project_submissions s
      where s.id = submission_id and s.author_id = (select auth.uid())
    )
    or public.can_manage_project(slug)
  )
  with check (
    exists (
      select 1 from public.project_submissions s
      where s.id = submission_id and s.author_id = (select auth.uid())
    )
    or public.can_manage_project(slug)
  );

-- judging_log (append-only)
create policy judging_log_select on public.judging_log
  for select to authenticated
  using (public.is_assigned_staff(slug, 'juri') or public.can_manage_project(slug));
create policy judging_log_insert on public.judging_log
  for insert to authenticated
  with check (
    actor_id = (select auth.uid())
    and (
      (state = 'ditutup' and public.can_manage_project(slug))
      or (state = 'dibuka' and public.is_admin() and char_length(trim(coalesce(note, ''))) >= 1)
    )
  );

-- jury_scores (locked when judging is closed; judge reads only their own)
create policy jury_scores_select on public.jury_scores
  for select to authenticated
  using (judge_id = (select auth.uid()) or public.can_manage_project(slug));
create policy jury_scores_insert on public.jury_scores
  for insert to authenticated
  with check (
    judge_id = (select auth.uid())
    and (public.is_assigned_staff(slug, 'juri') or public.is_admin())
    and not public.is_judging_closed(slug)
  );
create policy jury_scores_update on public.jury_scores
  for update to authenticated
  using (
    judge_id = (select auth.uid())
    and (public.is_assigned_staff(slug, 'juri') or public.is_admin())
    and not public.is_judging_closed(slug)
  )
  with check (
    judge_id = (select auth.uid())
    and (public.is_assigned_staff(slug, 'juri') or public.is_admin())
    and not public.is_judging_closed(slug)
  );

-- contest_stages & contest_results
create policy contest_stages_select on public.contest_stages
  for select using (true);
create policy contest_stages_write on public.contest_stages
  for all to authenticated
  using (public.can_manage_project(slug))
  with check (public.can_manage_project(slug));

create policy contest_results_select on public.contest_results
  for select using (
    public.can_manage_project(slug)
    or exists (
      select 1 from public.contest_stages cs
      where cs.slug = contest_results.slug and cs.stage in ('finalis', 'pemenang')
    )
  );
create policy contest_results_write on public.contest_results
  for all to authenticated
  using (public.can_manage_project(slug))
  with check (public.can_manage_project(slug));

-- bug_reports & bug_report_log
create policy bug_reports_select on public.bug_reports
  for select to authenticated
  using (reporter_id = (select auth.uid()) or public.is_admin());
create policy bug_reports_insert on public.bug_reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));

create policy bug_report_log_select on public.bug_report_log
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.bug_reports r
      where r.id = report_id and r.reporter_id = (select auth.uid())
    )
  );
create policy bug_report_log_insert on public.bug_report_log
  for insert to authenticated
  with check (actor_id = (select auth.uid()) and public.is_admin());

-- platform_settings
create policy platform_settings_select on public.platform_settings
  for select using (true);
create policy platform_settings_write on public.platform_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============ Table & Function Grants ============
grant select on public.projects, public.featured_projects, public.class_testimonials,
  public.contest_stages, public.contest_results, public.platform_settings to anon, authenticated;

grant select on public.staff_roles, public.account_suspensions, public.staff_assignments,
  public.project_registrations, public.registration_cancellations, public.payment_events,
  public.project_submissions, public.mentor_tasks, public.class_assignments,
  public.class_material_progress, public.testimonial_decisions, public.solo_progress,
  public.judging_log, public.jury_scores, public.bug_reports, public.bug_report_log to authenticated;

grant insert, update, delete on public.projects, public.featured_projects, public.project_registrations,
  public.mentor_tasks, public.class_testimonials, public.contest_stages, public.contest_results,
  public.platform_settings to authenticated;
grant insert, delete on public.staff_assignments, public.class_material_progress to authenticated;
grant insert, update on public.project_submissions, public.class_assignments,
  public.solo_progress, public.jury_scores to authenticated;
grant insert on public.registration_cancellations, public.testimonial_decisions,
  public.judging_log, public.bug_reports, public.bug_report_log to authenticated;

revoke execute on function public.grant_staff_role(uuid, text, text) from public, anon;
revoke execute on function public.revoke_staff_role(uuid, text, text) from public, anon;
revoke execute on function public.suspend_account(uuid, text) from public, anon;
revoke execute on function public.restore_account(uuid, text) from public, anon;
revoke execute on function public.jury_submissions(text) from public, anon;

grant execute on function public.grant_staff_role(uuid, text, text) to authenticated;
grant execute on function public.revoke_staff_role(uuid, text, text) to authenticated;
grant execute on function public.suspend_account(uuid, text) to authenticated;
grant execute on function public.restore_account(uuid, text) to authenticated;
grant execute on function public.jury_submissions(text) to authenticated;

-- ============ Storage Buckets: project-posters (public, 2 MB) & project-files (private, 10 MB) ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('project-posters', 'project-posters', true, 2097152, array['image/webp', 'image/jpeg', 'image/png']),
  (
    'project-files',
    'project-files',
    false,
    10485760,
    array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/webp',
      'image/jpeg',
      'image/png'
    ]
  )
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy project_posters_read on storage.objects
  for select using (bucket_id = 'project-posters');

create policy project_posters_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'project-posters'
    and (public.has_staff_role('organizer') or public.is_admin())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy project_posters_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'project-posters'
    and (public.has_staff_role('organizer') or public.is_admin())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'project-posters'
    and (public.has_staff_role('organizer') or public.is_admin())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy project_posters_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'project-posters'
    and (public.has_staff_role('organizer') or public.is_admin())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy project_files_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'project-files'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.is_admin()
      or public.has_staff_role('organizer')
      or public.has_staff_role('editor')
    )
  );

create policy project_files_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy project_files_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy project_files_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
