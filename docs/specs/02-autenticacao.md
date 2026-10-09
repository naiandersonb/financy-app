# Spec 02 — Autenticação

## Objetivo

Cada pessoa tem uma conta própria e acessa somente os próprios dados financeiros.

## Histórias de usuário

- Como visitante, quero criar uma conta com e-mail e senha para começar a usar o app.
- Como usuário, quero entrar com e-mail e senha para acessar minhas finanças.
- Como visitante ou usuário, quero entrar com minha conta Google, sem criar nem lembrar outra senha.
- Como usuário, quero sair da minha conta, principalmente em computadores compartilhados.

## Regras de negócio

1. Cadastro com e-mail e senha (Supabase Auth). A senha precisa ter no mínimo 6 caracteres.
2. Se o projeto Supabase exigir confirmação de e-mail, após o cadastro a pessoa
   vê uma mensagem pedindo para confirmar pelo link enviado; ela ainda não fica logada.
3. Se a confirmação estiver desativada, o cadastro já leva direto à tela principal.
4. Todas as rotas, exceto `/login` e `/signup`, exigem sessão.
5. Visitante sem sessão que acessa uma rota protegida é redirecionado para `/login`.
6. Usuário logado que acessa `/login` ou `/signup` é redirecionado para `/`.
7. A sessão é renovada de forma transparente (refresh de token no `src/proxy.ts`).
8. Mensagens de erro de login não revelam se o e-mail existe ("E-mail ou senha inválidos").

### Login social com Google

9. O botão "Continuar com Google" aparece em `/login` e em `/signup`. O mesmo fluxo serve para
   entrar e para criar a conta: no primeiro acesso, a conta é criada automaticamente.
10. O fluxo é OAuth com PKCE, feito pelo Supabase Auth: o app redireciona para o Google, o Google
    volta para o Supabase, e o Supabase volta para `/auth/callback?code=...`. Essa rota troca o
    `code` por uma sessão e redireciona para `/`.
11. A rota `/auth/callback` é pública (o proxy não exige sessão nela).
12. Se o usuário cancelar no Google, ou se a troca do `code` falhar, ele volta para
    `/login?error=google` e vê "Não foi possível entrar com o Google. Tente novamente."
    O erro técnico não aparece na tela.
13. A URL de retorno é montada a partir de `NEXT_PUBLIC_SITE_URL`, nunca do cabeçalho `Host` da
    requisição, que pode ser forjado.
14. O parâmetro opcional `next` do callback só aceita caminho relativo interno (começa com `/` e não
    com `//`); qualquer outro valor é trocado por `/`, para evitar open redirect.
15. Mesma pessoa, dois métodos: se o e-mail da conta Google já tiver uma conta com senha (e-mail
    confirmado), o Supabase vincula as identidades e o usuário entra na **mesma** conta, com os
    mesmos dados. Se o e-mail com senha não estiver confirmado, o Supabase não vincula; isso é
    aceito na v1 e documentado.
16. Apenas o Google entra nesta versão. Outros provedores reaproveitam a mesma porta e a mesma rota,
    mas exigem spec própria.

## Telas

- **`/login`**: botão "Continuar com Google" no topo, divisor "ou", campos e-mail e senha,
  botão "Entrar" e link "Cadastre-se" para `/signup`. Mostra o erro do Google quando a URL tem
  `?error=google`.
- **`/signup`**: mesmo layout; botão "Continuar com Google", divisor, botão "Criar conta" e link
  "Entrar" para `/login`.
- **Botão do Google**: segue as diretrizes de marca do Google (logo "G" oficial em SVG, texto
  "Continuar com Google", fundo branco com borda no tema claro). Fica desabilitado e mostra estado de
  carregamento enquanto redireciona.
- **Cabeçalho da área logada**: mostra o e-mail do usuário e o botão "Sair".

## Critérios de aceite

Marcado = verificado por teste automatizado ou manual (indicado ao lado). Os demais ainda precisam
de verificação manual ou de um teste que ainda não existe.

- [x] Dado um e-mail novo e uma senha válida, quando envio o cadastro, então a conta é criada
      e vejo a tela principal ou o aviso para confirmar o e-mail. _(teste manual)_
- [x] Dado uma senha com menos de 6 caracteres, quando envio o cadastro, então vejo um erro e nada é criado. _(teste automatizado)_
- [ ] Dado credenciais corretas, quando entro, então sou levado para `/`.
- [x] Dado credenciais incorretas, quando entro, então vejo "E-mail ou senha inválidos" e continuo em `/login`. _(teste automatizado)_
- [x] Dado que não estou logado, quando acesso `/`, então sou redirecionado para `/login`. _(teste automatizado e manual)_
- [x] Dado que estou logado, quando clico em "Sair", então a sessão termina e vou para `/login`. _(teste manual)_
- [x] Enquanto o formulário é enviado, o botão fica desabilitado e mostra estado de carregamento. _(teste automatizado)_
- [ ] O usuário A nunca consegue ler ou alterar dados do usuário B, nem chamando a API diretamente (RLS).

### Google

- [x] Quando clico em "Continuar com Google" em `/login` ou `/signup`, então sou levado à tela de consentimento do Google. _(teste manual)_
- [x] Dado que autorizo no Google pela primeira vez, então uma conta é criada e chego em `/` logado. _(teste manual)_
- [x] Dado que já entrei com o Google antes, quando entro de novo, então vejo os mesmos dados de antes. _(teste manual)_
- [x] Dado uma conta com senha e e-mail confirmado, quando entro com o Google usando o mesmo e-mail, então vejo os dados dessa conta. _(teste manual)_
- [x] Dado que cancelo no Google, então volto para `/login` e vejo "Não foi possível entrar com o Google. Tente novamente." _(teste automatizado e manual)_
- [x] Dado um `code` inválido ou ausente em `/auth/callback`, então sou redirecionado para `/login?error=google`, sem sessão. _(teste automatizado)_
- [x] Dado `/auth/callback?code=...&next=https://site-malicioso.com` (ou `//site-malicioso.com`), então sou redirecionado para `/`, nunca para fora do app. _(teste automatizado)_
- [x] Dado que estou logado com o Google, quando clico em "Sair", então a sessão do app termina (sem deslogar do Google). _(teste manual)_

## Notas técnicas

| Camada | Arquivos |
|--------|----------|
| `domain` | — |
| `application` | Porta `ports/auth-gateway.ts` (`signIn`, `signUp`, `signOut`, `currentUserId`, `startOAuthSignIn(provider, redirectTo)` → URL do provedor, `completeOAuthSignIn(code)`); schemas `schemas/credentials-schema.ts` (e-mail válido, senha ≥ 6) e `schemas/redirect-path-schema.ts` (caminho interno seguro, padrão `/`); casos de uso `use-cases/sign-in.ts`, `sign-up.ts`, `sign-out.ts`, `start-google-sign-in.ts`, `complete-oauth-sign-in.ts` |
| `infrastructure` | `supabase/server-client.ts` (`createServerClient` do `@supabase/ssr`, cookies via `next/headers`); `supabase/supabase-auth-gateway.ts` (`signInWithOAuth({ provider: "google", options: { redirectTo } })` e `exchangeCodeForSession(code)`); `supabase/session-proxy.ts` (inclui `/auth/callback` nas rotas públicas); `supabase/env.ts` (passa a exigir `NEXT_PUBLIC_SITE_URL`) |
| `main` | `makeSignIn`, `makeSignUp`, `makeSignOut`, `makeStartGoogleSignIn`, `makeCompleteOAuthSignIn` |
| `presentation` | `features/auth/components/auth-form.tsx` (`useActionState`, recebe a ação por prop); `features/auth/components/google-sign-in-button.tsx` (recebe a ação por prop); `features/auth/components/sign-out-button.tsx` |
| `app` | `(auth)/login/page.tsx` (lê `?error=google`), `(auth)/signup/page.tsx`, `(auth)/actions.ts` (inclui `signInWithGoogle`, que chama o caso de uso e faz `redirect(url)`); `auth/callback/route.ts` (Route Handler `GET`, controller fino que chama `completeOAuthSignIn` e redireciona) |
| raiz de `src` | `proxy.ts`: renova a sessão e faz os redirecionamentos |

- Identidade verificada com `supabase.auth.getClaims()`, não com `getSession()`.
- Variáveis: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `NEXT_PUBLIC_SITE_URL`
  (ex.: `http://localhost:3000`), todas documentadas em `.env.example`.
- O `@supabase/ssr` usa PKCE por padrão: o `code_verifier` fica em cookie, então o callback precisa
  usar o cliente de servidor que lê e grava cookies.

### Configuração externa (feita uma vez, fora do código)

1. **Google Cloud Console** → APIs e serviços → criar a tela de consentimento OAuth (tipo
   "Externo"; escopos `openid`, `email` e `profile`) e uma credencial **ID do cliente OAuth** do
   tipo "Aplicativo da Web".
   - URI de redirecionamento autorizado: `https://<projeto>.supabase.co/auth/v1/callback`
     (para o Supabase local: `http://127.0.0.1:54321/auth/v1/callback`).
2. **Supabase** → Authentication → Sign In / Providers → **Google**: ativar e colar o Client ID e o
   Client Secret.
3. **Supabase** → Authentication → URL Configuration: `Site URL` = URL do app; em
   **Redirect URLs**, adicionar `http://localhost:3000/auth/callback` e a URL de produção
   equivalente.
4. O Client Secret do Google fica **só** no painel do Supabase (ou em `supabase/config.toml` lendo
   de variável de ambiente, no Supabase local); nunca no código nem no `.env.local` do app.
- Parte deste código já existe e é reorganizada na spec 01; esta spec completa o restante (logout no cabeçalho, testes dos critérios de aceite).

## Conformidade com a constituição

| Princípio | Como esta spec atende |
|-----------|-----------------------|
| Clean Architecture | Supabase Auth fica atrás da porta `AuthGateway`; Server Actions só chamam casos de uso |
| Cobertura > 90% | Entrada `"./src/presentation/features/auth/"` no `coverageThreshold`; testes dos schemas (`redirect-path-schema` com `/x`, `//x`, `https://x`, vazio), dos casos de uso (gateway fake, sucesso e falha de OAuth), do gateway (Supabase mockado), do `auth-form`, do `google-sign-in-button`, das actions, do Route Handler de callback (com `code` válido, inválido, ausente e `next` malicioso) e do `proxy.ts` (com e sem sessão, rotas públicas incluindo `/auth/callback`) |
| Segurança | `getClaims()`, RLS como barreira final, mensagem de erro genérica, nada de `service_role`, PKCE, URL de retorno vinda de `NEXT_PUBLIC_SITE_URL`, proteção contra open redirect, Client Secret fora do repositório |
| Validação com zod | `credentialsSchema` e `redirectPathSchema` validados no servidor |
| Novas dependências | Nenhuma: o OAuth usa o `@supabase/ssr` já instalado, e o logo do Google é um SVG inline |

**Exceções:** nenhuma.

## Fora do escopo

Outros provedores sociais (Apple, GitHub etc.), vincular ou desvincular manualmente o Google de uma conta existente, recuperação de senha, troca de e-mail/senha, exclusão de conta, 2FA.

## Questões em aberto

- A confirmação de e-mail vai ficar ativada no Supabase?
- Recuperação de senha ("Esqueci minha senha") entra já na v1?
- O app do Google Cloud vai precisar de verificação do Google (necessária para sair do modo
  "Teste" e liberar qualquer conta Google, além dos usuários de teste cadastrados)?

## Tarefas

- [T-001 — Login social com Google](../tasks/T-001-login-google.md)
