-- DRAFT — NOT APPLIED TO PRODUCTION. Requires ARAS review + founder approval.
--
-- F5 (docs/security/rls-audit-2026-09.md): rows with organization_id IS NULL
-- are "global" (all 10 production `experts` rows are global). The current
-- FOR ALL policies accept `organization_id IS NULL` in both USING and WITH
-- CHECK, so ANY authenticated user — including a fresh sign-up with no
-- membership — can insert, edit or delete global experts, knowledge sources
-- and documents, and their child rows.
--
-- New rule: global rows stay readable by every authenticated user, but only
-- service_role (trusted server jobs) may write them. Org-scoped rows are
-- written by active non-viewer members (ARAS: viewers are read-only).

-- experts / knowledge_sources / knowledge_documents -------------------------------
do $$
declare t text;
begin
  foreach t in array array['experts', 'knowledge_sources', 'knowledge_documents']
  loop
    execute format('drop policy if exists org_members_access on public.%I', t);
    execute format($p$
      create policy %1$s_read on public.%1$I for select to authenticated
        using (organization_id is null or (select public.is_org_member(organization_id)))
    $p$, t);
    execute format($p$
      create policy %1$s_org_insert on public.%1$I for insert to authenticated
        with check (organization_id is not null and (select public.has_org_role(organization_id, array['owner','admin','manager','member'])))
    $p$, t);
    execute format($p$
      create policy %1$s_org_update on public.%1$I for update to authenticated
        using (organization_id is not null and (select public.has_org_role(organization_id, array['owner','admin','manager','member'])))
        with check (organization_id is not null and (select public.has_org_role(organization_id, array['owner','admin','manager','member'])))
    $p$, t);
    execute format($p$
      create policy %1$s_org_delete on public.%1$I for delete to authenticated
        using (organization_id is not null and (select public.has_org_role(organization_id, array['owner','admin','manager','member'])))
    $p$, t);
  end loop;
end $$;

-- Child tables: readable when the parent is visible; writable only when the
-- parent belongs to an organization where the caller is an active non-viewer.

-- expert_capabilities
drop policy if exists expert_capabilities_access on public.expert_capabilities;
create policy expert_capabilities_read on public.expert_capabilities
  for select to authenticated
  using (exists (select 1 from public.experts e
    where e.id = expert_capabilities.expert_id
      and (e.organization_id is null or (select public.is_org_member(e.organization_id)))));
create policy expert_capabilities_org_write on public.expert_capabilities
  for all to authenticated
  using (exists (select 1 from public.experts e
    where e.id = expert_capabilities.expert_id
      and e.organization_id is not null
      and (select public.has_org_role(e.organization_id, array['owner','admin','manager','member']))))
  with check (exists (select 1 from public.experts e
    where e.id = expert_capabilities.expert_id
      and e.organization_id is not null
      and (select public.has_org_role(e.organization_id, array['owner','admin','manager','member']))));

-- expert_evaluations (keeps existing expert_evaluations_read SELECT policy)
drop policy if exists expert_evaluations_access on public.expert_evaluations;
create policy expert_evaluations_org_write on public.expert_evaluations
  for all to authenticated
  using (exists (select 1 from public.experts e
    where e.id = expert_evaluations.expert_id
      and e.organization_id is not null
      and (select public.has_org_role(e.organization_id, array['owner','admin','manager','member']))))
  with check (exists (select 1 from public.experts e
    where e.id = expert_evaluations.expert_id
      and e.organization_id is not null
      and (select public.has_org_role(e.organization_id, array['owner','admin','manager','member']))));

-- knowledge_chunks
drop policy if exists document_chunks_access on public.knowledge_chunks;
create policy knowledge_chunks_read on public.knowledge_chunks
  for select to authenticated
  using (exists (select 1 from public.knowledge_documents d
    where d.id = knowledge_chunks.document_id
      and (d.organization_id is null or (select public.is_org_member(d.organization_id)))));
create policy knowledge_chunks_org_write on public.knowledge_chunks
  for all to authenticated
  using (exists (select 1 from public.knowledge_documents d
    where d.id = knowledge_chunks.document_id
      and d.organization_id is not null
      and (select public.has_org_role(d.organization_id, array['owner','admin','manager','member']))))
  with check (exists (select 1 from public.knowledge_documents d
    where d.id = knowledge_chunks.document_id
      and d.organization_id is not null
      and (select public.has_org_role(d.organization_id, array['owner','admin','manager','member']))));
