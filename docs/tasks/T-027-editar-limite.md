# T-027 — Editar o valor de um limite

| Campo | Valor |
|-------|-------|
| Spec | [07 — Orçamento por categoria](../specs/07-orcamento-por-categoria.md), regras 1 e 6 e ação "Editar (só o valor)" |
| Status | A fazer |
| Depende de | [T-026](T-026-definir-limite.md) |
| Bloqueia | — |

## Comportamento

Cada orçamento ganha a ação **Editar**, que abre o diálogo da T-026 com a categoria fixa (só o valor
pode mudar). Como o limite é recorrente, o novo valor vale para todos os meses.

## Escopo

`presentation`: modo de edição no `budget-dialog.tsx` e botão no `budget-item.tsx`. O `upsert` já
existente grava sobre a chave `(user_id, category_id)`.

## Critérios de aceite

- [ ] Editar Lazer para R$ 500 → todos os meses passam a usar R$ 500. *(critério 6)*
- [ ] A categoria não pode ser trocada na edição.
- [ ] Gate de qualidade verde.

## Tamanho

~2 arquivos de produção, ~40 linhas.
