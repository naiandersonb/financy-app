# T-019 — Extrair o botão de exclusão com confirmação

| Campo | Valor |
|-------|-------|
| Spec | [04 — Lançamentos](../specs/04-lancamentos.md) (preparação para a T-020) |
| Status | A fazer |
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
- `DeleteCategoryButton` passa a usá-lo.

## Critérios de aceite

- [ ] Os testes atuais do `DeleteCategoryButton` continuam passando sem mudar de expectativa.
- [ ] O componente genérico tem testes próprios.
- [ ] Gate de qualidade verde.

## Tamanho

~2 arquivos de produção, ~90 linhas (a maior parte movida).
