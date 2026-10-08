# Spec 02 — Autenticação

## Objetivo

Cada pessoa tem uma conta própria e acessa somente os próprios dados financeiros.

## Histórias de usuário

- Como visitante, quero criar uma conta com e-mail e senha para começar a usar o app.
- Como usuário, quero entrar com e-mail e senha para acessar minhas finanças.
- Como usuário, quero sair da minha conta, principalmente em computadores compartilhados.

## Regras de negócio

1. Cadastro com e-mail e senha (Supabase Auth). A senha precisa ter no mínimo 6 caracteres.
2. Se o projeto Supabase exigir confirmação de e-mail, após o cadastro a pessoa
   vê uma mensagem pedindo para confirmar pelo link enviado; ela ainda não fica logada.
3. Se a confirmação estiver desativada, o cadastro já leva direto à tela principal.
4. Todas as rotas, exceto `/login` e `/cadastro`, exigem sessão.
5. Visitante sem sessão que acessa uma rota protegida é redirecionado para `/login`.
6. Usuário logado que acessa `/login` ou `/cadastro` é redirecionado para `/`.
7. A sessão é renovada de forma transparente (refresh de token no `src/proxy.ts`).
8. Mensagens de erro de login não revelam se o e-mail existe ("E-mail ou senha inválidos").

## Telas

- **`/login`**: campos e-mail e senha, botão "Entrar", link "Cadastre-se" para `/cadastro`.
  Reaproveita o layout atual de `src/app/login/page.tsx`.
- **`/cadastro`**: mesmo layout; botão "Criar conta", link "Entrar" para `/login`.
- **Cabeçalho da área logada**: mostra o e-mail do usuário e o botão "Sair".

## Critérios de aceite

- [ ] Dado um e-mail novo e uma senha válida, quando envio o cadastro, então a conta é criada
      e vejo a tela principal ou o aviso para confirmar o e-mail.
- [ ] Dado uma senha com menos de 6 caracteres, quando envio o cadastro, então vejo um erro e nada é criado.
- [ ] Dado credenciais corretas, quando entro, então sou levado para `/`.
- [ ] Dado credenciais incorretas, quando entro, então vejo "E-mail ou senha inválidos" e continuo em `/login`.
- [ ] Dado que não estou logado, quando acesso `/`, então sou redirecionado para `/login`.
- [ ] Dado que estou logado, quando clico em "Sair", então a sessão termina e vou para `/login`.
- [ ] Enquanto o formulário é enviado, o botão fica desabilitado e mostra estado de carregamento.
- [ ] O usuário A nunca consegue ler ou alterar dados do usuário B, nem chamando a API diretamente (RLS).

## Notas técnicas

| Camada | Arquivos |
|--------|----------|
| `domain` | — |
| `application` | Porta `ports/auth-gateway.ts`; schema `schemas/credentials-schema.ts` (e-mail válido, senha ≥ 6); casos de uso `use-cases/sign-in.ts`, `sign-up.ts`, `sign-out.ts` |
| `infrastructure` | `supabase/server-client.ts` (`createServerClient` do `@supabase/ssr`, cookies via `next/headers`); `supabase/supabase-auth-gateway.ts`; `supabase/session-proxy.ts` |
| `main` | `makeSignIn`, `makeSignUp`, `makeSignOut` |
| `presentation` | `features/auth/components/auth-form.tsx` (`useActionState`, recebe a ação por prop); `features/auth/components/sign-out-button.tsx` |
| `app` | `(auth)/login/page.tsx`, `(auth)/cadastro/page.tsx`, `(auth)/actions.ts` |
| raiz de `src` | `proxy.ts`: renova a sessão e faz os redirecionamentos |

- Identidade verificada com `supabase.auth.getClaims()`, não com `getSession()`.
- Variáveis: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (documentadas em `.env.example`).
- Parte deste código já existe e é reorganizada na spec 01; esta spec completa o restante (logout no cabeçalho, testes dos critérios de aceite).

## Conformidade com a constituição

| Princípio | Como esta spec atende |
|-----------|-----------------------|
| Clean Architecture | Supabase Auth fica atrás da porta `AuthGateway`; Server Actions só chamam casos de uso |
| Cobertura > 90% | Entrada `"./src/presentation/features/auth/"` no `coverageThreshold`; testes do schema, dos casos de uso (gateway fake), do gateway (Supabase mockado), do `auth-form`, das actions e do `proxy.ts` (com e sem sessão, rotas públicas e protegidas) |
| Segurança | `getClaims()`, RLS como barreira final, mensagem de erro de login genérica, nada de `service_role` |
| Validação com zod | `credentialsSchema` validado no servidor |

**Exceções:** nenhuma.

## Fora do escopo

Login social (Google etc.), recuperação de senha, troca de e-mail/senha, exclusão de conta, 2FA.

## Questões em aberto

- A confirmação de e-mail vai ficar ativada no Supabase?
- Recuperação de senha ("Esqueci minha senha") entra já na v1?
