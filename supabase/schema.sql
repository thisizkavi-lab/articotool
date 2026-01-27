
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. SESSIONS TABLE
create table sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  video_id text not null,
  created_at bigint not null, -- Storing JS timestamp for simplicity with existing code
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table sessions enable row level security;
create policy "Users can view own sessions" on sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on sessions for update using (auth.uid() = user_id);
create policy "Users can delete own sessions" on sessions for delete using (auth.uid() = user_id);

-- 2. SEGMENTS TABLE (Linked to Sessions)
create table segments (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references sessions(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  start_time double precision not null,
  end_time double precision not null,
  text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table segments enable row level security;
create policy "Users can view own segments" on segments for select using (auth.uid() = user_id);
create policy "Users can insert own segments" on segments for insert with check (auth.uid() = user_id);
create policy "Users can update own segments" on segments for update using (auth.uid() = user_id);
create policy "Users can delete own segments" on segments for delete using (auth.uid() = user_id);

-- 3. LIBRARY GROUPS TABLE
create table library_groups (
  id text primary key, -- Keeping text ID to match existing logic (or UUID if preferred, but existing code uses strings like 'group-123')
  user_id uuid references auth.users not null,
  name text not null,
  emoji text,
  created_at bigint not null,
  updated_at bigint not null
);
alter table library_groups enable row level security;
create policy "Users can view own groups" on library_groups for select using (auth.uid() = user_id);
create policy "Users can insert own groups" on library_groups for insert with check (auth.uid() = user_id);
create policy "Users can update own groups" on library_groups for update using (auth.uid() = user_id);
create policy "Users can delete own groups" on library_groups for delete using (auth.uid() = user_id);

-- 4. LIBRARY VIDEOS TABLE
create table library_videos (
  id text not null, -- video_id from YouTube
  group_id text references library_groups(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  title text not null,
  channel_name text,
  thumbnail text,
  duration text,
  transcript jsonb, -- Storing full transcript as JSON
  segments jsonb default '[]'::jsonb, -- Storing library segments as JSON
  created_at bigint not null,
  
  primary key (group_id, id) -- Composite primary key? Or just UUID. Let's use simple PK.
);
-- Actually, let's make a unique ID for the row, but enforce uniqueness of video in group
-- Altering to use a surrogate key for easier management
alter table library_videos drop constraint if exists library_videos_pkey;
alter table library_videos add column row_id uuid default uuid_generate_v4() primary key;

alter table library_videos enable row level security;
create policy "Users can view own videos" on library_videos for select using (auth.uid() = user_id);
create policy "Users can insert own videos" on library_videos for insert with check (auth.uid() = user_id);
create policy "Users can update own videos" on library_videos for update using (auth.uid() = user_id);
create policy "Users can delete own videos" on library_videos for delete using (auth.uid() = user_id);

-- 5. RECORDINGS TABLE (Metadata for audio files)
create table recordings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  segment_id uuid references segments(id) on delete set null, -- Can exist without segment?
  session_id uuid references sessions(id) on delete cascade,
  blob_path text not null, -- Path in Storage Bucket
  created_at bigint not null
);
alter table recordings enable row level security;
create policy "Users can view own recordings" on recordings for select using (auth.uid() = user_id);
create policy "Users can insert own recordings" on recordings for insert with check (auth.uid() = user_id);
create policy "Users can update own recordings" on recordings for update using (auth.uid() = user_id);
create policy "Users can delete own recordings" on recordings for delete using (auth.uid() = user_id);

-- STORAGE BUCKET POLICY (This usually needs to be done via UI or specialized API, but SQL can create policies on storage.objects)
-- We'll assume the bucket 'recordings' is created in the UI. We can set policies here:
insert into storage.buckets (id, name, public) values ('recordings', 'recordings', true) on conflict do nothing;

create policy "Users can upload own recordings" on storage.objects for insert with check (
  bucket_id = 'recordings' and auth.uid() = owner
);
create policy "Users can view own recordings file" on storage.objects for select using (
  bucket_id = 'recordings' and auth.uid() = owner
);
