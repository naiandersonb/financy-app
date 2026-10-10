# Spec 05 — Resumo mensal

## Objetivo

Mostrar, de relance, como está o mês: quanto entrou, quanto saiu e o que sobrou.

## Histórias de usuário

- Como usuário, quero ver o total de receitas, de despesas e o saldo do mês.
- Como usuário, quero navegar entre meses para comparar com meses anteriores.
- Como usuário, quero voltar rapidamente para o mês atual.

## Regras de negócio

1. **Receitas do mês** = soma dos valores dos lançamentos `income` com data no mês.
2. **Despesas do mês** = soma dos valores dos lançamentos `expense` com data no mês.
3. **Saldo do mês** = Receitas − Despesas. Pode ser negativo.
4. O saldo é só do mês: não acumula o saldo de meses anteriores (v1).
5. Os cálculos são feitos em centavos (inteiros) e formatados só na exibição.

## Seletor de mês

- Mostra o mês por extenso (ex.: "Outubro de 2026"), com botões ‹ anterior e próximo ›.
- Quando o mês exibido não é o atual, aparece o link "Mês atual".
- A navegação atualiza `?month=AAAA-MM` na URL (são links reais, então voltar/avançar do navegador funciona).
- Parâmetro ausente ou inválido (ex.: `?month=2026-13`, `?month=abc`) → mês atual.
- É permitido navegar para meses futuros (para lançar contas já previstas).
- O seletor e o mês escolhido valem para todas as seções da tela (lista, resumo, categorias, orçamentos).

## Telas

Três cartões lado a lado (empilhados no celular):

| Cartão | Conteúdo | Destaque |
|--------|----------|----------|
| Receitas | total do mês | verde |
| Despesas | total do mês | vermelho |
| Saldo | receitas − despesas | verde se ≥ 0, vermelho se < 0 |

Cada cartão tem ícone e rótulo; a cor nunca é a única pista (o saldo negativo
mostra o sinal de menos).

## Critérios de aceite

- [ ] Dado receitas de R$ 5.000,00 e despesas de R$ 3.200,50 no mês, então os cartões mostram
      `R$ 5.000,00`, `R$ 3.200,50` e saldo `R$ 1.799,50`.
- [ ] Dado despesas maiores que as receitas, então o saldo aparece negativo e em vermelho.
- [ ] Dado um mês sem lançamentos, então os três cartões mostram `R$ 0,00`.
- [ ] Lançamentos de outros meses não entram nos totais (inclusive do último dia do mês anterior e do 1º dia do seguinte).
- [x] Quando clico em ‹ estando em janeiro de 2027, vou para dezembro de 2026 (virada de ano). _(teste automatizado)_
- [x] Quando acesso `/?month=2026-13`, vejo o mês atual. _(teste automatizado)_
- [ ] Depois de criar, editar ou excluir um lançamento, os totais se atualizam sem recarregar a página.

## Notas técnicas

| Camada | Arquivos |
|--------|----------|
| `domain` | `month-key.ts` (`parseMonthKey`, `shiftMonth`, `monthDateRange`, `currentMonthKey(now)`, `defaultDateInMonth`); `month-summary.ts` (`summarizeMonth`) |
| `application` | Caso de uso `use-cases/get-month-overview.ts`: recebe o mês, carrega os lançamentos e devolve o resumo (reaproveitado pelas specs 06 e 07) |
| `presentation` | `features/monthly-summary/components/month-navigator.tsx`, `summary-cards.tsx`; `formatters/date.ts` (`formatMonthLabel`) |
| `app` | `(finance)/page.tsx`: lê `searchParams` (uma Promise no Next 16), chama `makeGetMonthOverview()` e compõe os componentes |

- Aritmética de meses (`shiftMonth`, virada de ano) com date-fns via `src/shared/calendar-date.ts`, em horário local,
  para não haver erro de um dia por causa do fuso.
- `currentMonthKey` recebe `now` por parâmetro para os testes serem determinísticos.

## Conformidade com a constituição

| Princípio | Como esta spec atende |
|-----------|-----------------------|
| Clean Architecture | Cálculo do resumo no `domain`; a página só compõe |
| Rotas finas | `page.tsx` (async, fora da cobertura) não tem lógica; tudo o que ela usa é testado nas camadas abaixo |
| Cobertura > 90% | Entrada `"./src/presentation/features/monthly-summary/"` no `coverageThreshold`; testes de `month-key` (virada de ano, mês inválido, `now` injetado), `summarizeMonth` (vazio, saldo negativo), do caso de uso e dos componentes (cores e sinal do saldo, link "Mês atual") |
| Acessibilidade | Saldo negativo com sinal, não só cor |

**Exceções:** nenhuma.

## Tarefas

1. [T-021 — Seletor de mês](../tasks/T-021-seletor-de-mes.md)
2. [T-022 — Cartões de receitas, despesas e saldo do mês](../tasks/T-022-cartoes-de-resumo.md)

## Fora do escopo

Saldo acumulado entre meses, comparação com o mês anterior (% de variação), gráficos de evolução anual,
projeção de fim de mês.

## Questões em aberto

- Vale mostrar a variação em relação ao mês anterior já na v1?
- O "mês atual" deve seguir o fuso do navegador ou um fixo (America/Sao_Paulo)?
