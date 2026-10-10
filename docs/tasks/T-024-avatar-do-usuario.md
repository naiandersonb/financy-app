# T-024 — Avatar do usuário no cabeçalho

| Campo | Valor |
|-------|-------|
| Spec | [02 — Autenticação](../specs/02-autenticacao.md), "Cabeçalho da área logada" e critérios de "Avatar" |
| Status | A fazer |
| Depende de | — |
| Bloqueia | — |

## Comportamento

O cabeçalho mostra, ao lado do e-mail, a foto da conta Google de quem entrou pelo login social. Sem
foto (cadastro com e-mail e senha) ou com URL de host não permitido, mostra a inicial do e-mail num
círculo.

## Escopo (corte vertical)

| Camada | Mudança |
|--------|---------|
| `application` | `CurrentUser` ganha `avatarUrl: string \| null` |
| `infrastructure` | `SupabaseAuthGateway.currentUser()` lê `user_metadata.avatar_url` (ou `picture`) das claims já validadas pelo `getClaims()`; qualquer valor que não seja texto vira `null` |
| `presentation` | `features/auth/components/user-avatar.tsx` (foto com `next/image` ou inicial); `UserMenu` passa a mostrá-lo. A lista de hosts permitidos fica num módulo próprio, importado também pelo `next.config.ts` (`images.remotePatterns`), para as duas listas nunca divergirem |
| `app` | o layout da área logada repassa o `avatarUrl` |

## Segurança

O `user_metadata` pode ser alterado pelo próprio usuário (`supabase.auth.updateUser`), então a URL é
tratada como **não confiável**: só hosts permitidos são exibidos (hoje `lh3.googleusercontent.com`,
em HTTPS). Isso evita carregar imagens de qualquer servidor (rastreamento por IP) e também erro em
tempo de execução, já que o `next/image` recusa hosts não configurados.

## Critérios de aceite

- [ ] Login com Google → foto da conta no cabeçalho.
- [ ] Login com e-mail e senha → inicial do e-mail num círculo.
- [ ] `avatar_url` de host não permitido, ou em `http://` → inicial, sem requisição ao host.
- [ ] A foto tem `alt=""` (decorativa: o e-mail está ao lado).
- [ ] Gate de qualidade verde.

## Tamanho

~6 arquivos de produção, ~80 linhas.
