# T-020 — Excluir lançamento com confirmação

| Campo | Valor |
|-------|-------|
| Spec | [04 — Lançamentos](../specs/04-lancamentos.md), regra 4 |
| Status | A fazer |
| Depende de | [T-016](T-016-tela-lista-lancamentos.md) e [T-019](T-019-extrair-confirmacao-de-exclusao.md) |
| Bloqueia | — |

## Comportamento

Cada linha da lista ganha a ação **Excluir**, que pede confirmação (mostrando descrição e valor) e
remove o lançamento de vez.

## Escopo

`presentation`: `delete-transaction-button.tsx` usando o `ConfirmDeleteButton`; `app`: a página
repassa `deleteTransaction` (action e caso de uso já existem).

## Critérios de aceite

- [ ] Excluir e confirmar → o lançamento some; cancelar → nada muda. *(critério 8)*
- [ ] Gate de qualidade verde.

## Tamanho

~3 arquivos de produção, ~50 linhas.
