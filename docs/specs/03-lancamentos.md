# Spec 03 — Lançamentos (receitas e despesas)

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
| Categoria | sim | Uma das categorias do tipo escolhido (lista abaixo). |
| Data | sim | Data válida. Padrão: hoje, se o mês exibido for o atual; senão, dia 1º do mês exibido. |

### Categorias (fixas na v1)

- **Despesa:** Moradia, Alimentação, Transporte, Saúde, Educação, Lazer, Compras,
  Contas e serviços, Outros.
- **Receita:** Salário, Freelance, Investimentos, Outros.

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
  data curta (ex.: `08 de out.`), descrição, categoria e valor (`+ R$` em verde para
  receita, `− R$` em vermelho para despesa), além das ações **Editar** e **Excluir**.
- **Editar** abre o mesmo diálogo já preenchido.
- **Estado vazio**: "Nenhum lançamento neste mês", com chamada para criar o primeiro.
- O diálogo fecha sozinho quando a gravação dá certo; se der erro, continua aberto mostrando a mensagem.
- Enquanto salva, o botão "Salvar" fica desabilitado ("Salvando…").

## Critérios de aceite

- [ ] Dado o formulário preenchido corretamente, quando salvo, então o lançamento aparece na lista do mês da sua data.
- [ ] Dado um valor `0`, negativo ou com mais de 2 casas, quando salvo, então vejo um erro e nada é gravado.
- [ ] Dado uma descrição vazia ou com mais de 120 caracteres, quando salvo, então vejo um erro.
- [ ] Dado uma categoria que não pertence ao tipo escolhido (requisição forjada), então o servidor rejeita.
- [ ] Dado um lançamento existente, quando edito o valor e salvo, então a lista e os totais refletem o novo valor.
- [ ] Dado um lançamento existente, quando mudo a data para outro mês, então ele some do mês atual.
- [ ] Dado um lançamento, quando clico em excluir e confirmo, então ele some; se cancelo, nada muda.
- [ ] Dado um mês sem lançamentos, então vejo o estado vazio.
- [ ] Valores aparecem no formato `R$ 1.234,56`.

## Notas técnicas

| Camada | Arquivos |
|--------|----------|
| `domain` | `transaction.ts` (`Transaction`, `TransactionKind`); `category.ts` (categorias por tipo, `isValidCategory`) |
| `application` | Porta `ports/transaction-repository.ts` (`listByMonth`, `create`, `update`, `delete`); schemas `schemas/amount-schema.ts` e `schemas/transaction-input-schema.ts` (valida a categoria contra o tipo); casos de uso `use-cases/list-month-transactions.ts`, `save-transaction.ts`, `delete-transaction.ts` |
| `infrastructure` | `supabase/supabase-transaction-repository.ts` (mapeia `amount_cents`/`occurred_on` ↔ entidade) |
| `main` | `makeListMonthTransactions`, `makeSaveTransaction`, `makeDeleteTransaction` |
| `presentation` | `features/transactions/components/transaction-dialog.tsx`, `transaction-list.tsx`, `delete-transaction-button.tsx`; `formatters/money.ts` e `formatters/date.ts` |
| `app` | `(finance)/actions.ts` (`saveTransaction`, `deleteTransaction`, seguidas de `revalidatePath("/")`) |

- Tabela `transactions` (ver visão geral) com RLS `auth.uid() = user_id` e índice em `(user_id, occurred_on)`; migration em `supabase/migrations/`.
- Consulta do mês: `occurred_on >= 'AAAA-MM-01' AND occurred_on < primeiro dia do mês seguinte` (intervalo vindo de `domain/month-key.ts`).
- Ações chegam aos componentes de cliente por props (ex.: `<TransactionDialog onSave={saveTransaction} />`).

## Conformidade com a constituição

| Princípio | Como esta spec atende |
|-----------|-----------------------|
| Clean Architecture | Acesso ao banco só pela porta `TransactionRepository`; regras de categoria no `domain` |
| Cobertura > 90% | Entrada `"./src/presentation/features/transactions/"` no `coverageThreshold`; testes de `category`, dos schemas (valores-limite: `0`, `0.001`, 120/121 caracteres, categoria de outro tipo), dos casos de uso (repositório fake), do repositório (Supabase mockado), dos componentes (criar, editar, excluir com confirmação/cancelamento, estado vazio) e das actions |
| Dinheiro em centavos | `amount-schema` converte para centavos inteiros; formatação só em `presentation/formatters` |
| Validação com zod | `transactionInputSchema` no servidor |
| RLS | Migration com política `auth.uid() = user_id` |

**Exceções:** nenhuma.

## Fora do escopo

Lançamentos recorrentes ou parcelados, anexos/comprovantes, busca e filtros na lista,
paginação (um mês costuma ter poucas dezenas de itens), notas/observações, desfazer exclusão.

## Questões em aberto

- Precisa de filtro por tipo/categoria na lista já na v1?
- As categorias devem ser personalizáveis pelo usuário (seria uma tabela `categories`)?
