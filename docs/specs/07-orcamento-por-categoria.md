# Spec 07 — Orçamento por categoria

## Objetivo

Permitir definir um limite mensal de gasto por categoria e acompanhar quanto já foi usado,
com alerta claro quando o limite for ultrapassado.

## Histórias de usuário

- Como usuário, quero definir um limite mensal para uma categoria de despesa (ex.: Lazer até R$ 400).
- Como usuário, quero ver quanto já gastei de cada limite e quanto ainda resta no mês.
- Como usuário, quero ser avisado quando estiver perto do limite ou já tiver passado dele.
- Como usuário, quero alterar ou remover um limite.

## Regras de negócio

1. O orçamento é **recorrente**: um limite por categoria vale para todos os meses até ser alterado.
   (Na v1 não há limite diferente por mês.)
2. Só categorias de **despesa** podem ter orçamento; no máximo um por categoria.
3. Limite maior que zero, até 2 casas decimais, guardado em centavos.
4. Para o mês selecionado, cada orçamento mostra:
   - **Gasto** = soma das despesas da categoria no mês.
   - **Restante** = Limite − Gasto (pode ser negativo).
   - **Uso** = Gasto ÷ Limite.
5. Estados:
   | Uso | Estado | Aparência |
   |-----|--------|-----------|
   | < 80% | Dentro do limite | barra na cor primária, "Restam R$ X" |
   | 80% a 100% | Atenção | barra âmbar, "Restam R$ X" |
   | > 100% | Estourado | barra vermelha cheia, "Excedeu R$ X" |
6. Alterar um limite muda o cálculo de todos os meses, inclusive os passados (consequência da regra 1).
7. Remover um orçamento pede confirmação; os lançamentos não são afetados.

## Telas e interações

- Seção **"Orçamentos"** na tela principal, abaixo de "Gastos por categoria".
- Botão **"Definir limite"**: abre um diálogo com a categoria (somente categorias de despesa
  que ainda não têm orçamento) e o valor do limite. Se todas já tiverem, o botão fica oculto.
- Cada item mostra: selo da categoria (com as cores dela, ver [spec 03](03-categorias.md)), `R$ gasto de R$ limite`, barra de progresso, texto de restante/excedente
  e as ações Editar (só o valor) e Remover.
- Ordem: estourados primeiro, depois do maior para o menor uso.
- Estado vazio: "Nenhum limite definido. Defina limites para acompanhar seus gastos."
- Um resumo no topo da seção, quando houver estouro: "2 categorias acima do limite".

## Critérios de aceite

- [ ] Dado que defino Lazer = R$ 400 e gastei R$ 100 em Lazer no mês, então vejo 25%, "Restam R$ 300,00", barra primária.
- [ ] Dado gasto de R$ 340 (85%), então a barra fica âmbar.
- [ ] Dado gasto de R$ 450, então vejo a barra vermelha cheia e "Excedeu R$ 50,00".
- [ ] Dado que Lazer já tem orçamento, então Lazer não aparece na lista do diálogo "Definir limite".
- [ ] Dado um limite `0` ou negativo, então vejo um erro e nada é gravado.
- [ ] Quando edito o limite de Lazer para R$ 500, então todos os meses passam a usar R$ 500.
- [ ] Quando removo um orçamento e confirmo, então ele some e os lançamentos continuam intactos.
- [ ] Quando troco de mês, então os valores gastos refletem o novo mês e os limites continuam os mesmos.
- [ ] Quando crio uma despesa na categoria, então a barra do orçamento se atualiza sem recarregar.

## Notas técnicas

| Camada | Arquivos |
|--------|----------|
| `domain` | `budget.ts` (`Budget`); `budget-status.ts` (`budgetStatuses`: gasto, restante, uso e estado `ok`/`warning`/`over` com limiares de 80% e 100%, ordenação) |
| `application` | Porta `ports/budget-repository.ts` (`list`, `upsert`, `delete`); schema `schemas/budget-input-schema.ts` (só categorias de despesa); casos de uso `use-cases/list-budgets.ts`, `save-budget.ts`, `delete-budget.ts`. O `user_id` do upsert vem do `AuthGateway` |
| `infrastructure` | `supabase/supabase-budget-repository.ts` (`upsert` na PK `(user_id, category_id)`) |
| `main` | `makeListBudgets`, `makeSaveBudget`, `makeDeleteBudget` |
| `presentation` | `features/budgets/components/budget-section.tsx`, `budget-dialog.tsx`, `budget-item.tsx` (usa o `Progress` do shadcn em `presentation/components/progress.tsx`, valor visual limitado a 100%) |
| `app` | `(finance)/actions.ts` (`saveBudget`, `deleteBudget`) |

- Tabela `budgets` com PK `(user_id, category_id)` e RLS; a FK composta da spec 03 garante que só
  categorias de despesa do próprio usuário recebem orçamento. Uma categoria com orçamento não pode ser
  removida (spec 03, regra 5).

## Conformidade com a constituição

| Princípio | Como esta spec atende |
|-----------|-----------------------|
| Clean Architecture | Estados do orçamento calculados no `domain`; persistência pela porta `BudgetRepository` |
| Cobertura > 90% | Entrada `"./src/presentation/features/budgets/"` no `coverageThreshold`; testes de `budgetStatuses` nos limites (79,9%, 80%, 100%, 100,1%, gasto zero), do schema, dos casos de uso (repositório e gateway fakes), do repositório, dos componentes (definir, editar, remover, categorias já usadas fora do diálogo, resumo de estouros) e das actions |
| Validação com zod | `budgetInputSchema` no servidor |
| RLS | Migration com política `auth.uid() = user_id` |

**Exceções:** nenhuma.

## Tarefas

1. [T-025 — Seção de orçamentos do mês (acompanhamento)](../tasks/T-025-secao-de-orcamentos.md)
2. [T-026 — Definir limite de uma categoria](../tasks/T-026-definir-limite.md)
3. [T-027 — Editar o valor de um limite](../tasks/T-027-editar-limite.md)
4. [T-028 — Remover orçamento](../tasks/T-028-remover-orcamento.md)

## Fora do escopo

Limite diferente por mês, rollover (sobra de um mês somando no próximo), notificações por
e-mail/push, orçamento total do mês (todas as categorias somadas), orçamento para receitas.

## Questões em aberto

- O limite deveria ser por mês (permitindo histórico e valores diferentes por mês) em vez de recorrente?
  Isso mudaria a PK para `(user_id, category_id, month)`.
- O limiar de atenção de 80% está bom ou deve ser configurável?
