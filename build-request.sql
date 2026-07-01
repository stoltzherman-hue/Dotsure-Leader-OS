-- DOTSURE LEADER OS — Build Request tracking
-- Run this in the Leader OS Supabase project (NOT the harness project)
-- Tracks build ideas submitted to the harness and the pass/escalate decision
-- that comes back via the callback endpoint.

create table "BuildRequest" (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references "UserProfile"(id),
  idea text not null,
  status text not null default 'PENDING',
  risk_tier text,
  harness_project_code text,
  decided_at timestamptz,
  created_at timestamptz default now()
);

alter table "BuildRequest" enable row level security;

create policy "Users manage own build requests"
  on "BuildRequest" for all using (auth.uid() = created_by);
