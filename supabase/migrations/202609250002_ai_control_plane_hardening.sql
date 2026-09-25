-- DİJİJ AI Control Plane hardening: canonical state and self-approval DB guards
alter table public.ai_tasks
  drop constraint if exists ai_tasks_state_check;
alter table public.ai_tasks
  add constraint ai_tasks_state_check check (state in (
    'REQUESTED','CLASSIFIED','PLANNED','RESEARCHING','GENERATING','VERIFYING',
    'POLICY_CHECK','APPROVAL_REQUIRED','APPROVED','EXECUTING','WAITING_TOOL',
    'WAITING_EXTERNAL','OBSERVING','EVALUATING','COMPLETED','FAILED','CANCELLED'
  ));

alter table public.ai_approvals
  drop constraint if exists ai_approvals_no_self_approval;
alter table public.ai_approvals
  add constraint ai_approvals_no_self_approval
  check (approved_by is null or requested_by is null or approved_by <> requested_by);

create or replace function public.prevent_ai_audit_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'ai_audit_events is append-only';
end;
$$;

drop trigger if exists ai_audit_events_no_update on public.ai_audit_events;
create trigger ai_audit_events_no_update
before update or delete on public.ai_audit_events
for each row execute function public.prevent_ai_audit_mutation();
