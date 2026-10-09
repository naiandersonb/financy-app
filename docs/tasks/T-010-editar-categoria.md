# T-010 — Editar categoria

| Campo | Valor |
|-------|-------|
| Spec | [03 — Categorias](../specs/03-categorias.md), regras 3 e 8; campo "Tipo" |
| Status | Implementada (aguardando revisão) |
| Depende de | [T-008](T-008-previa-contraste.md) e [T-009](T-009-referencias-por-id.md) |
| Bloqueia | — |

## Comportamento

Cada categoria em `/categories` tem a ação **Editar**, que abre o mesmo diálogo preenchido. É possível
mudar nome e cores; o tipo aparece desabilitado. A mudança vale em todo o app, inclusive em meses
passados.

## Escopo (corte vertical)

- `application`: porta ganha `update`; caso de uso `update-category.ts` com o schema
  `categoryUpdateSchema`, que reaproveita os campos editáveis e **não tem** `kind` (o tipo não pode ser
  trocado nem forçando a requisição); nome duplicado → erro.
- `infrastructure`: `update` no repositório.
- `main`: `makeUpdateCategory`.
- `presentation`: modo de edição no `category-dialog.tsx`; botão Editar no `category-list.tsx`;
  `KindSelector` ganha `disabled`.
- `app`: action `updateCategory`, com `revalidatePath` de `/` e `/categories` (`runAndRevalidate`
  passa a aceitar uma lista de caminhos).

## Critérios de aceite cobertos

- [x] Renomear "Lazer" para "Diversão" → lançamentos e orçamentos de todos os meses mostram "Diversão". *(critério 9; verificado por teste de integração, já que as telas de lançamentos e orçamentos vêm nas specs 04 e 07)*
- [x] O tipo não muda na edição, nem forçando a requisição.
- [x] Renomear para um nome que já existe no mesmo tipo → "Já existe uma categoria com esse nome".
- [x] Gate de qualidade verde.

## Tamanho

Medido: 11 arquivos de produção, ~150 linhas (estimativa inicial era 6: o `KindSelector`, o
`runAndRevalidate` e a página também mudaram).
