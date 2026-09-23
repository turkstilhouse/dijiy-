-- DRAFT — NOT APPLIED TO PRODUCTION. Requires ARAS review + founder approval.
--
-- F6 (docs/security/rls-audit-2026-09.md): ARAS decision "viewer is read-only;
-- a viewer must not change any business data". Today every remaining business
-- table grants FOR ALL to any active member via `org_members_access` (or an
-- equivalent `*_via_*` / `*_member_all` policy), so a viewer can create, edit
-- and delete orders, customers, tasks, audit events, and more.
--
-- This migration applies the same role matrix as 20260923150100:
--   A  governance config   members read · owner/admin write
--   B  operational data    members read · owner/admin/manager/member write · owner/admin delete
--   C  append-only ledgers members read · owner/admin/manager/member insert · no update/delete
-- Child tables follow their parent's organization.
--
-- Depends on public.has_org_role() from 20260923150100.
-- Unaffected: service_role (BYPASSRLS).

-- A) Governance configuration ---------------------------------------------------
--    projects (Dijiy product definition), routing_rules (AI task routing),
--    agent_assignments (which agent owns what)
do $$
declare t text;
begin
  foreach t in array array['projects', 'routing_rules']
  loop
    execute format('drop policy if exists org_members_access on public.%I', t);
  end loop;
  drop policy if exists agent_assignments_member_all on public.agent_assignments;

  foreach t in array array['projects', 'routing_rules', 'agent_assignments']
  loop
    execute format($p$
      create policy %1$s_member_select on public.%1$I for select to authenticated
        using ((select public.is_org_member(organization_id)))
    $p$, t);
    execute format($p$
      create policy %1$s_admin_insert on public.%1$I for insert to authenticated
        with check ((select public.has_org_role(organization_id, array['owner','admin'])))
    $p$, t);
    execute format($p$
      create policy %1$s_admin_update on public.%1$I for update to authenticated
        using ((select public.has_org_role(organization_id, array['owner','admin'])))
        with check ((select public.has_org_role(organization_id, array['owner','admin'])))
    $p$, t);
    execute format($p$
      create policy %1$s_admin_delete on public.%1$I for delete to authenticated
        using ((select public.has_org_role(organization_id, array['owner','admin'])))
    $p$, t);
  end loop;
end $$;

-- B) Operational data ------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['customers', 'suppliers', 'fabrics', 'products',
    'orders', 'production_orders', 'tasks', 'decisions', 'predictions']
  loop
    execute format('drop policy if exists org_members_access on public.%I', t);
  end loop;
  drop policy if exists orchestration_runs_member_all on public.orchestration_runs;

  foreach t in array array['customers', 'suppliers', 'fabrics', 'products',
    'orders', 'production_orders', 'tasks', 'decisions', 'predictions',
    'orchestration_runs']
  loop
    execute format($p$
      create policy %1$s_member_select on public.%1$I for select to authenticated
        using ((select public.is_org_member(organization_id)))
    $p$, t);
    execute format($p$
      create policy %1$s_writer_insert on public.%1$I for insert to authenticated
        with check ((select public.has_org_role(organization_id, array['owner','admin','manager','member'])))
    $p$, t);
    execute format($p$
      create policy %1$s_writer_update on public.%1$I for update to authenticated
        using ((select public.has_org_role(organization_id, array['owner','admin','manager','member'])))
        with check ((select public.has_org_role(organization_id, array['owner','admin','manager','member'])))
    $p$, t);
    execute format($p$
      create policy %1$s_admin_delete on public.%1$I for delete to authenticated
        using ((select public.has_org_role(organization_id, array['owner','admin'])))
    $p$, t);
  end loop;
end $$;

-- C) Append-only ledgers -----------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['audit_events', 'cost_events']
  loop
    execute format('drop policy if exists org_members_access on public.%I', t);
    execute format($p$
      create policy %1$s_member_select on public.%1$I for select to authenticated
        using ((select public.is_org_member(organization_id)))
    $p$, t);
    execute format($p$
      create policy %1$s_writer_insert on public.%1$I for insert to authenticated
        with check ((select public.has_org_role(organization_id, array['owner','admin','manager','member'])))
    $p$, t);
  end loop;
end $$;

-- Child tables (scoped through the parent's organization) -------------------------

-- order_items → orders
drop policy if exists order_items_via_order on public.order_items;
create policy order_items_member_select on public.order_items
  for select to authenticated
  using (exists (select 1 from public.orders o
    where o.id = order_items.order_id
      and (select public.is_org_member(o.organization_id))));
create policy order_items_writer_write on public.order_items
  for all to authenticated
  using (exists (select 1 from public.orders o
    where o.id = order_items.order_id
      and (select public.has_org_role(o.organization_id, array['owner','admin','manager','member']))))
  with check (exists (select 1 from public.orders o
    where o.id = order_items.order_id
      and (select public.has_org_role(o.organization_id, array['owner','admin','manager','member']))));

-- task_runs → tasks
drop policy if exists task_runs_via_task on public.task_runs;
create policy task_runs_member_select on public.task_runs
  for select to authenticated
  using (exists (select 1 from public.tasks t
    where t.id = task_runs.task_id
      and (select public.is_org_member(t.organization_id))));
create policy task_runs_writer_write on public.task_runs
  for all to authenticated
  using (exists (select 1 from public.tasks t
    where t.id = task_runs.task_id
      and (select public.has_org_role(t.organization_id, array['owner','admin','manager','member']))))
  with check (exists (select 1 from public.tasks t
    where t.id = task_runs.task_id
      and (select public.has_org_role(t.organization_id, array['owner','admin','manager','member']))));

-- evaluations → tasks
drop policy if exists evaluations_via_task on public.evaluations;
create policy evaluations_member_select on public.evaluations
  for select to authenticated
  using (exists (select 1 from public.tasks t
    where t.id = evaluations.task_id
      and (select public.is_org_member(t.organization_id))));
create policy evaluations_writer_write on public.evaluations
  for all to authenticated
  using (exists (select 1 from public.tasks t
    where t.id = evaluations.task_id
      and (select public.has_org_role(t.organization_id, array['owner','admin','manager','member']))))
  with check (exists (select 1 from public.tasks t
    where t.id = evaluations.task_id
      and (select public.has_org_role(t.organization_id, array['owner','admin','manager','member']))));

-- actual_outcomes → predictions (global predictions: read-only for clients, as in F5)
drop policy if exists predictions_outcomes_via_prediction on public.actual_outcomes;
create policy actual_outcomes_read on public.actual_outcomes
  for select to authenticated
  using (exists (select 1 from public.predictions p
    where p.id = actual_outcomes.prediction_id
      and (p.organization_id is null or (select public.is_org_member(p.organization_id)))));
create policy actual_outcomes_writer_write on public.actual_outcomes
  for all to authenticated
  using (exists (select 1 from public.predictions p
    where p.id = actual_outcomes.prediction_id
      and p.organization_id is not null
      and (select public.has_org_role(p.organization_id, array['owner','admin','manager','member']))))
  with check (exists (select 1 from public.predictions p
    where p.id = actual_outcomes.prediction_id
      and p.organization_id is not null
      and (select public.has_org_role(p.organization_id, array['owner','admin','manager','member']))));
