# T-003 — Comparação exata das rotas públicas no proxy

| Campo | Valor |
|-------|-------|
| Spec | [02 — Autenticação](../specs/02-autenticacao.md), regras 4–6 e 11 |
| Status | Concluída |
| Depende de | — |
| Bloqueia | — (fazer junto ou antes da [T-001](T-001-login-google.md), que adiciona `/auth/callback` às rotas públicas) |

## Problema

`src/infrastructure/supabase/session-proxy.ts` decide se uma rota é pública com
`pathname.startsWith(path)` sobre `["/login", "/cadastro"]`. Assim, qualquer caminho que **comece**
com esses textos também é tratado como público, por exemplo `/loginx` ou `/cadastro-antigo`:

- visitante sem sessão não é redirecionado para `/login` nessas rotas;
- usuário logado é redirecionado para `/` ao acessá-las.

Hoje essas rotas não existem (dariam 404), então não há dado exposto; o risco é uma rota futura
com esse prefixo ficar pública sem ninguém perceber.

## Solução proposta

Considerar pública só a rota exata ou seus subcaminhos: `pathname === path` ou
`pathname.startsWith(path + "/")`.

## Passos

- [x] Ajustar a comparação em `session-proxy.ts`.
- [x] Testes em `session-proxy.test.ts`: `/login` e `/cadastro` continuam públicas; `/loginx` e `/cadastro-antigo` exigem sessão; `/login/algo` continua pública.

## Pronto quando

- [x] Visitante sem sessão em `/loginx` é redirecionado para `/login`.
- [x] Gate de qualidade verde, com a cobertura mantida.
