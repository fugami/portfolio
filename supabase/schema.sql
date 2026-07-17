-- ===========================================================================
-- Supabase schema for the portfolio site.
-- Run this in the Supabase SQL editor when you're ready to move off the local
-- JSON store. Then set the env vars from .env.local.example and the app will
-- read/write Supabase automatically — no code changes needed.
-- ===========================================================================

create table if not exists public.projects (
  id           text primary key,
  date         date not null,
  title        text not null,
  type         text not null default '',  -- medium, e.g. "Film", "YouTube Video"
  role         text not null default '',  -- credit, e.g. "Director", "Editor"
  client       text not null default '',
  featured     boolean not null default false,
  link_type    text not null default 'page' check (link_type in ('external','page')),
  external_url text,
  slug         text unique,
  cover_image  text,
  content      text,
  published    boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.roles (
  id          text primary key,
  start_year  int not null,
  end_year    int,                 -- null = present
  org         text not null,
  role        text not null default '',
  details     text,
  created_at  timestamptz not null default now()
);

create index if not exists projects_date_idx on public.projects (date desc);
create index if not exists roles_start_year_idx on public.roles (start_year desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public site reads published projects + all roles with the anon key.
-- Writes go through the service-role key (server-side), which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.roles enable row level security;

drop policy if exists "public read published projects" on public.projects;
create policy "public read published projects"
  on public.projects for select
  using (published = true);

drop policy if exists "public read roles" on public.roles;
create policy "public read roles"
  on public.roles for select
  using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for cover/inline images (public read).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public read media" on storage.objects;
create policy "public read media"
  on storage.objects for select
  using (bucket_id = 'media');
