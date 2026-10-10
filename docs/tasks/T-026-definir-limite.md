# T-026 — Definir limite de uma categoria

| Campo | Valor |
|-------|-------|
| Spec | [07 — Orçamento por categoria](../specs/07-orcamento-por-categoria.md), regras 2 e 3 e botão "Definir limite" |
| Status | Implementada (aguardando revisão) |
| Depende de | [T-025](T-025-secao-de-orcamentos.md) |
| Bloqueia | T-027 |

## Comportamento

O botão **"Definir limite"** abre um diálogo com a categoria (só categorias de despesa que ainda não
têm orçamento) e o valor do limite. Se todas já tiverem, o botão fica oculto.

## Escopo

`presentation`: `features/budgets/components/budget-dialog.tsx` (categoria com selo, valor em R$;
campos controlados, como nos outros diálogos) e o view model `categories-without-budget.ts`; a
`BudgetSection` decide sozinha se mostra o botão. `app`: a página repassa `saveBudget`. Caso de uso,
validação e action já existem e têm testes (spec 01 e T-009).

### Bug encontrado e corrigido

O teste do diálogo mostrou que o `<select>` controlado também volta à primeira opção no
`form.reset()` do React 19 (o mesmo problema dos rádios, corrigido na T-015). O diálogo de
lançamento tinha o bug escondido: o teste da T-015 trocava o tipo, o que recriava as opções. A
correção ficou no `NativeSelect` compartilhado, que mantém o `defaultSelected` das opções igual ao
valor atual. O arquivo saiu da exclusão de cobertura do shadcn e ganhou testes; o diálogo de
lançamento ganhou um teste de regressão.

## Critérios de aceite

- [x] Lazer já tem orçamento → Lazer não aparece na lista do diálogo. *(critério 4)*
- [x] Limite `0` ou negativo → erro, nada gravado. *(critério 5)*
- [x] Todas as categorias de despesa com orçamento → botão oculto.
- [x] Gate de qualidade verde.

## Tamanho

Medido: 6 arquivos de produção (incluindo a correção no `NativeSelect`), ~190 linhas.
