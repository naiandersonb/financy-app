# T-024 — Avatar e nome do usuário no cabeçalho

| Campo | Valor |
|-------|-------|
| Spec | [02 — Autenticação](../specs/02-autenticacao.md), "Cabeçalho da área logada" e critérios de "Avatar e nome" |
| Status | Concluída (falta conferir no navegador os critérios de login com Google e com e-mail) |
| Depende de | — |
| Bloqueia | — |

## Comportamento

O cabeçalho mostra a foto e o nome da conta Google de quem entrou pelo login social, com o e-mail
menor abaixo do nome. Sem foto (cadastro com e-mail e senha) ou com URL de host não permitido, mostra
a inicial do nome (ou do e-mail) num círculo; sem nome, mostra só o e-mail.

O nome entrou nesta tarefa durante a revisão: vem da mesma fonte (`user_metadata`) e aparece na
mesma área da tela.

## Escopo (corte vertical)

| Camada | Mudança |
|--------|---------|
| `application` | `CurrentUser` ganha `name` e `avatarUrl` (`string \| null`) |
| `infrastructure` | `SupabaseAuthGateway.currentUser()` lê `user_metadata.full_name` (ou `name`) e `user_metadata.avatar_url` (ou `picture`) das claims já validadas pelo `getClaims()`; o que não for texto (ou for só espaços) vira `null` |
| `presentation` | `features/auth/components/user-avatar.tsx` (foto com `next/image` ou inicial); `UserMenu` passa a mostrá-lo. A lista de hosts permitidos fica num módulo próprio, importado também pelo `next.config.ts` (`images.remotePatterns`), para as duas listas nunca divergirem |
| `app` | o layout da área logada repassa o `avatarUrl` |

## Segurança

O `user_metadata` pode ser alterado pelo próprio usuário (`supabase.auth.updateUser`), então a URL é
tratada como **não confiável**: só hosts permitidos são exibidos (hoje `lh3.googleusercontent.com`,
em HTTPS). Isso evita carregar imagens de qualquer servidor (rastreamento por IP) e também erro em
tempo de execução, já que o `next/image` recusa hosts não configurados.

## Critérios de aceite

- [ ] Login com Google → foto da conta no cabeçalho.
- [ ] Login com e-mail e senha → inicial do e-mail num círculo, e só o e-mail como texto.
- [ ] Login com Google → nome em destaque e e-mail abaixo; a inicial (sem foto) vem do nome.
- [x] `avatar_url` de host não permitido, ou em `http://` → inicial, sem requisição ao host.
- [x] A foto tem `alt=""` (decorativa: o e-mail está ao lado).
- [x] Gate de qualidade verde.

## Verificação (2026-10-10)

- Build de produção na porta 3100: o otimizador de imagens do Next devolve `200 image/png` para uma
  foto em `lh3.googleusercontent.com` e `400 "url" parameter is not allowed` para outro host.

## Tamanho

Medido: 8 arquivos de produção (incluindo `next.config.ts` e o layout), ~120 linhas.
