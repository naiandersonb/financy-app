# Spec 04 — Lançamentos (receitas e despesas)

## Objetivo

Registrar cada entrada e saída de dinheiro para que os resumos do mês reflitam a realidade.

## Histórias de usuário

- Como usuário, quero registrar uma despesa com descrição, valor, categoria e data.
- Como usuário, quero registrar uma receita (salário, freela…) da mesma forma.
- Como usuário, quero ver a lista de lançamentos do mês que estou consultando.
- Como usuário, quero corrigir um lançamento que registrei errado.
- Como usuário, quero excluir um lançamento que não deveria existir.

## Campos

| Campo | Obrigatório | Regras |
|-------|-------------|--------|
| Tipo | sim | `Despesa` ou `Receita`. Padrão: Despesa. |
| Descrição | sim | 1 a 120 caracteres, sem espaços nas pontas. |
| Valor | sim | Maior que zero, até 2 casas decimais. Guardado em centavos. |
| Categoria | sim | Uma das categorias **do usuário** do tipo escolhido (ver [spec 03](03-categorias.md)). |
| Data | sim | Data válida. Padrão: hoje, se o mês exibido for o atual; senão, dia 1º do mês exibido. |

### Categorias

As categorias vêm do cadastro do próprio usuário ([spec 03](03-categorias.md)), em ordem alfabética.
O seletor nativo lista os nomes; ao lado dele aparece o selo da categoria escolhida, com as cores
dela.

Ao trocar o tipo, a lista de categorias muda e a seleção volta para a primeira
categoria do novo tipo.

## Regras de negócio

1. Um lançamento pertence a exatamente um usuário e um dia.
2. O mês de um lançamento é definido pela data; se a data mudar para outro mês, ele
   deixa de aparecer no mês atual e passa a aparecer no novo.
3. A validação acontece no servidor (a do navegador serve só para conforto). Mensagens de erro em português.
4. A exclusão pede confirmação e é definitiva (sem lixeira na v1).
5. Depois de criar, editar ou excluir, lista, resumo, gastos por categoria e orçamentos
   são atualizados sem recarregar a página.

## Telas e interações

- Botão **"Novo lançamento"** ao lado do seletor de mês: abre um diálogo com o formulário.
- **Lista do mês**: ordenada por data (mais recente primeiro) e, no mesmo dia, pela ordem
  de criação. Cada linha mostra:
  data curta (ex.: `08 de out`), descrição, selo da categoria (com as cores dela) e valor (`+ R$` em verde para
  receita, `− R$` em vermelho para despesa), além das ações **Editar** e **Excluir**.
- **Editar** abre o mesmo diálogo já preenchido.
- **Estado vazio**: "Nenhum lançamento neste mês", com chamada para criar o primeiro.
- O diálogo fecha sozinho quando a gravação dá certo; se der erro, continua aberto mostrando a mensagem.
- Enquanto salva, o botão "Salvar" fica desabilitado ("Salvando…").

## Critérios de aceite

Marcado = verificado por teste (indicado ao lado). Os abertos são fluxos de ponta a ponta na tela
(criar, editar, mudar de mês, excluir), que dependem de conferência no navegador com login; cada
passo deles já tem teste de componente, caso de uso e action.

- [ ] Dado o formulário preenchido corretamente, quando salvo, então o lançamento aparece na lista do mês da sua data.
- [x] Dado um valor `0`, negativo ou com mais de 2 casas, quando salvo, então vejo um erro e nada é gravado. _(teste automatizado)_
- [x] Dado uma descrição vazia ou com mais de 120 caracteres, quando salvo, então vejo um erro. _(teste automatizado)_
- [x] Dado uma categoria que não pertence ao tipo escolhido ou a outro usuário (requisição forjada), então o servidor rejeita. _(testes automatizado e de integração)_
- [x] Quando renomeio ou recolorizo uma categoria, então os lançamentos dela mostram o novo nome e as novas cores. _(testes automatizado e de integração)_
- [ ] Dado um lançamento existente, quando edito o valor e salvo, então a lista e os totais refletem o novo valor.
- [ ] Dado um lançamento existente, quando mudo a data para outro mês, então ele some do mês atual.
- [ ] Dado um lançamento, quando clico em excluir e confirmo, então ele some; se cancelo, nada muda.
- [x] Dado um mês sem lançamentos, então vejo o estado vazio. _(teste automatizado)_
- [x] Valores aparecem no formato `R$ 1.234,56`. _(teste automatizado)_

## Notas técnicas

| Camada | Arquivos |
|--------|----------|
| `domain` | `transaction.ts` (`Transaction` com `categoryId`, `TransactionKind`) |
| `application` | Porta `ports/transaction-repository.ts` (`listByMonth`, `create`, `update`, `delete`); schemas `schemas/amount-schema.ts` e `schemas/transaction-input-schema.ts` (`categoryId` como uuid); `save-transaction` confere, pelo `CategoryRepository` da spec 03, que a categoria é do usuário e do mesmo tipo; casos de uso `use-cases/list-month-transactions.ts`, `save-transaction.ts`, `delete-transaction.ts` |
| `infrastructure` | `supabase/supabase-transaction-repository.ts` (mapeia `amount_cents`/`occurred_on`/`category_id` ↔ entidade). O selo da categoria é montado na tela cruzando `categoryId` com a lista de categorias do usuário, que a página já carrega para o diálogo |
| `main` | `makeListMonthTransactions`, `makeSaveTransaction`, `makeDeleteTransaction` |
| `presentation` | `features/transactions/components/transaction-dialog.tsx` (recebe a lista de categorias por prop), `transaction-list.tsx` (usa `CategoryBadge` do barrel de `features/categories`), `delete-transaction-button.tsx`; `formatters/money.ts` e `formatters/date.ts` |
| `app` | `(finance)/actions.ts` (`saveTransaction`, `deleteTransaction`, seguidas de `revalidatePath("/")`) |

- Tabela `transactions` (ver visão geral) com RLS `auth.uid() = user_id` e índice em `(user_id, occurred_on)`; migration em `supabase/migrations/`.
- A FK composta `(category_id, user_id, kind)` da spec 03 é a barreira final contra categoria de outro usuário ou de outro tipo.
- Consulta do mês: `occurred_on >= 'AAAA-MM-01' AND occurred_on < primeiro dia do mês seguinte` (intervalo vindo de `domain/month-key.ts`).
- Ações chegam aos componentes de cliente por props (ex.: `<TransactionDialog onSave={saveTransaction} />`).

## Conformidade com a constituição

| Princípio | Como esta spec atende |
|-----------|-----------------------|
| Clean Architecture | Acesso ao banco só pelas portas `TransactionRepository` e `CategoryRepository` |
| Cobertura > 90% | Entrada `"./src/presentation/features/transactions/"` no `coverageThreshold`; testes dos schemas (valores-limite: `0`, `0.001`, 120/121 caracteres, `categoryId` inválido), dos casos de uso com categoria de outro tipo/usuário, dos casos de uso (repositório fake), do repositório (Supabase mockado), dos componentes (criar, editar, excluir com confirmação/cancelamento, estado vazio) e das actions |
| Dinheiro em centavos | `amount-schema` converte para centavos inteiros; formatação só em `presentation/formatters` |
| Validação com zod | `transactionInputSchema` no servidor |
| RLS | Migration com política `auth.uid() = user_id` |

**Exceções:** nenhuma.

## Tarefas

Ordem de implementação:

1. [T-016 — Tela principal com a lista de lançamentos do mês](../tasks/T-016-tela-lista-lancamentos.md)
2. [T-015 — Diálogo de lançamento mantém os campos quando há erro](../tasks/T-015-dialogo-lancamento-mantem-campos.md)
3. [T-017 — Criar lançamento pela tela principal](../tasks/T-017-criar-lancamento.md)
4. [T-018 — Editar lançamento pela lista](../tasks/T-018-editar-lancamento.md)
5. [T-019 — Extrair o botão de exclusão com confirmação](../tasks/T-019-extrair-confirmacao-de-exclusao.md) (refatoração preparatória)
6. [T-020 — Excluir lançamento com confirmação](../tasks/T-020-excluir-lancamento.md)

## Fora do escopo

Lançamentos recorrentes ou parcelados, anexos/comprovantes, busca e filtros na lista,
paginação (um mês costuma ter poucas dezenas de itens), notas/observações, desfazer exclusão.

## Questões em aberto

- Precisa de filtro por tipo/categoria na lista já na v1?
