-- DRAFT — NOT APPLIED TO PRODUCTION. Requires ARAS review + founder approval.
--
-- Enable Row Level Security on private.ai_comms_threads / ai_comms_messages
-- (Supabase advisor: rls_disabled, priority 1).
--
-- Current exposure: none in practice. The `private` schema is not in the
-- PostgREST exposed schemas and anon/authenticated have neither USAGE on the
-- schema nor table grants. This migration is defence in depth: if a future
-- grant or schema exposure slips in, the tables still return nothing.
--
-- Behaviour change: none for existing callers.
--   * service_role has BYPASSRLS → unaffected.
--   * postgres owns the tables and RLS is not FORCEd → owner access unaffected
--     (includes the touch_ai_comms_thread trigger).
--   * No policies are created on purpose: any other role is denied by default.

alter table private.ai_comms_threads enable row level security;
alter table private.ai_comms_messages enable row level security;

-- Re-assert that client roles have no path in (idempotent; no-ops today).
revoke all on schema private from public, anon, authenticated;
revoke all on all tables in schema private from public, anon, authenticated;
alter default privileges in schema private
  revoke all on tables from public, anon, authenticated;

comment on table private.ai_comms_threads is
  'AI agent communication threads. service_role only; RLS enabled with no policies (deny-by-default for client roles).';
comment on table private.ai_comms_messages is
  'AI agent communication messages. service_role only; RLS enabled with no policies (deny-by-default for client roles).';
