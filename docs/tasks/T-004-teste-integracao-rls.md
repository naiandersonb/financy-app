# T-004 — Teste de integração do isolamento entre usuários (RLS)

| Campo | Valor |
|-------|-------|
| Spec | [02 — Autenticação](../specs/02-autenticacao.md), critério "O usuário A nunca consegue ler ou alterar dados do usuário B" |
| Status | Concluída |
| Depende de | Docker instalado (já disponível na máquina de desenvolvimento) |
| Bloqueia | Fechamento da spec 02. Também serve de base para as specs 03, 04 e 07, que criam tabelas novas |

## Problema

O isolamento entre usuários depende das políticas de Row Level Security das migrations. Os testes
atuais mockam o Supabase, então **nada prova que o banco de verdade bloqueia** um usuário de ler ou
alterar os dados de outro. Um erro numa política (ou uma tabela nova sem RLS) passaria despercebido.

## Abordagem

Testes de integração contra um **Supabase local** (`npx supabase start`, via Docker), com as
migrations de `supabase/migrations/` aplicadas do zero. **Nunca** contra o projeto na nuvem: os
testes criam e apagam usuários.

- Para criar os usuários de teste, os testes usam a chave `service_role` **do Supabase local**
  (gerada pela CLI, sem valor fora da máquina). Ela fica restrita à pasta de testes de integração e
  nunca é importada pelo app; a constituição continua proibindo a `service_role` no código de
  produção.
- As consultas que provam o isolamento são feitas como o usuário logado (chave pública + sessão),
  exatamente como o app faz.

## Escopo

1. `npx supabase init` (cria `supabase/config.toml`; as migrations já estão no lugar certo). A CLI
   entra como dependência de desenvolvimento (`supabase`), para fixar a versão usada por todos em vez
   de baixá-la a cada `npx`.
2. Configuração separada de Jest para integração (`jest.integration.config.ts`, ambiente `node`,
   arquivos `*.integration.test.ts`) e script `npm run test:integration`. Esses testes **não** rodam
   no `npm test` comum nem entram na medição de cobertura, porque precisam do Docker.
3. Suíte `supabase/tests/rls.integration.test.ts` (com os auxiliares em `local-supabase.ts` e o
   `global-setup.ts`, que lê URL e chaves do `supabase status` e recusa URLs que não sejam locais), com dois usuários (A e B) criados no `beforeAll`
   e removidos no `afterAll`:
   - A cria um lançamento e um orçamento; B **não vê** nenhum dos dois (`select` volta vazio).
   - B não consegue **alterar** nem **excluir** os registros de A (0 linhas afetadas; os dados de A
     continuam intactos).
   - B não consegue **inserir** um registro com o `user_id` de A.
   - Visitante sem sessão não lê nem grava nada.
   - Toda tabela do schema `public` tem RLS habilitada (consulta a `pg_tables.rowsecurity`), para
     pegar tabelas novas sem RLS no futuro.
4. Documentar no `README.md` como subir o Supabase local e rodar a suíte.

## Fora do escopo

Rodar a suíte em CI (não há CI configurado ainda), testes de performance de políticas, testes das
migrations de categorias (spec 03), que entram junto com aquela spec.

## Pronto quando

- [x] `npx supabase start` sobe o banco local com as migrations aplicadas.
- [x] `npm run test:integration` passa, cobrindo leitura, alteração, exclusão e inserção cruzadas,
      acesso anônimo e a checagem de RLS em todas as tabelas.
- [x] Remover temporariamente uma política de RLS faz a suíte falhar (prova de que o teste detecta o problema).
- [x] `npm test`, `npm run lint`, `npx tsc --noEmit` e `npm run build` continuam verdes.
- [x] Nenhuma chave `service_role` é importada fora de `supabase/tests/`.

## Verificação (2026-10-09)

- `npm run test:integration`: 8 testes passando.
- Trocar a política de `transactions` por `using (true)`: 4 testes falham. Desligar o RLS de
  `budgets`: 6 falham (inclusive a checagem de "toda tabela tem RLS"). Depois de `npm run db:reset`,
  os 8 voltam a passar.
- Scripts novos: `db:start`, `db:stop`, `db:reset` e `test:integration`.

## Tamanho

Cerca de 150 linhas de teste e configuração, sem código de produção. Dentro do limite da constituição.
