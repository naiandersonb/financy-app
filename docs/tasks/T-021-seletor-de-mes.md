# T-021 — Seletor de mês

| Campo | Valor |
|-------|-------|
| Spec | [05 — Resumo mensal](../specs/05-resumo-mensal.md), "Seletor de mês" |
| Status | A fazer |
| Depende de | [T-016](T-016-tela-lista-lancamentos.md) |
| Bloqueia | — |

## Comportamento

O título do mês na tela principal ganha as setas **‹ anterior** e **próximo ›**, e o link **"Mês
atual"** quando o mês exibido não é o atual. São links reais para `/?month=AAAA-MM`, então
voltar/avançar do navegador funciona. Dá para ir a meses futuros.

## Escopo

- `presentation`: `features/monthly-summary/components/month-navigator.tsx` (recebe o mês exibido e o
  mês atual; usa `shiftMonth` do `domain` e `formatMonthLabel`).
- `app`: a página troca o `<h1>` pelo seletor e passa o mês atual (calculado com `currentMonthKey`).
- Entrada `"./src/presentation/features/monthly-summary/"` no `coverageThreshold`.

## Critérios de aceite

- [ ] Em janeiro de 2027, ‹ leva a `/?month=2026-12` e › a `/?month=2027-02` (virada de ano). *(critério 5)*
- [ ] "Mês atual" aparece só quando o mês exibido não é o atual e leva a `/`.
- [ ] As setas têm rótulo acessível ("Mês anterior: Dezembro de 2026").
- [ ] `/?month=2026-13` mostra o mês atual. *(critério 6; já feito na T-016)*
- [ ] Gate de qualidade verde.

## Tamanho

~2 arquivos de produção, ~70 linhas.
