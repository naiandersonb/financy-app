# T-020 — Excluir lançamento com confirmação

| Campo | Valor |
|-------|-------|
| Spec | [04 — Lançamentos](../specs/04-lancamentos.md), regra 4 |
| Status | Concluída (falta conferir no navegador o critério 8 da spec) |
| Depende de | [T-016](T-016-tela-lista-lancamentos.md) e [T-019](T-019-extrair-confirmacao-de-exclusao.md) |
| Bloqueia | — |

## Comportamento

Cada linha da lista ganha a ação **Excluir**, que pede confirmação (mostrando descrição e valor) e
remove o lançamento de vez.

## Escopo

`presentation`: `delete-transaction-button.tsx` (componente de cliente, como o de categoria) usando
o `ConfirmDeleteButton`, com descrição e valor na confirmação; botão em cada linha da lista; `app`:
a página repassa `deleteTransaction` (action e caso de uso já existem).

## Critérios de aceite

- [ ] Excluir e confirmar → o lançamento some; cancelar → nada muda. *(critério 8)*
- [x] Gate de qualidade verde.

## Tamanho

Medido: 3 arquivos de produção, ~50 linhas.
