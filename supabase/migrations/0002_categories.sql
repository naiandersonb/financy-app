-- Categorias personalizadas por usuário (spec 03, T-005).
-- Esta migration é a ÚNICA fonte dos nomes e cores das categorias padrão.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('income', 'expense')),
  name text not null check (char_length(name) between 1 and 30 and name = btrim(name)),
  background_color text not null check (background_color ~ '^#[0-9a-f]{6}$'),
  text_color text not null check (text_color ~ '^#[0-9a-f]{6}$'),
  created_at timestamptz not null default now(),
  -- Alvo das chaves estrangeiras compostas de lançamentos e orçamentos (migration 0003).
  unique (id, user_id, kind)
);

-- Nome único por usuário e tipo, sem diferenciar maiúsculas/minúsculas.
create unique index categories_user_kind_name_key
  on public.categories (user_id, kind, lower(name));

alter table public.categories enable row level security;

create policy "Usuário gerencia suas categorias" on public.categories
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Funções com privilégio elevado ficam fora do schema public, que a API do Supabase expõe.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create function private.create_default_categories(target_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.categories (user_id, kind, name, background_color, text_color)
  values
    (target_user_id, 'expense', 'Moradia', '#dbeafe', '#1e3a8a'),
    (target_user_id, 'expense', 'Alimentação', '#fef3c7', '#78350f'),
    (target_user_id, 'expense', 'Transporte', '#e0e7ff', '#3730a3'),
    (target_user_id, 'expense', 'Saúde', '#fce7f3', '#9d174d'),
    (target_user_id, 'expense', 'Educação', '#ede9fe', '#5b21b6'),
    (target_user_id, 'expense', 'Lazer', '#dcfce7', '#166534'),
    (target_user_id, 'expense', 'Compras', '#ffedd5', '#9a3412'),
    (target_user_id, 'expense', 'Contas e serviços', '#e0f2fe', '#075985'),
    (target_user_id, 'expense', 'Outros', '#f3f4f6', '#374151'),
    (target_user_id, 'income', 'Salário', '#d1fae5', '#065f46'),
    (target_user_id, 'income', 'Freelance', '#ccfbf1', '#115e59'),
    (target_user_id, 'income', 'Investimentos', '#ecfccb', '#3f6212'),
    (target_user_id, 'income', 'Outros', '#f3f4f6', '#374151')
  on conflict do nothing;
$$;

create function private.handle_new_user_categories()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.create_default_categories(new.id);
  return new;
end;
$$;

revoke execute on function private.create_default_categories(uuid) from public, anon, authenticated;
revoke execute on function private.handle_new_user_categories() from public, anon, authenticated;

-- Cobre cadastro com senha e com Google: ambos criam a linha em auth.users.
create trigger on_auth_user_created_create_categories
  after insert on auth.users
  for each row execute function private.handle_new_user_categories();

-- Usuários que já existiam antes desta migration.
select private.create_default_categories(id) from auth.users;
