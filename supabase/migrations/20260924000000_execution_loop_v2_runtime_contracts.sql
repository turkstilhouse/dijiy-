create table if not exists public.execution_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  orchestration_run_id uuid not null references public.orchestration_runs(id) on delete cascade,
  agent_assignment_id uuid references public.agent_assignments(id) on delete set null,
  step_key text not null,
  sequence_no integer not null,
  step_type text not null check (step_type in ('planning','policy_check','routing','agent','tool','validation','approval','persistence','finalization')),
  status text not null default 'queued' check (status in ('queued','running','waiting_approval','succeeded','failed','cancelled','retry_scheduled')),
  idempotency_key text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error jsonb,
  risk_level text not null default 'approval' check (risk_level in ('automatic','notification','approval')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, idempotency_key),
  unique (orchestration_run_id, sequence_no)
);

create table if not exists public.provider_invocations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  orchestration_run_id uuid references public.orchestration_runs(id) on delete set null,
  execution_step_id uuid references public.execution_steps(id) on delete set null,
  provider_id uuid references public.ai_providers(id) on delete set null,
  model_id uuid references public.ai_models(id) on delete set null,
  provider_request_id text,
  idempotency_key text not null,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','retry_scheduled','cancelled')),
  request_meta jsonb not null default '{}'::jsonb,
  response_meta jsonb not null default '{}'::jsonb,
  input_tokens integer,
  output_tokens integer,
  estimated_cost_usd numeric,
  error jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, idempotency_key)
);

create table if not exists public.tool_invocations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  orchestration_run_id uuid references public.orchestration_runs(id) on delete set null,
  execution_step_id uuid references public.execution_steps(id) on delete set null,
  tool_id uuid references public.ai_tools(id) on delete set null,
  integration_id uuid references public.integrations(id) on delete set null,
  operation_key text,
  idempotency_key text not null,
  status text not null default 'queued' check (status in ('queued','running','waiting_approval','succeeded','failed','retry_scheduled','cancelled')),
  risk_level text not null default 'approval' check (risk_level in ('automatic','notification','approval')),
  request_meta jsonb not null default '{}'::jsonb,
  response_meta jsonb not null default '{}'::jsonb,
  error jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, idempotency_key)
);

create index if not exists execution_steps_run_idx on public.execution_steps(orchestration_run_id, sequence_no);
create index if not exists execution_steps_status_idx on public.execution_steps(status, created_at);
create index if not exists provider_invocations_run_idx on public.provider_invocations(orchestration_run_id, created_at);
create index if not exists tool_invocations_run_idx on public.tool_invocations(orchestration_run_id, created_at);

alter table public.execution_steps enable row level security;
alter table public.provider_invocations enable row level security;
alter table public.tool_invocations enable row level security;

revoke all on public.execution_steps from anon, authenticated;
revoke all on public.provider_invocations from anon, authenticated;
revoke all on public.tool_invocations from anon, authenticated;
grant all on public.execution_steps to service_role;
grant all on public.provider_invocations to service_role;
grant all on public.tool_invocations to service_role;
