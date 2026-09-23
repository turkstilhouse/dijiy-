-- Minimal stand-in for what the Supabase platform provides: client roles and
-- an `auth` schema whose auth.uid() reads the JWT subject.
--
-- Applied ONLY when the test database has no `auth` schema (PGlite). On the
-- real supabase/postgres image (CI) the platform's own roles and auth schema
-- are used instead, so tests run against genuine Supabase behaviour.

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
