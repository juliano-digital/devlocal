create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  business text not null check (char_length(btrim(business)) between 1 and 160),
  phone text not null check (char_length(btrim(phone)) between 1 and 14),
  state text not null check (
    state in (
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS',
      'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC',
      'SE', 'SP', 'TO'
    )
  ),
  city text not null check (char_length(btrim(city)) between 1 and 120),
  message text not null default '' check (char_length(message) <= 2000),
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

revoke all on table public.leads from public, anon, authenticated;
grant insert (name, business, phone, state, city, message)
  on table public.leads to anon, authenticated;
grant select, delete on table public.leads to authenticated;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'leads'
  loop
    execute format('drop policy %I on public.leads', existing_policy.policyname);
  end loop;
end
$$;

create policy leads_public_insert
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

create policy leads_admin_select
  on public.leads
  for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy leads_admin_delete
  on public.leads
  for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create index if not exists leads_created_at_idx
  on public.leads (created_at desc);
