# T-009 — Lançamentos e orçamentos referenciam a categoria por id

| Campo | Valor |
|-------|-------|
| Spec | [03 — Categorias](../specs/03-categorias.md), "Modelo de dados" (mudanças nas tabelas existentes) e "Remoção da lista fixa de categorias" |
| Status | Concluída |
| Depende de | [T-006](T-006-listar-categorias.md) (usa `list-categories` e o `CategoryRepository`) |
| Bloqueia | T-010, T-011 e as specs 04, 06 e 07 |

## Comportamento

É uma **refatoração**, sem tela nova: lançamentos e orçamentos passam a apontar para a categoria pelo
`id` (com chave estrangeira composta que garante mesmo usuário e mesmo tipo), e a lista fixa de
categorias some do código. O diálogo de lançamento passa a mostrar as categorias do usuário.

## Escopo

- Migration `supabase/migrations/0003_category_references.sql`: `category_id` em `transactions` e
  `budgets`, conversão do texto antigo para o `id` (mesmo nome e tipo), FKs compostas
  `(category_id, user_id, kind)`, nova PK de `budgets` `(user_id, category_id)`, coluna `kind` fixa
  em `'expense'` em `budgets`, remoção das colunas de texto.
- Código: `Transaction.categoryId` e `Budget.categoryId`; agregações de `domain` agrupando por id;
  schemas com `categoryId` (uuid); `save-transaction` e `save-budget` conferem a categoria pelo
  `CategoryRepository` (porta ganha `findById`); repositórios Supabase; o diálogo de lançamento
  recebe a lista de categorias por prop.
- Remoção de `src/domain/fixed-categories.ts`, `categoriesFor` e `isValidCategory`, da entrada em
  `coveragePathIgnorePatterns` do `jest.config.ts` e da exceção registrada na spec 01.

## Critérios de aceite cobertos

- [x] Não existe lista de categorias no código; a busca por `fixed-categories`, `categoriesFor` e `isValidCategory` em `src/` não retorna nada. *(critério 15)*
- [x] Os nomes e cores padrão existem em um único lugar: a migration `0002_categories.sql`. *(critério 16)*
- [x] `jest.config.ts` não tem mais exceção de cobertura para categorias. *(critério 17)*
- [x] Lançamento ou orçamento com categoria de outro usuário ou de outro tipo é rejeitado pelo caso de uso **e** pelo banco (teste de integração). *(critério 14, parte de uso)*
- [x] Dados antigos convertidos: cada lançamento/orçamento existente aponta para a categoria de mesmo nome e tipo.
- [x] Gate de qualidade e `npm run test:integration` verdes.

## Verificação (2026-10-09)

- Conversão de dados (banco local na `0002` com lançamentos e orçamento gravados por nome, depois
  `npx supabase migration up`): cada registro passou a apontar para a categoria de mesmo nome e tipo,
  inclusive "salário" em minúsculas.
- Nome sem correspondente: a migration falha no `set not null` e é desfeita por inteiro; a coluna
  antiga e os lançamentos continuam intactos.
- `npm run test:integration`: 31 testes, incluindo categoria de outro tipo e de outro usuário
  recusadas pelo banco (`23503`) e categoria em uso protegida contra exclusão.

- Projeto na nuvem: `0003` aplicada com `npx supabase db push` (depois de registrar a `0001` e a
  `0002` com `migration repair`, já que tinham sido aplicadas pelo SQL Editor). Com a chave pública:
  `category_id` existe, as colunas `category` antigas foram removidas e o visitante continua vendo 0
  linhas nas três tabelas.

## Tamanho (exceção justificada)

Medido: 20 arquivos de produção, +153/−68 linhas (sem testes, fakes e barrels). **Acima do limite
de ~10 arquivos**, embora bem abaixo do de linhas: a troca de `category` por `categoryId` toca uma
ou duas linhas em cada ponto que lê a categoria. É uma refatoração de
troca de referência que precisa ser atômica: aplicar a migration sem adaptar todos os pontos que leem
`category` quebraria o app, e adaptar o código sem a migration também. Por ser só refatoração (sem
comportamento novo), segue a regra de "refatorações em tarefas próprias".
