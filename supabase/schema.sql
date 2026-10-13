-- Nepal Law AI — database schema for Supabase (Postgres).
--
-- This is the shape the app expects. Run it in the Supabase SQL editor for a new
-- project; on an existing project, review it first. It is safe to run more than
-- once: tables are only created if missing, and the policies below are dropped
-- and recreated under these names.

-- ─── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  sources jsonb,
  created_at timestamptz not null default now()
);

create index if not exists conversations_user_id_created_at_idx
  on public.conversations (user_id, created_at desc);

create index if not exists messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at);

-- ─── Row-level security: every row belongs to exactly one user ───────────────
-- Rename and delete in the sidebar need the update/delete policies; without
-- them Postgres silently ignores the change and the app reports an error.

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Users read their conversations" on public.conversations;
create policy "Users read their conversations" on public.conversations
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users create their conversations" on public.conversations;
create policy "Users create their conversations" on public.conversations
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users rename their conversations" on public.conversations;
create policy "Users rename their conversations" on public.conversations
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their conversations" on public.conversations;
create policy "Users delete their conversations" on public.conversations
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users read their messages" on public.messages;
create policy "Users read their messages" on public.messages
  for select to authenticated using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users add messages to their conversations" on public.messages;
create policy "Users add messages to their conversations" on public.messages
  for insert to authenticated with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users delete their messages" on public.messages;
create policy "Users delete their messages" on public.messages
  for delete to authenticated using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );

-- ─── Realtime (optional): keeps the sidebar in sync across tabs and devices ──

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;
end $$;
