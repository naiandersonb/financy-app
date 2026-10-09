# T-004 — Teste de integração do isolamento entre usuários (RLS)

| Campo | Valor |
|-------|-------|
| Spec | [02 — Autenticação](../specs/02-autenticacao.md), critério "O usuário A nunca consegue ler ou alterar dados do usuário B" |
| Status | A fazer |
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

1. `npx supabase init` (cria `supabase/config.toml`; as migrations já estão no lugar certo).
2. Configuração separada de Jest para integração (`jest.integration.config.ts`, ambiente `node`,
   arquivos `*.integration.test.ts`) e script `npm run test:integration`. Esses testes **não** rodam
   no `npm test` comum nem entram na medição de cobertura, porque precisam do Docker.
3. Suíte `supabase/tests/rls.integration.test.ts`, com dois usuários (A e B) criados no `beforeAll`
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

- [ ] `npx supabase start` sobe o banco local com as migrations aplicadas.
- [ ] `npm run test:integration` passa, cobrindo leitura, alteração, exclusão e inserção cruzadas,
      acesso anônimo e a checagem de RLS em todas as tabelas.
- [ ] Remover temporariamente uma política de RLS faz a suíte falhar (prova de que o teste detecta o problema).
- [ ] `npm test`, `npm run lint`, `npx tsc --noEmit` e `npm run build` continuam verdes.
- [ ] Nenhuma chave `service_role` é importada fora de `supabase/tests/`.

## Tamanho

Cerca de 150 linhas de teste e configuração, sem código de produção. Dentro do limite da constituição.
