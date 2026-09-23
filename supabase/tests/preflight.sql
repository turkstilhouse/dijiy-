-- Read-only preflight for the draft migrations in supabase/migrations/.
--
-- Run against the target database (production or a development branch)
-- BEFORE applying the drafts. It only reads catalogs and changes nothing.
-- Expected result: zero rows. Every row returned is a problem to resolve.

with
expected_policies (tbl, policy) as (values
  -- 20260923150100
  ('integrations', 'org_access'), ('integration_surfaces', 'org_access'),
  ('capabilities', 'org_access'), ('operation_catalog', 'org_access'),
  ('app_builds', 'org_access'), ('artifacts', 'org_access'),
  ('workflow_templates', 'org_access'), ('workflow_runs', 'org_access'),
  ('tool_performance_log', 'org_access'), ('human_approval_requests', 'org_access'),
  ('product_fabrics', 'product_fabrics_via_product'),
  ('product_fabrics', 'org managers can modify product fabrics'),
  ('product_fabrics', 'org members can access product fabrics'),
  -- 20260923150200
  ('experts', 'org_members_access'), ('knowledge_sources', 'org_members_access'),
  ('knowledge_documents', 'org_members_access'),
  ('expert_capabilities', 'expert_capabilities_access'),
  ('expert_evaluations', 'expert_evaluations_access'),
  ('expert_evaluations', 'expert_evaluations_read'),
  ('knowledge_chunks', 'document_chunks_access'),
  -- 20260923150300
  ('projects', 'org_members_access'), ('routing_rules', 'org_members_access'),
  ('customers', 'org_members_access'), ('suppliers', 'org_members_access'),
  ('fabrics', 'org_members_access'), ('products', 'org_members_access'),
  ('orders', 'org_members_access'), ('production_orders', 'org_members_access'),
  ('tasks', 'org_members_access'), ('decisions', 'org_members_access'),
  ('predictions', 'org_members_access'), ('audit_events', 'org_members_access'),
  ('cost_events', 'org_members_access'),
  ('agent_assignments', 'agent_assignments_member_all'),
  ('orchestration_runs', 'orchestration_runs_member_all'),
  ('order_items', 'order_items_via_order'), ('task_runs', 'task_runs_via_task'),
  ('evaluations', 'evaluations_via_task'),
  ('actual_outcomes', 'predictions_outcomes_via_prediction')
),
expected_columns (tbl, col) as (
  select t, 'organization_id' from unnest(array[
    'integrations', 'capabilities', 'operation_catalog', 'app_builds',
    'artifacts', 'workflow_templates', 'workflow_runs', 'tool_performance_log',
    'human_approval_requests', 'experts', 'knowledge_sources',
    'knowledge_documents', 'projects', 'routing_rules', 'customers',
    'suppliers', 'fabrics', 'products', 'orders', 'production_orders', 'tasks',
    'decisions', 'predictions', 'audit_events', 'cost_events',
    'agent_assignments', 'orchestration_runs']) t
  union all values
    ('integration_surfaces', 'integration_id'),
    ('expert_capabilities', 'expert_id'), ('expert_evaluations', 'expert_id'),
    ('knowledge_chunks', 'document_id'), ('order_items', 'order_id'),
    ('task_runs', 'task_id'), ('evaluations', 'task_id'),
    ('actual_outcomes', 'prediction_id'), ('product_fabrics', 'product_id'),
    ('human_approval_requests', 'approval_type'),
    ('human_approval_requests', 'reason'),
    ('human_approval_requests', 'payload'),
    ('human_approval_requests', 'workflow_run_id'),
    ('human_approval_requests', 'task_id'),
    ('human_approval_requests', 'status'),
    ('human_approval_requests', 'decided_by'),
    ('human_approval_requests', 'decided_at'),
    ('human_approval_requests', 'created_at'),
    ('workspace_members', 'role'), ('workspace_members', 'status')
),
new_objects (kind, name) as (values
  ('function', 'has_org_role'),
  ('function', 'approval_decider_roles'),
  ('function', 'guard_human_approval_update')
)
select 'missing policy' as problem, format('public.%I: %s', e.tbl, e.policy) as detail
from expected_policies e
where not exists (select 1 from pg_policies p
  where p.schemaname = 'public' and p.tablename = e.tbl and p.policyname = e.policy)

union all
select 'missing column', format('public.%I.%I', c.tbl, c.col)
from expected_columns c
where not exists (select 1 from information_schema.columns ic
  where ic.table_schema = 'public' and ic.table_name = c.tbl and ic.column_name = c.col)

union all
select 'name collision', format('public.%s() already exists', n.name)
from new_objects n
where exists (select 1 from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
  where ns.nspname = 'public' and p.proname = n.name)

union all
select 'name collision', 'public.human_approval_requests.requested_by already exists'
where exists (select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'human_approval_requests'
    and column_name = 'requested_by')

union all
select 'missing table', format('private.%I', t)
from unnest(array['ai_comms_threads', 'ai_comms_messages']) t
where to_regclass(format('private.%I', t)) is null

union all
select 'missing function', 'public.is_org_member(uuid)'
where to_regprocedure('public.is_org_member(uuid)') is null

union all
select 'unexpected policy', format('public.%I: %s (not handled by the drafts)', p.tablename, p.policyname)
from pg_policies p
where p.schemaname = 'public'
  and p.tablename in (select tbl from expected_policies)
  and (p.tablename, p.policyname) not in (select tbl, policy from expected_policies)
  and p.cmd <> 'SELECT'

union all
select 'rows already present', 'human_approval_requests has rows; review requested_by backfill'
where exists (select 1 from public.human_approval_requests);
