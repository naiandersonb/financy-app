# T-013 — Extrair o seletor de tipo e o tratamento de erros das actions

| Campo | Valor |
|-------|-------|
| Spec | [03 — Categorias](../specs/03-categorias.md) (preparação para a T-007) |
| Status | Implementada (aguardando revisão) |
| Depende de | — |
| Bloqueia | [T-007](T-007-criar-categoria.md) |

## Motivo

O formulário de categoria (T-007) precisa de duas peças que hoje são privadas de outra feature:

- o seletor **Despesa/Receita** (`KindOption`), dentro de `transaction-dialog.tsx`;
- o `runAndRevalidate`, que troca falhas de infraestrutura por mensagem amigável e revalida a tela,
  dentro de `src/app/(finance)/actions.ts`.

Copiá-las duplicaria código; colocá-las na T-007 passaria do limite de tamanho. Por isso esta é uma
**refatoração isolada, sem mudança de comportamento**.

## Escopo

- `src/presentation/components/kind-selector.tsx`: `KindSelector` (grupo de rádios "Tipo" com
  Despesa/Receita, mesmo visual de hoje); `transaction-dialog.tsx` passa a usá-lo.
- `src/app/(finance)/run-action.ts`: `runAndRevalidate(failureMessage, revalidate, run)`, com o
  caminho a revalidar como parâmetro; `src/app/(finance)/actions.ts` passa a usá-lo com `"/"`.

## Critérios de aceite

- [x] Nenhum teste existente muda de expectativa (o diálogo de lançamento e as actions se comportam igual).
- [x] `KindSelector` e `runAndRevalidate` têm testes próprios, colocados ao lado dos arquivos.
- [x] Não sobra `KindOption` em `transaction-dialog.tsx` nem `runAndRevalidate` em `actions.ts`.
- [x] Gate de qualidade verde, cobertura mantida.

## Tamanho

~4 arquivos de produção, ~80 linhas (a maior parte só movida).
