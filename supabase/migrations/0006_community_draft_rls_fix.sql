-- 0006: Izinkan draf `community_posts` dengan `visibility is null` saat insert dan update.
drop policy community_posts_insert on public.community_posts;
create policy community_posts_insert on public.community_posts
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (visibility is distinct from 'grup' or public.is_group_member(group_id))
  );

drop policy community_posts_update on public.community_posts;
create policy community_posts_update on public.community_posts
  for update to authenticated
  using (author_id = (select auth.uid()))
  with check (
    author_id = (select auth.uid())
    and (visibility is distinct from 'grup' or public.is_group_member(group_id))
  );
