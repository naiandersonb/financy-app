# T-005 — Tabela de categorias e categorias padrão

| Campo | Valor |
|-------|-------|
| Spec | [03 — Categorias](../specs/03-categorias.md), regras 1, 3 e 4; "Modelo de dados" |
| Status | Concluída |
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
  - função `private.create_default_categories(user_id)` (`security definer`, `search_path` fixo) com
    a tabela de padrões da spec, que é **a única fonte** desses nomes e cores. Fica no schema
    `private`, que a API do Supabase não expõe, com `execute` revogado de `anon` e `authenticated`:
    no `public`, qualquer usuário poderia chamá-la com o id de outro;
  - gatilho `after insert on auth.users` que chama a função (cobre cadastro com senha e Google);
  - criação das categorias padrão para os usuários que já existem.
- Casos novos na suíte de integração da T-004 (`supabase/tests/categories.integration.test.ts`).

## Critérios de aceite cobertos

- [x] Usuário recém-criado (por senha) tem exatamente as 13 categorias padrão, com as cores da tabela. *(parte de dados do critério 1; a tela vem na T-006)*
- [x] Usuários que já existiam antes da migration também recebem as 13 categorias.
- [x] O usuário A não lê, não altera e não apaga categorias do usuário B; visitante sem sessão não acessa nada. *(critério 14, parte de RLS)*
- [x] O banco rejeita cor fora do formato `#rrggbb` e nome duplicado no mesmo tipo (sem diferenciar maiúsculas).
- [x] A checagem "toda tabela tem RLS" da T-004 continua verde com a tabela nova.

- [x] A função de categorias padrão não pode ser chamada pela API.

## Verificação (2026-10-09)

- `npm run test:integration`: 24 testes (8 de RLS da T-004 + 16 de categorias).
- Backfill: com o banco só na `0001`, um usuário criado antes recebeu as 13 categorias ao aplicar a
  `0002` com `npx supabase migration up`.

- Projeto na nuvem (2026-10-09, 13:51 UTC), com a chave pública: visitante lê 0 categorias e não
  consegue criar categoria em nome de outro usuário (`42501`).

## Tamanho

Só SQL (~110 linhas) e testes de integração. Nenhum código TypeScript de produção.
