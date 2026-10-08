# T-001 — Login social com Google

| Campo | Valor |
|-------|-------|
| Spec | [02 — Autenticação](../specs/02-autenticacao.md), seção "Login social com Google" (regras 9–16) |
| Status | A fazer |
| Depende de | [Spec 01 — Fundação](../specs/01-fundacao.md) concluída (camadas em `src/`, Jest, zod, `AuthGateway` existente) |
| Bloqueia | — |

## Objetivo

Permitir entrar e criar conta com o Google em `/login` e `/cadastro`, cumprindo todos os
critérios de aceite da seção "Google" da spec 02 e a [constituição](../constitution.md).

## Pré-requisitos externos (feitos por uma pessoa, não pelo código)

- [ ] Projeto no Google Cloud com a tela de consentimento OAuth configurada e o usuário de teste cadastrado.
- [ ] Credencial "ID do cliente OAuth" (Aplicativo da Web) com a URI `https://<projeto>.supabase.co/auth/v1/callback`.
- [ ] Provedor Google ativado no Supabase com o Client ID e o Client Secret.
- [ ] `http://localhost:3000/auth/callback` nas Redirect URLs do Supabase.
- [ ] `NEXT_PUBLIC_SITE_URL=http://localhost:3000` no `.env.local`.

## Passos de implementação

Cada passo escreve o teste primeiro e vai em um commit próprio (Conventional Commits).

1. **Configuração**
   - [ ] Adicionar `NEXT_PUBLIC_SITE_URL` ao `.env.example` e a `src/infrastructure/supabase/env.ts`.
2. **`application`**
   - [ ] `schemas/redirect-path-schema.ts`: aceita só caminho interno; padrão `/`. Testes com `/x`, `//x`, `https://x`, `javascript:x`, vazio e ausente.
   - [ ] Estender `ports/auth-gateway.ts` com `startOAuthSignIn(provider, redirectTo)` e `completeOAuthSignIn(code)`, retornando `Result`.
   - [ ] `use-cases/start-google-sign-in.ts`: monta `redirectTo` = `${siteUrl}/auth/callback` e devolve a URL do provedor. Testes com gateway fake (sucesso e falha).
   - [ ] `use-cases/complete-oauth-sign-in.ts`: valida o `code` e o `next`, troca por sessão e devolve o caminho de destino ou um erro. Testes com gateway fake (code válido, inválido, ausente; `next` malicioso).
3. **`infrastructure`**
   - [ ] Implementar os dois métodos novos em `supabase/supabase-auth-gateway.ts` (`signInWithOAuth` e `exchangeCodeForSession`). Testes com o cliente Supabase mockado, incluindo erro do Supabase.
   - [ ] Incluir `/auth/callback` nas rotas públicas de `supabase/session-proxy.ts`. Testes do proxy com e sem sessão nessa rota.
4. **`main`**
   - [ ] `makeStartGoogleSignIn` e `makeCompleteOAuthSignIn`.
5. **`app`**
   - [ ] Action `signInWithGoogle` em `(auth)/actions.ts`: chama o caso de uso e faz `redirect(url)`; em falha, `redirect("/login?erro=google")`. Testes com a factory mockada.
   - [ ] `auth/callback/route.ts` (`GET`): lê `code`, `next` e `error`, chama o caso de uso e redireciona. Testes do handler (sucesso, cancelamento, `code` inválido, `next` malicioso).
   - [ ] `(auth)/login/page.tsx`: lê `?erro=google` e passa a mensagem para o formulário.
6. **`presentation`**
   - [ ] `features/auth/components/google-sign-in-button.tsx`: logo "G" em SVG inline, "Continuar com Google", estado de carregamento, recebe a ação por prop. Testes de clique e estado desabilitado.
   - [ ] `auth-form.tsx`: botão do Google + divisor "ou" e exibição do erro do Google. Testes de render com e sem erro.
7. **Gate**
   - [ ] `npm run lint`, `npx tsc --noEmit`, `npm run test:coverage` (> 90% em `src/presentation/features/auth/` e no global) e `npm run build`.
   - [ ] Teste manual no navegador: primeiro acesso, segundo acesso, cancelamento, mesmo e-mail de uma conta com senha, logout.

## Pronto quando

- [ ] Todos os critérios de aceite da seção "Google" da spec 02 marcados.
- [ ] Gate de qualidade verde.
- [ ] Nenhum segredo do Google no repositório.
