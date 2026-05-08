-- Run this SQL in your Supabase SQL Editor
-- Go to: supabase.com → Your Project → SQL Editor → New Query → Paste & Run

--------------------------------------------------------------------------------
-- 1. Agency Settings (White-label & API keys)
--------------------------------------------------------------------------------
create table if not exists agency_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null, -- Links to auth.users
  agency_name text,
  logo_url text,
  primary_color text default '#2563eb',
  from_email text,
  gemini_api_key text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 2. Team Members
--------------------------------------------------------------------------------
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null, -- The agency owner
  member_email text not null,
  role text default 'editor', -- admin, editor, viewer
  status text default 'pending', -- pending, active
  created_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 3. Clients
--------------------------------------------------------------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, -- Multi-tenancy
  name text not null,
  email text not null,
  website text not null,
  phone text,
  company text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 4. Reports
--------------------------------------------------------------------------------
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  client_id uuid references clients(id) on delete cascade,
  month text not null,
  year int not null,
  status text default 'draft', -- draft, ready, sent
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 5. Metrics (Performance data for reports)
--------------------------------------------------------------------------------
create table if not exists metrics (
  id uuid primary key default gen_random_uuid(),
  report_id uuid unique references reports(id) on delete cascade,
  organic_traffic int,
  prev_traffic int,
  backlinks int,
  prev_backlinks int,
  domain_authority int,
  prev_da int,
  impressions int,
  clicks int,
  avg_position float,
  technical_fixed int,
  pages_indexed int,
  notes text,
  recommendations text
);

--------------------------------------------------------------------------------
-- 6. Keywords
--------------------------------------------------------------------------------
create table if not exists keywords (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  keyword text not null,
  prev_ranking int,
  curr_ranking int,
  search_volume int,
  url text
);

--------------------------------------------------------------------------------
-- 7. Work Done (Tasks completed in a reporting period)
--------------------------------------------------------------------------------
create table if not exists work_done (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  category text not null,
  task text not null
);

--------------------------------------------------------------------------------
-- 8. Audit Results (Manual 180-check checklist)
--------------------------------------------------------------------------------
create table if not exists audit_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  client_id uuid references clients(id) on delete cascade,
  report_id uuid references reports(id) on delete cascade,
  checks jsonb not null default '{}',
  updated_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 9. Notes & Strategy
--------------------------------------------------------------------------------
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 10. Prompts / Templates
--------------------------------------------------------------------------------
create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  category text not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 11. Leads (Captured from public audit tool)
--------------------------------------------------------------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  website text,
  audit_data jsonb,
  source text default 'public_audit_tool',
  created_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 12. Rank History (Historical tracking)
--------------------------------------------------------------------------------
create table if not exists rank_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  client_id uuid references clients(id) on delete cascade,
  keyword text not null,
  position int not null,
  month text not null,
  year int not null,
  url text,
  created_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 13. Backlinks Tracking
--------------------------------------------------------------------------------
create table if not exists backlinks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  client_id uuid references clients(id) on delete cascade,
  source_url text not null,
  target_url text not null,
  anchor_text text,
  da int,
  type text default 'Other',
  status text default 'live',
  added_date date default current_date,
  notes text,
  created_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 14. Competitor Analysis
--------------------------------------------------------------------------------
create table if not exists competitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  website text not null,
  da int,
  keywords int,
  notes text,
  created_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 15. Portal Links (Publicly shareable links)
--------------------------------------------------------------------------------
create table if not exists portal_links (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade unique,
  token text not null unique,
  created_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 16. Security (Enable RLS & Policies)
--------------------------------------------------------------------------------

-- Enable RLS on all tables
alter table agency_settings enable row level security;
alter table team_members enable row level security;
alter table clients enable row level security;
alter table reports enable row level security;
alter table metrics enable row level security;
alter table keywords enable row level security;
alter table work_done enable row level security;
alter table audit_results enable row level security;
alter table notes enable row level security;
alter table prompts enable row level security;
alter table leads enable row level security;
alter table rank_history enable row level security;
alter table backlinks enable row level security;
alter table competitors enable row level security;
alter table portal_links enable row level security;

-- Policies
create policy "Users can manage their own agency settings" on agency_settings for all using (auth.uid() = user_id);
create policy "Users can manage their own clients" on clients for all using (auth.uid() = user_id);
create policy "Users can manage their own reports" on reports for all using (auth.uid() = user_id);
create policy "Users can manage their own audit results" on audit_results for all using (auth.uid() = user_id);
create policy "Users can manage their own notes" on notes for all using (auth.uid() = user_id);
create policy "Users can manage their own prompts" on prompts for all using (auth.uid() = user_id);
create policy "Users can manage their own rank history" on rank_history for all using (auth.uid() = user_id);
create policy "Users can manage their own backlinks" on backlinks for all using (auth.uid() = user_id);
create policy "Users can manage their own competitors" on competitors for all using (auth.uid() = user_id);

create policy "Users can manage metrics via reports" on metrics for all using (
  exists (select 1 from reports where reports.id = metrics.report_id and reports.user_id = auth.uid())
);
create policy "Users can manage keywords via reports" on keywords for all using (
  exists (select 1 from reports where reports.id = keywords.report_id and reports.user_id = auth.uid())
);
create policy "Users can manage work_done via reports" on work_done for all using (
  exists (select 1 from reports where reports.id = work_done.report_id and reports.user_id = auth.uid())
);

create policy "Admins can see leads" on leads for select using (true);

create policy "Public can view reports via token" on reports for select using (
  exists (select 1 from portal_links where portal_links.report_id = reports.id)
);
create policy "Public can view metrics via token" on metrics for select using (
  exists (select 1 from portal_links where portal_links.report_id = metrics.report_id)
);
create policy "Public can view keywords via token" on keywords for select using (
  exists (select 1 from portal_links where portal_links.report_id = keywords.report_id)
);
create policy "Public can view work_done via token" on work_done for select using (
  exists (select 1 from portal_links where portal_links.report_id = work_done.report_id)
);
