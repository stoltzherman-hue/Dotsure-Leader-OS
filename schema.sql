-- DOTSURE LEADER OS — Database Schema
-- Run this in your NEW Supabase project SQL editor
-- DO NOT run in harness Supabase project (guwqrtxfnymhmrgqgavx)

-- ============================================================
-- CORE USER TABLES
-- ============================================================

create table "UserProfile" (
  id uuid primary key references auth.users(id),
  full_name text,
  email text,
  role text default 'MANAGER',
  department text,
  team_size integer,
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- WORKSPACE MODULE
-- ============================================================

create table "Conversation" (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references "UserProfile"(id) on delete cascade,
  title text default 'New conversation',
  module text default 'workspace',
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TASKS MODULE
-- ============================================================

create table "Task" (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references "UserProfile"(id),
  assigned_to uuid references "UserProfile"(id),
  title text not null,
  description text,
  status text default 'OPEN',
  due_date timestamptz,
  priority text default 'MEDIUM',
  department text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- REPORTS MODULE
-- ============================================================

create table "ReportAnalysis" (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references "UserProfile"(id),
  filename text,
  file_url text,
  analysis text,
  data_type text,
  created_at timestamptz default now()
);

-- ============================================================
-- KNOWLEDGE MODULE
-- ============================================================

create table "KnowledgeItem" (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references "UserProfile"(id),
  title text not null,
  content text not null,
  category text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- BUILDS MODULE (harness pipeline ported in)
-- ============================================================

create table "Project" (
  id uuid primary key default gen_random_uuid(),
  "projectCode" text unique,
  name text not null,
  description text,
  "projectType" text,
  department text,
  "riskTier" text default 'MEDIUM',
  status text default 'PIPELINE_RUNNING',
  "technicalOwner" text,
  "businessOwner" text,
  "targetGoLive" text,
  "escalationPath" text,
  "createdBy" uuid references "UserProfile"(id),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

create table "ProjectDocument" (
  id uuid primary key default gen_random_uuid(),
  "projectId" uuid references "Project"(id) on delete cascade,
  filename text not null,
  content text,
  "generatedBy" text,
  version integer default 1,
  "createdAt" timestamptz default now()
);

create table "PipelineRun" (
  id uuid primary key default gen_random_uuid(),
  "projectId" uuid references "Project"(id) on delete cascade,
  "agentName" text,
  model text,
  "inputTokens" integer,
  "outputTokens" integer,
  "latencyMs" integer,
  "costUsd" numeric(10,6),
  "guardrailFlag" boolean default false,
  "flagReason" text,
  "createdAt" timestamptz default now()
);

create table "ApprovalRequest" (
  id uuid primary key default gen_random_uuid(),
  "projectId" uuid references "Project"(id) on delete cascade,
  "approverRole" text,
  "approverName" text,
  status text default 'PENDING',
  decision text,
  notes text,
  "requestedAt" timestamptz default now(),
  "decidedAt" timestamptz
);

-- ============================================================
-- SYSTEM CONTEXT (AI context for all modules)
-- ============================================================

create table "SystemContext" (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  "updatedAt" timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table "UserProfile" enable row level security;
alter table "Conversation" enable row level security;
alter table "Task" enable row level security;
alter table "ReportAnalysis" enable row level security;
alter table "KnowledgeItem" enable row level security;
alter table "Project" enable row level security;
alter table "ProjectDocument" enable row level security;
alter table "PipelineRun" enable row level security;
alter table "ApprovalRequest" enable row level security;

-- UserProfile
create policy "Users manage own profile"
  on "UserProfile" for all using (auth.uid() = id);

-- Conversations
create policy "Users manage own conversations"
  on "Conversation" for all using (auth.uid() = user_id);

-- Tasks - all users see all tasks (team visibility)
create policy "All users see tasks"
  on "Task" for select using (true);
create policy "Users create tasks"
  on "Task" for insert with check (auth.uid() = created_by);
create policy "Users update own tasks"
  on "Task" for update using (auth.uid() = created_by or auth.uid() = assigned_to);

-- Reports
create policy "Users manage own reports"
  on "ReportAnalysis" for all using (auth.uid() = user_id);

-- Knowledge - all users see, authenticated users add
create policy "All users see knowledge"
  on "KnowledgeItem" for select using (true);
create policy "Users add knowledge"
  on "KnowledgeItem" for insert with check (auth.uid() = created_by);
create policy "Users update own knowledge"
  on "KnowledgeItem" for update using (auth.uid() = created_by);

-- Projects - all authenticated users see all projects
create policy "All users see projects"
  on "Project" for select using (auth.role() = 'authenticated');
create policy "Users create projects"
  on "Project" for insert with check (auth.uid() = "createdBy");
create policy "Users update own projects"
  on "Project" for update using (auth.uid() = "createdBy");

-- Project documents
create policy "All users see documents"
  on "ProjectDocument" for select using (auth.role() = 'authenticated');
create policy "Service role inserts documents"
  on "ProjectDocument" for insert with check (auth.role() = 'authenticated');

-- Pipeline runs
create policy "All users see pipeline runs"
  on "PipelineRun" for select using (auth.role() = 'authenticated');
create policy "Authenticated users insert pipeline runs"
  on "PipelineRun" for insert with check (auth.role() = 'authenticated');

-- Approval requests
create policy "All users see approvals"
  on "ApprovalRequest" for select using (auth.role() = 'authenticated');
create policy "Authenticated users insert approvals"
  on "ApprovalRequest" for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users update approvals"
  on "ApprovalRequest" for update using (auth.role() = 'authenticated');

-- System context - readable by all, writable by authenticated
alter table "SystemContext" disable row level security;
grant select, insert, update on "SystemContext" to anon;
grant select, insert, update on "SystemContext" to authenticated;
