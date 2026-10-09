# T-006 — Página de categorias (listagem)

| Campo | Valor |
|-------|-------|
| Spec | [03 — Categorias](../specs/03-categorias.md), "Onde a categoria aparece" e "Telas e interações" (listagem) |
| Status | A fazer |
| Depende de | [T-005](T-005-tabela-categorias.md) |
| Bloqueia | T-007 |

## Comportamento

O usuário acessa **Categorias** pelo cabeçalho e vê as próprias categorias em `/categories`, em duas
seções ("Despesas" e "Receitas"), em ordem alfabética, cada uma como selo com as suas cores.

## Escopo (corte vertical)

| Camada | Arquivos |
|--------|----------|
| `domain` | `category.types.ts` (`Category`) |
| `application` | porta `category-repository.ts` (só `listByUser`), caso de uso `list-categories.ts` |
| `infrastructure` | `supabase-category-repository.ts` (`listByUser`) |
| `main` | `makeListCategories` |
| `presentation` | `features/categories/`: `category-badge.tsx`, `category-list.tsx`, barrel; link "Categorias" no `AppHeader` |
| `app` | `(finance)/categories/page.tsx` |

Entrada `"./src/presentation/features/categories/"` no `coverageThreshold`.

## Critérios de aceite cobertos

- [ ] Usuário recém-cadastrado abre `/categories` e vê as 13 categorias padrão com as cores da tabela. *(critério 1)*
- [ ] Seções "Despesas" e "Receitas" em ordem alfabética; o selo sempre mostra o nome.
- [ ] O cabeçalho tem o link "Categorias".
- [ ] Gate de qualidade verde.

## Tamanho

~9 arquivos de produção, ~170 linhas.
