# T-016 — Tela principal com a lista de lançamentos do mês

| Campo | Valor |
|-------|-------|
| Spec | [04 — Lançamentos](../specs/04-lancamentos.md), "Telas e interações" (lista e estado vazio) |
| Status | Concluída (falta conferir no navegador os critérios 1 e 2) |
| Depende de | — |
| Bloqueia | T-017, T-018, T-020 |

## Comportamento

A tela `/` deixa de ser o modelo do Next e mostra os lançamentos do mês: título com o mês (ex.:
"Outubro de 2026"), lista ordenada por data (mais recente primeiro) e, no mesmo dia, pela ordem de
criação. Cada linha mostra a data curta (`08 de out`), a descrição, o selo da categoria com as cores
dela e o valor (`+ R$` em verde para receita, `− R$` em vermelho para despesa). Mês sem lançamentos
mostra "Nenhum lançamento neste mês".

O mês vem de `?month=AAAA-MM`; ausente ou inválido, usa o mês atual. As setas para trocar de mês
são da spec 05.

## Escopo

- `presentation`: `features/transactions/components/transaction-list.tsx` (cruza `categoryId` com a
  lista de categorias para o selo) e o view model do valor com sinal.
- `app`: `(finance)/page.tsx` lê `?month`, carrega lançamentos e categorias pelos casos de uso e
  compõe a tela (rota fina).
- `app/layout.tsx` (raiz): título "Finanças" e `lang="pt-BR"`, que ainda estão com os valores do
  modelo do Next ("Create Next App" e `lang="en"`).

## Critérios de aceite

- [ ] `/` mostra os lançamentos do mês atual, na ordem da spec.
- [ ] `/?month=2026-09` mostra setembro; `/?month=2026-13` mostra o mês atual.
- [x] Valores no formato `R$ 1.234,56`, com sinal e cor por tipo (a cor não é a única pista: o sinal também aparece). *(critério 10)*
- [x] Mês sem lançamentos mostra o estado vazio. *(critério 9)*
- [x] Renomear ou recolorir uma categoria muda o selo dos lançamentos dela. *(critério 5)*
- [x] Gate de qualidade verde.

Também removidos `public/next.svg` e `public/vercel.svg`, usados só pela página do modelo que esta
tarefa substitui.

## Tamanho

Medido: 5 arquivos de produção, ~120 linhas.
