# Spec 06 — Gastos por categoria

## Objetivo

Mostrar para onde o dinheiro foi no mês, destacando as categorias que mais pesam.

## Histórias de usuário

- Como usuário, quero ver quanto gastei em cada categoria no mês.
- Como usuário, quero identificar rapidamente as maiores categorias de gasto.

## Regras de negócio

1. Considera apenas lançamentos do tipo **despesa** do mês selecionado.
2. O agrupamento é pelo **id** da categoria (duas categorias nunca se misturam, mesmo que sejam renomeadas).
   Para cada categoria com gasto maior que zero: total gasto e percentual sobre o total de despesas do mês.
3. Categorias sem gasto no mês não aparecem.
4. Ordenação: maior gasto primeiro; em caso de empate, ordem alfabética.
5. Os percentuais são arredondados para inteiro só na exibição (podem não somar exatamente 100%).

## Visualização

Lista de barras horizontais (melhor que gráfico de pizza para comparar valores e legível no celular):

```
Moradia        R$ 1.800,00   56%  ███████████████████▍
Alimentação    R$   850,00   27%  █████████
Transporte     R$   320,50   10%  ███▌
Lazer          R$   230,00    7%  ██▍
```

- Cada linha: selo da categoria (nome com as cores escolhidas pelo usuário, ver [spec 03](03-categorias.md)),
  valor, percentual e barra proporcional ao percentual.
- Todas as barras na mesma cor (a primária do tema); a ordem e o comprimento já mostram a
  hierarquia. As cores da categoria ficam só no selo: muitas são tons claros pensados para fundo de
  texto, que sumiriam como barra sobre fundo branco.
- Estado vazio: "Nenhuma despesa neste mês."
- Acessibilidade: valor e percentual sempre em texto, sem depender só da barra.

## Critérios de aceite

- [x] Dado despesas de R$ 300 em Alimentação e R$ 100 em Lazer, então vejo Alimentação 75% e Lazer 25%, nessa ordem. _(teste automatizado)_
- [x] Receitas nunca aparecem nesta seção. _(teste automatizado)_
- [x] Dado um mês só com receitas, então vejo o estado vazio. _(teste automatizado)_
- [ ] Quando edito a categoria de uma despesa, então os valores das duas categorias se atualizam.
- [ ] Quando renomeio ou recolorizo uma categoria, então a linha dela mostra o novo selo.
- [ ] Quando troco de mês, então a seção mostra os gastos do novo mês.

## Notas técnicas

| Camada | Arquivos |
|--------|----------|
| `domain` | `category-spending.ts` (`spendingByCategory(transactions, categories)`: só despesas, agrupa por `categoryId`, ordem por valor e depois alfabética pelo nome) |
| `application` | Reaproveita `get-month-overview.ts` (spec 05), que passa a devolver também os gastos por categoria |
| `presentation` | `features/category-spending/components/category-breakdown.tsx` (usa `CategoryBadge` do barrel de `features/categories`) |

- Calculado a partir dos lançamentos que o caso de uso já carregou (não precisa de outra consulta).
- Barras em CSS (largura em %), sem biblioteca de gráficos na v1.

## Conformidade com a constituição

| Princípio | Como esta spec atende |
|-----------|-----------------------|
| Clean Architecture | Agregação no `domain`; componente só exibe |
| Cobertura > 90% | Entrada `"./src/presentation/features/category-spending/"` no `coverageThreshold`; testes de `spendingByCategory` (empate, só receitas, total zero) e do componente (ordem, percentuais em texto, estado vazio) |
| Sem dependência nova | Barras em CSS |

**Exceções:** nenhuma.

## Tarefas

1. [T-023 — Gastos por categoria do mês](../tasks/T-023-gastos-por-categoria.md)

## Fora do escopo

Clicar na categoria para filtrar a lista, gráfico de pizza ou rosca, comparação com meses
anteriores, receitas por categoria.

## Questões em aberto

- Clicar em uma categoria deveria filtrar a lista de lançamentos? (seria uma boa v1.1)
