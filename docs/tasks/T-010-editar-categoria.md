# T-010 — Editar categoria

| Campo | Valor |
|-------|-------|
| Spec | [03 — Categorias](../specs/03-categorias.md), regras 3 e 8; campo "Tipo" |
| Status | A fazer |
| Depende de | [T-008](T-008-previa-contraste.md) e [T-009](T-009-referencias-por-id.md) |
| Bloqueia | — |

## Comportamento

Cada categoria em `/categories` tem a ação **Editar**, que abre o mesmo diálogo preenchido. É possível
mudar nome e cores; o tipo aparece desabilitado. A mudança vale em todo o app, inclusive em meses
passados.

## Escopo (corte vertical)

- `application`: porta ganha `update`; caso de uso `update-category.ts` (reaproveita o schema; ignora
  troca de tipo; nome duplicado → erro).
- `infrastructure`: `update` no repositório.
- `main`: `makeUpdateCategory`.
- `presentation`: modo de edição no `category-dialog.tsx`; botão Editar no `category-list.tsx`.
- `app`: action `updateCategory`, com `revalidatePath` de `/` e `/categories`.

## Critérios de aceite cobertos

- [ ] Renomear "Lazer" para "Diversão" → lançamentos e orçamentos de todos os meses mostram "Diversão". *(critério 9; verificado por teste de integração, já que as telas de lançamentos e orçamentos vêm nas specs 04 e 07)*
- [ ] O tipo não muda na edição, nem forçando a requisição.
- [ ] Renomear para um nome que já existe no mesmo tipo → "Já existe uma categoria com esse nome".
- [ ] Gate de qualidade verde.

## Tamanho

~6 arquivos de produção, ~120 linhas.
