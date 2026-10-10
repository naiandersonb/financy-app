# T-023 — Gastos por categoria do mês

| Campo | Valor |
|-------|-------|
| Spec | [06 — Gastos por categoria](../specs/06-gastos-por-categoria.md) (inteira) |
| Status | Concluída (falta conferir no navegador os critérios 4 a 6 da spec) |
| Depende de | [T-022](T-022-cartoes-de-resumo.md) (caso de uso `get-month-overview`) |
| Bloqueia | — |

## Comportamento

Na tela principal, uma seção **"Gastos por categoria"** mostra, para cada categoria com despesa no
mês: o selo da categoria, o valor, o percentual sobre o total de despesas e uma barra proporcional.
Maior gasto primeiro; empate em ordem alfabética. Receitas não entram. Mês sem despesas mostra
"Nenhuma despesa neste mês."

## Escopo

- `domain`: `spendingByCategory(transactions, categories)` passa a desempatar pela ordem alfabética
  do nome (por isso recebe as categorias). A ordenação alfabética do pt-BR, hoje no view model de
  `presentation` (`categoriesByKind`), passa para o `domain` como `compareCategoryNames`, para as
  duas usarem a mesma regra.
- `application`: `get-month-overview` passa a carregar também as categorias e a devolver
  `{ transactions, summary, categories, spending }`. A página deixa de buscar as categorias por fora.
- `presentation`: `features/category-spending/components/category-breakdown.tsx` (selo do barrel de
  `features/categories`, barras em CSS na cor primária, valor e percentual sempre em texto).
- Entrada `"./src/presentation/features/category-spending/"` no `coverageThreshold`.

## Critérios de aceite

- [x] R$ 300 em Alimentação e R$ 100 em Lazer → Alimentação 75% e Lazer 25%, nessa ordem. *(critério 1)*
- [x] Empate de valor → ordem alfabética pelo nome da categoria.
- [x] Receitas nunca aparecem. *(critério 2)*
- [x] Mês só com receitas → estado vazio. *(critério 3)*
- [ ] Editar a categoria de uma despesa atualiza as duas linhas; renomear ou recolorir muda o selo; trocar de mês mostra os gastos do novo mês. *(critérios 4–6: a seção é recalculada a cada renderização da página, que as actions revalidam)*
- [x] Gate de qualidade verde.

## Tamanho

Medido: 7 arquivos de produção, ~150 linhas.
