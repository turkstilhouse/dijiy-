-- DİJİJ AI Control Plane execution persistence hardening.
-- Adds durable execution identity/idempotency and locks control-plane tables behind service-role access.

alter table public.ai_tasks
  add column if not exists execution_id text;

create unique index if not exists ai_tasks_execution_id_idx
  on public.ai_tasks(execution_id)
  where execution_id is not null;

create table if not exists public.ai_execution_idempotency (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ai_tasks(id) on delete cascade,
  idempotency_key text not null,
  operation text not null,
  status text not null check (status in ('IN_PROGRESS','COMPLETED','FAILED')),
  result_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(idempotency_key)
);

alter table public.ai_tasks enable row level security;
alter table public.ai_evidence enable row level security;
alter table public.ai_approvals enable row level security;
alter table public.ai_audit_events enable row level security;
alter table public.ai_execution_idempotency enable row level security;

revoke all on public.ai_tasks from anon, authenticated;
revoke all on public.ai_evidence from anon, authenticated;
revoke all on public.ai_approvals from anon, authenticated;
revoke all on public.ai_audit_events from anon, authenticated;
revoke all on public.ai_execution_idempotency from anon, authenticated;

grant all on public.ai_tasks to service_role;
grant all on public.ai_evidence to service_role;
grant all on public.ai_approvals to service_role;
grant all on public.ai_audit_events to service_role;
grant all on public.ai_execution_idempotency to service_role;

create index if not exists ai_tasks_execution_state_idx
  on public.ai_tasks(state, updated_at);

create index if not exists ai_execution_idempotency_task_idx
  on public.ai_execution_idempotency(task_id, updated_at);
