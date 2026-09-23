-- DRAFT — NOT APPLIED TO PRODUCTION. Requires ARAS review + founder approval.
--
-- Replace the legacy `org_access` policies with active-membership, role-aware
-- policies. Analysis: docs/security/rls-audit-2026-09.md (findings F1–F4).
--
-- Problems fixed:
--   F1  org_access never checks workspace_members.status → 'suspended' and
--       'invited' members keep full read/write access.
--   F2  org_access is FOR ALL for every member, including role 'viewer' →
--       any member can edit integrations, capabilities, operation risk levels,
--       and approve their own human_approval_requests. Approvals now record the
--       requester, forbid self-approval and reserve high-risk types for owners.
--   F3  product_fabrics has a permissive FOR ALL policy for any member that
--       silently overrides the manager-only write policy next to it.
--   F4  policies target role `public` and call auth.uid() per row.
--
-- Unaffected: service_role (BYPASSRLS) — server-side agents and workers.

-- Helper -------------------------------------------------------------------------
create or replace function public.has_org_role(target_org uuid, allowed_roles text[])
  returns boolean
  language sql
  stable security definer
  set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.organization_id = target_org
      and wm.user_id = (select auth.uid())
      and wm.status = 'active'
      and wm.role = any (allowed_roles)
  );
$$;

comment on function public.has_org_role(uuid, text[]) is
  'True when the caller is an ACTIVE member of target_org with one of allowed_roles.';

revoke execute on function public.has_org_role(uuid, text[]) from public, anon;
grant execute on function public.has_org_role(uuid, text[]) to authenticated, service_role;

-- A) Governance configuration: members read, owner/admin write ------------------
--    integrations, capabilities, operation_catalog
do $$
declare t text;
begin
  foreach t in array array['integrations', 'capabilities', 'operation_catalog']
  loop
    execute format('drop policy if exists org_access on public.%I', t);
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

-- integration_surfaces has no organization_id; scope through its integration.
drop policy if exists org_access on public.integration_surfaces;
create policy integration_surfaces_member_select on public.integration_surfaces
  for select to authenticated
  using (exists (
    select 1 from public.integrations i
    where i.id = integration_surfaces.integration_id
      and (select public.is_org_member(i.organization_id))
  ));
create policy integration_surfaces_admin_insert on public.integration_surfaces
  for insert to authenticated
  with check (exists (
    select 1 from public.integrations i
    where i.id = integration_surfaces.integration_id
      and (select public.has_org_role(i.organization_id, array['owner','admin']))
  ));
create policy integration_surfaces_admin_update on public.integration_surfaces
  for update to authenticated
  using (exists (
    select 1 from public.integrations i
    where i.id = integration_surfaces.integration_id
      and (select public.has_org_role(i.organization_id, array['owner','admin']))
  ))
  with check (exists (
    select 1 from public.integrations i
    where i.id = integration_surfaces.integration_id
      and (select public.has_org_role(i.organization_id, array['owner','admin']))
  ));
create policy integration_surfaces_admin_delete on public.integration_surfaces
  for delete to authenticated
  using (exists (
    select 1 from public.integrations i
    where i.id = integration_surfaces.integration_id
      and (select public.has_org_role(i.organization_id, array['owner','admin']))
  ));

-- B) Operational data: members read, non-viewers write, owner/admin delete -------
--    app_builds, artifacts, workflow_templates, workflow_runs
do $$
declare t text;
begin
  foreach t in array array['app_builds', 'artifacts', 'workflow_templates', 'workflow_runs']
  loop
    execute format('drop policy if exists org_access on public.%I', t);
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

-- C) Append-only log: members read, non-viewers insert; no update/delete ---------
drop policy if exists org_access on public.tool_performance_log;
create policy tool_performance_log_member_select on public.tool_performance_log
  for select to authenticated
  using ((select public.is_org_member(organization_id)));
create policy tool_performance_log_writer_insert on public.tool_performance_log
  for insert to authenticated
  with check ((select public.has_org_role(organization_id, array['owner','admin','manager','member'])));

-- D) Human approvals ------------------------------------------------------------
--
-- Rules (ARAS decision, 2026-09-23):
--   * Viewers and inactive members cannot create or decide requests.
--   * Self-approval is forbidden: the requester can never be the decider.
--   * High-risk approval types (ARAS system_contract.human_approval_required_for)
--     may only be decided by an OWNER; all other types by owner or admin.
--   * A decision is recorded once (decided_by = the human deciding, decided_at)
--     and is immutable afterwards. Request fields never change after creation.
--   * Requests are never deleted by clients (audit trail).
--   * service_role (agents/workers) may create requests on an agent's behalf
--     (requested_by NULL) and expire them, but cannot record a decision without
--     a human decided_by, and the self-approval rule applies to it too.

alter table public.human_approval_requests
  add column if not exists requested_by uuid
    references auth.users(id) on delete set null
    default auth.uid();

comment on column public.human_approval_requests.requested_by is
  'Human who created the request (auth.uid()). NULL when an agent/worker created it via service_role.';

create or replace function public.approval_decider_roles(approval_type text)
  returns text[]
  language sql
  immutable
  set search_path = ''
as $$
  select case
    when approval_type = any (array[
      'irreversible_external_actions',
      'financial_commitments',
      'legal_commitments',
      'credential_changes'
    ]) then array['owner']
    else array['owner', 'admin']
  end;
$$;

comment on function public.approval_decider_roles(text) is
  'Roles allowed to decide a human_approval_request of the given type. High-risk types are owner-only.';

create or replace function public.guard_human_approval_update()
  returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  if old.status <> 'pending' then
    raise exception 'approval request % is already %', old.id, old.status
      using errcode = 'check_violation';
  end if;

  if (new.organization_id, new.approval_type, new.reason, new.payload,
      new.workflow_run_id, new.task_id, new.requested_by, new.created_at)
     is distinct from
     (old.organization_id, old.approval_type, old.reason, old.payload,
      old.workflow_run_id, old.task_id, old.requested_by, old.created_at) then
    raise exception 'approval request fields are immutable'
      using errcode = 'check_violation';
  end if;

  if new.status in ('approved', 'rejected') then
    if new.decided_by is null or new.decided_at is null then
      raise exception 'a decision must record decided_by and decided_at'
        using errcode = 'check_violation';
    end if;
    if new.decided_by = new.requested_by then
      raise exception 'self-approval is not allowed'
        using errcode = 'check_violation';
    end if;
  elsif new.decided_by is not null or new.decided_at is not null then
    raise exception 'decided_by/decided_at are only set with an approved or rejected status'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_human_approval_update on public.human_approval_requests;
create trigger guard_human_approval_update
  before update on public.human_approval_requests
  for each row execute function public.guard_human_approval_update();

drop policy if exists org_access on public.human_approval_requests;

create policy human_approval_requests_member_select on public.human_approval_requests
  for select to authenticated
  using ((select public.is_org_member(organization_id)));

create policy human_approval_requests_writer_insert on public.human_approval_requests
  for insert to authenticated
  with check (
    (select public.has_org_role(organization_id, array['owner','admin','manager','member']))
    and requested_by = (select auth.uid())
    and status = 'pending'
    and decided_by is null
    and decided_at is null
  );

create policy human_approval_requests_decide on public.human_approval_requests
  for update to authenticated
  using (
    status = 'pending'
    and requested_by is distinct from (select auth.uid())
    and public.has_org_role(organization_id, public.approval_decider_roles(approval_type))
  )
  with check (
    status in ('approved', 'rejected')
    and decided_by = (select auth.uid())
    and decided_at is not null
    and requested_by is distinct from (select auth.uid())
    and public.has_org_role(organization_id, public.approval_decider_roles(approval_type))
  );
-- No DELETE policy: approval history is retained.

-- F3: product_fabrics — remove the policy that bypasses manager-only writes ------
drop policy if exists product_fabrics_via_product on public.product_fabrics;
