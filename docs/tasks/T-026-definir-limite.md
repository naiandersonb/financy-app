# T-026 — Definir limite de uma categoria

| Campo | Valor |
|-------|-------|
| Spec | [07 — Orçamento por categoria](../specs/07-orcamento-por-categoria.md), regras 2 e 3 e botão "Definir limite" |
| Status | A fazer |
| Depende de | [T-025](T-025-secao-de-orcamentos.md) |
| Bloqueia | T-027 |

## Comportamento

O botão **"Definir limite"** abre um diálogo com a categoria (só categorias de despesa que ainda não
têm orçamento) e o valor do limite. Se todas já tiverem, o botão fica oculto.

## Escopo

`presentation`: `features/budgets/components/budget-dialog.tsx` (categoria com selo, valor em R$;
campos controlados, como nos outros diálogos); `app`: a página repassa `saveBudget`. Caso de uso,
validação e action já existem e têm testes (spec 01 e T-009).

## Critérios de aceite

- [ ] Lazer já tem orçamento → Lazer não aparece na lista do diálogo. *(critério 4)*
- [ ] Limite `0` ou negativo → erro, nada gravado. *(critério 5)*
- [ ] Todas as categorias de despesa com orçamento → botão oculto.
- [ ] Gate de qualidade verde.

## Tamanho

~3 arquivos de produção, ~120 linhas.
