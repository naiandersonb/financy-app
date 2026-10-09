# Constituição do projeto

Princípios inegociáveis do **finance-app**, um app de finanças pessoais para controlar receitas,
despesas e orçamentos mensais. Toda spec, plano e PR deve respeitá-los; exceções precisam ser
justificadas por escrito na própria spec.

## Stack

- **Linguagem:** TypeScript (`strict`), React 19.
- **Framework:** Next.js 16 com App Router, Server Components, Server Actions e `proxy.ts`
  (substituto do `middleware.ts`). Esta versão tem mudanças incompatíveis em relação a versões
  anteriores: antes de usar uma API do Next, consultar `node_modules/next/dist/docs/`.
- **UI:** Tailwind CSS 4 + shadcn/ui (estilo `base-vega`, sobre Base UI) + ícones `lucide-react`.
- **Backend:** Supabase (Auth + Postgres) via `@supabase/ssr` e `@supabase/supabase-js`.
- **Validação de entrada:** zod.
- **Datas:** date-fns (com o locale `ptBR` para exibição).
- **Testes:** Jest configurado via `next/jest` (`jest.config.ts`), com `jest-environment-jsdom`,
  Testing Library (`@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`) e
  `@testing-library/jest-dom`. A cobertura usa o próprio Jest (`coverageProvider: "v8"`).
- **Gerenciador de pacotes:** npm (`package-lock.json` versionado).

Novas dependências só entram quando nenhuma lib já instalada resolve o problema, e a justificativa
deve constar na spec.

## Arquitetura

Clean Architecture em camadas. **Regra de dependência:** o código só aponta para dentro, em direção
ao domínio. Uma camada interna nunca conhece uma externa.

```
                 app  (rotas, Server Actions, proxy)
                  │
        ┌─────────┼──────────────┐
        ▼         ▼              ▼
 presentation    main  ───────▶ infrastructure
        │    (composição)        │
        │         │              │
        └────▶ application ◀─────┘
                  │
                  ▼
               domain

 shared: TypeScript puro, usável por todas as camadas
```

| Camada | Responsabilidade | Pode importar | Não pode conter |
| --- | --- | --- | --- |
| `src/domain/` | Entidades, value objects (ex.: `Money`, `MonthKey`), regras de negócio puras (saldo, gasto por categoria, status de orçamento) e erros de domínio | `shared` | React, Next, Supabase, I/O, qualquer dependência externa |
| `src/application/` | Casos de uso (um por arquivo), **portas** (interfaces de repositório/gateway) e schemas zod de entrada | `domain`, `shared` | React, Next, Supabase, implementação concreta de I/O |
| `src/infrastructure/` | Adaptadores que implementam as portas: clientes Supabase, repositórios, mapeamento linha ↔ entidade, sessão | `application`, `domain`, `shared` | React, regra de negócio |
| `src/presentation/` | Componentes React, hooks de UI, view models e formatação para exibição, organizados por feature | `application` (tipos e DTOs), `domain`, `shared` | Acesso a Supabase/HTTP, import de `infrastructure` ou `main`, regra de negócio |
| `src/main/` | Composition root: factories que montam cada caso de uso com os adaptadores concretos (`makeCreateTransaction()`) | todas, exceto `app` e `presentation` | Regra de negócio, React |
| `src/app/` | Rotas do Next (`page`, `layout`, `loading`, `error`), Server Actions e metadados | `presentation`, `main`, `application` (tipos), `shared` | Regra de negócio, acesso direto ao Supabase |
| `src/proxy.ts` | Renovação de sessão e redirecionamento de rotas protegidas | `infrastructure` (sessão) | Regra de negócio |
| `src/shared/` | TypeScript puro e agnóstico de negócio (ex.: `cn`, helpers de data genéricos) | nada do projeto | React, integrações externas, conceitos de finanças |

Regras complementares:

- **Inversão de dependência:** `application` declara a porta (ex.: `TransactionRepository`);
  `infrastructure` a implementa (ex.: `SupabaseTransactionRepository`); `main` faz a ligação.
  Casos de uso recebem as portas por parâmetro, nunca instanciam adaptadores.
- **Fluxo de uma requisição:** `page.tsx` ou Server Action (em `app`) → factory de `main` →
  caso de uso (`application`) → regras (`domain`) + porta (implementada em `infrastructure`).
  O resultado volta como dado serializável para os componentes de `presentation`.
- **Server Actions são controllers finos:** recebem o `FormData`, chamam o caso de uso e devolvem
  um resultado serializável. Ficam em `src/app/**/actions.ts`, colocadas junto da rota que as usa.
- **Presentation recebe ações por props:** componentes de cliente não importam Server Actions de
  `app`; a página passa a ação como prop (ex.: `<AuthForm action={signIn} />`).
- **Rotas finas:** `page.tsx` e `layout.tsx` só leem parâmetros, chamam casos de uso e compõem
  componentes. Toda lógica fica em camadas testáveis (o Jest não testa Server Components `async`).
- **Resultados esperados são valores:** casos de uso retornam `Result` (`{ ok: true, value } |
  { ok: false, error }`) para falhas previstas (validação, não encontrado); exceções ficam para falhas
  reais (banco fora do ar, bug).
- **Server-only:** `infrastructure` e `main` importam `"server-only"`, e nenhum desses módulos pode
  chegar ao bundle do cliente.
- **Client Components só quando necessário:** o padrão é Server Component; `"use client"` apenas
  para interatividade (estado, eventos, diálogos), o mais perto possível da folha da árvore.
- Features da UI vivem em `src/presentation/features/<kebab-name>/{components,hooks,view-models}`.
  Componentes genéricos, inclusive os gerados pelo shadcn, ficam direto em
  `src/presentation/components/`, **sem subpasta `ui/`** (o alias `ui` do `components.json` aponta
  para `@/presentation/components`).
- Importar sempre pelo barrel (`index.ts`) de cada módulo de feature/camada; arquivos gerados
  pelo shadcn são importados diretamente.
- Antes de criar código novo, procurar uma implementação existente e onde código semelhante já mora.

### Regras de domínio transversais

- **Dinheiro** é sempre inteiro em centavos (`bigint` no banco, `number` inteiro no TS), nunca
  `float`. A formatação (`R$ 1.234,56`, `pt-BR`/BRL) acontece só em `presentation`.
- **Datas de lançamento** são datas de calendário (`AAAA-MM-DD`, sem hora nem fuso). Toda conversão
  e aritmética de datas usa **date-fns** em horário local, através de `src/shared/calendar-date.ts`;
  nunca `new Date("AAAA-MM-DD")`, que o JavaScript interpreta como UTC e desloca o dia no Brasil.
  Formatação para exibição usa o date-fns com o locale `ptBR`.
- **Isolamento por usuário:** toda tabela com dados de usuário tem `user_id` e **Row Level Security**
  habilitada com política `auth.uid() = user_id`. A UI nunca é a única barreira.

## Qualidade

- **Gate obrigatório antes de merge:** `npm run lint`, `npx tsc --noEmit`, `npm run test:coverage`
  e `npm run build` passando sem erros.
- **Cobertura de testes por feature acima de 90%.** Toda feature entregue precisa ter cobertura
  de **linhas, branches, funções e statements maior que 90%** nos arquivos que ela cria ou altera, em
  todas as camadas. Isso é garantido por `coverageThreshold` no `jest.config.ts` com valor **91**
  (o Jest aceita valores iguais ao limite, então 91 é o menor inteiro que garante "maior que 90%"),
  e o gate falha abaixo dele. Ficam fora da medição apenas:
  - componentes gerados pelo shadcn, listados um a um em `coveragePathIgnorePatterns` no
    `jest.config.ts` (todo `npx shadcn add` atualiza essa lista; um componente do shadcn editado à
    mão sai da lista e passa a precisar de testes);
  - arquivos só de tipos (sufixo `.types.ts`), portas (`src/application/ports/`, que só declaram
    interfaces) e barrels (`index.ts` que só reexporta);
  - arquivos de rota do Next (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`), que devem
    continuar finos (ver Arquitetura);
  - `src/main/**` (só composição, sem lógica).

  Excluir outro arquivo da cobertura exige justificativa na spec da feature.
- **Sem `any`** (`@typescript-eslint/no-explicit-any: error`). Sem `@ts-ignore`; `@ts-expect-error`
  só com comentário explicando o porquê.
- **Erros:** nunca engolir erros. Preservar a causa (`new Error(msg, { cause })`). Mensagens para o
  usuário em pt-BR e sem detalhes internos. Nunca logar segredos, tokens ou dados financeiros/pessoais.
- **Segurança:** identidade verificada com `supabase.auth.getClaims()` (nunca confiar em
  `getSession()` no servidor). A chave `service_role` nunca é usada no app. Toda entrada de Server
  Action é validada com zod no servidor, mesmo que já validada no navegador.
- **Responsabilidade única:** cada função, componente, hook, caso de uso e arquivo faz uma coisa.
  Se a descrição precisa de "e", dividir.
- **Mudanças cirúrgicas:** menor diff que resolve o problema; sem alterações não relacionadas;
  remover código que a mudança deixou órfão.
- **Sem arquivos-variante** (`_v2`, `_new`, `_copy`…): editar o original.
- **Sem gavetas genéricas** (`utils`, `helpers`, `common`) fora de `shared/`; nomear pelo conceito
  de domínio.
- **Acessibilidade e responsividade:** telas funcionam a partir de 360px de largura; formulários
  têm `label` associado; cor nunca é a única forma de transmitir informação (ex.: saldo negativo
  também mostra o sinal de menos); usar os componentes de `presentation/components` em vez de
  reimplementá-los.

### Testes

**Colocation:** o teste fica ao lado do arquivo que testa, com o mesmo nome + `.test.ts` (ou
`.test.tsx` quando renderiza React). Não há pasta `tests/` nem `__tests__/`.

| Camada | O que testar | Como |
| --- | --- | --- |
| `domain` | Entidades, value objects e regras (somas, percentuais, limites de 80%/100%, virada de mês/ano) | Entrada → saída, sem mock |
| `application` (casos de uso) | Orquestração: validação, chamada da porta certa, `Result` de sucesso e de falha | Porta implementada por um **fake em memória**, sem `jest.mock` |
| `application` (schemas) | Regras do zod (obrigatórios, formatos, limites) | `schema.safeParse(...)` |
| `infrastructure` | Mapeamento linha ↔ entidade, filtros e tratamento de erro do Supabase | Cliente Supabase mockado |
| `presentation` | Fluxos do usuário (preencher, validar, enviar, ver erro, estado vazio) e view models | Testing Library + `user-event`, com Server Action falsa passada por prop |
| `app` (Server Actions) | Leitura do `FormData`, chamada do caso de uso e `revalidatePath` | `jest.mock` da factory de `main` |
| `src/proxy.ts` | Redirecionamentos com e sem sessão | Sessão de `infrastructure` mockada |

- **Mocks na fronteira:** cada camada mocka só a camada imediatamente abaixo. Testes de
  `presentation` nunca mockam o Supabase.
- **Determinismo:** sem rede real, sem dependência de data/hora do sistema (injetar `now` ou usar
  `jest.useFakeTimers()`), sem ordem entre testes.
- **Consultas na tela:** preferir `getByRole`/`getByLabelText` a `getByTestId`; testar o que o
  usuário vê, não detalhes de implementação.
- Nunca pular, enfraquecer ou apagar um teste só para ficar verde, nem baixar o threshold de
  cobertura para fazer o gate passar.
- Os critérios de aceite de cada spec devem ter pelo menos um teste correspondente.

## Convenções

### Nomenclatura

| Tipo | Padrão | Exemplo |
| --- | --- | --- |
| Arquivos e pastas | kebab-case | `transaction-dialog.tsx`, `month-key.ts` |
| Componentes React | PascalCase no identificador | `export function TransactionDialog` |
| Hooks | camelCase com prefixo `use` | `use-month-navigation.ts` → `useMonthNavigation` |
| Casos de uso | verbo + substantivo | `create-transaction.ts` → `createTransaction` |
| Portas | substantivo + papel | `transaction-repository.ts` → `TransactionRepository` |
| Adaptadores | tecnologia + porta | `supabase-transaction-repository.ts` |
| Factories de `main` | prefixo `make` | `makeCreateTransaction()` |
| Schemas zod | camelCase com sufixo `Schema` | `transactionInputSchema` |
| Testes | mesmo nome do arquivo + `.test.ts(x)` | `create-transaction.test.ts` |
| Arquivos só de tipos | sufixo `.types.ts` (fica fora da cobertura) | `transaction.types.ts` |

### Código

- Textos de UI, specs, README e mensagens de commit em português (pt-BR); identificadores de código
  em inglês.
- **Rotas e parâmetros de URL em inglês**, em kebab-case, tratados como identificadores de código
  (ex.: `/signup`, `/categories`, `/?month=2026-10`, `/login?error=google`). O texto exibido nas
  telas continua em pt-BR.
- Comentários explicam o porquê, nunca narram o quê.
- Formatação e ordem de imports seguem o ESLint do projeto (`eslint.config.mjs`).
- Commits seguem Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`…).
- Mudanças de schema do banco vão em migrations versionadas em `supabase/migrations/`, nunca
  apenas pelo painel do Supabase.
- Variáveis de ambiente novas são documentadas em `.env.example`; segredos nunca são commitados.

## Fluxo de trabalho

### Tarefas curtas e revisáveis

O trabalho é entregue em tarefas pequenas para que cada mudança possa ser revisada com atenção.

- **Toda spec é quebrada em tarefas** (`docs/tasks/T-NNN-<slug>.md`) antes da implementação. Cada
  tarefa entrega **um único comportamento** verificável e aponta para a spec e os critérios de aceite
  que cobre.
- **Limite de tamanho:** até ~300 linhas de código de produção alteradas e até ~10 arquivos de
  produção por tarefa. Testes não entram na conta, para não desincentivar testar. Uma tarefa que
  passe disso é dividida, ou a própria tarefa justifica por escrito por que não pode ser.
- **Corte vertical:** a tarefa atravessa as camadas que precisar (de `domain` até `app`), em vez de
  entregar uma camada isolada. Cada entrega funciona sozinha e não deixa código sem uso esperando a
  próxima tarefa.
- **Refatorações e renomeações** que tocam muitos arquivos (ex.: mover pastas, renomear rotas) ficam
  em tarefas próprias, sem misturar com comportamento novo.
- **Uma tarefa, um commit:** cada tarefa termina com o gate de qualidade verde e vira um commit.
- **Aprovação antes do commit:** o agente apresenta o diff da tarefa e **nunca commita sem a
  aprovação explícita** de quem revisa. Aprovar uma tarefa não aprova a seguinte.

## Governança

- Esta constituição prevalece sobre preferências individuais e sobre outros documentos de
  orientação. Em caso de conflito com `CLAUDE.md`, `AGENTS.md` ou `README.md`, esta é a referência
  e os demais devem ser atualizados (exceto o bloco de `AGENTS.md` gerado pelo `next dev`).
- Toda spec em `docs/specs/` deve conter uma seção **"Conformidade com a constituição"** listando
  os princípios afetados, as camadas tocadas, a estratégia de testes para atingir a cobertura e
  qualquer exceção, com justificativa.
- Toda spec lista as suas tarefas em uma seção **"Tarefas"**, com link para cada arquivo em
  `docs/tasks/`.
- Revisões de PR verificam: regra de dependência entre camadas, convenções de nome, testes dos
  critérios de aceite, cobertura acima de 90% e gate de qualidade verde.
- **Emendas:** qualquer alteração neste arquivo é feita em PR próprio, descrevendo o motivo, e
  incrementa a versão:
  - **MAJOR** — remoção ou redefinição incompatível de um princípio;
  - **MINOR** — novo princípio ou seção;
  - **PATCH** — esclarecimentos e correções de texto.
- Código existente que viole a constituição é corrigido de forma incremental, quando a área for
  tocada, e não em mudanças não relacionadas.

---

**Versão:** 1.3.0 · **Ratificada em:** 2026-10-08 · **Última emenda:** 2026-10-09
