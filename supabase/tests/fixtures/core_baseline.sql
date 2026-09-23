-- Test fixture: a minimal replica of the RLS-relevant parts of Supabase
-- TURKSTILHOUSE-CORE as of 2026-09-23 (read-only inspection, 13 migrations).
--
-- Policies, helper functions, constraints and grants below are copied from
-- production `pg_policies` / `pg_proc` / `pg_constraint`. Tables keep only the
-- columns those policies (and the draft migrations) reference.
--
-- This file is ONLY for local tests (PGlite). Never run it against production.

-- Supabase platform roles ------------------------------------------------------
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

-- auth schema stub: auth.uid() reads the JWT subject like Supabase does -------
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid
  language sql stable
  as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

grant usage on schema public to anon, authenticated, service_role;

-- Tenancy ------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member'
    check (role = any (array['owner','admin','manager','member','viewer'])),
  status text not null default 'active'
    check (status = any (array['active','invited','suspended'])),
  unique (organization_id, user_id)
);

create function public.is_org_member(target_org uuid)
  returns boolean
  language sql
  stable security definer
  set search_path to 'public'
as $function$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.organization_id = target_org
      and wm.user_id = (select auth.uid())
      and wm.status = 'active'
  );
$function$;

create policy members_read_org_members on public.workspace_members
  for select to authenticated
  using ((select is_org_member(workspace_members.organization_id) as is_org_member));
create policy members_read_own_membership on public.workspace_members
  for select to authenticated
  using ((user_id = (select auth.uid() as uid)));

-- Legacy governance tables with `org_access` policies ------------------------------
create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null default 'x'
);
create table public.integration_surfaces (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id),
  surface text not null default 'x'
);
create table public.capabilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  capability_key text not null default 'x'
);
create table public.operation_catalog (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  operation_key text not null default 'x',
  default_risk_level text not null default 'approval'
);
create table public.app_builds (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null default 'x'
);
create table public.artifacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null default 'x'
);
create table public.workflow_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null default 'x'
);
create table public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  status text not null default 'queued'
);
create table public.tool_performance_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  outcome text
);
create table public.human_approval_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  approval_type text not null default 'x',
  reason text not null default 'x',
  status text not null default 'pending',
  decided_by uuid,
  decided_at timestamptz
);

do $$
declare t text;
begin
  foreach t in array array['integrations','capabilities','operation_catalog',
    'app_builds','artifacts','workflow_templates','workflow_runs',
    'tool_performance_log','human_approval_requests']
  loop
    execute format($f$
      create policy org_access on public.%I as permissive for all to public
      using (organization_id in (select workspace_members.organization_id
        from workspace_members where (workspace_members.user_id = auth.uid())))
      with check (organization_id in (select workspace_members.organization_id
        from workspace_members where (workspace_members.user_id = auth.uid())))
    $f$, t);
  end loop;
end $$;

create policy org_access on public.integration_surfaces as permissive for all to public
  using (integration_id in (select i.id from (integrations i
    join workspace_members wm on ((wm.organization_id = i.organization_id)))
    where (wm.user_id = auth.uid())))
  with check (integration_id in (select i.id from (integrations i
    join workspace_members wm on ((wm.organization_id = i.organization_id)))
    where (wm.user_id = auth.uid())));

-- Products / fabrics (duplicate permissive policy on product_fabrics) ---------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  name text not null default 'x'
);
create table public.fabrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id)
);
create table public.product_fabrics (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  fabric_id uuid not null references public.fabrics(id),
  quantity_m2 numeric not null default 1
);

create policy org_members_access on public.products for all to authenticated
  using ((select is_org_member(products.organization_id) as is_org_member))
  with check ((select is_org_member(products.organization_id) as is_org_member));
create policy org_members_access on public.fabrics for all to authenticated
  using ((select is_org_member(fabrics.organization_id) as is_org_member))
  with check ((select is_org_member(fabrics.organization_id) as is_org_member));

create policy "org managers can modify product fabrics" on public.product_fabrics
  for all to authenticated
  using (exists (select 1 from (products p
    join workspace_members wm on ((wm.organization_id = p.organization_id)))
    where ((p.id = product_fabrics.product_id) and (wm.user_id = (select auth.uid() as uid))
      and (wm.status = 'active'::text)
      and (wm.role = any (array['owner'::text, 'admin'::text, 'manager'::text])))))
  with check (exists (select 1 from (products p
    join workspace_members wm on ((wm.organization_id = p.organization_id)))
    where ((p.id = product_fabrics.product_id) and (wm.user_id = (select auth.uid() as uid))
      and (wm.status = 'active'::text)
      and (wm.role = any (array['owner'::text, 'admin'::text, 'manager'::text])))));
create policy "org members can access product fabrics" on public.product_fabrics
  for select to authenticated
  using (exists (select 1 from (products p
    join workspace_members wm on ((wm.organization_id = p.organization_id)))
    where ((p.id = product_fabrics.product_id) and (wm.user_id = (select auth.uid() as uid))
      and (wm.status = 'active'::text))));
create policy product_fabrics_via_product on public.product_fabrics
  for all to authenticated
  using (exists (select 1 from products p
    where ((p.id = product_fabrics.product_id)
      and (select is_org_member(p.organization_id) as is_org_member))))
  with check (exists (select 1 from products p
    where ((p.id = product_fabrics.product_id)
      and (select is_org_member(p.organization_id) as is_org_member))));

-- Global (organization_id IS NULL) knowledge / expert tables --------------------------
create table public.experts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  name text not null default 'x'
);
create table public.expert_capabilities (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid not null references public.experts(id),
  capability text not null default 'x'
);
create table public.expert_evaluations (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid not null references public.experts(id),
  quality_score numeric
);
create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  name text not null default 'x'
);
create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.knowledge_sources(id),
  organization_id uuid references public.organizations(id),
  title text not null default 'x'
);
create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.knowledge_documents(id),
  chunk_index integer not null default 0,
  content text not null default 'x'
);

create policy org_members_access on public.experts for all to authenticated
  using (((organization_id is null) or (select is_org_member(experts.organization_id) as is_org_member)))
  with check (((organization_id is null) or (select is_org_member(experts.organization_id) as is_org_member)));
create policy org_members_access on public.knowledge_sources for all to authenticated
  using (((organization_id is null) or (select is_org_member(knowledge_sources.organization_id) as is_org_member)))
  with check (((organization_id is null) or (select is_org_member(knowledge_sources.organization_id) as is_org_member)));
create policy org_members_access on public.knowledge_documents for all to authenticated
  using (((organization_id is null) or (select is_org_member(knowledge_documents.organization_id) as is_org_member)))
  with check (((organization_id is null) or (select is_org_member(knowledge_documents.organization_id) as is_org_member)));
create policy expert_capabilities_access on public.expert_capabilities for all to authenticated
  using (exists (select 1 from experts e where ((e.id = expert_capabilities.expert_id)
    and ((e.organization_id is null) or (select is_org_member(e.organization_id) as is_org_member)))))
  with check (exists (select 1 from experts e where ((e.id = expert_capabilities.expert_id)
    and ((e.organization_id is null) or (select is_org_member(e.organization_id) as is_org_member)))));
create policy expert_evaluations_access on public.expert_evaluations for all to authenticated
  using (exists (select 1 from experts e where ((e.id = expert_evaluations.expert_id)
    and ((e.organization_id is null) or (select is_org_member(e.organization_id) as is_org_member)))))
  with check (exists (select 1 from experts e where ((e.id = expert_evaluations.expert_id)
    and ((e.organization_id is null) or (select is_org_member(e.organization_id) as is_org_member)))));
create policy expert_evaluations_read on public.expert_evaluations for select to authenticated
  using (exists (select 1 from experts e where ((e.id = expert_evaluations.expert_id)
    and ((e.organization_id is null) or (select is_org_member(e.organization_id) as is_org_member)))));
create policy document_chunks_access on public.knowledge_chunks for all to authenticated
  using (exists (select 1 from knowledge_documents d where ((d.id = knowledge_chunks.document_id)
    and ((d.organization_id is null) or (select is_org_member(d.organization_id) as is_org_member)))))
  with check (exists (select 1 from knowledge_documents d where ((d.id = knowledge_chunks.document_id)
    and ((d.organization_id is null) or (select is_org_member(d.organization_id) as is_org_member)))));

-- RLS on + Supabase default grants for every public table ----------------------------
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant all on public.%I to anon, authenticated, service_role', t);
  end loop;
end $$;

-- private schema: service_role only, RLS currently DISABLED ---------------------------
create schema private;
grant usage on schema private to service_role;

create table private.ai_comms_threads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subject text not null default 'x'
);
create table private.ai_comms_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references private.ai_comms_threads(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  message text not null default 'x'
);
grant all on private.ai_comms_threads, private.ai_comms_messages to service_role;
