# Spec 03 — Categorias personalizadas

## Objetivo

Permitir que cada usuário crie, edite e remova as próprias categorias de receita e de despesa,
escolhendo a **cor de fundo** e a **cor do texto** com que cada categoria aparece no app, para
reconhecer rapidamente para onde vai o dinheiro.

## Histórias de usuário

- Como usuário, quero criar uma categoria (ex.: "Pets") para classificar meus gastos do meu jeito.
- Como usuário, quero escolher a cor de fundo e a cor do texto da categoria para identificá-la de relance.
- Como usuário, quero ver como a categoria vai ficar antes de salvar.
- Como usuário, quero renomear uma categoria ou mudar suas cores.
- Como usuário, quero remover uma categoria que não uso mais.
- Como novo usuário, quero já começar com categorias prontas, sem precisar configurar nada.

## Campos

| Campo | Obrigatório | Regras |
|-------|-------------|--------|
| Nome | sim | 1 a 30 caracteres, sem espaços nas pontas. Único por usuário e tipo, sem diferenciar maiúsculas/minúsculas ("Pets" e "pets" são a mesma). |
| Tipo | sim | `Despesa` ou `Receita`. Não pode ser alterado depois da criação. |
| Cor de fundo | sim | Hexadecimal `#RRGGBB`. Padrão do formulário: `#E5E7EB`. |
| Cor do texto | sim | Hexadecimal `#RRGGBB`. Padrão do formulário: `#1F2937`. |

## Regras de negócio

1. Cada categoria pertence a um único usuário e a um único tipo.
2. **Contraste mínimo:** a combinação de cor do texto e cor de fundo precisa ter razão de contraste
   **≥ 4,5:1** (WCAG AA para texto normal). Abaixo disso, o formulário mostra o aviso
   "Pouco contraste: o nome pode ficar difícil de ler" e **não deixa salvar**.
3. As cores são guardadas em minúsculas (`#1f2937`); a entrada aceita maiúsculas.
4. **Categorias iniciais:** todo usuário novo (cadastro com senha ou com Google) recebe
   automaticamente as categorias padrão abaixo. Depois disso, elas são categorias comuns: podem ser
   renomeadas, recoloridas e removidas.

   | Tipo | Nome | Fundo | Texto |
   |------|------|-------|-------|
   | Despesa | Moradia | `#dbeafe` | `#1e3a8a` |
   | Despesa | Alimentação | `#fef3c7` | `#78350f` |
   | Despesa | Transporte | `#e0e7ff` | `#3730a3` |
   | Despesa | Saúde | `#fce7f3` | `#9d174d` |
   | Despesa | Educação | `#ede9fe` | `#5b21b6` |
   | Despesa | Lazer | `#dcfce7` | `#166534` |
   | Despesa | Compras | `#ffedd5` | `#9a3412` |
   | Despesa | Contas e serviços | `#e0f2fe` | `#075985` |
   | Despesa | Outros | `#f3f4f6` | `#374151` |
   | Receita | Salário | `#d1fae5` | `#065f46` |
   | Receita | Freelance | `#ccfbf1` | `#115e59` |
   | Receita | Investimentos | `#ecfccb` | `#3f6212` |
   | Receita | Outros | `#f3f4f6` | `#374151` |

5. **Remoção:** só é permitida se a categoria não tiver lançamentos nem orçamento. Se tiver, a remoção
   é bloqueada com a mensagem "Esta categoria tem N lançamentos e não pode ser removida. Mova os
   lançamentos para outra categoria antes." (ou "…tem um orçamento definido…").
6. Cada usuário precisa manter pelo menos uma categoria de cada tipo; remover a última de um tipo é
   bloqueado.
7. Limite de 50 categorias por usuário.
8. Renomear ou recolorir uma categoria se reflete imediatamente em todos os lançamentos, gastos
   por categoria e orçamentos, inclusive de meses passados, pois eles guardam a referência à
   categoria, não o nome.

## Onde a categoria aparece

Em todo o app, a categoria é exibida como um **selo** (`CategoryBadge`): texto com o nome, cor de
fundo e cor de texto da categoria, cantos arredondados. As cores escolhidas são usadas iguais nos
temas claro e escuro, porque o par fundo/texto já garante a leitura.

| Lugar | Spec |
|-------|------|
| Lista de categorias e prévia no formulário | esta |
| Lista de lançamentos e seletor de categoria do lançamento | 04 |
| Gastos por categoria (nome da linha) | 06 |
| Orçamentos (nome do item) | 07 |

O selo sempre mostra o nome; a cor nunca é a única forma de identificar a categoria.

## Telas e interações

- **`/categories`**: acessível pelo menu do cabeçalho ("Categorias"). Duas seções, "Despesas" e
  "Receitas", com as categorias em ordem alfabética. Cada item mostra o selo e as ações **Editar**
  e **Remover**.
- Botão **"Nova categoria"**: abre um diálogo com:
  - nome;
  - tipo (Despesa/Receita; desabilitado na edição);
  - cor de fundo e cor do texto, cada uma com seletor nativo (`<input type="color">`) e campo de
    texto hexadecimal sincronizados;
  - **prévia ao vivo** do selo com o nome digitado;
  - indicador de contraste ("Contraste 7,2:1 — bom" ou o aviso da regra 2).
- **Editar** abre o mesmo diálogo preenchido. **Remover** pede confirmação e mostra o erro da regra
  5 ou 6 quando for o caso.
- O diálogo fecha sozinho quando salva; em erro, continua aberto com a mensagem.
- Estado de carregamento nos botões enquanto salva ou remove.

## Critérios de aceite

Marcado = verificado por teste (indicado ao lado). Os dois primeiros dependem de conferência
no navegador com login.

- [ ] Dado um usuário recém-cadastrado (por senha ou Google), quando abro `/categories`, então vejo as 13 categorias padrão com as cores da tabela.
- [ ] Dado nome "Pets", tipo Despesa, fundo `#FDE68A` e texto `#78350F`, quando salvo, então "Pets" aparece em Despesas com essas cores.
- [x] Dado que já existe "Pets" em Despesas, quando crio "pets" em Despesas, então vejo "Já existe uma categoria com esse nome" e nada é criado. _(testes automatizado e de integração)_
- [x] Dado que já existe "Outros" em Despesas, quando crio "Outros" em Receitas, então é permitido. _(testes automatizado e de integração)_
- [x] Dado nome vazio ou com mais de 30 caracteres, então vejo um erro. _(testes automatizado e de integração)_
- [x] Dado cor inválida (ex.: `#12345`, `azul`) enviada ao servidor, então ela é rejeitada. _(testes automatizado e de integração)_
- [x] Dado fundo `#ffffff` e texto `#eeeeee`, então vejo o aviso de pouco contraste e não consigo salvar, nem forçando a requisição. _(teste automatizado)_
- [x] Quando altero a cor no seletor, o campo hexadecimal e a prévia se atualizam, e vice-versa. _(teste automatizado)_
- [x] Quando renomeio "Lazer" para "Diversão", então os lançamentos, gastos e orçamentos de todos os meses mostram "Diversão". _(teste de integração; a tela de gastos vem na spec 06)_
- [x] Dado uma categoria sem lançamentos nem orçamento, quando removo e confirmo, então ela some. _(teste automatizado)_
- [x] Dado uma categoria com lançamentos, quando tento remover, então vejo a mensagem da regra 5 e ela continua. _(testes automatizado e de integração)_
- [x] Dado que só resta uma categoria de Receita, quando tento removê-la, então a remoção é bloqueada. _(teste automatizado)_
- [x] Dado que já tenho 50 categorias, quando tento criar outra, então vejo "Limite de 50 categorias atingido". _(teste automatizado)_
- [x] O usuário A não vê nem usa as categorias do usuário B, nem em requisição forjada (RLS e chave estrangeira). _(teste de integração)_
- [x] Não existe lista de categorias no código: `src/domain/fixed-categories.ts`, `categoriesFor` e `isValidCategory` foram apagados, e a busca por esses nomes em `src/` não retorna nada.
- [x] Os nomes e cores das categorias padrão existem em um único lugar: a migration `0002_categories.sql`.
- [x] `jest.config.ts` não tem mais exceção de cobertura para categorias.

## Modelo de dados

```
categories
  id                uuid  PK
  user_id           uuid  FK auth.users (cascade)
  kind              'income' | 'expense'
  name              text  (1–30 caracteres)
  background_color  text  check ~ '^#[0-9a-f]{6}$'
  text_color        text  check ~ '^#[0-9a-f]{6}$'
  created_at        timestamptz
  unique (user_id, kind, lower(name))
  unique (id, user_id, kind)        ← alvo das FKs compostas abaixo
```

A tabela `categories`, a RLS e as categorias padrão ficam na migration `0002_categories.sql`.
As mudanças nas tabelas existentes ficam numa migration separada, `0003_category_references.sql`
(sem editar a `0001`), para que cada uma acompanhe uma tarefa:

- `transactions.category text` → `category_id uuid not null`, com FK composta
  `(category_id, user_id, kind) → categories (id, user_id, kind) on delete restrict`. Assim o banco
  garante que o lançamento usa uma categoria **do mesmo usuário** e **do mesmo tipo**.
- `budgets.category text` → `category_id uuid not null`; PK passa a ser `(user_id, category_id)`;
  coluna `kind text not null default 'expense' check (kind = 'expense')` e FK composta
  `(category_id, user_id, kind) → categories (id, user_id, kind) on delete restrict`, garantindo
  orçamento só para categoria de despesa.
- **Categorias padrão:** função `private.create_default_categories()` (schema não exposto pela API) (`security definer`,
  `search_path` fixo) disparada por trigger `after insert on auth.users`. Cobre cadastro com senha e
  com Google.
- **Dados existentes:** a migration cria as categorias padrão para os usuários que já existem e
  converte o texto antigo de `transactions.category`/`budgets.category` para o `id` correspondente
  (mesmo nome e tipo) antes de remover a coluna de texto.
- RLS em `categories` com a política `auth.uid() = user_id`, como nas outras tabelas.

## Notas técnicas

| Camada | Arquivos |
|--------|----------|
| `shared` | `color-contrast.ts`: `parseHexColor`, `relativeLuminance`, `contrastRatio` (fórmula WCAG 2.x), sem conceito de finanças |
| `domain` | `category.ts`: entidade `Category` (`id`, `kind`, `name`, `backgroundColor`, `textColor`), `MIN_CATEGORY_CONTRAST = 4.5`, `MAX_CATEGORIES_PER_USER = 50`, `hasReadableContrast(category)`. Não contém nenhuma lista de categorias |
| `application` | Porta `ports/category-repository.ts` (`listByUser`, `create`, `update`, `delete`, `countByUser`, `countUsage(id)` → lançamentos e orçamento); schema `schemas/category-input-schema.ts` (nome, tipo, cores em hex normalizadas para minúsculas, contraste ≥ 4,5); casos de uso `use-cases/list-categories.ts`, `create-category.ts` (limite de 50, nome duplicado → `Result` de erro), `update-category.ts` (não altera o tipo), `delete-category.ts` (regras 5 e 6) |
| `infrastructure` | `supabase/supabase-category-repository.ts`; traduz a violação de `unique` (código `23505`) em erro de nome duplicado e a de FK (`23503`) em categoria em uso |
| `main` | `makeListCategories`, `makeCreateCategory`, `makeUpdateCategory`, `makeDeleteCategory` |
| `presentation` | `features/categories/components/category-badge.tsx` (exportado no barrel para as outras features), `category-list.tsx`, `category-dialog.tsx`, `color-field.tsx` (seletor + hex sincronizados), `contrast-indicator.tsx` |
| `app` | `(finance)/categories/page.tsx`, `(finance)/categories/actions.ts` (`saveCategory`, `deleteCategory`, com `revalidatePath` de `/` e `/categories`) |

- O cálculo de contraste existe em `shared` e é usado nos dois lados: no navegador, para a prévia e
  o aviso; no servidor, dentro do schema, como validação de verdade.
### Remoção da lista fixa de categorias

A lista que existe hoje no código (`src/domain/fixed-categories.ts` após a spec 01, antes
`lib/finance/categories.ts`) é apagada nesta spec. A partir daqui, **o banco é a única fonte das
categorias**, e os nomes e cores padrão existem apenas na migration `0002_categories.sql`.

| Uso atual da lista | Substituído por |
|--------------------|-----------------|
| `categoriesFor(kind)` no diálogo de lançamento | Lista do usuário vinda do caso de uso `list-categories`, passada por prop |
| `isValidCategory(kind, category)` na validação do lançamento | Caso de uso `save-transaction` confere, pelo `CategoryRepository`, que a categoria é do usuário e do mesmo tipo; a FK composta `(category_id, user_id, kind)` é a barreira final no banco |
| `isValidCategory("expense", category)` na validação do orçamento | Caso de uso `save-budget` confere que a categoria é de despesa do usuário; FK composta com `kind = 'expense'` no banco |

Passos:

1. Implementar `list-categories` e trocar os usos acima.
2. Apagar `src/domain/fixed-categories.ts` e as funções `categoriesFor` e `isValidCategory`.
3. Remover a entrada dele de `coveragePathIgnorePatterns` no `jest.config.ts` e a exceção da spec 01.

- O seletor de categoria do formulário de lançamento (spec 04) passa a receber a lista do usuário
  vinda de `list-categories`, em vez da lista fixa.

## Conformidade com a constituição

| Princípio | Como esta spec atende |
|-----------|-----------------------|
| Clean Architecture | Regras (contraste, limite, remoção) em `domain`/`application`; Supabase só atrás de `CategoryRepository`; contraste genérico em `shared` |
| Cobertura > 90% | Entrada `"./src/presentation/features/categories/"` no `coverageThreshold`; testes de `contrastRatio` (preto/branco = 21:1, cores iguais = 1:1, limite de 4,5), do schema (hex inválido, maiúsculas, contraste baixo), dos casos de uso (repositório fake: duplicado, limite de 50, em uso, última do tipo), do repositório (Supabase mockado, códigos `23505`/`23503`), dos componentes (prévia ao vivo, sincronização seletor ↔ hex, aviso de contraste, remoção bloqueada) e das actions |
| Validação com zod | `categoryInputSchema` no servidor, incluindo o contraste |
| Isolamento por usuário | RLS + FKs compostas com `user_id` |
| Acessibilidade | Contraste mínimo WCAG AA obrigatório; o nome sempre aparece no selo |
| Migrations versionadas | `0002_categories.sql` e `0003_category_references.sql` novas, sem alterar a `0001` |
| Sem código morto / fonte única | Apaga a lista fixa do código e encerra a exceção de cobertura aberta na spec 01; categorias padrão só na migration |
| Novas dependências | Nenhuma: seletor de cor nativo e fórmula de contraste própria |

**Exceções:** nenhuma.

## Tarefas

Ordem de implementação:

1. [T-005 — Tabela de categorias e categorias padrão](../tasks/T-005-tabela-categorias.md)
2. [T-006 — Página de categorias (listagem)](../tasks/T-006-listar-categorias.md)
3. [T-013 — Extrair o seletor de tipo e o tratamento de erros das actions](../tasks/T-013-extrair-seletor-tipo-e-runner.md) (refatoração preparatória)
4. [T-007 — Criar categoria (com validação no servidor)](../tasks/T-007-criar-categoria.md)
5. [T-008 — Prévia ao vivo e indicador de contraste](../tasks/T-008-previa-contraste.md)
6. [T-009 — Lançamentos e orçamentos referenciam a categoria por id](../tasks/T-009-referencias-por-id.md)
7. [T-010 — Editar categoria](../tasks/T-010-editar-categoria.md)
8. [T-011 — Remover categoria (com bloqueios)](../tasks/T-011-remover-categoria.md)

Pré-requisito: [T-004 — Teste de integração do isolamento entre usuários (RLS)](../tasks/T-004-teste-integracao-rls.md).

## Fora do escopo

Ícones ou emojis por categoria, subcategorias, reordenar manualmente, arquivar categoria (esconder
sem remover), mover lançamentos em lote para outra categoria, criar categoria sem sair do
formulário de lançamento, paleta de cores sugeridas, cores diferentes por tema (claro/escuro).

## Questões em aberto

- Remover uma categoria em uso deveria oferecer "mover os lançamentos para outra categoria" já na
  v1, em vez de só bloquear?
- O contraste baixo deve **bloquear** o salvamento (como está) ou apenas avisar?
- Vale permitir criar uma categoria direto do formulário de lançamento ("+ Nova categoria")?
