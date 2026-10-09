# T-011 — Remover categoria (com bloqueios)

| Campo | Valor |
|-------|-------|
| Spec | [03 — Categorias](../specs/03-categorias.md), regras 5 e 6 |
| Status | A fazer |
| Depende de | [T-009](T-009-referencias-por-id.md) |
| Bloqueia | — |

## Comportamento

Cada categoria tem a ação **Remover**, que pede confirmação. A remoção é bloqueada, com mensagem
explicando o motivo, quando a categoria tem lançamentos, tem orçamento ou é a última do seu tipo.

## Escopo (corte vertical)

- `application`: porta ganha `delete` e `countUsage(id)`; caso de uso `delete-category.ts` (regras 5 e 6).
- `infrastructure`: `delete` e `countUsage`; violação de FK (`23503`) vira "categoria em uso", como
  segunda barreira para corrida entre a contagem e a exclusão.
- `main`: `makeDeleteCategory`.
- `presentation`: botão Remover com confirmação e exibição do erro.
- `app`: action `deleteCategory`.

## Critérios de aceite cobertos

- [ ] Categoria sem lançamentos nem orçamento → removida após confirmar; cancelar não muda nada. *(critério 10)*
- [ ] Categoria com lançamentos → "Esta categoria tem N lançamentos e não pode ser removida. Mova os lançamentos para outra categoria antes." *(critério 11)*
- [ ] Categoria com orçamento → mensagem equivalente sobre o orçamento.
- [ ] Última categoria de Receita → remoção bloqueada. *(critério 12)*
- [ ] Gate de qualidade verde.

## Tamanho

~6 arquivos de produção, ~130 linhas.
