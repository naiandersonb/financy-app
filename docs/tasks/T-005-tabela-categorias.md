# T-005 — Tabela de categorias e categorias padrão

| Campo | Valor |
|-------|-------|
| Spec | [03 — Categorias](../specs/03-categorias.md), regras 1, 3 e 4; "Modelo de dados" |
| Status | A fazer |
| Depende de | [T-004](T-004-teste-integracao-rls.md) (suíte de integração com Supabase local, usada para provar RLS e o gatilho) |
| Bloqueia | T-006 a T-011 |

## Comportamento

Todo usuário (novo ou já existente) passa a ter as 13 categorias padrão no banco, com nome, tipo e
cores, isoladas por RLS. Ainda sem tela: só banco.

## Escopo

- Migration `supabase/migrations/0002_categories.sql`:
  - tabela `categories` (colunas, `check` de cor `^#[0-9a-f]{6}$`, `unique (user_id, kind, lower(name))`
    e `unique (id, user_id, kind)`);
  - RLS com a política `auth.uid() = user_id`;
  - função `public.create_default_categories(user_id)` (`security definer`, `search_path` fixo) com
    a tabela de padrões da spec, que é **a única fonte** desses nomes e cores;
  - gatilho `after insert on auth.users` que chama a função (cobre cadastro com senha e Google);
  - criação das categorias padrão para os usuários que já existem.
- Casos novos na suíte de integração da T-004 (`supabase/tests/categories.integration.test.ts`).

## Critérios de aceite cobertos

- [ ] Usuário recém-criado (por senha) tem exatamente as 13 categorias padrão, com as cores da tabela. *(parte de dados do critério 1; a tela vem na T-006)*
- [ ] Usuários que já existiam antes da migration também recebem as 13 categorias.
- [ ] O usuário A não lê, não altera e não apaga categorias do usuário B; visitante sem sessão não acessa nada. *(critério 14, parte de RLS)*
- [ ] O banco rejeita cor fora do formato `#rrggbb` e nome duplicado no mesmo tipo (sem diferenciar maiúsculas).
- [ ] A checagem "toda tabela tem RLS" da T-004 continua verde com a tabela nova.

## Tamanho

Só SQL (~110 linhas) e testes de integração. Nenhum código TypeScript de produção.
