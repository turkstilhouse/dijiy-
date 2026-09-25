-- DİJİY AI Control Plane foundation tables
-- Provider-neutral execution state, budgets, evidence, approvals and audit.

create table if not exists public.ai_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  requested_by uuid,
  objective text not null,
  risk_class text not null check (risk_class in ('R0','R1','R2','R3','R4','R5')),
  state text not null default 'REQUESTED',
  budget jsonb not null,
  usage jsonb not null default '{}'::jsonb,
  idempotency_key text,
  checkpoint jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ai_tasks_idempotency_idx
  on public.ai_tasks(workspace_id, idempotency_key)
  where idempotency_key is not null;

create table if not exists public.ai_evidence (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ai_tasks(id) on delete cascade,
  claim text not null,
  source text not null,
  source_trust text not null check (source_trust in ('S0','S1','S2','S3','S4','S5')),
  verification text not null default 'UNVERIFIED'
    check (verification in ('UNVERIFIED','PARTIAL','VERIFIED','CONFLICTING')),
  confidence numeric(5,4) check (confidence >= 0 and confidence <= 1),
  collected_at timestamptz not null default now()
);

create table if not exists public.ai_approvals (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ai_tasks(id) on delete cascade,
  requested_by uuid,
  approved_by uuid,
  status text not null default 'PENDING'
    check (status in ('PENDING','APPROVED','REJECTED','EXPIRED')),
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.ai_audit_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.ai_tasks(id) on delete set null,
  actor_id uuid,
  action text not null,
  state text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_audit_events_task_idx on public.ai_audit_events(task_id, created_at);
create index if not exists ai_evidence_task_idx on public.ai_evidence(task_id, collected_at);

-- Audit is append-only at the application contract level.
-- UPDATE/DELETE privileges must remain restricted to the service role.
