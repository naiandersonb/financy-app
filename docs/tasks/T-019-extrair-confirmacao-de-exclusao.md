# T-019 — Extrair o botão de exclusão com confirmação

| Campo | Valor |
|-------|-------|
| Spec | [04 — Lançamentos](../specs/04-lancamentos.md) (preparação para a T-020) |
| Status | Concluída |
| Depende de | — |
| Bloqueia | T-020 |

## Motivo

O `DeleteCategoryButton` (T-011) já implementa botão de lixeira, janela de confirmação, estado de
carregamento e exibição do motivo quando a exclusão é recusada. A exclusão de lançamento (T-020)
precisa do mesmo comportamento. Para não duplicar, esta **refatoração sem mudança de
comportamento** extrai um componente genérico.

## Escopo

- `src/presentation/components/confirm-delete-button.tsx`: rótulo acessível, título, descrição,
  conteúdo extra (ex.: o selo) e a ação de exclusão por props.
- `DeleteCategoryButton` passa a usá-lo. Ele **continua sendo componente de cliente** (`"use client"`):
  é ele que monta a função `() => onDelete(category.id)`, e funções criadas no servidor não podem
  ser passadas a componentes de cliente (o erro só apareceria em tempo de execução, não nos testes
  nem no build).

## Critérios de aceite

- [x] Os testes atuais do `DeleteCategoryButton` continuam passando sem mudar de expectativa.
- [x] O componente genérico tem testes próprios.
- [x] Gate de qualidade verde.

## Tamanho

Medido: 2 arquivos de produção; `confirm-delete-button.tsx` com ~90 linhas (movidas) e
`delete-category-button.tsx` encolhendo de ~90 para ~30.
