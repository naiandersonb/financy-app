# T-011 — Remover categoria (com bloqueios)

| Campo | Valor |
|-------|-------|
| Spec | [03 — Categorias](../specs/03-categorias.md), regras 5 e 6 |
| Status | Concluída |
| Depende de | [T-009](T-009-referencias-por-id.md) |
| Bloqueia | — |

## Comportamento

Cada categoria tem a ação **Remover**, que pede confirmação. A remoção é bloqueada, com mensagem
explicando o motivo, quando a categoria tem lançamentos, tem orçamento ou é a última do seu tipo.

## Escopo (corte vertical)

- `application`: porta ganha `delete` e `usage(id)`; caso de uso `delete-category.ts` (regras 5 e 6).
  A mensagem diz quantos lançamentos usam a categoria (no singular quando é um).
- `infrastructure`: `delete` e `countUsage`; violação de FK (`23503`) vira "categoria em uso", como
  segunda barreira para corrida entre a contagem e a exclusão.
- `main`: `makeDeleteCategory`.
- `presentation`: `delete-category-button.tsx`, com janela de confirmação do próprio app (não o
  `window.confirm` do navegador), mostrando o selo da categoria e o motivo quando a remoção é bloqueada.
- `app`: action `deleteCategory`.

## Critérios de aceite cobertos

- [x] Categoria sem lançamentos nem orçamento → removida após confirmar; cancelar não muda nada. *(critério 10)*
- [x] Categoria com lançamentos → "Esta categoria tem N lançamentos e não pode ser removida. Mova os lançamentos para outra categoria antes." *(critério 11)*
- [x] Categoria com orçamento → mensagem equivalente sobre o orçamento.
- [x] Última categoria de Receita → remoção bloqueada. *(critério 12)*
- [x] Gate de qualidade verde.

## Tamanho

Medido: 9 arquivos de produção, +208/−9 linhas.
