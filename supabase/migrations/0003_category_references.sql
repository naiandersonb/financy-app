-- Lançamentos e orçamentos passam a referenciar a categoria pelo id (spec 03, T-009).
-- Os registros antigos guardam o nome da categoria; cada um é ligado à categoria de mesmo nome e
-- tipo do mesmo usuário. Se algum não tiver correspondente, o `set not null` falha e a migration
-- inteira é desfeita: preferimos um erro visível a apagar ou reclassificar dados sem avisar.

-- Lançamentos ------------------------------------------------------------------------------
alter table public.transactions add column category_id uuid;

update public.transactions as t
set category_id = c.id
from public.categories as c
where c.user_id = t.user_id
  and c.kind = t.kind
  and lower(c.name) = lower(t.category);

alter table public.transactions alter column category_id set not null;

-- Garante no banco: categoria do mesmo usuário e do mesmo tipo do lançamento.
alter table public.transactions
  add constraint transactions_category_fk
  foreign key (category_id, user_id, kind)
  references public.categories (id, user_id, kind)
  on delete restrict;

create index transactions_category_idx on public.transactions (category_id);

alter table public.transactions drop column category;

-- Orçamentos -------------------------------------------------------------------------------
alter table public.budgets add column category_id uuid;

-- Coluna fixa em 'expense' só para a chave estrangeira composta garantir categoria de despesa.
alter table public.budgets
  add column kind text not null default 'expense' check (kind = 'expense');

update public.budgets as b
set category_id = c.id
from public.categories as c
where c.user_id = b.user_id
  and c.kind = 'expense'
  and lower(c.name) = lower(b.category);

alter table public.budgets alter column category_id set not null;

alter table public.budgets drop constraint budgets_pkey;
alter table public.budgets add primary key (user_id, category_id);

alter table public.budgets
  add constraint budgets_category_fk
  foreign key (category_id, user_id, kind)
  references public.categories (id, user_id, kind)
  on delete restrict;

alter table public.budgets drop column category;
