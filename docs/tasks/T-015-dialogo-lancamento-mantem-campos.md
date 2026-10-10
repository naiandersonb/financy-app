# T-015 — Diálogo de lançamento mantém os campos quando há erro

| Campo | Valor |
|-------|-------|
| Spec | [04 — Lançamentos](../specs/04-lancamentos.md), "Telas e interações" (em erro, o diálogo continua aberto mostrando a mensagem) |
| Status | Concluída |
| Depende de | — (pode ser feita junto com a [T-009](T-009-referencias-por-id.md), que já altera esse diálogo) |
| Bloqueia | [T-017](T-017-criar-lancamento.md) (antes de o diálogo aparecer na tela) |

## Problema

No React 19, ao fim da action de um formulário, os campos **não controlados** voltam ao valor
inicial. Em `transaction-dialog.tsx`, descrição, valor, data e categoria usam `defaultValue`; quando
o servidor devolve erro, o diálogo continua aberto, mas esses campos são apagados e o usuário perde
o que digitou. (O mesmo problema foi corrigido no diálogo de categoria na T-007.)

Ainda não afeta o usuário: o diálogo de lançamento só passa a ser usado numa tela na spec 04.

## Solução

- Descrição, valor, data e categoria passam a ser controlados por estado (teste de regressão
  escrito antes da correção, falhando).
- O teste revelou que **o tipo também voltava para "Despesa"**: o `form.reset()` do React 19 devolve
  cada rádio ao seu `defaultChecked`, e o React não mantém esse atributo em dia como faz com o
  `value` dos campos de texto. A correção ficou no `KindSelector` (componente compartilhado), que
  mantém o `defaultChecked` igual à escolha atual. Isso corrige também o mesmo problema, ainda não
  percebido, no diálogo de categoria, que ganhou um teste para isso.

## Critérios de aceite

- [x] Depois de um erro do servidor, descrição, valor, data, categoria e tipo continuam com o que o usuário preencheu.
- [x] Na edição, os campos começam com os valores do lançamento, como hoje.
- [x] Gate de qualidade verde.

## Tamanho

Medido: 2 arquivos de produção (`transaction-dialog.tsx` e `kind-selector.tsx`), ~40 linhas.
