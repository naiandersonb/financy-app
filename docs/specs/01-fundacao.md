# Spec 01 — Fundação: estrutura em camadas, ferramentas e conformidade

## Objetivo

Preparar o projeto para seguir a [constituição](../constitution.md) antes de qualquer feature:

1. mover o código para `src/`, organizado nas camadas da Clean Architecture;
2. instalar e configurar **Jest** (testes e cobertura) e **zod** (validação de entrada);
3. tornar as regras da constituição verificáveis automaticamente (lint de camadas, cobertura);
4. deixar **o código que já existe** em conformidade com a constituição, inclusive com testes.

Nenhum comportamento visível ao usuário muda nesta spec.

## Parte A — Ferramentas

### A1. Jest (via `next/jest`)

Instalação (dev):

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event ts-node @types/jest
```

`ts-node` é necessário para o Jest ler o `jest.config.ts`.

`jest.config.ts` na raiz, criado com `nextJest({ dir: "./" })` (que carrega `next.config.ts` e `.env*`):

| Opção | Valor |
|-------|-------|
| `testEnvironment` | `jsdom` (testes de `domain`/`application`/`infrastructure` podem usar `@jest-environment node` no topo do arquivo) |
| `setupFilesAfterEnv` | `["<rootDir>/jest.setup.ts"]`, que importa `@testing-library/jest-dom` |
| `moduleNameMapper` | `{ "^@/(.*)$": "<rootDir>/src/$1" }` |
| `collectCoverageFrom` | `["src/**/*.{ts,tsx}"]` |
| `coveragePathIgnorePatterns` | arquivos de rota (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`), `src/main/`, barrels, arquivos só de tipos, cada componente gerado pelo shadcn, listado pelo nome, e `src/domain/fixed-categories.ts` (temporário, ver C2) |
| `coverageProvider` | `v8` |
| `coverageThreshold` | `global` com 91 em `lines`, `branches`, `functions` e `statements`, mais uma entrada por diretório de feature com os mesmos 91 (ex.: `"./src/presentation/features/transactions/"`), para que nenhuma feature fique abaixo do limite escondida na média |

`server-only` lança erro fora do servidor: mapear para um módulo vazio no `moduleNameMapper`
(`"^server-only$": "<rootDir>/jest.server-only-stub.ts"`).

Scripts no `package.json`:

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

### A2. zod

```bash
npm install zod
```

Usado só em `src/application/schemas/` para validar a entrada dos casos de uso (Server Actions).
Substitui o parsing manual que existe hoje em `lib/finance/form-parsing.ts`.

### A3. Travas automáticas da constituição

- **Regra de dependência entre camadas** no `eslint.config.mjs`, com a regra nativa
  `no-restricted-imports` (sem dependência nova), por pasta:

  | Arquivos em | Não podem importar |
  |-------------|--------------------|
  | `src/domain/**` | `@/application/*`, `@/infrastructure/*`, `@/presentation/*`, `@/main/*`, `@/app/*`, `react`, `next/*`, `@supabase/*`, `zod` |
  | `src/application/**` | `@/infrastructure/*`, `@/presentation/*`, `@/main/*`, `@/app/*`, `react`, `next/*`, `@supabase/*` |
  | `src/infrastructure/**` | `@/presentation/*`, `@/main/*`, `@/app/*`, `react` |
  | `src/presentation/**` | `@/infrastructure/*`, `@/main/*`, `@/app/*`, `@supabase/*` |
  | `src/main/**` | `@/presentation/*`, `@/app/*` |
  | `src/shared/**` | qualquer `@/*`, `react`, `next/*`, `@supabase/*` |

- `@typescript-eslint/no-explicit-any: "error"` e `@typescript-eslint/ban-ts-comment` (proíbe
  `@ts-ignore` e exige descrição no `@ts-expect-error`).

## Parte B — Estrutura `src/` em camadas

```
finance-app/
├── src/
│   ├── app/                 rotas, Server Actions, layout, globals.css
│   │   ├── (auth)/          login, cadastro e actions de autenticação
│   │   └── (finance)/       tela principal e actions de lançamentos/orçamentos
│   ├── presentation/
│   │   ├── components/      componentes genéricos + shadcn (sem subpasta ui/)
│   │   ├── formatters/      formatação para exibição (moeda, datas)
│   │   └── features/<nome>/{components,hooks,view-models}
│   ├── application/
│   │   ├── ports/           interfaces (repositórios, gateway de auth)
│   │   ├── schemas/         schemas zod de entrada
│   │   └── use-cases/       um caso de uso por arquivo
│   ├── domain/              entidades, value objects e regras puras
│   ├── infrastructure/
│   │   └── supabase/        clientes, sessão, repositórios
│   ├── main/                factories make<CasoDeUso>()
│   ├── shared/              TS puro agnóstico (cn, Result)
│   └── proxy.ts
├── public/  docs/  supabase/          continuam na raiz
└── configs (package.json, tsconfig.json, next.config.ts, jest.config.ts,
    jest.setup.ts, eslint.config.mjs, postcss.config.mjs, components.json, .env*)
```

Os grupos de rota `(auth)` e `(finance)` não mudam as URLs (`/login`, `/cadastro`, `/`).

### Ajustes de configuração

| Arquivo | Mudança |
|---------|---------|
| `tsconfig.json` | `"paths": { "@/*": ["./src/*"] }` |
| `components.json` | `tailwind.css` → `src/app/globals.css`; aliases `components` e `ui` → `@/presentation/components`; `utils` → `@/shared/cn`; `lib` → `@/shared`; `hooks` → `@/presentation/hooks` |
| `eslint.config.mjs` | Regras da parte A3 |
| `.gitignore` | Incluir `coverage/` |

Regra do Next: não pode sobrar `app/` na raiz, senão `src/app` é ignorado.

## Parte C — Conformidade do código atual

Mapa de cada arquivo existente para o seu destino e o que muda nele.

### C1. Movimentações simples (conteúdo igual, só ajuste de imports)

| Hoje | Destino |
|------|---------|
| `app/layout.tsx`, `app/globals.css`, `app/favicon.ico` | `src/app/` |
| `app/page.tsx` (template do Next) | `src/app/(finance)/page.tsx` (o conteúdo real vem na spec 05) |
| `components/ui/*.tsx` (button, card, dialog, input, label, native-select, progress) | `src/presentation/components/*.tsx`; o import interno do `dialog.tsx` muda de `@/components/ui/button` para `@/presentation/components/button` |
| `lib/utils.ts` | `src/shared/cn.ts` |
| `proxy.ts` | `src/proxy.ts` |
| `lib/supabase/env.ts` | `src/infrastructure/supabase/env.ts` |

### C2. Arquivos que precisam ser divididos ou reescritos

| Hoje | Problema em relação à constituição | Destino |
|------|------------------------------------|---------|
| `lib/finance/types.ts` | Mistura entidades com tipo de resultado de formulário | `src/domain/transaction.ts` (`Transaction`, `TransactionKind`), `src/domain/budget.ts` (`Budget`), `src/shared/result.ts` (`Result<T, E>` genérico, que substitui `FormResult`) |
| `lib/finance/categories.ts` | Lista fixa de categorias no código; pela spec 03 as categorias vêm do banco | **Temporário:** movido sem alterações para `src/domain/fixed-categories.ts` só para o código atual continuar compilando (a pasta `lib/` precisa sumir). Não ganha testes nem novos usos, fica fora da cobertura e é **apagado na spec 03**. O nome evita conflito com a entidade `category.ts` que a spec 03 cria |
| `lib/finance/month.ts` | Mistura regra de mês com formatação de exibição | `src/domain/month-key.ts` (`parseMonthKey`, `shiftMonth`, `monthDateRange`, `currentMonthKey`, `defaultDateInMonth`); `formatMonthLabel` e `formatDayLabel` vão para `src/presentation/formatters/date.ts` |
| `lib/finance/money.ts` | Mistura parsing de entrada com formatação | `parseAmountToCents` vira o schema zod `src/application/schemas/amount-schema.ts`; `formatCents` e `centsToInputValue` vão para `src/presentation/formatters/money.ts` |
| `lib/finance/summary.ts` | Três regras num arquivo | `src/domain/month-summary.ts`, `src/domain/category-spending.ts`, `src/domain/budget-status.ts` |
| `lib/finance/form-parsing.ts` | Validação manual; deveria ser zod em `application` | `src/application/schemas/transaction-input-schema.ts` e `budget-input-schema.ts` |
| `lib/finance/queries.ts` | Acesso ao Supabase sem porta; chamado direto pela UI/rota | Portas `src/application/ports/transaction-repository.ts` e `budget-repository.ts`; adaptadores `src/infrastructure/supabase/supabase-transaction-repository.ts` e `supabase-budget-repository.ts` |
| `lib/supabase/server.ts` | `getCurrentUserId` é preocupação de autenticação | `src/infrastructure/supabase/server-client.ts` (cliente) + `src/infrastructure/supabase/supabase-auth-gateway.ts` (implementa a porta `AuthGateway`: `signIn`, `signUp`, `signOut`, `currentUserId`) |
| `lib/supabase/proxy.ts` | — | `src/infrastructure/supabase/session-proxy.ts` |
| `app/auth/actions.ts` | Chama Supabase direto e contém regra (tamanho mínimo da senha) | `src/app/(auth)/actions.ts` (controller fino) + casos de uso `src/application/use-cases/sign-in.ts`, `sign-up.ts`, `sign-out.ts` + schema `credentials-schema.ts` |
| `app/actions/transactions.ts` | Chama Supabase direto | `src/app/(finance)/actions.ts` + casos de uso `save-transaction.ts`, `delete-transaction.ts`, `list-month-transactions.ts` |
| `app/actions/budgets.ts` | Chama Supabase direto e busca o `user_id` | `src/app/(finance)/actions.ts` + casos de uso `save-budget.ts`, `delete-budget.ts`, `list-budgets.ts` (o `user_id` vem do `AuthGateway`, injetado pela factory) |
| `app/login/page.tsx`, `app/cadastro/page.tsx` | — | `src/app/(auth)/login/page.tsx`, `src/app/(auth)/cadastro/page.tsx` |
| `components/auth/auth-form.tsx` | Importa o tipo `AuthFormState` de `app` (presentation não pode importar `app`) | `src/presentation/features/auth/components/auth-form.tsx`; o tipo do estado passa a vir de `application` |
| `components/finance/transaction-dialog.tsx` | Importa `saveTransaction` direto de `app` | `src/presentation/features/transactions/components/transaction-dialog.tsx`; recebe a ação por prop (`onSave`) |
| — (novo) | Composição | `src/main/` com `makeSignIn`, `makeSaveTransaction` etc. |

### C3. Testes do código atual

Todo arquivo de C1 e C2 que fica dentro da medição de cobertura ganha teste colocado, seguindo a
tabela "Testes" da constituição:

- `domain`: `month-key`, `month-summary`, `category-spending`, `budget-status` (`fixed-categories` fica sem
  testes, pois é temporário)
  (incluindo virada de ano e meses de 28/29/30/31 dias);
- `application`: os três schemas zod e cada caso de uso, com portas fake em memória;
- `infrastructure`: repositórios, auth gateway e `session-proxy`, com cliente Supabase mockado;
- `presentation`: `auth-form`, `transaction-dialog` (fluxo de preencher, trocar tipo → categorias,
  erro, sucesso fecha o diálogo) e os formatters;
- `app`: as Server Actions, com a factory de `main` mockada; `src/proxy.ts`.

## Critérios de aceite

- [ ] `app/`, `components/`, `lib/` e `proxy.ts` não existem mais na raiz; o código está em `src/` nas camadas acima.
- [ ] Não existe `src/presentation/components/ui/`; `npx shadcn add <componente>` cria o arquivo em `src/presentation/components/`.
- [ ] `zod`, `jest` e as libs da parte A1 estão no `package.json`; os scripts `test`, `test:watch` e `test:coverage` existem.
- [ ] `npm run test:coverage` passa com cobertura acima de 90% (linhas, branches, funções e statements), no global e em cada diretório de feature.
- [ ] Um import proibido (ex.: `@supabase/ssr` dentro de `src/presentation`) faz o `npm run lint` falhar.
- [ ] Nenhum arquivo de `presentation` importa de `app`, `main` ou `infrastructure`.
- [ ] Nenhuma Server Action ou rota chama o Supabase diretamente; toda chamada passa por um caso de uso.
- [ ] `npm run lint`, `npx tsc --noEmit` e `npm run build` passam.
- [ ] `/login` e `/cadastro` funcionam como antes; `/` continua protegida pelo proxy.

## Passo a passo sugerido (um commit por passo)

1. `chore`: commit do estado atual (hoje `components/`, `lib/` e `app/login/` ainda não estão versionados).
2. `chore`: instalar Jest, Testing Library e zod; criar `jest.config.ts`, `jest.setup.ts` e scripts.
3. `refactor`: criar `src/` e mover os arquivos de C1 (`git mv`); ajustar `tsconfig.json` e `components.json`; apagar `.next/` e `tsconfig.tsbuildinfo`.
4. `refactor`: `domain` e `shared` (C2) + testes.
5. `refactor`: `application` (portas, schemas zod, casos de uso) + testes.
6. `refactor`: `infrastructure` + `main` + testes.
7. `refactor`: `app` e `presentation` (actions finas, ações por props) + testes.
8. `chore`: travas de lint (A3) e `coverageThreshold`; gate completo verde.

## Conformidade com a constituição

| Princípio | Como esta spec atende |
|-----------|-----------------------|
| Clean Architecture / regra de dependência | Cria as camadas, migra todo o código existente para elas e trava as importações via ESLint |
| Cobertura > 90% por feature | Configura `coverageThreshold` global e por feature; escreve os testes do código existente |
| Stack (Jest, zod) | Instala e configura |
| Componentes sem `ui/` | Configura os aliases do shadcn para `@/presentation/components` |
| Novas dependências justificadas | Jest/Testing Library: ferramentas de teste definidas na constituição. `ts-node`: exigido pelo `jest.config.ts`. zod: validação de entrada definida na constituição |

**Exceções:**

| Exceção | Justificativa |
|---------|---------------|
| `src/domain/fixed-categories.ts` fora da cobertura e sem testes | Código temporário que será apagado na spec 03 (categorias passam a vir do banco). Escrever testes para ele seria trabalho descartado; ele não recebe novos usos até ser removido |

## Fora do escopo

Implementar as features (specs 02–07), reorganizações além do mapa da parte C e testes E2E.

## Riscos

- **Arquivos não versionados:** fazer o commit do passo 1 antes de mover, para não perder histórico.
- **Cache do Next/TS** com caminhos antigos pode gerar erros falsos; apagar `.next/`.
- **Cobertura por diretório:** cada feature nova precisa ganhar sua entrada no `coverageThreshold`.
  O checklist de PR deve conferir isso.
