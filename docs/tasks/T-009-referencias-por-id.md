# T-009 — Lançamentos e orçamentos referenciam a categoria por id

| Campo | Valor |
|-------|-------|
| Spec | [03 — Categorias](../specs/03-categorias.md), "Modelo de dados" (mudanças nas tabelas existentes) e "Remoção da lista fixa de categorias" |
| Status | A fazer |
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

- [ ] Não existe lista de categorias no código; a busca por `fixed-categories`, `categoriesFor` e `isValidCategory` em `src/` não retorna nada. *(critério 15)*
- [ ] Os nomes e cores padrão existem em um único lugar: a migration `0002_categories.sql`. *(critério 16)*
- [ ] `jest.config.ts` não tem mais exceção de cobertura para categorias. *(critério 17)*
- [ ] Lançamento ou orçamento com categoria de outro usuário ou de outro tipo é rejeitado pelo caso de uso **e** pelo banco (teste de integração). *(critério 14, parte de uso)*
- [ ] Dados antigos convertidos: cada lançamento/orçamento existente aponta para a categoria de mesmo nome e tipo.
- [ ] Gate de qualidade e `npm run test:integration` verdes.

## Tamanho (exceção justificada)

~13 arquivos de produção, ~250 linhas: **acima do limite de ~10 arquivos**. É uma refatoração de
troca de referência que precisa ser atômica: aplicar a migration sem adaptar todos os pontos que leem
`category` quebraria o app, e adaptar o código sem a migration também. Por ser só refatoração (sem
comportamento novo), segue a regra de "refatorações em tarefas próprias".
