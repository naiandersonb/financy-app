# T-007 — Criar categoria (com validação no servidor)

| Campo | Valor |
|-------|-------|
| Spec | [03 — Categorias](../specs/03-categorias.md), "Campos", regras 2, 3 e 7 |
| Status | A fazer |
| Depende de | [T-006](T-006-listar-categorias.md) |
| Bloqueia | T-008 |

## Comportamento

Em `/categories`, o botão **"Nova categoria"** abre um diálogo com nome, tipo, cor de fundo e cor do
texto. Cada cor tem um seletor nativo (`<input type="color">`) e um campo hexadecimal sincronizados.
O servidor valida tudo, inclusive o **contraste mínimo de 4,5:1**, o nome duplicado e o limite de 50.

## Escopo (corte vertical)

| Camada | Arquivos |
|--------|----------|
| `shared` | `color-contrast.ts` (`parseHexColor`, `relativeLuminance`, `contrastRatio`, fórmula WCAG 2.x) |
| `domain` | `category.ts` (`MIN_CATEGORY_CONTRAST`, `MAX_CATEGORIES_PER_USER`, `hasReadableContrast`) |
| `application` | `category-input-schema.ts`; porta ganha `create` e `countByUser`; caso de uso `create-category.ts` |
| `infrastructure` | repositório: `create` (traduz `23505` em nome duplicado) e `countByUser` |
| `main` | `makeCreateCategory` |
| `presentation` | `category-dialog.tsx`, `color-field.tsx` |
| `app` | `(finance)/categories/actions.ts` (`createCategory`, `revalidatePath`) |

## Critérios de aceite cobertos

- [ ] "Pets", Despesa, fundo `#FDE68A`, texto `#78350F` → aparece em Despesas com essas cores (guardadas em minúsculas). *(critério 2)*
- [ ] "pets" em Despesas quando já existe "Pets" → "Já existe uma categoria com esse nome", nada criado. *(critério 3)*
- [ ] "Outros" em Receitas quando já existe "Outros" em Despesas → permitido. *(critério 4)*
- [ ] Nome vazio ou com mais de 30 caracteres → erro. *(critério 5)*
- [ ] Cor inválida (`#12345`, `azul`) enviada ao servidor → rejeitada. *(critério 6)*
- [ ] Fundo `#ffffff` e texto `#eeeeee` → rejeitado pelo servidor, mesmo forçando a requisição. *(critério 7, parte do servidor; o aviso na tela vem na T-008)*
- [ ] Com 50 categorias, criar outra → "Limite de 50 categorias atingido". *(critério 13)*
- [ ] Seletor de cor e campo hexadecimal se mantêm sincronizados. *(parte do critério 8; a prévia vem na T-008)*
- [ ] Gate de qualidade verde.

## Tamanho

~10 arquivos de produção, ~260 linhas.
