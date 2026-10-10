# T-028 — Remover orçamento

| Campo | Valor |
|-------|-------|
| Spec | [07 — Orçamento por categoria](../specs/07-orcamento-por-categoria.md), regra 7 |
| Status | A fazer |
| Depende de | [T-025](T-025-secao-de-orcamentos.md) |
| Bloqueia | — |

## Comportamento

Cada orçamento ganha a ação **Remover**, com confirmação (reaproveita o `ConfirmDeleteButton`). Os
lançamentos não são afetados; a categoria volta a aparecer no diálogo "Definir limite".

## Escopo

`presentation`: `delete-budget-button.tsx` (componente de cliente, como os outros botões de
exclusão); `app`: a página repassa `deleteBudget` (action e caso de uso já existem).

## Critérios de aceite

- [ ] Remover e confirmar → o orçamento some e os lançamentos continuam intactos. *(critério 7)*
- [ ] Cancelar → nada muda.
- [ ] Gate de qualidade verde.

## Tamanho

~3 arquivos de produção, ~50 linhas.
