# T-022 — Cartões de receitas, despesas e saldo do mês

| Campo | Valor |
|-------|-------|
| Spec | [05 — Resumo mensal](../specs/05-resumo-mensal.md), regras 1–5 e "Telas" |
| Status | Concluída (falta conferir no navegador o critério 7) |
| Depende de | [T-016](T-016-tela-lista-lancamentos.md) |
| Bloqueia | specs 06 e 07 (reaproveitam o caso de uso) |

## Comportamento

Acima da lista, três cartões mostram as **Receitas**, as **Despesas** e o **Saldo** do mês. O saldo
fica verde quando é maior ou igual a zero e vermelho (com sinal de menos) quando é negativo. Os
totais acompanham a lista: criar, editar ou excluir um lançamento atualiza os cartões sem recarregar.

## Escopo

- `application`: caso de uso `get-month-overview.ts`, que carrega os lançamentos do mês (usando
  `listMonthTransactions`) e devolve `{ transactions, summary }` com o `summarizeMonth` do `domain`.
  As specs 06 e 07 acrescentam a esse retorno os gastos por categoria e os orçamentos.
- `main`: `makeGetMonthOverview`; a página passa a usá-lo, e o `makeListMonthTransactions`, que ficou
  sem uso, foi removido (o caso de uso `listMonthTransactions` continua, usado pelo novo).
- `presentation`: `features/monthly-summary/components/summary-cards.tsx`.

## Critérios de aceite

- [x] Receitas de R$ 5.000,00 e despesas de R$ 3.200,50 → cartões `R$ 5.000,00`, `R$ 3.200,50` e saldo `R$ 1.799,50`. *(critério 1)*
- [x] Despesas maiores que receitas → saldo negativo, em vermelho e com sinal de menos. *(critério 2)*
- [x] Mês sem lançamentos → os três cartões em `R$ 0,00`. *(critério 3)*
- [x] Lançamentos do último dia do mês anterior e do 1º dia do seguinte não entram nos totais. *(critério 4)*
- [ ] Depois de criar, editar ou excluir, os totais se atualizam sem recarregar. *(critério 7; as actions já revalidam `/`)*
- [x] Gate de qualidade verde.

## Tamanho

Medido: 6 arquivos de produção, ~110 linhas.
