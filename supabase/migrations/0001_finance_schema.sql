-- Schema do app de finanças pessoais.
-- Execute no SQL Editor do Supabase (ou via `supabase db push`).

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('income', 'expense')),
  description text not null check (char_length(description) between 1 and 120),
  amount_cents bigint not null check (amount_cents > 0),
  category text not null,
  occurred_on date not null,
  created_at timestamptz not null default now()
);

create index transactions_user_month_idx on public.transactions (user_id, occurred_on);

-- Limite mensal recorrente por categoria de despesa.
create table public.budgets (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null,
  limit_cents bigint not null check (limit_cents > 0),
  primary key (user_id, category)
);

alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

create policy "Usuário gerencia seus lançamentos" on public.transactions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Usuário gerencia seus orçamentos" on public.budgets
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
