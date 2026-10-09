# T-015 — Diálogo de lançamento mantém os campos quando há erro

| Campo | Valor |
|-------|-------|
| Spec | [04 — Lançamentos](../specs/04-lancamentos.md), "Telas e interações" (em erro, o diálogo continua aberto mostrando a mensagem) |
| Status | A fazer |
| Depende de | — (pode ser feita junto com a [T-009](T-009-referencias-por-id.md), que já altera esse diálogo) |
| Bloqueia | — |

## Problema

No React 19, ao fim da action de um formulário, os campos **não controlados** voltam ao valor
inicial. Em `transaction-dialog.tsx`, descrição, valor, data e categoria usam `defaultValue`; quando
o servidor devolve erro, o diálogo continua aberto, mas esses campos são apagados e o usuário perde
o que digitou. (O mesmo problema foi corrigido no diálogo de categoria na T-007.)

Ainda não afeta o usuário: o diálogo de lançamento só passa a ser usado numa tela na spec 04.

## Solução proposta

Tornar os campos controlados por estado, como no diálogo de categoria, com teste de regressão que
reproduz o problema antes da correção.

## Critérios de aceite

- [ ] Depois de um erro do servidor, descrição, valor, data, categoria e tipo continuam com o que o usuário preencheu.
- [ ] Na edição, os campos começam com os valores do lançamento, como hoje.
- [ ] Gate de qualidade verde.

## Tamanho

1 arquivo de produção, ~30 linhas, mais os testes.
