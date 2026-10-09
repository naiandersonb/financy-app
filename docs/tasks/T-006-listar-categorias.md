# T-006 — Página de categorias (listagem)

| Campo | Valor |
|-------|-------|
| Spec | [03 — Categorias](../specs/03-categorias.md), "Onde a categoria aparece" e "Telas e interações" (listagem) |
| Status | Implementada (aguardando revisão) |
| Depende de | [T-005](T-005-tabela-categorias.md) |
| Bloqueia | T-007 |

## Comportamento

O usuário acessa **Categorias** pelo cabeçalho e vê as próprias categorias em `/categories`, em duas
seções ("Despesas" e "Receitas"), em ordem alfabética, cada uma como selo com as suas cores.

## Escopo (corte vertical)

| Camada | Arquivos |
|--------|----------|
| `domain` | `category.types.ts` (`Category`) |
| `application` | porta `category-repository.ts` (só `list`; o RLS já restringe ao usuário), caso de uso `list-categories.ts` |
| `infrastructure` | `supabase-category-repository.ts` (`list`) |
| `main` | `makeListCategories` |
| `presentation` | `features/categories/`: `category-badge.tsx`, `category-list.tsx`, view model `categories-by-kind.ts` (ordem alfabética do pt-BR), barrel; link "Categorias" no `AppHeader` |
| `app` | `(finance)/categories/page.tsx` |

Entrada `"./src/presentation/features/categories/"` no `coverageThreshold`.

## Critérios de aceite cobertos

- [ ] Usuário recém-cadastrado abre `/categories` e vê as 13 categorias padrão com as cores da tabela. *(critério 1)*
- [x] Seções "Despesas" e "Receitas" em ordem alfabética; o selo sempre mostra o nome.
- [x] O cabeçalho tem o link "Categorias".
- [x] Gate de qualidade verde.

## Tamanho

~9 arquivos de produção, ~170 linhas.
