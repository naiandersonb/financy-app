# T-025 — Seção de orçamentos do mês (acompanhamento)

| Campo | Valor |
|-------|-------|
| Spec | [07 — Orçamento por categoria](../specs/07-orcamento-por-categoria.md), regras 4 e 5 e "Telas e interações" (lista, ordem, resumo, estado vazio) |
| Status | A fazer |
| Depende de | [T-023](T-023-gastos-por-categoria.md) (`get-month-overview`) |
| Bloqueia | T-026, T-027, T-028 |

## Comportamento

Abaixo de "Gastos por categoria", a seção **"Orçamentos"** mostra cada limite definido: selo da
categoria, "R$ gasto de R$ limite", barra de progresso e "Restam R$ X" ou "Excedeu R$ X". A barra é
primária abaixo de 80% de uso, âmbar de 80% a 100% e vermelha (cheia) acima de 100%. Estourados
primeiro, depois do maior para o menor uso. Com estouro, um resumo no topo ("2 categorias acima do
limite"). Sem limites, o estado vazio.

Ainda não há como criar limites pela tela (T-026); esta tarefa entrega o acompanhamento.

## Escopo

- `domain`: `budgetStatuses` ganha `usage` (gasto ÷ limite), `state` (`ok` / `warning` / `over`, com
  limiares de 80% e 100%) e a ordenação da spec.
- `application`: `get-month-overview` passa a carregar os orçamentos e devolver `budgets`
  (os estados do mês).
- `presentation`: `features/budgets/components/budget-section.tsx` e `budget-item.tsx` (barra com o
  `Progress` do shadcn, limitada visualmente a 100%; o estado também aparece em texto).
- Entrada `"./src/presentation/features/budgets/"` no `coverageThreshold`.

## Critérios de aceite

- [ ] Lazer = R$ 400, gasto R$ 100 → 25%, "Restam R$ 300,00", barra primária. *(critério 1)*
- [ ] Gasto R$ 340 (85%) → barra âmbar. *(critério 2)*
- [ ] Gasto R$ 450 → barra vermelha cheia e "Excedeu R$ 50,00". *(critério 3)*
- [ ] Limiares exatos: 79,9% normal; 80% atenção; 100% atenção; 100,1% estourado; gasto zero normal.
- [ ] Trocar de mês recalcula os gastos e mantém os limites. *(critério 8)*
- [ ] Criar uma despesa na categoria atualiza a barra sem recarregar. *(critério 9; as actions já revalidam `/`)*
- [ ] Gate de qualidade verde.

## Tamanho

~6 arquivos de produção, ~170 linhas.
