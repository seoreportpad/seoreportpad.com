-- Run this SQL in your Supabase SQL Editor
-- Go to: supabase.com → Your Project → SQL Editor → New Query → Paste & Run

-- 1. Clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  website text not null,
  phone text,
  company text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Reports
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  month text not null,
  year int not null,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Keywords
create table if not exists keywords (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  keyword text not null,
  prev_ranking int,
  curr_ranking int,
  search_volume int,
  url text
);

-- 4. Work Done
create table if not exists work_done (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  category text not null,
  task text not null
);

-- 5. Metrics
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

-- 6. Notes
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. Prompts / Templates
create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. Daily Work Logs
create table if not exists work_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  log_date date not null default current_date,
  month text not null,
  year int not null,
  category text not null,
  task text not null,
  status text default 'done',
  created_at timestamptz default now()
);

-- 9. Screenshots (stored as base64 data URLs)
create table if not exists screenshots (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  label text,
  url text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (optional, for future auth)
alter table clients enable row level security;
alter table reports enable row level security;
alter table keywords enable row level security;
alter table work_done enable row level security;
alter table metrics enable row level security;
alter table notes enable row level security;
alter table prompts enable row level security;
alter table work_logs enable row level security;
alter table screenshots enable row level security;

-- 10. Rank History (keyword positions over time)
create table if not exists rank_history (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  keyword text not null,
  position int not null,
  month text not null,
  year int not null,
  url text,
  created_at timestamptz default now()
);

-- 11. Backlinks
create table if not exists backlinks (
  id uuid primary key default gen_random_uuid(),
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

-- 12. Competitors
create table if not exists competitors (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  website text not null,
  da int,
  keywords int,
  notes text,
  created_at timestamptz default now()
);

-- 13. Portal Links (shareable client report links)
create table if not exists portal_links (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade unique,
  token text not null unique,
  created_at timestamptz default now()
);

-- Enable RLS on new tables
alter table rank_history enable row level security;
alter table backlinks enable row level security;
alter table competitors enable row level security;
alter table portal_links enable row level security;

-- Allow all access for now (no auth yet — for local use)
create policy "Allow all" on clients for all using (true) with check (true);
create policy "Allow all" on reports for all using (true) with check (true);
create policy "Allow all" on keywords for all using (true) with check (true);
create policy "Allow all" on work_done for all using (true) with check (true);
create policy "Allow all" on metrics for all using (true) with check (true);
create policy "Allow all" on notes for all using (true) with check (true);
create policy "Allow all" on prompts for all using (true) with check (true);
create policy "Allow all" on work_logs for all using (true) with check (true);
create policy "Allow all" on screenshots for all using (true) with check (true);
create policy "Allow all" on rank_history for all using (true) with check (true);
create policy "Allow all" on backlinks for all using (true) with check (true);
create policy "Allow all" on competitors for all using (true) with check (true);
create policy "Allow all" on portal_links for all using (true) with check (true);
